
import React from 'react';
import { X, History, ChevronRight, Calendar, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { ThemeMode } from '../types';
import { useTranslation } from 'react-i18next';

interface AuditHistoryModalProps {
  sessions: any[];
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  themeMode: ThemeMode;
}

const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({ sessions, onClose, onSelectSession, themeMode }) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-brand-light/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-navy text-brand-amber rounded-2xl flex items-center justify-center shadow-lg">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-navy">{t('history.audit_title')}</h2>
              <p className="text-sm text-slate-500 font-medium">{t('history.audit_subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={28} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {sessions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                <ShieldAlert size={40} className="opacity-20" />
              </div>
              <p className="font-medium text-lg">{t('history.no_audit')}</p>
              <button onClick={onClose} className="text-brand-blue font-bold text-sm underline underline-offset-4">{t('history.start_first')}</button>
            </div>
          ) : (
            sessions.map((session) => (
              <button 
                key={session.id} 
                onClick={() => onSelectSession(session.id)}
                className="w-full text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-amber/50 hover:bg-amber-50/30 transition-all group active:scale-[0.98]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
                        session.status === 'active' 
                          ? 'bg-brand-amber text-brand-navy shadow-inner' 
                          : 'bg-slate-100 text-slate-400 group-hover:bg-brand-navy group-hover:text-white'
                    }`}>
                      {session.visa?.type || '...'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-brand-navy group-hover:text-brand-blue transition-colors">
                          {t('history.audit_visa', { type: session.visa?.type || t('common.unspecified') })}
                        </h3>
                        {session.status === 'active' ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full flex items-center gap-1">
                            <Clock size={10} className="animate-pulse" /> {t('history.ongoing')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-full">{t('history.archived')}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          <Calendar size={12} />
                          {new Date(session.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {session.visa?.confidence !== undefined && (
                          <span className="flex items-center gap-1 text-[11px] text-brand-blue font-bold">
                            <CheckCircle2 size={12} />
                            {t('history.score_label')} {session.visa.confidence}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-full text-slate-300 group-hover:bg-brand-amber group-hover:text-brand-navy transition-all">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('history.footer_security')}</p>
        </div>
      </div>
    </div>
  );
};

export default AuditHistoryModal;
