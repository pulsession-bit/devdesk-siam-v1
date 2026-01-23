
import React from 'react';
import { ShieldCheck, Check, Cpu, User, Zap, ArrowRight, Sparkles, UserCheck, Lock, FileText, MessageSquare } from 'lucide-react';
import { AuditResult, VisaType, ThemeMode } from '../types';
import AuditScore from './AuditScore';
import { useTranslation } from 'react-i18next';

interface PreAuditResultProps {
  result: AuditResult;
  visaType: VisaType;
  onContinue: () => void;
  themeMode: ThemeMode;
}

const PreAuditResult: React.FC<PreAuditResultProps> = ({ result, visaType, onContinue, themeMode }) => {
  const { t } = useTranslation();
  const score = result.confidence_score || 0;
  const isHighScore = score > 80;

  return (
    <div className="w-full max-w-5xl mx-auto pb-32 pt-6 px-4 md:px-0 font-sans">
      
      {/* HEADER SECTION */}
      <div className="text-center space-y-6 mb-12 animate-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 bg-white shadow-sm">
           <FileText size={14} className="text-[#FF9F1C]" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
             {t('audit_result.report_tag')}
           </span>
        </div>
        
        <h2 className="text-6xl md:text-8xl font-sans font-black tracking-tight text-[#051229] leading-none">
          {t('audit_result.score_prefix')} <span className="text-blue-600">{visaType || 'Retirement'}</span>
        </h2>
        
        <p className="text-slate-500 font-bold text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          {t('audit_result.analysis_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: SCORE & STATUS */}
        <div className="lg:col-span-5 space-y-6 animate-in slide-in-from-left-4 duration-700 delay-100">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden text-center h-full flex flex-col justify-center">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-navy via-brand-gold to-brand-navy" />
                
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">{t('audit_result.indicator')}</h3>
                <div className="flex-1 flex items-center justify-center">
                    <AuditScore result={result} themeMode={themeMode} />
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-50">
                    <div className={`inline-flex items-center justify-center w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest ${isHighScore ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {isHighScore ? t('audit_result.high_potential') : t('audit_result.optimization_needed')}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                       <Cpu size={12} /> {t('audit_result.audit_id')}: SVP-{Math.floor(Math.random() * 1000000)}
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: ACTION PLAN & LIAISON */}
        <div className="lg:col-span-7 space-y-6 animate-in slide-in-from-right-4 duration-700 delay-200">
            
            {/* Verdict Card (Navy) */}
            <div className="bg-[#051229] text-white p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-brand-navy/30 h-full flex flex-col justify-center">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><ShieldCheck size={200} /></div>
                
                <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 text-[#FF9F1C]">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                             <h3 className="text-xl font-bold">{t('audit_result.verdict_title')}</h3>
                             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">{t('audit_result.verdict_subtitle')}</p>
                        </div>
                    </div>

                    <div className="mb-10">
                        <p className="text-lg md:text-xl font-serif italic leading-relaxed text-slate-200">
                            "{result.summary || t('audit_result.default_summary')}"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
                        <div>
                            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3">
                                <Check size={12} /> {t('audit_result.points_validated')}
                            </p>
                            <ul className="space-y-2">
                                <li className="text-xs text-slate-300 flex items-center gap-2 before:content-['•'] before:text-slate-500">{t('audit_result.point_finance')}</li>
                                <li className="text-xs text-slate-300 flex items-center gap-2 before:content-['•'] before:text-slate-500">{t('audit_result.point_pro')}</li>
                            </ul>
                        </div>
                        <div>
                            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#FF9F1C] mb-3">
                                <Sparkles size={12} /> {t('audit_result.optimization')}
                            </p>
                             <ul className="space-y-2">
                                <li className="text-xs text-slate-300 flex items-center gap-2 before:content-['•'] before:text-slate-500">{t('audit_result.point_bank')}</li>
                                <li className="text-xs text-slate-300 flex items-center gap-2 before:content-['•'] before:text-slate-500">{t('audit_result.point_status')}</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-4">
                         <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                            <Lock size={10} /> {t('audit_result.transmission_required')}
                         </p>
                    </div>
                </div>
            </div>

        </div>
      </div>

      {/* FOOTER CTA SECTION */}
      <div className="mt-16 bg-white rounded-[3rem] p-12 text-center shadow-xl border border-slate-100 relative overflow-hidden animate-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl -z-0" />
          
          <div className="relative z-10">
              <div className="w-16 h-16 bg-[#051229] text-[#FF9F1C] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Zap size={32} fill="currentColor" />
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-[#051229] mb-4 tracking-tight">
                  {t('audit_result.start_official')} <span className="text-blue-600">{t('audit_result.audit_official')}</span>
              </h2>
              <p className="text-slate-500 font-medium max-w-xl mx-auto mb-10">
                  {t('audit_result.register_desc')}
              </p>

              <button 
                onClick={onContinue} 
                className="group relative bg-[#051229] hover:bg-[#0F264A] text-white px-10 py-5 rounded-2xl shadow-2xl transition-all hover:-translate-y-1 active:scale-95 mx-auto flex items-center gap-4"
              >
                <span className="text-sm font-bold uppercase tracking-widest">{t('audit_result.btn_consult')}</span>
                <ArrowRight size={18} className="text-[#FF9F1C]" />
              </button>
              
              <div className="mt-10 flex items-center justify-center gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-2"><ShieldCheck size={12} className="text-blue-600" /> {t('audit_result.security_pdpa')}</span>
                  <span className="flex items-center gap-2"><Check size={12} className="text-emerald-500" /> {t('audit_result.acceptance_100')}</span>
                  <span className="flex items-center gap-2">{t('audit_result.free_analysis')}</span>
              </div>
          </div>
      </div>

    </div>
  );
};

export default PreAuditResult;
