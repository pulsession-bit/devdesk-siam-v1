import React, { useState, useEffect } from 'react';
import { AppStep, VisaType, PreAuditData, ChatMessage, AuditResult } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import LandingGeneral from './components/LandingGeneral';
import PreAuditForm from './components/PreAuditForm';
import PreAuditResult from './components/PreAuditResult';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import InputArea from './components/InputArea';
import SecurityPage from './components/SecurityPage';
import LoginModal from './components/LoginModal';
import { ApplicationsPage } from './components/ApplicationsPage';
import ShopPage from './components/ShopPage';
import DocumentsPage from './components/DocumentsPage';
import CallModal from './components/CallModal';
import { useTranslation } from 'react-i18next';
import { useAuth } from './contexts/AuthContext';
import { MessageCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { sendMessageToAgent } from './services/geminiService';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "mock-key";
const ai = new GoogleGenAI({ apiKey });

// Using React.PropsWithChildren to ensure 'children' is correctly handled
const ChatWrapper = ({ children, onClose }: React.PropsWithChildren<{ onClose: () => void }>) => (
  <div className="fixed inset-0 z-[150] flex justify-end items-stretch pointer-events-none">
    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-all pointer-events-auto" onClick={onClose} />
    <div className="pointer-events-auto w-full md:w-[450px] lg:w-[500px] shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-500 bg-[#F8FAFC]">
      {children}
    </div>
  </div>
);

function App() {
  const [step, setStep] = useState<AppStep>(AppStep.DASHBOARD);
  const [visaType, setVisaType] = useState<VisaType>('DTV');
  const [preAuditData, setPreAuditData] = useState<PreAuditData | null>({
    nationality: 'French',
    profession: 'Software Engineer',
    savings: '500,000 THB'
  });
  const [auditResult, setAuditResult] = useState<AuditResult | null>({
    audit_status: 'VALID',
    confidence_score: 95,
    summary: 'Profil test validé automatiquement.',
    issues: [],
    missing_docs: [],
    ready_for_payment: true
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // New States for Call
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callPayload, setCallPayload] = useState<any>(null);

  const { i18n } = useTranslation();
  const { user, loginAsTester } = useAuth();

  useEffect(() => {
    loginAsTester();
  }, []);

  const handleAuditSubmit = async (data: PreAuditData) => {
    setPreAuditData(data);
    setIsTyping(true);
    try {
      // Simple audit simulation if needed or call real service
      // For now kept simple as per original
      setAuditResult({
        audit_status: 'VALID',
        confidence_score: 95,
        summary: "Analysis complete.",
        issues: [],
        missing_docs: [],
        ready_for_payment: true
      });
      setStep(AppStep.PRE_RESULT);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), text, sender: 'user', timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await sendMessageToAgent(text, [], !!user);

      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'agent',
        timestamp: Date.now(),
        suggestions: response.suggestions,
        actionPayload: response.auditResult
      };

      setMessages(prev => [...prev, agentMsg]);

      // Click-to-Call Action
      if (response.action && response.action.action === 'request_call') {
        setCallPayload(response.action.payload);
        setIsCallModalOpen(true);
      }

      // Live Audit Update
      if (response.auditResult) {
        setAuditResult(prev => ({ ...prev, ...response.auditResult }));
      }

    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessage = { id: Date.now().toString(), text: "Désolé, une erreur est survenue.", sender: 'agent', timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden font-sans bg-brand-navy selection:bg-brand-amber/30">
      {step !== AppStep.WELCOME && step !== AppStep.SECURITY && step !== AppStep.QUALIFICATION && (
        <Sidebar
          currentStep={step}
          onNavigate={(s) => setStep(s)}
          onLogout={() => setStep(AppStep.WELCOME)}
          isOpen={true}
          onToggle={() => { }}
          themeMode="EXECUTIVE"
          user={user}
        />
      )}

      <main className="flex-1 relative overflow-hidden flex flex-col min-h-0 bg-[#F8FAFC]">
        {step === AppStep.WELCOME && (
          <WelcomeScreen
            onStartConcierge={() => setIsChatOpen(true)}
            onLoginRequest={() => setIsLoginModalOpen(true)}
            onNavigateToSecurity={() => setStep(AppStep.SECURITY)}
            onSelectTheme={() => { }}
          />
        )}

        {step === AppStep.QUALIFICATION && (
          <LandingGeneral
            onLoginRequest={() => setIsLoginModalOpen(true)}
            onStartConcierge={() => setIsChatOpen(true)}
            onNavigateToSecurity={() => setStep(AppStep.SECURITY)}
            onNavigateToDTV={() => setVisaType('DTV')}
          />
        )}

        {step === AppStep.PRE_AUDIT && (
          <PreAuditForm
            visaType={visaType}
            onBack={() => setStep(AppStep.WELCOME)}
            onSubmit={handleAuditSubmit}
            isLoading={isTyping}
            themeMode="EXECUTIVE"
          />
        )}

        {step === AppStep.PRE_RESULT && auditResult && (
          <PreAuditResult
            result={auditResult}
            visaType={visaType}
            onContinue={() => setStep(AppStep.DASHBOARD)}
            themeMode="EXECUTIVE"
          />
        )}

        {step === AppStep.DASHBOARD && (
          <Dashboard
            result={auditResult || { audit_status: 'PENDING', issues: [], missing_docs: [], ready_for_payment: false, confidence_score: 0 }}
            visaType={visaType}
            onConsultAgent={() => setIsChatOpen(true)}
            onUploadMore={() => { }}
            onScheduleAppointment={() => { }}
            onStartPayment={() => { }}
            themeMode="EXECUTIVE"
          />
        )}

        {step === AppStep.APPLICATIONS && (
          <ApplicationsPage
            themeMode="EXECUTIVE"
            currentVisaType={visaType}
            auditResult={auditResult || undefined}
            sessions={[]}
            onNavigateToPayment={() => setStep(AppStep.PAYMENT)}
            onNavigateToDocuments={() => setStep(AppStep.DOCUMENTS)}
            onConsultAgent={() => setIsChatOpen(true)}
          />
        )}

        {step === AppStep.SHOP && (
          <ShopPage
            themeMode="EXECUTIVE"
            onNavigateToPayment={() => setStep(AppStep.PAYMENT)}
          />
        )}

        {step === AppStep.DOCUMENTS && (
          <DocumentsPage
            themeMode="EXECUTIVE"
            visaType={visaType}
            onCallAgent={() => setIsChatOpen(true)}
            onClose={() => setStep(AppStep.DASHBOARD)}
          />
        )}

        {step === AppStep.SECURITY && (
          <SecurityPage onBack={() => setStep(AppStep.WELCOME)} />
        )}

        {isChatOpen && (
          <ChatWrapper onClose={() => setIsChatOpen(false)}>
            <Chat
              messages={messages}
              isTyping={isTyping}
              onReply={handleSendMessage}
              onClose={() => setIsChatOpen(false)}
              onScheduleAppointment={() => setStep(AppStep.BOOKING)}
              onCallAgent={() => {
                setCallPayload({ visaType, reason: 'user_request' });
                setIsCallModalOpen(true);
              }}
            />
            <InputArea
              onSendMessage={(text) => handleSendMessage(text)}
              disabled={isTyping}
              themeMode="EXECUTIVE"
            />
          </ChatWrapper>
        )}

        {isCallModalOpen && callPayload && (
          <CallModal
            payload={callPayload}
            contextData={{ result: auditResult!, context: preAuditData || {} }}
            onClose={(transcript) => {
              setIsCallModalOpen(false);
              if (transcript) handleSendMessage(`(Fin de l'appel). Transcript: ${transcript}`);
            }}
            onMinimize={() => setIsCallModalOpen(false)}
            themeMode="EXECUTIVE"
          />
        )}

        {isLoginModalOpen && (
          <LoginModal
            onClose={() => setIsLoginModalOpen(false)}
            onNavigateToSecurity={() => {
              setIsLoginModalOpen(false);
              setStep(AppStep.SECURITY);
            }}
          />
        )}

        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-full bg-[#051229] text-[#FF9F1C] shadow-2xl flex items-center justify-center border border-white/10 hover:scale-110 active:scale-95 transition-all"
          >
            <MessageCircle size={32} />
          </button>
        )}
      </main>
    </div>
  );
}

export default App;
