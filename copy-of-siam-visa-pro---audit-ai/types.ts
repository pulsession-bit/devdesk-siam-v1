

export type VisaType = 'DTV' | 'Retirement' | 'Tourism' | 'Business' | null;

export type Sender = 'user' | 'agent' | 'system';

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  name: string;
  type: string;
  data: string; // Base64
}

export interface AuditResult {
  visa_type?: string;
  audit_status: 'VALID' | 'INVALID' | 'PENDING';
  issues: string[];
  missing_docs: string[];
  ready_for_payment: boolean;
  confidence_score?: number; // 0-100
}

export interface CallPayload {
  reason: string;
  visaType: string;
  userStage: string;
  notes: string;
}

export interface AgentAction {
  action: 'request_call';
  payload: CallPayload;
}

export enum AppStep {
  QUALIFICATION = 'QUALIFICATION',
  AUDIT = 'AUDIT',
  RESULT = 'RESULT',
  PAYMENT = 'PAYMENT'
}


declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
