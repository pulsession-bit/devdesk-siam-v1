
import { GoogleGenAI, LiveServerMessage } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';

interface TranscriptItem {
  role: 'user' | 'agent';
  text: string;
}

export type TranscriptUpdate = {
  role: 'user' | 'agent';
  text: string;
  isFinal: boolean;
};

export class LiveAgent {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sessionPromise: Promise<any> | null = null;
  private nextStartTime: number = 0;
  private sources: Set<AudioBufferSourceNode> = new Set();
  private isConnected: boolean = false;
  private processor: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Transcription State
  private transcriptionHistory: TranscriptItem[] = [];
  private currentInputTranscription: string = '';
  private currentOutputTranscription: string = '';

  // Callback for realtime updates
  private onTranscriptUpdate: ((update: TranscriptUpdate) => void) | null = null;

  constructor() {
    const key = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
    if (!key) {
      throw new Error("API Key missing");
    }
    this.ai = new GoogleGenAI({ apiKey: key });
  }

  async connect(
    onStatusChange: (status: string) => void,
    onTranscriptUpdate?: (update: TranscriptUpdate) => void
  ) {
    if (this.isConnected) return;

    onStatusChange('connecting');
    this.onTranscriptUpdate = onTranscriptUpdate || null;

    // Reset State
    this.transcriptionHistory = [];
    this.currentInputTranscription = '';
    this.currentOutputTranscription = '';

    // 1. Setup Audio Contexts
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    this.inputAudioContext = new AudioContext({ sampleRate: 16000 }); // Try to force 16k
    this.outputAudioContext = new AudioContext({ sampleRate: 24000 });
    this.nextStartTime = this.outputAudioContext.currentTime;

    // Setup Analyzer
    this.analyser = this.outputAudioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.5;
    this.analyser.connect(this.outputAudioContext.destination);

    // 2. Get User Media
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      console.error("Mic access denied", e);
      onStatusChange('error_mic');
      return;
    }

    // 3. Connect to Gemini Live
    try {
      this.sessionPromise = this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: ['AUDIO' as any],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: SYSTEM_PROMPT + "\n\nCONTEXTE: Ceci est un APPEL VOCAL en direct. Sois concis, direct et empathique. Pas de listes à puces. Parle comme un humain au téléphone.",
        },
        callbacks: {
          onopen: () => {
            console.log("Live Session Opened");
            onStatusChange('connected');
            this.isConnected = true;
            this.startAudioInput();
          },
          onmessage: async (message: LiveServerMessage) => {
            this.handleServerMessage(message);
          },
          onclose: () => {
            console.log("Live Session Closed");
            onStatusChange('disconnected');
            this.disconnect();
          },
          onerror: (e) => {
            console.error("Live Session Error", e);
            onStatusChange('error');
            this.disconnect();
          }
        }
      });
    } catch (err) {
      console.error("Failed to connect to Live API", err);
      onStatusChange('error');
    }
  }

  private startAudioInput() {
    if (!this.inputAudioContext || !this.mediaStream || !this.sessionPromise) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);

      let pcmData = inputData;
      const currentRate = this.inputAudioContext!.sampleRate;

      // Manual Downsampling to 16kHz if needed
      if (currentRate !== 16000) {
        pcmData = this.downsampleBuffer(inputData, currentRate, 16000);
      }

      const pcmBlob = this.createBlob(pcmData);

      this.sessionPromise?.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private downsampleBuffer(buffer: Float32Array, sampleRate: number, outSampleRate: number): Float32Array {
    if (outSampleRate === sampleRate) {
      return buffer;
    }
    if (outSampleRate > sampleRate) {
      return buffer; // Cannot upsample with this logic, return original
    }
    const sampleRateRatio = sampleRate / outSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0, count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }

  private async handleServerMessage(message: LiveServerMessage) {
    const serverContent = message.serverContent;

    if (serverContent?.outputTranscription) {
      const chunk = serverContent.outputTranscription.text;
      this.currentOutputTranscription += chunk;
      this.onTranscriptUpdate?.({
        role: 'agent',
        text: this.currentOutputTranscription,
        isFinal: false
      });
    }

    if (serverContent?.inputTranscription) {
      const chunk = serverContent.inputTranscription.text;
      this.currentInputTranscription += chunk;
      this.onTranscriptUpdate?.({
        role: 'user',
        text: this.currentInputTranscription,
        isFinal: false
      });
    }

    if (serverContent?.turnComplete) {
      if (this.currentInputTranscription.trim()) {
        this.transcriptionHistory.push({ role: 'user', text: this.currentInputTranscription.trim() });
        this.onTranscriptUpdate?.({ role: 'user', text: this.currentInputTranscription.trim(), isFinal: true });
        this.currentInputTranscription = '';
      }
      if (this.currentOutputTranscription.trim()) {
        this.transcriptionHistory.push({ role: 'agent', text: this.currentOutputTranscription.trim() });
        this.onTranscriptUpdate?.({ role: 'agent', text: this.currentOutputTranscription.trim(), isFinal: true });
        this.currentOutputTranscription = '';
      }
    }

    if (!this.outputAudioContext) return;

    if (serverContent?.interrupted) {
      this.stopAllAudio();
      this.nextStartTime = this.outputAudioContext.currentTime;

      if (this.currentOutputTranscription) {
        this.transcriptionHistory.push({ role: 'agent', text: this.currentOutputTranscription.trim() + "..." });
        this.currentOutputTranscription = '';
      }
      return;
    }

    const base64Audio = serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      try {
        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);

        const audioBuffer = await this.decodeAudioData(
          this.decode(base64Audio),
          this.outputAudioContext,
          24000,
          1
        );

        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;

        if (this.analyser) {
          source.connect(this.analyser);
        } else {
          source.connect(this.outputAudioContext.destination);
        }

        source.onended = () => this.sources.delete(source);

        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;

        this.sources.add(source);
      } catch (e) {
        console.error("Error decoding audio", e);
      }
    }
  }

  // Visualization helper
  getOutputVolume(): number {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    return sum / dataArray.length;
  }

  getFormattedTranscript(): string | null {
    if (this.currentInputTranscription.trim()) {
      this.transcriptionHistory.push({ role: 'user', text: this.currentInputTranscription.trim() });
      this.currentInputTranscription = '';
    }
    if (this.currentOutputTranscription.trim()) {
      this.transcriptionHistory.push({ role: 'agent', text: this.currentOutputTranscription.trim() });
      this.currentOutputTranscription = '';
    }

    if (this.transcriptionHistory.length === 0) return null;

    return this.transcriptionHistory
      .map(item => `[${item.role === 'user' ? 'Moi' : 'Agent'}] : ${item.text}`)
      .join('\n\n');
  }

  disconnect() {
    this.isConnected = false;
    this.onTranscriptUpdate = null;

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.inputSource) {
      this.inputSource.disconnect();
      this.inputSource = null;
    }
    if (this.inputAudioContext) {
      this.inputAudioContext.close();
      this.inputAudioContext = null;
    }

    this.stopAllAudio();
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    if (this.outputAudioContext) {
      this.outputAudioContext.close();
      this.outputAudioContext = null;
    }

    this.sessionPromise = null;
  }

  private stopAllAudio() {
    this.sources.forEach(source => {
      try { source.stop(); } catch (e) { }
    });
    this.sources.clear();
  }

  private createBlob(data: Float32Array): { data: string; mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return {
      data: this.encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
}
