
import React, { useState } from 'react';
import { CheckCircle2, User, ChevronRight, MessageSquare, CreditCard, Lock, Database, Cpu, Mail, Check, Loader2, LayoutDashboard, FileText, X, PenTool, Copy, Zap, ArrowRight, ShieldCheck, Activity, Fingerprint, EyeOff, Server, AlertCircle } from 'lucide-react';
import { AuditResult, VisaType, PreAuditData, ThemeMode, Appointment } from '../types';
import AuditScore from './AuditScore';
import AppointmentCard from './AppointmentCard';
import { sendConfirmationEmail } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { generateEmbassyBrief } from '../services/geminiService';
import { useTranslation } from 'react-i18next';

interface DashboardProps {
  result: AuditResult;
  visaType: VisaType;
  context?: PreAuditData;
  onConsultAgent: () => void;
  onUploadMore: () => void;
  onScheduleAppointment: (date: string, time: string) => void;
  onStartPayment: () => void;
  themeMode: ThemeMode;
  appointment?: Appointment | null;
  hasPaid?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ result, visaType, context, onConsultAgent, onUploadMore, onScheduleAppointment, onStartPayment, themeMode, appointment, hasPaid }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [embassyLetter, setEmbassyLetter] = useState<string | null>(null);

  const handleSendEmail = async () => {
    if (!user || !user.email) return;
    setEmailLoading(true);
    try {
      await sendConfirmationEmail(user.email, user.displayName || 'Client', visaType || 'DTV', result);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (e) {
      console.error("Email trigger error:", e);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGenerateLetter = async () => {
    if (!context) return;
    setGeneratingLetter(true);
    try {
        const letter = await generateEmbassyBrief(visaType || 'DTV', context);
        setEmbassyLetter(letter);
    } catch (e) {
        console.error("Generate Letter Error", e);
    } finally {
        setGeneratingLetter(false);
    }
  };

  const LockedFeature = ({ children, onUnlock }: { children?: React.ReactNode, onUnlock: () => void }) => {
    if (hasPaid) return <>{children}</>;
    return (
      <div className="relative group overflow-hidden rounded-[2.5rem]">
        <div 
          className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white/50"
          onClick={onUnlock}
        >
          <div className="p-3 rounded-full mb-2 bg-[#051229] text-[#FF9F1C] shadow-lg">
            <Lock size={20} />
          </div>
          <span className="font-bold uppercase text-[10px] tracking-widest px-4 py-2 rounded-lg bg-white text-[#051229] shadow-sm">
            Fonctionnalité Verrouillée
          </span>
        </div>
        <div className="pointer-events-none filter blur-[2px] opacity-50">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#F8FAFC] scroll-container">
      
      {/* HEADER DESKSIAM (Design Noir/Navy) */}
      <div className="bg-[#051229] px-6 py-8 md:px-12 md:py-10 border-b border-white/5 shadow-2xl relative overflow-hidden">
         {/* Background elements */}
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Cpu size={300} /></div>
         
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#FF9F1C] shadow-lg">
                    <LayoutDashboard size={32} />
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="px-2 py-0.5 bg-[#FF9F1C] text-[#051229] text-[9px] font-black uppercase tracking-widest rounded-sm">Session Active</span>
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">#{user?.uid.slice(0, 6).toUpperCase()}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl text-white leading-none">
                        <span className="font-sans font-bold tracking-tight">{t('dashboard.title')}</span><span className="font-serif font-normal text-[#FF9F1C]">SIAM</span>
                    </h1>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">{t('dashboard.subtitle')}</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                    <p className="text-[10px] font-bold text-[#FF9F1C] uppercase tracking-widest mb-1">Status</p>
                    <p className="text-xl font-bold text-white uppercase tracking-tight">
                        {hasPaid ? t('dashboard.status_active') : t('dashboard.status_pending')}
                    </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${hasPaid ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                    {hasPaid ? <CheckCircle2 size={24} /> : <Lock size={20} />}
                </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-24">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLONNE GAUCHE (Score & Action) */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* CARTE VISASCORE (Blanche) */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 text-center relative overflow-hidden group">
                    <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mb-6">{t('dashboard.score_analysis')}</h3>
                    <div className="flex justify-center mb-6">
                        <AuditScore result={result} themeMode={themeMode} />
                    </div>
                    {result.confidence_score !== undefined && result.confidence_score < 80 && (
                         <div className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2">
                             <X size={12} /> {t('dashboard.critical_file')}
                         </div>
                    )}
                </div>

                {/* CARTE RDV CONFIRMÉ (Si RDV pris) */}
                {appointment && (
                    <AppointmentCard 
                        visaType={appointment.visaType || 'DTV'} 
                        score={result.confidence_score || 0} 
                        onSchedule={() => {}} 
                        isConfirmed={true} 
                    />
                )}

                {/* CARTE ACTION REQUISE (Sombre) - Si pas payé */}
                {!hasPaid ? (
                    <div className="bg-[#051229] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden text-white group cursor-pointer hover:scale-[1.02] transition-transform duration-300" onClick={onStartPayment}>
                         <div className="absolute top-0 right-0 p-6 opacity-10"><CreditCard size={100} /></div>
                         <div className="relative z-10">
                             <span className="bg-[#FF9F1C] text-[#051229] px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-4 inline-block">{t('dashboard.action_required')}</span>
                             <h3 className="text-2xl font-serif font-normal mb-2">{t('dashboard.activate_file')}</h3>
                             <p className="text-xs text-slate-400 mb-6 leading-relaxed max-w-[200px]">
                                 {t('dashboard.activate_desc')}
                             </p>
                             <button className="w-full py-4 bg-[#FF9F1C] hover:bg-amber-400 text-[#051229] rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                                 {t('dashboard.btn_activate')}
                                 <ArrowRight size={16} />
                             </button>
                             <p className="text-[9px] text-center mt-3 opacity-60">(~ 2 min)</p>
                         </div>
                    </div>
                ) : (
                    // Widget Support Agent si payé
                    <button onClick={onConsultAgent} className="w-full bg-white text-[#051229] border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex items-center justify-between group hover:border-[#FF9F1C] transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-[#051229] transition-colors">
                              <MessageSquare size={24} className="text-slate-400 group-hover:text-[#FF9F1C]" />
                           </div>
                           <div className="text-left">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.support_ai')}</p>
                              <p className="font-bold uppercase tracking-tight">{t('dashboard.open_concierge')}</p>
                           </div>
                        </div>
                        <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform text-slate-300 group-hover:text-[#FF9F1C]" />
                     </button>
                )}

                {/* Status Blocks Small */}
                {!hasPaid && !appointment && (
                     <div className="bg-slate-100 rounded-3xl p-6 flex items-center gap-4 opacity-70">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                            <User size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#051229]">Analyse terminée.</p>
                            <p className="text-[10px] text-slate-500">En attente d'activation.</p>
                        </div>
                     </div>
                )}
            </div>

            {/* COLONNE DROITE (Dossier & Outils) */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* CARTE DOSSIER CANDIDAT */}
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-8 mb-8">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                 <User size={24} />
                             </div>
                             <h3 className="text-2xl font-serif text-[#051229] uppercase tracking-wide">{t('dashboard.file_candidate')}</h3>
                         </div>
                         <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                             <Database size={12} />
                             <span className="text-[9px] font-bold uppercase tracking-widest">Belgium Secure Storage</span>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Timeline Verticale */}
                        <div className="space-y-6 relative">
                            {/* Ligne verticale */}
                            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100"></div>

                            {/* Etape 1 */}
                            <div className="relative flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs relative z-10 border-4 border-white">1.</div>
                                <span className="text-sm font-medium text-[#051229]">{t('dashboard.step_created')}</span>
                            </div>

                            {/* Etape 2 (Active/Blocked) */}
                            <div className="relative flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs relative z-10 border-4 border-white ${hasPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>2.</div>
                                <div className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold ${hasPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                    {hasPaid ? t('dashboard.step_ai_validated') : t('dashboard.step_ai_required')}
                                </div>
                            </div>

                            {/* Etape 3 */}
                             <div className="relative flex items-center gap-4 opacity-50">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs relative z-10 border-4 border-white">3.</div>
                                <span className="text-sm font-medium text-slate-500">{t('dashboard.step_expert')}</span>
                            </div>

                            {/* Etape 4 */}
                            <div className="relative flex items-center gap-4 opacity-50">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs relative z-10 border-4 border-white">4.</div>
                                <span className="text-sm font-medium text-slate-500">{t('dashboard.step_official')}</span>
                            </div>
                        </div>

                        {/* Details Candidat */}
                        <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-100 space-y-6">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('pre_audit.section_identity')}</p>
                                <div className="h-px w-10 bg-slate-200 mb-4"></div>
                                
                                <div className="mb-4">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t('pre_audit.label_nationality')}</p>
                                    <p className="text-sm font-bold text-[#051229]">{context?.nationality || '...'}</p>
                                </div>
                                
                                <div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t('pre_audit.label_profession')}</p>
                                    <p className="text-sm font-bold text-[#051229] flex items-center gap-2">
                                        {context?.profession || '...'}
                                        <ArrowRight size={12} className="text-slate-300" />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Card */}
                    <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-4 opacity-60">
                         <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                             <FileText size={16} />
                         </div>
                         <div>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-[#051229]">Besgium S2ietop Storage</p>
                             <p className="text-[9px] text-slate-400 uppercase tracking-widest">DeskSIAM - Le Guichet Authoritatif</p>
                         </div>
                    </div>
                </div>

                {/* GENERATEUR LETTRE (Optionnel si payé) */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 bg-[#FF9F1C]/10 text-[#FF9F1C] rounded-xl flex items-center justify-center">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#051229] uppercase tracking-wide text-sm">{t('dashboard.letter_title')}</h4>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t('dashboard.letter_desc')}</p>
                        </div>
                    </div>
                    <LockedFeature onUnlock={onStartPayment}>
                        <button 
                            onClick={handleGenerateLetter}
                            disabled={generatingLetter}
                            className="w-full py-4 rounded-2xl border border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-xs hover:border-[#FF9F1C] hover:text-[#051229] hover:bg-amber-50/50 transition-all flex items-center justify-center gap-2 group"
                        >
                            {generatingLetter ? <Loader2 size={16} className="animate-spin" /> : <PenTool size={16} />}
                            {generatingLetter ? t('dashboard.btn_generating') : t('dashboard.btn_generate_letter')}
                        </button>
                    </LockedFeature>
                </div>

                {/* MODULE SECURITE (Dark) */}
                <div className="bg-[#051229] rounded-[2.5rem] p-8 border border-white/10 relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400 border border-white/10">
                            <Lock size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">{t('dashboard.security_center')}</h3>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[#FF9F1C]">DeskSIAM • Isolement Actif</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                            <div className="p-1.5 bg-emerald-500/10 w-fit rounded text-emerald-400 mb-2"><Server size={14} /></div>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Stockage</p>
                            <p className="text-xs font-bold text-white">{t('dashboard.storage_hermetic')}</p>
                            <p className="text-[8px] text-slate-500 truncate">ID: {user?.uid.slice(0,8)}***</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                            <div className="p-1.5 bg-blue-500/10 w-fit rounded text-blue-400 mb-2"><EyeOff size={14} /></div>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Permission IA</p>
                            <p className="text-xs font-bold text-white">{t('dashboard.permission_context')}</p>
                            <p className="text-[8px] text-slate-500">Pas de mémoire long terme</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                            <div className="p-1.5 bg-amber-500/10 w-fit rounded text-amber-400 mb-2"><Activity size={14} /></div>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Traçabilité</p>
                            <p className="text-xs font-bold text-white">{t('dashboard.audit_log')}</p>
                            <p className="text-[8px] text-slate-500">Session chiffrée SSL</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>

      </div>

      {/* MODALE LETTRE AMBASSADE */}
      {embassyLetter && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#051229]/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#051229] text-white rounded-xl flex items-center justify-center">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="font-serif text-lg text-[#051229]">{t('dashboard.letter_title')}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ambassade Royale de Thaïlande</p>
                        </div>
                    </div>
                    <button onClick={() => setEmbassyLetter(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-white font-serif text-slate-800 leading-loose text-sm md:text-base whitespace-pre-wrap">
                    {embassyLetter}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
                    <button 
                        onClick={() => {navigator.clipboard.writeText(embassyLetter); alert('Copié !');}}
                        className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-xs hover:bg-slate-100 flex items-center gap-2"
                    >
                        <Copy size={16} /> Copier
                    </button>
                    <button 
                        onClick={() => setEmbassyLetter(null)}
                        className="px-6 py-3 rounded-xl bg-[#051229] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#0F264A]"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
