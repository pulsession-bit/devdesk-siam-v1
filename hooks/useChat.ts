import { useState, useCallback } from 'react';
import { ChatMessage, AuditResult, CallPayload } from '../types';
import { sendMessageToAgent } from '../services/geminiService';
import i18n from '../services/i18n';

interface UseChatOptions {
  onAuditUpdate?: (result: Partial<AuditResult>) => void;
  onCallRequest?: (payload: CallPayload) => void;
  isUserLoggedIn?: boolean;
}

interface UseChatReturn {
  isTyping: boolean;
  sendMessage: (text: string, addMessage: (msg: ChatMessage) => void) => Promise<void>;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const [isTyping, setIsTyping] = useState(false);
  const { onAuditUpdate, onCallRequest, isUserLoggedIn = false } = options;

  const sendMessage = useCallback(async (
    text: string,
    addMessage: (msg: ChatMessage) => void
  ) => {
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: Date.now()
    };
    addMessage(userMsg);
    setIsTyping(true);

    try {
      const response = await sendMessageToAgent(text, [], isUserLoggedIn);

      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'agent',
        timestamp: Date.now(),
        suggestions: response.suggestions,
        actionPayload: response.auditResult
      };

      addMessage(agentMsg);

      // Handle call request action
      if (response.action?.action === 'request_call' && onCallRequest) {
        onCallRequest(response.action.payload);
      }

      // Handle audit result update
      if (response.auditResult && onAuditUpdate) {
        onAuditUpdate(response.auditResult);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        text: i18n.t('gemini.service_unavailable') || "Désolé, une erreur est survenue.",
        sender: 'agent',
        timestamp: Date.now()
      };
      addMessage(errorMsg);
    } finally {
      setIsTyping(false);
    }
  }, [isUserLoggedIn, onAuditUpdate, onCallRequest]);

  return {
    isTyping,
    sendMessage
  };
}

export default useChat;
