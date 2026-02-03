import { useState, useEffect, useCallback, useRef } from 'react';
import { AppStep, VisaType, AuditResult, ChatMessage } from '../types';
import { resumeAuditSession, isChatSessionActive, startAuditSession } from '../services/geminiService';

const SESSION_KEY = 'siam_visa_pro_session_v2';
const DEBOUNCE_MS = 1000;

interface SessionData {
  sessionId: string | null;
  messages: ChatMessage[];
  step: AppStep;
  visaType: VisaType;
  auditResult: AuditResult | null;
  timestamp: number;
}

interface UseSessionReturn {
  sessionId: string | null;
  messages: ChatMessage[];
  step: AppStep;
  visaType: VisaType;
  auditResult: AuditResult | null;
  isSessionLoaded: boolean;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setStep: React.Dispatch<React.SetStateAction<AppStep>>;
  setVisaType: React.Dispatch<React.SetStateAction<VisaType>>;
  setAuditResult: React.Dispatch<React.SetStateAction<AuditResult | null>>;
  addMessage: (message: ChatMessage) => void;
  clearSession: () => void;
}

const DEFAULT_AUDIT_RESULT: AuditResult = {
  audit_status: 'VALID',
  confidence_score: 95,
  summary: 'Profil test validé automatiquement.',
  issues: [],
  missing_docs: [],
  ready_for_payment: true
};

export function useSession(): UseSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [visaType, setVisaType] = useState<VisaType>('DTV');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Restore session on mount
  useEffect(() => {
    const initSession = async () => {
      let currentSessionId = Date.now().toString();
      const savedData = localStorage.getItem(SESSION_KEY);

      if (savedData) {
        try {
          const parsed: SessionData = JSON.parse(savedData);
          if (parsed.messages && parsed.messages.length > 0) {
            setMessages(parsed.messages);
            setStep(parsed.step || AppStep.DASHBOARD);
            setVisaType(parsed.visaType || 'DTV');
            setAuditResult(parsed.auditResult || null);
            currentSessionId = parsed.sessionId || currentSessionId;
            setSessionId(currentSessionId);

            await resumeAuditSession(parsed.messages, currentSessionId);
          }
        } catch (e) {
          console.error('Session restore failed:', e);
        }
      }

      if (!isChatSessionActive()) {
        await startAuditSession(currentSessionId);
      }

      setIsSessionLoaded(true);
    };

    initSession();
  }, []);

  // Debounced save to localStorage
  useEffect(() => {
    if (!isSessionLoaded) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save
    saveTimeoutRef.current = setTimeout(() => {
      const data: SessionData = {
        sessionId,
        messages,
        step,
        visaType,
        auditResult,
        timestamp: Date.now()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, step, visaType, auditResult, sessionId, isSessionLoaded]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setMessages([]);
    setStep(AppStep.DASHBOARD);
    setVisaType('DTV');
    setAuditResult(null);
    setSessionId(null);
  }, []);

  return {
    sessionId,
    messages,
    step,
    visaType,
    auditResult,
    isSessionLoaded,
    setMessages,
    setStep,
    setVisaType,
    setAuditResult,
    addMessage,
    clearSession
  };
}

export default useSession;
