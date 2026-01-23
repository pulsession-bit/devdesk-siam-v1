
import React from 'react';
import { X, Calendar, MessageSquareText, History, FileText } from 'lucide-react';
import { ChatMessage } from '../types';
import { useTranslation } from 'react-i18next';

interface CallHistoryModalProps {
  messages: ChatMessage[];
  onClose: () => void;
}

const CallHistoryModal: React.FC<CallHistoryModalProps> = ({ messages, onClose }) => {
  const { t, i18n } = useTranslation();

  // Filtrer les messages qui sont des comptes-rendus d'appels (identifiés par le header spécifique utilisé dans App.tsx)
  const transcriptMessages = messages.filter(m => 
    (m.sender === 'system' || m.sender === 'agent') && 
    (m.text.includes("COMPTE-RENDU DE L'APPEL") || m.text.includes("Transcript"))
  ).sort((a, b) => b.timestamp - a.timestamp); // Du plus récent au plus ancien

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden relative animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-brand-light/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-navy text-white rounded-full flex items-center justify-center shadow-sm">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-navy">{t('history.call_title')}</h2>
              <p className="text-xs text-slate-500">{t('history.call_subtitle')}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
          {transcriptMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
              <MessageSquareText size={48} className="mb-4" />
              <p>{t('history.no_call')}</p>
            </div>
          ) : (
            transcriptMessages.map((msg) => (
              <div key={msg.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className="px-5 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar size={14} />
                    <span className="text-xs font-semibold">
                      {new Date(msg.timestamp).toLocaleDateString(i18n.language, { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-md flex items-center gap-1">
                    <FileText size={10} />
                    {t('history.transcript_tag')}
                  </div>
                </div>
                
                {/* Transcript Body */}
                <div className="p-5">
                   <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-brand-light p-4 rounded-lg border border-slate-100 font-mono text-[13px]">
                     {/* On nettoie le titre générique pour ne garder que le contenu */}
                     {msg.text.replace('📄 **COMPTE-RENDU DE L\'APPEL**', '').trim()}
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white text-center text-xs text-slate-400">
          {t('history.call_footer')}
        </div>

      </div>
    </div>
  );
};

export default CallHistoryModal;
