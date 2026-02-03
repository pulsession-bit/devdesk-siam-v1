import React, { useState, useCallback } from 'react';
import { AppStep, PreAuditData, AuditResult, CallPayload } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import LandingGeneral from './components/LandingGeneral';
import PreAuditForm from './components/PreAuditForm';
import PreAuditResult from './components/PreAuditResult';
import AuditScore from './components/AuditScore';
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
import DatabaseAudit from './components/DatabaseAudit';
import ErrorBoundary from './components/ErrorBoundary';
import { useTranslation } from 'react-i18next';
import { useAuth } from './contexts/AuthContext';
import { MessageCircle } from 'lucide-react';
import { useSession } from './hooks/useSession';
import { useChat } from './hooks/useChat';
import { performPreAudit } from './services/geminiService';

// Chat Wrapper Component
const ChatWrapper: React.FC<React.PropsWithChildren<{ onClose: () => void }>> = ({ children, onClose }) => (
  <div className="fixed inset-0 z-[150] flex justify-end items-stretch pointer-events-none">
    <div
      className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-all pointer-events-auto"
      onClick={onClose}
      role="button"
      aria-label="Fermer le chat"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    />
    <div className="pointer-events-auto w-full md:w-[450px] lg:w-[500px] shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-500 bg-[#F8FAFC]">
      {children}
    </div>
  </div>
);

function App() {
  // Session Hook (handles localStorage with debounce)
  const {
    messages,
    step,
    visaType,
    auditResult,
    isSessionLoaded,
    setStep,
    setVisaType,
    setAuditResult,
    addMessage
  } = useSession();

  // Auth
  const { user, loginAsTester, logout } = useAuth();
  useTranslation(); // Initialize i18n

  // UI States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callPayload, setCallPayload] = useState<CallPayload | null>(null);

  // Pre-audit data
  const [preAuditData, setPreAuditData] = useState<PreAuditData | null>({
    nationality: 'French',
    profession: 'Software Engineer',
    savings: '500,000 THB'
  });

  // Chat Hook
  const { isTyping, sendMessage } = useChat({
    isUserLoggedIn: !!user,
    onAuditUpdate: (result) => {
      setAuditResult(prev => prev ? { ...prev, ...result } : result as AuditResult);
    },
    onCallRequest: (payload) => {
      setCallPayload(payload);
      setIsCallModalOpen(true);
    }
  });

  // Auto-login tester on session load
  React.useEffect(() => {
    if (isSessionLoaded) {
      loginAsTester();
    }
  }, [isSessionLoaded, loginAsTester]);

  // Handlers
  const handleAuditSubmit = useCallback(async (data: PreAuditData) => {
    setPreAuditData(data);
    try {
      const result = await performPreAudit(visaType, data);
      setAuditResult(result);
      setStep(AppStep.PRE_RESULT);
    } catch (error) {
      console.error("Audit Error:", error);
    }
  }, [visaType, setAuditResult, setStep]);

  const handleSendMessage = useCallback(async (text: string) => {
    // Special command for DB audit
    if (text.toLowerCase() === 'audit db') {
      setStep(AppStep.DB_AUDIT);
      return;
    }
    await sendMessage(text, addMessage);
  }, [sendMessage, addMessage, setStep]);

  const handleOpenCall = useCallback(() => {
    setCallPayload({ visaType: visaType || 'DTV', reason: 'user_request' });
    setIsCallModalOpen(true);
  }, [visaType]);

  const handleCloseCall = useCallback((transcript?: string | null) => {
    setIsCallModalOpen(false);
    if (transcript) {
      handleSendMessage(`(Fin de l'appel). Transcript: ${transcript}`);
    }
  }, [handleSendMessage]);

  const handleNavigate = useCallback((newStep: AppStep) => {
    setStep(newStep);
  }, [setStep]);

  // Show sidebar for main app views
  const showSidebar = ![AppStep.WELCOME, AppStep.SECURITY, AppStep.QUALIFICATION].includes(step);

  return (
    <ErrorBoundary>
      <div className="flex h-full overflow-hidden font-sans bg-brand-navy selection:bg-brand-amber/30">
        {showSidebar && (
          <Sidebar
            currentStep={step}
            onNavigate={handleNavigate}
            onLogout={async () => {
              await logout();
              setStep(AppStep.WELCOME);
            }}
            isOpen={true}
            onToggle={() => {}} // Sidebar toggle not implemented yet
            themeMode="EXECUTIVE"
            user={user}
          />
        )}

        <main className="flex-1 relative overflow-hidden flex flex-col min-h-0 bg-[#F8FAFC]">
          {/* Welcome Screen */}
          {step === AppStep.WELCOME && (
            <WelcomeScreen
              onStartConcierge={() => setStep(AppStep.AUDIT)}
              onLoginRequest={() => setIsLoginModalOpen(true)}
              onNavigateToSecurity={() => setStep(AppStep.SECURITY)}
              onSelectTheme={() => {}} // Theme selection not implemented yet
            />
          )}

          {/* Landing / Qualification */}
          {step === AppStep.QUALIFICATION && (
            <LandingGeneral
              onLoginRequest={() => setIsLoginModalOpen(true)}
              onStartConcierge={() => setStep(AppStep.AUDIT)}
              onNavigateToSecurity={() => setStep(AppStep.SECURITY)}
              onNavigateToDTV={() => setVisaType('DTV')}
              onSearch={(query) => {
                setStep(AppStep.AUDIT);
                handleSendMessage(query);
              }}
            />
          )}

          {/* Audit Chat */}
          {step === AppStep.AUDIT && (
            <div className="flex-1 flex flex-col relative h-full">
              {auditResult && (
                <div className="p-4 bg-white/80 backdrop-blur border-b border-slate-200 shadow-sm z-10">
                  <AuditScore result={auditResult} />
                </div>
              )}
              <Chat
                messages={messages}
                isTyping={isTyping}
                onReply={handleSendMessage}
                onClose={() => setStep(AppStep.DASHBOARD)}
                onScheduleAppointment={() => setStep(AppStep.BOOKING)}
                onCallAgent={handleOpenCall}
              />
              <InputArea
                onSendMessage={handleSendMessage}
                disabled={isTyping}
                themeMode="EXECUTIVE"
              />
            </div>
          )}

          {/* Pre-Audit Form */}
          {step === AppStep.PRE_AUDIT && (
            <PreAuditForm
              visaType={visaType}
              onBack={() => setStep(AppStep.WELCOME)}
              onSubmit={handleAuditSubmit}
              isLoading={isTyping}
              themeMode="EXECUTIVE"
            />
          )}

          {/* Pre-Audit Result */}
          {step === AppStep.PRE_RESULT && auditResult && (
            <PreAuditResult
              result={auditResult}
              visaType={visaType}
              onContinue={() => setStep(AppStep.DASHBOARD)}
              themeMode="EXECUTIVE"
            />
          )}

          {/* Dashboard */}
          {step === AppStep.DASHBOARD && (
            <Dashboard
              result={auditResult ?? {
                audit_status: 'PENDING',
                issues: [],
                missing_docs: [],
                ready_for_payment: false,
                confidence_score: 0
              }}
              visaType={visaType}
              onConsultAgent={() => setIsChatOpen(true)}
              onUploadMore={() => setStep(AppStep.DOCUMENTS)}
              onScheduleAppointment={() => setStep(AppStep.BOOKING)}
              onStartPayment={() => setStep(AppStep.PAYMENT)}
              themeMode="EXECUTIVE"
            />
          )}

          {/* Applications */}
          {step === AppStep.APPLICATIONS && (
            <ApplicationsPage
              themeMode="EXECUTIVE"
              currentVisaType={visaType}
              auditResult={auditResult ?? undefined}
              sessions={[]}
              onNavigateToPayment={() => setStep(AppStep.PAYMENT)}
              onNavigateToDocuments={() => setStep(AppStep.DOCUMENTS)}
              onConsultAgent={() => setIsChatOpen(true)}
            />
          )}

          {/* Shop */}
          {step === AppStep.SHOP && (
            <ShopPage
              themeMode="EXECUTIVE"
              onNavigateToPayment={() => setStep(AppStep.PAYMENT)}
            />
          )}

          {/* Documents */}
          {step === AppStep.DOCUMENTS && (
            <DocumentsPage
              themeMode="EXECUTIVE"
              visaType={visaType}
              onCallAgent={() => setIsChatOpen(true)}
              onClose={() => setStep(AppStep.DASHBOARD)}
            />
          )}

          {/* Security */}
          {step === AppStep.SECURITY && (
            <SecurityPage onBack={() => setStep(AppStep.WELCOME)} />
          )}

          {/* Database Audit */}
          {step === AppStep.DB_AUDIT && (
            <DatabaseAudit onBack={() => setStep(AppStep.DASHBOARD)} />
          )}

          {/* Floating Chat Panel */}
          {isChatOpen && step !== AppStep.AUDIT && (
            <ChatWrapper onClose={() => setIsChatOpen(false)}>
              <Chat
                messages={messages}
                isTyping={isTyping}
                onReply={handleSendMessage}
                onClose={() => setIsChatOpen(false)}
                onScheduleAppointment={() => setStep(AppStep.BOOKING)}
                onCallAgent={handleOpenCall}
              />
              <InputArea
                onSendMessage={handleSendMessage}
                disabled={isTyping}
                themeMode="EXECUTIVE"
              />
            </ChatWrapper>
          )}

          {/* Call Modal */}
          {isCallModalOpen && callPayload && (
            <CallModal
              payload={callPayload}
              contextData={{
                result: auditResult ?? {
                  audit_status: 'PENDING',
                  issues: [],
                  missing_docs: [],
                  ready_for_payment: false,
                  confidence_score: 0
                },
                context: preAuditData ?? {}
              }}
              onClose={handleCloseCall}
              onMinimize={() => setIsCallModalOpen(false)}
              themeMode="EXECUTIVE"
            />
          )}

          {/* Login Modal */}
          {isLoginModalOpen && (
            <LoginModal
              onClose={() => setIsLoginModalOpen(false)}
              onNavigateToSecurity={() => {
                setIsLoginModalOpen(false);
                setStep(AppStep.SECURITY);
              }}
            />
          )}

          {/* Floating Chat Button */}
          {!isChatOpen && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-full bg-[#051229] text-[#FF9F1C] shadow-2xl flex items-center justify-center border border-white/10 hover:scale-110 active:scale-95 transition-all"
              aria-label="Ouvrir le chat"
            >
              <MessageCircle size={32} />
            </button>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
