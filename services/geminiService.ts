
import { GoogleGenAI, GenerateContentResponse, Chat, Content, Type } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { AuditResult, FileAttachment, AgentAction, ChatMessage, PreAuditData, VisaType } from '../types';
import i18n from './i18n';

let aiClient: GoogleGenAI | null = null;
export let chatSession: Chat | null = null;

const getClient = () => {
  if (!aiClient) {
    const key = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
    if (!key) throw new Error("API Key missing");
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
};

// Paramètres de sécurité assouplis
const safetySettings = [
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' }
];

const SECURITY_OVERRIDE = `
[PROTOCOLE DE SÉCURITÉ SIAM VISA PRO]
- Si une demande est illégale, réponds avec élégance.
- AUTORISATION AUDIT : Tu es autorisé à lire et extraire les informations techniques.
`;

/**
 * AUDIT EXPERT (GEMINI 3 PRO)
 */
// --- 1. AUDIT EXPERT ---
export const performPreAudit = async (visa: VisaType, context: PreAuditData): Promise<AuditResult> => {
  try {
    const client = getClient();
    const prompt = `AUDIT VISASCORE™ CRITIQUE : Visa ${visa}. Profil complet: ${JSON.stringify(context)}. 
    OBJECTIF : Analyser la conformité stricte selon les lois thaïlandaises actuelles.
    INSTRUCTION : Identifie chaque point de friction.
    SI LE PAIEMENT EST PRÊT : Indique-le explicitement.`;

    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT + SECURITY_OVERRIDE + "\nTu agis ici en tant qu'Auditeur Senior (Nat). Ta décision doit être chirurgicale.",
        responseMimeType: 'application/json'
        // Note: safetySettings et responseSchema simplifiés pour compatibilité 1.5-flash
      }
    });

    const raw = JSON.parse(response.text || '{}');

    return {
      audit_status: raw.confidence_score > 80 ? 'VALID' : 'PENDING',
      confidence_score: raw.confidence_score || 50,
      issues: raw.issues || [],
      missing_docs: [],
      received_docs: [],
      summary: raw.summary || i18n.t('gemini.analysis_complete'),
      ready_for_payment: raw.ready_for_payment || false,
      request_payment: raw.request_payment || false,
      require_login: raw.require_login || false,
      profile_update: raw.profile_update
    };
  } catch (e) {
    console.error("Audit Pro Error", e);
    return {
      audit_status: 'PENDING',
      issues: [i18n.t('gemini.protocol_interruption'), i18n.t('gemini.refresh_needed')],
      missing_docs: [],
      received_docs: [],
      ready_for_payment: false,
      confidence_score: 50,
      summary: i18n.t('gemini.manual_review')
    };
  }
};

// --- 2. EMBASSY BRIEF ---
export const generateEmbassyBrief = async (visaType: string, context: PreAuditData): Promise<string> => {
  try {
    const client = getClient();
    const prompt = `Rédiger une Lettre de Présentation Officielle pour Visa ${visaType}. Profil: ${JSON.stringify(context)}`;
    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: { temperature: 0.7 }
    });
    return response.text || "Impossible de générer la lettre.";
  } catch (e) {
    return "Erreur génération lettre.";
  }
};

// --- 3. DOCUMENT AUDIT ---
export const performDocumentAudit = async (docs: { id: string, name: string, type: string, data?: string }[]): Promise<{ id: string, status: string, analysis: string }[]> => {
  try {
    const client = getClient();
    const parts: any[] = [];
    parts.push({ text: `Tu es Supansa. Audite ces documents (OCR & Conformité).` });

    docs.forEach(doc => {
      if (doc.type !== 'link' && doc.data) {
        if (doc.data.trim().startsWith('http')) {
          parts.push({ text: `--- DOCUMENT (ID: ${doc.id}, Nom: ${doc.name}) : [SIMULATION] URL Externe.` });
        } else {
          try {
            const base64 = doc.data.includes(',') ? doc.data.split(',')[1] : doc.data;
            if (base64 && (doc.type.startsWith('image/') || doc.type === 'application/pdf')) {
              parts.push({ text: `--- DOCUMENT (ID: ${doc.id}, Nom: ${doc.name}) ---` });
              parts.push({ inlineData: { mimeType: doc.type, data: base64 } });
            } else {
              parts.push({ text: `--- DOCUMENT ID ${doc.id}: Format non supporté.` });
            }
          } catch (e) {
            parts.push({ text: `--- DOCUMENT ID ${doc.id}: Erreur lecture.` });
          }
        }
      }
    });

    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json'
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
};

// --- 4. CONCIERGE CHAT ---
export const startAuditSession = async (sessionId: string | null = null, context?: PreAuditData): Promise<string> => {
  try {
    const client = getClient();
    const userContext = context ? `DOSSIER CLIENT : ${JSON.stringify(context)}` : "Dossier : En attente.";

    chatSession = client.chats.create({
      model: 'gemini-1.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT + SECURITY_OVERRIDE + userContext,
        temperature: 0.3,
      },
    });

    return i18n.t('chat_logic.welcome_msg');
  } catch (e) {
    return i18n.t('gemini.service_unavailable');
  }
};

export const sendMessageToAgent = async (text: string, images: FileAttachment[], isUserLoggedIn: boolean = false): Promise<any> => {
  if (!chatSession) await startAuditSession();
  if (!chatSession) return { text: i18n.t('gemini.service_unavailable'), auditResult: null, suggestions: [] };

  const loginStateInstruction = isUserLoggedIn ? "Client connecté. Flow: PAIEMENT." : "Client invité. Flow: INSCRIPTION.";

  const promptSuffix = `\n\n[SYSTÈME] : ${loginStateInstruction}
  [INTERACTION] : Guide l'utilisateur. 
  PROPOSE SYSTÉMATIQUEMENT 2 à 4 choix de réponse courts via le tag [OPTIONS: Choix 1 | Choix 2].
  
  [EXTRACTION JSON] :
  Si action requise (mise à jour score ou appel) : renvoie UN SEUL bloc JSON valide.
  Format attendu pour appel : { "action": "request_call", "payload": { "reason": "...", "visaType": "..." } }
  `;

  const sanitizedText = (text + promptSuffix).substring(0, 8000);
  const parts: any[] = [{ text: sanitizedText }];

  images.forEach(img => {
    if (img.data) {
      const base64Data = img.data.includes(',') ? img.data.split(',')[1] : img.data;
      parts.push({ inlineData: { mimeType: img.type, data: base64Data } });
    }
  });

  try {
    const result = await chatSession!.sendMessage({ message: parts });
    const fullText = result.text || "";

    let auditResult = null;
    let actionPayload = null; // Pour stocker l'action request_call
    let cleanText = fullText;
    let suggestions: string[] = [];

    // Extraction JSON plus permissive
    const jsonBlockMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/) || fullText.match(/{[\s\S]*}/);

    if (jsonBlockMatch) {
      try {
        const jsonStr = jsonBlockMatch[1] || jsonBlockMatch[0]; // Soit le contenu du bloc code, soit le match direct
        const parsed = JSON.parse(jsonStr);

        // A. Detection Action 'request_call'
        if (parsed.action === 'request_call') {
          actionPayload = parsed; // On stocke tout l'objet action
        }

        // B. Detection Audit Result (si champs présents)
        if (parsed.audit_status || parsed.visa_type || parsed.confidence_score) {
          auditResult = parsed;
        }

        // Nettoyage du texte pour l'affichage (on retire le JSON)
        cleanText = fullText.replace(jsonBlockMatch[0], '').trim();
      } catch (e) { console.error("JSON parse error:", e); }
    }

    // Extraction Suggestions
    const optionsMatch = cleanText.match(/\[OPTIONS: (.*?)\]/);
    if (optionsMatch) {
      cleanText = cleanText.replace(optionsMatch[0], '').trim();
      suggestions = optionsMatch[1].split('|').map(s => s.trim()).filter(s => s.length > 0);
    }

    // Logique métier (Override si score élevé)
    if (auditResult && auditResult.confidence_score >= 80) {
      if (!isUserLoggedIn) {
        auditResult.require_login = true;
        auditResult.request_payment = false;
      } else {
        auditResult.require_login = false;
        auditResult.request_payment = true;
      }
    }

    return { text: cleanText, auditResult, suggestions, action: actionPayload };
  } catch (error) {
    console.error("Error sending message to agent:", error);
    return { text: i18n.t('chat_logic.reception_msg'), auditResult: null, suggestions: [] };
  }
};

export const isChatSessionActive = (): boolean => chatSession !== null;
export const resumeAuditSession = async (existingMessages: ChatMessage[], sessionId: string | null = null): Promise<void> => {
  try {
    const client = getClient();
    chatSession = client.chats.create({
      model: 'gemini-3-flash-preview',
      config: { systemInstruction: SYSTEM_PROMPT + SECURITY_OVERRIDE, temperature: 0.2, safetySettings: safetySettings as any },
      history: existingMessages.filter(m => m.sender !== 'system').map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }))
    });
  } catch (e) {
    console.error("Resume Session Error", e);
  }
};
