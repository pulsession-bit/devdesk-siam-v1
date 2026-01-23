
export type VisaType = 'DTV' | 'Retirement' | 'Tourism' | 'Business' | null;
export type ThemeMode = 'CONCORD' | 'EXECUTIVE' | 'PRO';

export type Sender = 'user' | 'agent' | 'system';

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  attachments?: FileAttachment[];
  actionPayload?: any;
  suggestions?: string[]; // NOUVEAU : Liste de choix cliquables
}

export interface FileAttachment {
  name: string;
  type: string;
  data: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  icon?: string; // Nom de l'icone Lucide ou URL
  category: 'VIP' | 'LEGAL' | 'LIFESTYLE';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface AuditResult {
  visa_type?: string;
  audit_status: 'VALID' | 'INVALID' | 'PENDING';
  issues: string[];
  missing_docs: string[];
  received_docs?: string[]; 
  ready_for_payment: boolean;
  request_payment?: boolean; 
  require_login?: boolean; // NOUVEAU: Trigger pour l'inscription
  confidence_score?: number; 
  summary?: string; 
  profile_update?: Partial<PreAuditData>;
}

export interface PreAuditData {
  age?: string;
  savings?: string;
  monthlyIncome?: string;
  profession?: string;
  projectDescription?: string;
  nationality?: string;
  passportExpiry?: string;
  email?: string; // NOUVEAU
  phoneNumber?: string; // NOUVEAU
}

export enum AppStep {
  WELCOME = 'WELCOME',
  BOOKING = 'BOOKING', // NOUVELLE PAGE DÉDIÉE RDV
  QUALIFICATION = 'QUALIFICATION',
  PRE_AUDIT = 'PRE_AUDIT',
  PRE_RESULT = 'PRE_RESULT',
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  DOCUMENTS = 'DOCUMENTS',
  SETTINGS = 'SETTINGS',
  PAYMENT = 'PAYMENT',
  APPLICATIONS = 'APPLICATIONS',
  SHOP = 'SHOP',
  SECURITY = 'SECURITY',
  WIDGET = 'WIDGET' // NOUVEAU
}

// NOUVEAU: Interface pour la télémétrie technique
export interface UserMetadata {
  ip: string;
  device: 'Android' | 'iPhone' | 'Computer' | 'Unknown';
  userAgent: string;
  location?: {
    lat: number;
    lng: number;
  } | string; // "Lat,Lng" ou "Unknown"
  lastLoginAt?: any;
  referer?: string; // TRACKING REFERER
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'client' | 'agent' | 'admin';
  hasPaid?: boolean;
  isAnonymous?: boolean; 
  originCollection?: string; // TRACKING SOURCE
  metadata?: UserMetadata; // TRACKING TECH
}

export interface LeadProfile {
  uid: string;
  email: string | null;
  phoneNumber?: string | null;
  displayName: string | null;
  visaType: VisaType;
  currentScore: number;
  status: 'qualified' | 'auditing';
  auditDetails?: AuditResult;
  lastAuditAt?: any;
  callScripts?: string[];
  context?: PreAuditData; 
  originCollection?: string; // TRACKING SOURCE
  metadata?: UserMetadata; // TRACKING TECH
}

export interface CallPayload {
  visaType: string;
  reason: 'user_request' | 'urgent_departure' | string;
}

export interface AgentAction {
  type: string;
  payload: any;
}

export interface GlobalTTSState {
  currentPlayingMessageId: string | null;
  currentLoadingMessageId: string | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  messageText: string;
}

export interface GlobalTTSControls {
  seek: (progress: number) => void;
  togglePlayPause: () => void;
  stop: () => void;
}

export interface Appointment {
  id: string;
  userId: string;
  visaType: string;
  date: string;
  time: string;
  // Champs ajoutés pour le formulaire de Landing
  name?: string;
  email?: string;
  contactDetail?: string;
  contactMethod?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: any;
  originCollection?: string; // TRACKING SOURCE
  metadata?: UserMetadata; // TRACKING TECH
}

export interface LiveContext {
  result: AuditResult;
  context: PreAuditData;
  userName?: string;
  callOrigin?: string; // 'DOCUMENTS', 'DASHBOARD', 'PRE_AUDIT', etc.
}
