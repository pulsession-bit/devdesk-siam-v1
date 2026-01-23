

import { GoogleGenAI, GenerateContentResponse, ChatSession, Content } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { AuditResult, FileAttachment, AgentAction, ChatMessage } from '../types';

let aiClient: GoogleGenAI | null = null;
export let chatSession: ChatSession | null = null; // Export chatSession for App.tsx check

const getClient = () => {
  if (!aiClient) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing in getClient.");
      throw new Error("API Key missing");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

// New function to check if chatSession is active
export const isChatSessionActive = (): boolean => {
  return chatSession !== null;
};

// Helper to convert UI messages to Gemini History
const convertToGeminiHistory = (messages: ChatMessage[]): Content[] => {
  return messages
    .filter(m => m.sender === 'user' || m.sender === 'agent') // Filter out system messages
    .map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }] // Note: We simplify attachments restoration for history to text context mostly, preserving logic
    }));
};

export const startAuditSession = async (sessionId: string | null = null): Promise<string> => {
  const client = getClient();

  // Initialize chat with system prompt
  chatSession = client.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.2, // Low temperature for consistent auditing
    },
  });

  if (sessionId) {
    console.log(`Starting new Gemini session for Session ID: ${sessionId}`);
    // Potentially add sessionId to context or initial message if needed for backend logging
    // For now, it's just passed along
  }

  // Initial greeting trigger. This prompt instructs the model to follow step 3.1 of the System Prompt.
  const response = await chatSession.sendMessage({
    message: "Bonjour. Je suis prêt à commencer. Présente-toi et demande-moi mon projet comme convenu."
  });

  return response.text || "";
};

export const resumeAuditSession = async (existingMessages: ChatMessage[], sessionId: string | null = null): Promise<void> => {
  const client = getClient();
  const history = convertToGeminiHistory(existingMessages);

  // Re-initialize chat with previous history
  chatSession = client.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.2,
    },
    history: history
  });

  if (sessionId) {
    console.log(`Resuming Gemini session for Session ID: ${sessionId}`);
  }
  console.log("Session Gemini restaurée avec succès.");
};

/**
 * Updates the ongoing chat session with a call transcript, ensuring Gemini is aware of the call's content.
 * @param transcript The formatted transcript of the call.
 */
export const updateChatSessionHistoryWithTranscript = (transcript: string) => {
  if (chatSession) {
    // Add the transcript as a model's message to the history
    // We treat it as a 'model' response because it's part of the agent's interaction (even if human-assisted)
    // This ensures Gemini can use it as context for subsequent turns.
    chatSession.history.push({
      role: 'model',
      parts: [{ text: `(Compte-rendu d'appel téléphonique) : ${transcript}` }]
    });
    console.log("Call transcript added to Gemini chat history.");
  } else {
    console.warn("Attempted to add call transcript to history, but no active chat session.");
  }
};


interface AgentResponse {
  text: string;
  auditResult: AuditResult | null;
  action: AgentAction | null;
}

export const sendMessageToAgent = async (
  text: string,
  images: FileAttachment[] = []
): Promise<AgentResponse> => {
  if (!chatSession) {
    // Fallback should not happen if App handles init correctly, but here for robustness.
    console.warn("Chat session not initialized, attempting to start a new one.");
    await startAuditSession();
  }

  if (!chatSession) throw new Error("Session failed to initialize after fallback");

  const parts: any[] = [{ text }];

  // Add images if present
  images.forEach((img) => {
    // Remove data:image/png;base64, prefix if present for the API call
    const cleanData = img.data.split(',')[1] || img.data;
    parts.push({
      inlineData: {
        mimeType: img.type,
        data: cleanData
      }
    });
  });

  try {
    const result: GenerateContentResponse = await chatSession.sendMessage({
      message: { parts }
    });

    const fullText = result.text || "";

    // Extract JSON block - More robust regex to handle case sensitivity and missing tags
    const jsonMatch = fullText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

    let auditResult: AuditResult | null = null;
    let action: AgentAction | null = null;

    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);

        // Handle "action": "request_call" format
        if (parsed.action === 'request_call') {
          action = parsed;
        }
        // Handle Audit Result (heuristic based on fields)
        else if (parsed.audit_status || parsed.visa_type) {
          auditResult = parsed;
        }
        // Handle legacy "type": "audit_result" format if it still occurs
        else if (parsed.type === 'audit_result' && parsed.data) {
          auditResult = parsed.data;
        }

      } catch (e) {
        console.error("Failed to parse JSON from agent response", e);
      }
    }

    // Clean text presentation (remove the JSON block from the chat bubble)
    const cleanText = fullText.replace(/```(?:json)?\s*[\s\S]*?\s*```/gi, '').trim();

    return {
      text: cleanText,
      auditResult,
      action
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: "Une erreur technique est survenue lors de l'analyse. Veuillez réessayer.",
      auditResult: null,
      action: null
    };
  }
};