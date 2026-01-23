
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShieldCheck, FileText, CreditCard, ChevronRight, Phone, Menu, X, Trash2, Loader2, AlertCircle } from 'lucide-react';
import Chat from './components/Chat';
import InputArea from './components/InputArea';
import VisaSelect from './components/VisaSelect';
import AuditScore from './components/AuditScore';
import CallModal from './components/CallModal';
import { ChatMessage, AppStep, VisaType, FileAttachment, AuditResult, CallPayload } from './types';
import { startAuditSession, sendMessageToAgent, resumeAuditSession, isChatSessionActive, updateChatSessionHistoryWithTranscript } from './services/geminiService';


const STORAGE_KEY = 'siam_visa_pro_session_v1';

function App() {
  const [step, setStep] = useState<AppStep>(AppStep.QUALIFICATION);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [visaType, setVisaType] = useState<VisaType>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null); // New state for critical errors
  const [sessionId, setSessionId] = useState<string | null>(null); // New state for session ID
  
  // Call Feature State
  const [callPayload, setCallPayload] = useState<CallPayload | null>(null);


  // 1. Load Session on Mount
  useEffect(() => {
    let mounted = true;
    
    const initApp = async () => {
      try {
        // --- IMMEDIATE API KEY CHECK ---
        if (!process.env.API_KEY) {
          if (mounted) {
            setInitializationError("Erreur critique: La clé API n'est pas configurée. Veuillez vérifier votre environnement de déploiement (process.env.API_KEY).");
          }
          return; // Stop further initialization
        }
        // --- END API KEY CHECK ---

        let sessionWasRestoredToReactState = false;
        let currentSessionId: string = Date.now().toString(); // Default to new ID

        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            if (parsed.messages && parsed.messages.length > 0) {
              // Restore existing session ID
              currentSessionId = parsed.sessionId || Date.now().toString(); // Fallback for old sessions without ID
              
              // Restore React states first
              if (mounted) {
                setMessages(parsed.messages);
                setStep(parsed.step || AppStep.QUALIFICATION);
                setVisaType(parsed.visaType || null);
                setAuditResult(parsed.auditResult || null);
                setCallPayload(parsed.callPayload || null);
                setSessionId(currentSessionId);
              }

              // Then attempt to restore Gemini session with history
              await resumeAuditSession(parsed.messages, currentSessionId);
              sessionWasRestoredToReactState = true;
            }
          } catch (e) {
            console.error("Failed to restore session from localStorage", e);
            localStorage.removeItem(STORAGE_KEY); // Clear corrupt data
          }
        }

        // If no session was restored, or if a problem occurred during resume, start a fresh one
        if (!sessionWasRestoredToReactState || !isChatSessionActive()) {
          // Ensure sessionId is set if a new one was generated or not yet in state
          if (mounted) {
            setSessionId(currentSessionId);
          }
          setIsTyping(true); // Indicate initial typing for new session
          try {
            const welcomeText = await startAuditSession(currentSessionId); // Pass new ID to service
            if (mounted) {
              addMessage(welcomeText, 'agent');
            }
          } catch (error: any) { // Catch any error from startAuditSession
            if (mounted) {
              console.error("Error starting audit session:", error);
              addMessage(`Erreur de connexion à l'IA Auditeur: ${error.message || 'Problème inconnu'}.`, 'system');
            }
          } finally {
            if (mounted) setIsTyping(false);
          }
        }

        if (mounted) {
          setIsSessionLoaded(true); // Mark session data loaded into React
        }

      } catch (globalError: any) { // Catch any critical error during initApp
        console.error("Critical error during app initialization:", globalError);
        if (mounted) {
            setInitializationError(`Une erreur critique est survenue au démarrage de l'application: ${globalError.message || 'Problème inconnu'}.`);
        }
      } finally {
        if (mounted) setIsLoadingApp(false); // Always set to false when init process is done
      }
    };

    initApp();

    return () => { mounted = false; };
  }, []); // Empty dependency array, runs once on mount

  // 2. Save Session on Changes
  useEffect(() => {
    if (!isSessionLoaded || !sessionId) return; // Don't save before initial load or if no sessionId

    const sessionData = {
      sessionId, // Include sessionId here
      messages,
      step,
      visaType,
      auditResult,
      callPayload,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
  }, [sessionId, messages, step, visaType, auditResult, callPayload, isSessionLoaded]);

  // No TTS audio cleanup needed anymore


  const clearSession = () => {
    if (confirm("Voulez-vous vraiment effacer l'historique et recommencer ?")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  // Update step based on Audit Result
  useEffect(() => {
    if (auditResult) {
      if (auditResult.ready_for_payment && step !== AppStep.PAYMENT) {
        setStep(AppStep.PAYMENT);
      } else if (step === AppStep.QUALIFICATION && auditResult.visa_type) {
         // If agent detected visa type from chat, set it
         if (['DTV', 'Tourism', 'Retirement', 'Business'].some(t => auditResult.visa_type?.includes(t))) {
            setStep(AppStep.AUDIT);
         }
      }
    }
  }, [auditResult, step]);

  const addMessage = (text: string, sender: 'user' | 'agent' | 'system', attachments?: FileAttachment[]) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: Date.now(),
      attachments
    }]);
  };

  const handleVisaSelect = (type: VisaType) => {
    setVisaType(type);
    setStep(AppStep.AUDIT);
    // Inform agent of selection
    handleUserMessage(`Je souhaite postuler pour le visa : ${type}`, []);
  };

  const handleUserMessage = async (text: string, files: FileAttachment[]) => {
    addMessage(text, 'user', files);
    setIsTyping(true);

    try {
      const response = await sendMessageToAgent(text, files);
      addMessage(response.text, 'agent');
      
      // Handle Audit Updates
      if (response.auditResult) {
        setAuditResult(response.auditResult);
      }

      // Handle Actions (Click-to-Call)
      if (response.action && response.action.action === 'request_call') {
        setCallPayload(response.action.payload);
      }

    } catch (error) {
      addMessage("Une erreur est survenue.", 'system');
    } finally {
      setIsTyping(false);
    }
  };

  const handleManualCallRequest = () => {
    setCallPayload({
      reason: "user_request",
      visaType: visaType || "Non Défini",
      userStage: step,
      notes: "Demande manuelle de l'utilisateur via l'interface."
    });
  };


  const renderSidebar = () => (
    <div className={`
      fixed inset-0 z-40 md:static md:inset-auto w-full md:w-80 bg-brand-navy border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col h-screen transition-transform duration-300
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-amber rounded-lg flex items-center justify-center text-brand-navy">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="font-bold text-white text-base">Siam Visa Pro</h1>
            <p className="text-xs text-brand-amber font-medium uppercase tracking-wider whitespace-nowrap">Immigration Talentueuse</p>
          </div>
        </div>
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <nav className="space-y-6 flex-1">
        <StepItem 
          active={step === AppStep.QUALIFICATION} 
          completed={step !== AppStep.QUALIFICATION}
          label="Qualification"
          desc="Choix du Visa"
          icon={<FileText size={18} />}
        />
        <StepItem 
          active={step === AppStep.AUDIT} 
          completed={step === AppStep.PAYMENT}
          label="Audit IA"
          desc="Analyse documentaire"
          icon={<ShieldCheck size={18} />}
        />
        <StepItem 
          active={step === AppStep.PAYMENT} 
          completed={false}
          label="Validation"
          desc="Paiement & Dépôt"
          icon={<CreditCard size={18} />}
        />
      </nav>

      {/* Manual Call Trigger Button */}
      <div className="mt-6 space-y-3">
        <button 
          onClick={() => { handleManualCallRequest(); setIsMobileMenuOpen(false); }}
          className="w-full flex items-center justify-center gap-2 bg-brand-amber text-brand-navy hover:bg-brand-yellow py-4 rounded-xl transition-colors font-bold text-sm shadow-lg shadow-brand-amber/20"
        >
          <Phone size={18} />
          <span>Parler à un expert</span>
        </button>
        
        {/* Reset Session Button (Hidden utility mostly, but useful for user) */}
        <button 
          onClick={clearSession}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 py-3 rounded-lg transition-colors text-xs font-medium"
        >
          <Trash2 size={14} />
          <span>Nouvelle Demande</span>
        </button>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-800 hidden md:block">
        <div className="text-xs text-slate-400 text-center">
          Powered by Gemini 2.5 Flash
          <br />
          System Status: <span className="text-green-400">Online</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-brand-light">
      {isLoadingApp ? (
        <div className="flex items-center justify-center min-h-screen w-full bg-brand-navy text-white">
          {initializationError ? (
            <div className="text-center p-8 bg-red-800/90 rounded-lg shadow-xl max-w-md">
              <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Erreur de Démarrage</h2>
              <p className="text-red-100 mb-4">{initializationError}</p>
              <p className="text-red-200 text-sm">Veuillez vérifier la configuration de votre clé API.</p>
            </div>
          ) : (
            <div className="flex items-center">
              <Loader2 className="w-8 h-8 animate-spin mr-3 text-brand-amber" />
              <span className="text-lg font-medium">Chargement de l'auditeur...</span>
            </div>
          )}
        </div>
      ) : (
        <>
          {renderSidebar()}

          {/* Mobile Header */}
          <header className="bg-brand-navy border-b border-slate-800 p-4 flex items-center justify-between md:hidden z-30 sticky top-0">
             <div className="flex items-center gap-3">
               <button onClick={() => setIsMobileMenuOpen(true)} className="text-white">
                 <Menu size={24} />
               </button>
               <span className="font-semibold text-white">Siam Visa Pro</span>
             </div>
             <div className="flex items-center gap-3">
               <button 
                  onClick={handleManualCallRequest}
                  className="p-2 text-brand-navy bg-brand-amber rounded-full"
                  title="Demander un rappel"
               >
                  <Phone size={18} />
               </button>
             </div>
          </header>

          <main className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen relative">
            
            {/* Dynamic Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              
              {/* Top Layer: Visa Selector (if Step 1) */}
              {step === AppStep.QUALIFICATION && messages.length < 3 && (
                <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
                   <h2 className="text-2xl font-bold text-brand-navy mb-2">Quel est votre projet ?</h2>
                   <p className="text-slate-500 mb-8">L'agent va configurer l'audit selon le type de visa.</p>
                   <VisaSelect onSelect={handleVisaSelect} selected={visaType} />
                </div>
              )}

              {/* Payment Gateway Overlay */}
              {step === AppStep.PAYMENT && (
                 <div className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom duration-500">
                    <div className="max-w-md w-full text-center space-y-6">
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <ShieldCheck size={40} />
                      </div>
                      <h2 className="text-3xl font-bold text-brand-navy">Audit Validé !</h2>
                      <p className="text-slate-600">
                        Votre dossier a obtenu un score de confiance de <strong>{auditResult?.confidence_score}%</strong>.
                        Nos experts sont prêts à prendre le relais pour le dépôt officiel.
                      </p>
                      
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-600">Frais de service (Siam Visa Pro)</span>
                          <span className="font-bold text-brand-navy">1,000.00 €</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-400">
                          <span>Inclus: Revue finale, Dépôt Ambassade, Suivi</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => alert("Redirection vers la passerelle de paiement...")}
                        className="w-full bg-brand-amber hover:bg-brand-yellow text-brand-navy font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <CreditCard size={20} />
                        Payer et Finaliser
                      </button>
                      <button 
                        onClick={() => setStep(AppStep.AUDIT)}
                        className="text-slate-400 hover:text-brand-navy text-sm"
                      >
                        Retourner à l'audit
                      </button>
                    </div>
                 </div>
              )}

              {/* Call Modal Overlay */}
              {callPayload && (
                <CallModal 
                  payload={callPayload} 
                  onClose={(transcript) => {
                     setCallPayload(null);
                     if (transcript) {
                        addMessage(`📄 **COMPTE-RENDU DE L'APPEL**\n\n${transcript}`, 'system');
                        // IMPORTANT: Update Gemini session history with the transcript
                        updateChatSessionHistoryWithTranscript(transcript);
                     }
                  }} 
                />
              )}

              {/* Chat Layer */}
              <div className="flex-1 flex flex-col relative bg-brand-light">
                {/* Live Audit Score Overlay (if results exist and we are auditing) */}
                {auditResult && step === AppStep.AUDIT && (
                  <div className="p-4 bg-white/80 backdrop-blur border-b border-slate-200 shadow-sm z-10">
                    <AuditScore result={auditResult} />
                  </div>
                )}
                
                <Chat messages={messages} isTyping={isTyping} />
                <InputArea onSendMessage={handleUserMessage} disabled={step === AppStep.PAYMENT} />
              </div>

            </div>
          </main>
        </>
      )}
    </div>
  );
}

// Helper Component for Sidebar Steps
const StepItem = ({ active, completed, label, desc, icon }: { active: boolean; completed: boolean; label: string; desc: string; icon: React.ReactNode }) => (
  <div className={`flex items-start gap-3 transition-opacity duration-300 ${active || completed ? 'opacity-100' : 'opacity-40'}`}>
    <div className={`
      w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2
      ${completed 
        ? 'bg-green-500 border-green-500 text-white' 
        : active 
          ? 'border-brand-amber text-brand-amber bg-brand-navy' 
          : 'border-slate-600 text-slate-600'}
    `}>
      {completed ? <ShieldCheck size={14} /> : icon}
    </div>
    <div className={active ? 'transform translate-x-1 transition-transform' : ''}>
      <h3 className={`text-sm font-semibold ${active ? 'text-brand-amber' : 'text-slate-300'}`}>{label}</h3>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  </div>
);

export default App;
