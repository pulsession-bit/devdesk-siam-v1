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
      // Try to restore existing app session (NOT user auth session)
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        try {
          const data: SessionData = JSON.parse(saved);
          // Check if session is less than 24 hours old
          if (data.timestamp && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
            if (data.sessionId) setSessionId(data.sessionId);
            if (data.messages?.length) setMessages(data.messages);
            if (data.step) setStep(data.step);
            if (data.visaType) setVisaType(data.visaType);
            if (data.auditResult) setAuditResult(data.auditResult);
            setIsSessionLoaded(true);
            return;
          }
        } catch (e) {
          console.error('Failed to restore session:', e);
          localStorage.removeItem(SESSION_KEY);
        }
      }

      // No valid session found, start fresh
      const currentSessionId = Date.now().toString();

      if (!isChatSessionActive()) {
        await startAuditSession(currentSessionId);
      }

      setSessionId(currentSessionId);
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
