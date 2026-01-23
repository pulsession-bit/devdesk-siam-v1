
import React, { useState, useMemo, useEffect } from 'react';
import { 
  FolderClock, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  CreditCard,
  Send,
  Download,
  Check,
  Lock,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { ThemeMode, VisaType, AuditResult } from '../types';
import { useTranslation } from 'react-i18next';

interface ApplicationsPageProps {
  themeMode: ThemeMode;
  currentVisaType?: VisaType;
  auditResult?: AuditResult;
  sessions?: any[]; 
  onNavigateToPayment: () => void;
  onNavigateToDocuments: () => void;
  onConsultAgent: () => void;
}

interface ApplicationSession {
  id: string;
  type: VisaType;
  status: 'AUDITING' | 'PAYMENT_PENDING' | 'DOCS_PENDING' | 'SUBMITTED' | 'APPROVED';
  createdAt: string;
  updatedAt: string;
  progress: number; 
  score?: number;
}

export const ApplicationsPage: React.FC<ApplicationsPageProps> = ({ 
  themeMode, 
  currentVisaType, 
  auditResult,
  sessions = [], 
  onNavigateToPayment,
  onNavigateToDocuments,
  onConsultAgent
}) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  // Transformation des données sessions en format d'affichage
  const applications: ApplicationSession[] = useMemo(() => {
    let apps = sessions.map(s => {
        let status: ApplicationSession['status'] = 'AUDITING';
        
        if (s.status === 'closed' || s.visa?.confidence > 95) {
            status = 'APPROVED';
        } else if (s.visa?.confidence > 80) {
            status = 'PAYMENT_PENDING';
        } else if (s.visa?.confidence > 40) {
            status = 'DOCS_PENDING';
        }

        return {
            id: s.id,
            type: s.visa?.type || 'DTV',
            status,
            createdAt: new Date(s.createdAt).toLocaleDateString(i18n.language),
            updatedAt: new Date(s.lastActiveAt || s.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' }),
            progress: 0, 
            score: s.visa?.confidence
        };
    });

    if (apps.length === 0 && currentVisaType) {
        apps.push({
            id: 'NEW-SESSION',
            type: currentVisaType,
            status: auditResult?.audit_status === 'VALID' ? 'PAYMENT_PENDING' : 'AUDITING',
            createdAt: new Date().toLocaleDateString(i18n.language),
            updatedAt: new Date().toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' }),
            progress: 0,
            score: auditResult?.confidence_score || 85
        });
    }

    return apps;
  }, [sessions, currentVisaType, auditResult, i18n.language]);

  const filteredApps = applications.filter(app => 
    activeTab === 'ACTIVE' ? app.status !== 'APPROVED' : app.status === 'APPROVED'
  );

  const getTimelineSteps = (status: ApplicationSession['status']) => {
    const steps = [
      { id: 'audit', label: t('applications.step_audit'), icon: <CheckCircle2 size={12} /> },
      { id: 'payment', label: t('applications.step_mandate'), icon: <CreditCard size={12} /> },
      { id: 'docs', label: t('applications.step_docs'), icon: <FolderClock size={12} /> },
      { id: 'review', label: t('applications.step_review'), icon: <ShieldCheck size={12} /> },
      { id: 'visa', label: t('applications.step_visa'), icon: <Send size={12} /> }
    ];
    
    let currentIndex = 0;
    if (status === 'PAYMENT_PENDING') currentIndex = 1;
    if (status === 'DOCS_PENDING') currentIndex = 2;
    if (status === 'SUBMITTED') currentIndex = 3;
    if (status === 'APPROVED') currentIndex = 4;

    return steps.map((step, idx) => ({
      ...step,
      state: idx < currentIndex ? 'completed' : idx === currentIndex ? 'current' : 'locked'
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-[#F8FAFC] font-sans text-[#051229]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* COLONNE GAUCHE : Intro & Filtres */}
        <div className="lg:w-1/3 space-y-8 sticky top-6">
           <div className="space-y-4">
               {/* Logo Animé */}
               <div className="w-12 h-12 bg-[#051229] rounded-2xl flex items-center justify-center text-[#FF9F1C] shadow-lg shadow-brand-navy/20">
                  <FolderClock size={24} />
               </div>
               
               <h1 className="text-4xl md:text-5xl font-serif font-medium leading-tight">
                  {t('applications.title')}<br/> {t('applications.title_sub')}
               </h1>
               
               <p className="text-slate-500 text-sm leading-relaxed">
                  {t('applications.desc')}
               </p>
           </div>

           {/* Switcher Tab Style Pill */}
           <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
              <button 
                onClick={() => setActiveTab('ACTIVE')}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === 'ACTIVE' 
                    ? 'bg-[#051229] text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t('applications.tab_active')} ({applications.filter(a => a.status !== 'APPROVED').length})
              </button>
              <button 
                onClick={() => setActiveTab('ARCHIVED')}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === 'ARCHIVED' 
                    ? 'bg-[#051229] text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t('applications.tab_archived')}
              </button>
           </div>

           {/* Security Badge */}
           <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-4 max-w-xs">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                 <ShieldCheck size={20} />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('applications.secure_zone')}</span>
                 <span className="text-xs font-bold text-[#051229] flex items-center gap-2">
                    {t('applications.ssl_active')} <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 </span>
              </div>
           </div>
        </div>

        {/* COLONNE DROITE : La Carte Principale (Design Copié) */}
        <div className="lg:w-2/3 w-full space-y-6">
           {filteredApps.length === 0 ? (
               <div className="h-64 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-200 border-dashed text-slate-400">
                   <FolderClock size={48} className="mb-4 opacity-20" />
                   <p className="font-bold text-sm">{t('applications.empty_state')}</p>
               </div>
           ) : (
               filteredApps.map((app) => {
                  const timeline = getTimelineSteps(app.status);
                  const currentStep = timeline.find(t => t.state === 'current');
                  const isActionRequired = app.status === 'PAYMENT_PENDING' || app.status === 'DOCS_PENDING';

                  return (
                    <div key={app.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
                        
                        {/* HEADER CARD : Timeline */}
                        <div className="pb-8 border-b border-slate-50 mb-8">
                            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                                <h3 className="text-[10px] font-bold text-[#051229] uppercase tracking-widest">{t('applications.timeline')}</h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('applications.last_update')} : {app.updatedAt}</span>
                            </div>

                            {/* Timeline Visual */}
                            <div className="relative">
                                {/* Ligne connecteur */}
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10" />
                                
                                <div className="flex justify-between items-center overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                                    {timeline.map((step, idx) => (
                                        <div key={step.id} className="flex flex-col items-center gap-3 relative bg-white px-2">
                                            <div className={`
                                                flex items-center gap-2 px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all
                                                ${step.state === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                                                  step.state === 'current' ? 'bg-[#051229] border-[#051229] text-white shadow-lg ring-4 ring-[#051229]/5' : 
                                                  'bg-white border-slate-100 text-slate-300'}
                                            `}>
                                                {step.state === 'completed' && <Check size={10} strokeWidth={4} />}
                                                {step.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Action Requise Indicator */}
                                {isActionRequired && (
                                    <div className="mt-4 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                                        <span className="text-[#FF9F1C] flex items-center gap-1">
                                            <AlertCircle size={12} /> {t('applications.action_required')}
                                        </span>
                                        <span className="text-slate-300 hidden md:inline-block">
                                            <Lock size={10} className="inline mr-1" />
                                            {t('applications.blocked')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BODY CARD : Content Split */}
                        <div className="flex flex-col md:flex-row gap-8">
                            
                            {/* Left Content (Main) */}
                            <div className="flex-1 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <span className="text-sm font-bold text-[#051229]">
                                        {t('applications.file')} {app.type} — {t('applications.step')} {timeline.findIndex(t => t.state === 'current') + 1}/5 : {currentStep?.label}
                                    </span>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-[#051229] mb-2 leading-tight">
                                        {isActionRequired ? t('applications.status_ready') : t('applications.status_processing')}
                                    </h2>
                                    <p className="text-sm font-medium text-slate-600">
                                        {t('applications.visascore')} : <span className="text-emerald-500 font-bold">{app.score || 85}%</span> — <span className="italic text-slate-500">{t('applications.probability')}</span>
                                    </p>
                                </div>

                                <p className="text-xs text-slate-500 leading-relaxed">
                                    {app.status === 'PAYMENT_PENDING' 
                                        ? t('applications.mandate_info')
                                        : t('applications.docs_info')}
                                </p>

                                {/* CTA Button Orange Large */}
                                {app.status === 'PAYMENT_PENDING' && (
                                    <button 
                                        onClick={onNavigateToPayment}
                                        className="w-full py-4 bg-gradient-to-r from-[#e68e19] to-[#FF9F1C] hover:from-[#d68417] hover:to-[#e68e19] text-white rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
                                    >
                                        <div className="p-1.5 bg-white/20 rounded-lg">
                                            <Lock size={14} />
                                        </div>
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-sm font-bold uppercase tracking-wide">{t('applications.btn_mandate')}</span>
                                            <span className="text-[9px] opacity-80 font-medium">{t('applications.duration_est')}</span>
                                        </div>
                                    </button>
                                )}
                                
                                {app.status === 'DOCS_PENDING' && (
                                    <button 
                                        onClick={onNavigateToDocuments}
                                        className="w-full py-4 bg-[#051229] text-white rounded-2xl shadow-xl shadow-brand-navy/20 flex items-center justify-center gap-3 transition-all hover:bg-[#0a1e40]"
                                    >
                                        <div className="p-1.5 bg-white/10 rounded-lg">
                                            <FolderClock size={14} />
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-wide">{t('applications.btn_docs')}</span>
                                    </button>
                                )}
                            </div>

                            {/* Right Content (Agent Widget) */}
                            <div className="md:w-64 flex-shrink-0">
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 h-full flex flex-col">
                                    <h4 className="text-[10px] font-bold text-[#051229] uppercase tracking-widest mb-4">{t('applications.agent_title')}</h4>
                                    
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm relative">
                                            <img 
                                                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&auto=format&fit=crop" 
                                                className="w-full h-full object-cover" 
                                                alt="Supansa"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#051229] text-sm">Supansa</p>
                                            <p className="text-[10px] text-slate-500">{t('applications.agent_role')}</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto space-y-3">
                                        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            {t('applications.agent_avail')}
                                        </div>
                                        <button 
                                            onClick={onConsultAgent}
                                            className="w-full py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#051229] hover:bg-slate-100 transition-colors"
                                        >
                                            {t('applications.btn_contact')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                  );
               })
           )}
        </div>

      </div>
    </div>
  );
};
