
import { GoogleGenAI, Modality } from "@google/genai";

export const playTextToSpeech = async (
  text: string, 
  apiKey: string | undefined
): Promise<HTMLAudioElement> => {
  if (!apiKey) {
    throw new Error("API Key missing for TTS");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio content received");
    }

    // Convert Base64 string to Uint8Array (PCM data)
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Gemini TTS returns raw PCM (usually 24kHz, 16-bit, Mono).
    // We need to add a WAV header for the browser to play it via new Audio().
    const wavHeader = getWavHeader(bytes.length, 24000, 1, 16);
    const wavBlob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(wavBlob);
    
    return new Audio(audioUrl);

  } catch (e: any) {
    console.error("Gemini TTS Error:", e);
    throw new Error(e.message || "TTS Generation failed");
  }
};

// --- WAV Header Helpers ---

function getWavHeader(dataLength: number, sampleRate: number, numChannels: number, bitsPerSample: number) {
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
