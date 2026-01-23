import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { LiveContext } from '../types';

interface TranscriptItem {
  role: 'user' | 'agent';
  text: string;
}

export type TranscriptUpdate = {
  role: 'user' | 'agent';
  text: string;
  isFinal: boolean;
};

// Définition de l'outil de navigation pour l'IA
const navigationTool: FunctionDeclaration = {
  name: 'navigateToPage',
  description: 'Navigates the user application to a specific page or section.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      page: {
        type: Type.STRING,
        description: 'The destination page. Values: DASHBOARD, DOCUMENTS, CHAT, PAYMENT, SETTINGS, PRE_AUDIT.',
        enum: ['DASHBOARD', 'DOCUMENTS', 'CHAT', 'PAYMENT', 'SETTINGS', 'PRE_AUDIT']
      },
    },
    required: ['page'],
  },
};

export class LiveAgent {
  private static instance: LiveAgent;
  private ai: GoogleGenAI | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sessionPromise: Promise<any> | null = null;
  private nextStartTime: number = 0;
  private sources: Set<AudioBufferSourceNode> = new Set();
  public isConnected: boolean = false;
  private processor: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;

  private transcriptionHistory: TranscriptItem[] = [];
  private currentInputTranscription: string = '';
  private currentOutputTranscription: string = '';

  // Keep-Alive & Context Logic
  private keepAliveInterval: any = null;
  private activeContext: LiveContext | undefined;
  private isRefreshing: boolean = false;
  private readonly REFRESH_INTERVAL_MS = 90 * 1000; // 90 Secondes pour contourner les limites WebSocket

  // State for user callback logic
  private sessionCount: number = 0; // Compteur de sessions "humaines" (appels volontaires)

  // Support multi-listeners
  private transcriptListeners: Set<(update: TranscriptUpdate) => void> = new Set();
  private statusListeners: Set<(status: string) => void> = new Set();
  private navigationListeners: Set<(page: string) => void> = new Set();

  private constructor() {
    if (process.env.API_KEY) {
      try {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      } catch (e) {
        console.error("LiveAgent Init Error:", e);
      }
    } else {
      console.warn("LiveAgent: API Key missing. Live features will be disabled.");
    }
  }

  public static getInstance(): LiveAgent {
    if (!LiveAgent.instance) {
      LiveAgent.instance = new LiveAgent();
    }
    return LiveAgent.instance;
  }

  public onTranscript(listener: (update: TranscriptUpdate) => void) {
    this.transcriptListeners.add(listener);
    return () => this.transcriptListeners.delete(listener);
  }

  public onStatus(listener: (status: string) => void) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  public onNavigation(listener: (page: string) => void) {
    this.navigationListeners.add(listener);
    return () => this.navigationListeners.delete(listener);
  }

  private notifyStatus(status: string) {
    this.statusListeners.forEach(l => l(status));
  }

  private notifyTranscript(update: TranscriptUpdate) {
    this.transcriptListeners.forEach(l => l(update));
  }

  private notifyNavigation(page: string) {
    this.navigationListeners.forEach(l => l(page));
  }

  public async sendContextMessage(text: string) {
    if (!this.sessionPromise) return;
    try {
      const session = await this.sessionPromise;
      // Correction : sendRealtimeInput attend un objet RealtimeInput { parts: [...] } ou { media: ... }
      await session.sendRealtimeInput({ parts: [{ text: `[CONTEXT UPDATE]: ${text}` }] });
    } catch (e) {
      console.warn("Failed to send context update", e);
    }
  }

  /**
   * Lance la connexion. 
   * @param contextData Données initiales du dossier
   * @param preservedHistory (Interne) Historique de conversation à réinjecter en cas de reconnexion technique
   */
  async connect(contextData?: LiveContext, preservedHistory?: string) {
    if (this.isConnected && !this.isRefreshing) {
      this.notifyStatus('connected');
      return;
    }

    // Incrémentation du compteur de session UNIQUEMENT si c'est un appel volontaire (pas une reconnexion technique)
    if (!preservedHistory) {
      this.sessionCount++;
    }

    // Sauvegarde du contexte pour les reconnexions futures
    if (contextData) {
      this.activeContext = contextData;
    }

    if (!this.ai) {
      console.error("Cannot connect LiveAgent: GoogleGenAI client not initialized");
      this.notifyStatus('error');
      return;
    }

    // Si ce n'est pas un rafraîchissement transparent, on notifie l'UI
    if (!this.isRefreshing) {
      this.notifyStatus('connecting');
    }

    // Initialisation Audio Contexts
    if (!this.inputAudioContext || this.inputAudioContext.state === 'closed') {
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    if (!this.outputAudioContext || this.outputAudioContext.state === 'closed') {
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    this.nextStartTime = this.outputAudioContext.currentTime;

    // Analyser setup
    if (!this.analyser) {
      this.analyser = this.outputAudioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.connect(this.outputAudioContext.destination);
    }

    try {
      if (!this.mediaStream) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (e) {
      this.notifyStatus('error_mic');
      return;
    }

    // --- CONSTRUCTION DU PROMPT SYSTÈME DYNAMIQUE ---
    const userName = this.activeContext?.userName || "Candidat";
    const visaType = this.activeContext?.result?.visa_type || 'Non défini';
    const score = this.activeContext?.result?.confidence_score || 0;

    let systemInstruction = SYSTEM_PROMPT + `\n\nTu es Supansa de C.I.M. Visas. Ta voix est douce, posée, professionnelle.`;

    if (this.activeContext) {
      systemInstruction += `\n\nDONNÉES DOSSIER: Projet="${this.activeContext.context.projectDescription}", Nationalité=${this.activeContext.context.nationality}, Profession=${this.activeContext.context.profession}, Visa=${visaType}, Score=${score}%.`;
    }

    // SCÉNARIO 1 : RECONNEXION TECHNIQUE (Keep-Alive invisible)
    if (preservedHistory) {
      systemInstruction += `\n\n[HISTORIQUE TECHNIQUE - REPRISE IMMEDIATE]\nLe système audio a redémarré. Continue la phrase ou la conversation EXACTEMENT où elle s'est arrêtée. Ne salue pas à nouveau.\n\nHistorique récent:\n${preservedHistory}`;
    }
    // SCÉNARIO 2 : LE CLIENT RAPPELLE APRÈS AVOIR RACCROCHÉ (Session > 1)
    else if (this.sessionCount > 1) {
      systemInstruction += `\n\n[SCÉNARIO: LE CLIENT RAPPELLE]
        Le client ${userName} te rappelle après une coupure ou une fin de conversation précédente.
        1. Ne te présente pas entièrement ("Je suis Supansa..."), tu l'as déjà fait.
        2. Dis plutôt : "Re-bonjour ${userName}. Je vois que vous nous rappelez."
        3. Fais un TRÈS COURT état des lieux (1 phrase) : "Nous en étions à votre dossier ${visaType} (Score: ${score}%)."
        4. QUESTION CLÉ : Demande-lui s'il a pu faire l'action prévue (ex: "Avez-vous pu avancer sur l'envoi des documents ou le paiement que vous prévoyiez ?").
        5. Sois serviable et chaleureuse.`;
    }
    // SCÉNARIO 3 : PREMIER APPEL
    else {
      systemInstruction += `\n\n[SCÉNARIO: PREMIER APPEL]
        Accueille ${userName} chaleureusement. Présente-toi brièvement. Guide-le sur son audit en cours.`;
    }

    try {
      this.sessionPromise = this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          tools: [{ functionDeclarations: [navigationTool] }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: systemInstruction,
        },
        callbacks: {
          onopen: () => {
            this.isConnected = true;
            this.isRefreshing = false;
            this.notifyStatus('connected');
            this.startAudioInput();
            this.startKeepAlive(); // Démarrage du Timer 90s
          },
          onmessage: async (message: LiveServerMessage) => this.handleServerMessage(message),
          onclose: () => {
            // Si on est en train de rafraîchir volontairement, on ignore la fermeture
            if (!this.isRefreshing) {
              this.notifyStatus('disconnected');
              this.disconnect(false); // Clean disconnect
            }
          },
          onerror: (e) => {
            console.error("Live Error", e);
            // Tentative de reconnexion auto si erreur inattendue
            if (!this.isRefreshing) {
              setTimeout(() => this.performHandover(), 1000);
            }
          }
        }
      });
    } catch (err) {
      this.notifyStatus('error');
    }
  }

  /**
   * Mécanisme de Keep-Alive : Coupe et relance la session avant le timeout
   */
  private startKeepAlive() {
    if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
    this.keepAliveInterval = setInterval(() => {
      console.log("LiveAgent: 90s interval reached. Performing session handover...");
      this.performHandover();
    }, this.REFRESH_INTERVAL_MS);
  }

  /**
   * Effectue la passation de session (Handover)
   */
  private async performHandover() {
    this.isRefreshing = true;
    const currentHistory = this.getFormattedTranscript() || "";

    // 1. Fermer la session actuelle
    if (this.sessionPromise) {
      if (this.processor) {
        this.processor.disconnect();
        this.processor = null;
      }
    }

    // 2. Relancer immédiatement avec l'historique
    await this.connect(undefined, currentHistory);
  }

  private startAudioInput() {
    if (!this.inputAudioContext || !this.mediaStream || !this.sessionPromise) return;

    // Nettoyage préventif
    if (this.inputSource) { try { this.inputSource.disconnect(); } catch (e) { } }
    if (this.processor) { try { this.processor.disconnect(); } catch (e) { } }

    this.inputSource = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      // Si on est en cours de refresh, on n'envoie pas de données pour éviter les conflits
      if (this.isRefreshing) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createBlob(inputData);
      this.sessionPromise?.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async handleServerMessage(message: LiveServerMessage) {
    const serverContent = message.serverContent;

    if (message.toolCall) {
      const functionCalls = message.toolCall.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        if (call.name === 'navigateToPage') {
          const page = (call.args as any).page;
          this.notifyNavigation(page);
          this.sessionPromise?.then(session => {
            session.sendToolResponse({
              functionResponses: [{
                id: call.id,
                name: call.name,
                response: { result: `User is now on ${page} page.` }
              }]
            });
          });
        }
      }
    }

    if (serverContent?.outputTranscription) {
      this.currentOutputTranscription += serverContent.outputTranscription.text;
      this.notifyTranscript({ role: 'agent', text: this.currentOutputTranscription, isFinal: false });
    }
    if (serverContent?.inputTranscription) {
      this.currentInputTranscription += serverContent.inputTranscription.text;
      this.notifyTranscript({ role: 'user', text: this.currentInputTranscription, isFinal: false });
    }
    if (serverContent?.turnComplete) {
      if (this.currentInputTranscription.trim()) {
        this.transcriptionHistory.push({ role: 'user', text: this.currentInputTranscription.trim() });
        this.notifyTranscript({ role: 'user', text: this.currentInputTranscription.trim(), isFinal: true });
        this.currentInputTranscription = '';
      }
      if (this.currentOutputTranscription.trim()) {
        this.transcriptionHistory.push({ role: 'agent', text: this.currentOutputTranscription.trim() });
        this.notifyTranscript({ role: 'agent', text: this.currentOutputTranscription.trim(), isFinal: true });
        this.currentOutputTranscription = '';
      }
    }
    if (serverContent?.interrupted) {
      this.stopAllAudio();
      this.nextStartTime = this.outputAudioContext?.currentTime || 0;
      this.currentOutputTranscription = '';
      return;
    }
    const base64Audio = serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && this.outputAudioContext) {
      this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
      const audioBuffer = await this.decodeAudioData(this.decode(base64Audio), this.outputAudioContext, 24000, 1);
      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.analyser!);
      source.onended = () => this.sources.delete(source);
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.sources.add(source);
    }
  }

  getOutputVolume(): number {
    if (!this.analyser) return 0;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
  }

  getFormattedTranscript(): string | null {
    const history = [...this.transcriptionHistory];
    if (this.currentInputTranscription) history.push({ role: 'user', text: this.currentInputTranscription });
    if (this.currentOutputTranscription) history.push({ role: 'agent', text: this.currentOutputTranscription });
    return history.length === 0 ? null : history.map(item => `[${item.role === 'user' ? 'Client' : 'Agent'}] : ${item.text}`).join('\n\n');
  }

  /**
   * Déconnexion complète (Arrêt utilisateur)
   * @param clearListeners Si true, supprime les abonnements UI (Utilisé lors du démontage du composant)
   */
  disconnect(clearListeners: boolean = false) {
    this.isConnected = false;
    this.isRefreshing = false;

    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }

    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.inputAudioContext && this.inputAudioContext.state !== 'closed') {
      try { this.inputAudioContext.close(); } catch (e) { }
    }
    this.inputAudioContext = null;

    this.stopAllAudio();

    if (this.outputAudioContext && this.outputAudioContext.state !== 'closed') {
      try { this.outputAudioContext.close(); } catch (e) { }
    }
    this.outputAudioContext = null;

    this.sessionPromise = null;
    this.notifyStatus('disconnected');

    if (clearListeners) {
      this.statusListeners.clear();
      this.transcriptListeners.clear();
      this.navigationListeners.clear();
    }
  }

  private stopAllAudio() {
    this.sources.forEach(s => { try { s.stop(); } catch (e) { } });
    this.sources.clear();
  }

  private createBlob(data: Float32Array): { data: string; mimeType: string } {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return { data: this.encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  }

  private encode(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  private decode(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, rate: number, channels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frames = dataInt16.length / channels;
    const buffer = ctx.createBuffer(channels, frames, rate);
    for (let c = 0; c < channels; c++) {
      const cData = buffer.getChannelData(c);
      for (let i = 0; i < frames; i++) cData[i] = dataInt16[i * channels + c] / 32768.0;
    }
    return buffer;
  }
}