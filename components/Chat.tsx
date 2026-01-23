import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, VisaType, PreAuditData, FileAttachment, AuditResult, Appointment, UserProfile } from '../types';
import { playTextToSpeech } from '../services/ttsService';
import { Bot, User, Info, Scan, Lock, Database, Cpu, Landmark, PenTool, FolderOpen, CreditCard, FileSignature, Loader2, Check, Download, LogIn, FileText, X, Award, Clock, Briefcase, Volume2, Phone, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChatProps {
  messages: ChatMessage[];
  isTyping: boolean;
  visaType?: VisaType;
  currentProfile?: PreAuditData;
  auditResult?: AuditResult;
  themeMode?: string;
  onScheduleAppointment: (date: string, time: string) => void;
  appointment?: Appointment | null;
  onPaymentSuccess?: () => void;
  hasPaid?: boolean;
  user?: UserProfile | null;
  onLoginRequest?: () => void;
  onClose?: () => void;
  onCallAgent?: () => void;
  onReply?: (text: string) => void;
}

const SUPANSA_AVATAR = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&auto=format&fit=crop";

// Utilisation de React.FC pour garantir la compatibilité avec la prop 'key' lors du mapping
const InlineLoginCard: React.FC<{ onLogin: () => void, themeMode?: string }> = ({ onLogin, themeMode }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-sm font-sans">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Database size={18} /></div>
          <div><h4 className="font-bold text-[#051229] text-sm">{t('chat.save_required')}</h4><p className="text-[10px] text-slate-500 uppercase tracking-wide">{t('chat.secure_data')}</p></div>
        </div>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">{t('chat.save_desc')}</p>
        <button onClick={onLogin} className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 bg-[#051229] text-white hover:bg-slate-800">
          <LogIn size={14} /> {t('chat.btn_create')}
        </button>
      </div>
    </div>
  );
};

// Utilisation de React.FC pour garantir la compatibilité avec la prop 'key' lors du mapping
const InlinePaymentCard: React.FC<{ onPay: () => void, themeMode?: string, email?: string | null }> = ({ onPay, themeMode, email }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<'mandate' | 'payment' | 'processing' | 'success'>('mandate');
  const [signature, setSignature] = useState('');
  
  const handleSign = () => { if (signature.trim().length > 2) setStep('payment'); };
  const handlePayment = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(onPay, 2000);
    }, 2000);
  };

  if (step === 'success') {
    return (
      <div className="mt-4 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3 max-w-sm font-sans">
        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0"><Check size={16} /></div>
        <div>
           <p className="font-bold text-emerald-900 text-sm">{t('chat.payment_validated')}</p>
           <p className="text-xs text-emerald-700 mb-2">{t('chat.folder_transmitted')}</p>
           {email && <p className="text-[10px] text-emerald-600">{t('chat.conf_sent', { email })}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-sm font-sans">
      <div className="p-5 space-y-4">
        {step === 'mandate' && (
          <>
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3"><FileSignature size={18} className="text-slate-400" /><span className="font-bold text-[#051229] text-sm">{t('chat.mandate_title')}</span></div>
            <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between border border-slate-100"><div className="flex items-center gap-3"><FileText size={16} className="text-red-500" /><span className="text-xs font-medium text-[#051229]">CIM_Mandate_v2.pdf</span></div><Download size={14} className="text-slate-400" /></div>
            <input type="text" placeholder={t('chat.sign_placeholder')} value={signature} onChange={(e) => setSignature(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-script text-lg outline-none focus:border-[#FF9F1C] text-[#051229]" style={{ fontFamily: 'cursive' }} />
            <button onClick={handleSign} disabled={signature.length < 3} className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${signature.length < 3 ? 'bg-slate-100 text-slate-400' : 'bg-[#051229] text-white'}`}>{t('chat.btn_sign')}</button>
          </>
        )}
        {(step === 'payment' || step === 'processing') && (
          <>
            <div className="flex items-center justify-between border-b border-slate-50 pb-3"><div className="flex items-center gap-2"><CreditCard size={18} className="text-slate-400" /><span className="font-bold text-[#051229] text-sm">{t('chat.fees')}</span></div><span className="font-bold text-[#051229]">2,500 THB</span></div>
            <button onClick={handlePayment} disabled={step === 'processing'} className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 bg-[#051229] text-white hover:bg-slate-800">{step === 'processing' ? <Loader2 size={14} className="animate-spin" /> : <Lock size={12} />}{step === 'processing' ? t('chat.processing') : t('chat.btn_pay')}</button>
          </>
        )}
      </div>
    </div>
  );
};

// Utilisation de React.FC pour corriger l'erreur de typage 'key' lors du rendu dans une liste (ligne 141)
const RichMediaCard: React.FC<{ type: string }> = ({ type }) => {
  const { t } = useTranslation();
  const assets: Record<string, { img: string, title: string, sub: string, icon: any }> = {
    'NAT': { img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a', title: 'Nat', sub: t('chat.role_nat'), icon: <User size={14} /> },
    'EMBASSY': { img: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc', title: 'Ambassade', sub: t('chat.role_embassy'), icon: <Landmark size={14} /> },
    'MANDATE': { img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c', title: 'Mandat', sub: t('chat.role_mandate'), icon: <PenTool size={14} /> },
    'DOCS': { img: 'https://images.unsplash.com/photo-1618044733300-9472054094ee', title: 'Documents', sub: t('chat.role_docs'), icon: <FolderOpen size={14} /> },
    'AI': { img: SUPANSA_AVATAR, title: 'Supansa', sub: t('chat.role_ai'), icon: <Cpu size={14} /> }
  };
  const asset = assets[type];
  if (!asset) return null;
  return (
    <div className="mt-3 mb-1 w-full max-w-[240px] rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-white font-sans">
      <div className="h-24 w-full relative">
        <img src={asset.img + "?q=80&w=600&auto=format&fit=crop"} alt={asset.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-3 text-white"><span className="font-bold text-xs block">{asset.title}</span><p className="text-[10px] opacity-90">{asset.sub}</p></div>
      </div>
    </div>
  );
};

const AttachmentPreview: React.FC<{ file: FileAttachment }> = ({ file }) => {
  return (
    <div className="mt-3 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden max-w-[200px] font-sans">
      {file.type.startsWith('image/') ? (
        <img src={file.data} alt={file.name} className="w-full h-32 object-cover" />
      ) : (
        <div className="p-4 flex items-center gap-3"><FileText size={24} className="text-slate-400" /><div className="overflow-hidden"><p className="text-xs font-bold text-[#051229] truncate">{file.name}</p><p className="text-[10px] text-slate-400">Document</p></div></div>
      )}
    </div>
  );
};

const Chat: React.FC<ChatProps> = ({ messages, isTyping, currentProfile, themeMode, onScheduleAppointment, appointment, onPaymentSuccess, hasPaid, user, onLoginRequest, auditResult, onClose, onCallAgent, onReply }) => {
  const { t } = useTranslation();
  const endRef = useRef<HTMLDivElement>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(true); 

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const parseMessageContent = (text: string) => {
    const parts = text.split(/(\[VISUAL: [A-Z]+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/\[VISUAL: ([A-Z]+)\]/);
      if (match) return <RichMediaCard key={index} type={match[1]} />;
      if (part.trim() === '') return null;
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative bg-[#F8FAFC] font-sans">
      <div className="bg-[#051229] border-b border-white/5 px-6 py-4 z-20 sticky top-0 flex items-center justify-between shadow-lg text-white">
        <div className="flex items-center gap-4">
           <button onClick={() => setShowProfileModal(true)} className="w-12 h-12 rounded-full flex items-center justify-center shadow-md p-0.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer bg-white/10 border border-white/10">
              <img src={SUPANSA_AVATAR} alt="Supansa" className="w-full h-full object-cover rounded-full" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#051229] rounded-full"></div>
           </button>
           <div><h3 className="font-serif text-lg leading-none">Supansa</h3><div className="flex items-center gap-1.5 mt-0.5"><div className="w-1 h-1 rounded-full bg-[#FF9F1C]" /><span className="text-[10px] text-[#FF9F1C] font-bold uppercase tracking-widest">Liaison</span></div></div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setShowScheduler(!showScheduler)} className={`px-3 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors border ${appointment ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20'}`}>{appointment ? t('chat.rdv_ok') : t('chat.rdv')}</button>
            {onClose && <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><X size={18} /></button>}
        </div>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 relative border border-white/20 font-sans">
            <div className="h-28 bg-[#051229] relative"><button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"><X size={20} /></button></div>
            <div className="px-8 pb-8 relative">
               <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg -mt-14 mb-4 bg-slate-100 relative"><img src={SUPANSA_AVATAR} alt="Supansa" className="w-full h-full object-cover rounded-full" /></div>
               <div className="space-y-1 mb-6"><h2 className="text-3xl font-serif text-[#051229]">Supansa</h2><div className="flex items-center gap-2 text-[#FF9F1C] font-bold text-xs uppercase tracking-widest"><Award size={14} /> {t('chat.modal_role')}</div>{onCallAgent && (<button onClick={() => { setShowProfileModal(false); onCallAgent(); }} className="mt-4 w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 text-white transition-transform active:scale-95 bg-[#051229] hover:bg-slate-800"><Phone size={16} /> {t('chat.btn_start_call')}</button>)}</div>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><div className="flex items-center gap-2 mb-2 text-slate-400 text-[10px] font-black uppercase tracking-widest"><Clock size={12} /> {t('chat.last_session')}</div><p className="text-sm font-bold text-[#051229]">{t('chat.just_now')}</p></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-brand">
        {messages.map((msg, index) => (
          <React.Fragment key={msg.id}>
            {msg.sender === 'system' && (<div className="flex justify-center my-4 opacity-60"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{msg.text}</span></div>)}
            {msg.sender !== 'system' && (
              <div className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row items-start'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mt-1 p-0.5 overflow-hidden ${msg.sender === 'agent' ? 'bg-white border border-slate-100' : 'bg-[#051229] text-white'}`}>
                    {msg.sender === 'agent' ? (<img src={SUPANSA_AVATAR} alt="Supansa" className="w-full h-full object-cover rounded-full" />) : (user?.photoURL ? (<img src={user.photoURL} alt="User" className="w-full h-full object-cover rounded-full" />) : (<User size={16} />))}
                  </div>
                  <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap ${msg.sender === 'agent' ? 'bg-white border border-slate-100 text-[#051229] rounded-tl-none' : 'bg-[#051229] text-white rounded-tr-none'}`}>
                      <div className={msg.sender === 'user' ? 'text-white' : 'text-[#051229]'}>{parseMessageContent(msg.text)}</div>
                      {msg.attachments && msg.attachments.length > 0 && (<div className="flex flex-wrap gap-2 mt-3">{msg.attachments.map((file, i) => (<AttachmentPreview key={i} file={file} />))}</div>)}
                      {msg.sender === 'agent' && (
                        <>
                          {msg.actionPayload?.require_login && (!user || user.isAnonymous) && onLoginRequest && (<InlineLoginCard onLogin={onLoginRequest} themeMode={themeMode} />)}
                          {msg.actionPayload?.request_payment && (!user?.isAnonymous) && !hasPaid && onPaymentSuccess && (<InlinePaymentCard onPay={onPaymentSuccess} themeMode={themeMode} email={user?.email} />)}
                          {msg.actionPayload?.confidence_score && (<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-4"><div className="flex items-center gap-2 text-slate-500"><Scan size={14} /><span className="text-[10px] font-bold uppercase tracking-wide">VisaScore</span></div><div className={`px-2 py-0.5 rounded text-[10px] font-bold ${msg.actionPayload.confidence_score > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{msg.actionPayload.confidence_score}%</div></div>)}
                        </>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1.5 px-1 font-medium">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                {msg.sender === 'agent' && msg.suggestions && msg.suggestions.length > 0 && index === messages.length - 1 && (
                  <div className="flex flex-wrap gap-2 mt-1 ml-12 animate-in slide-in-from-left-2 fade-in duration-300">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button key={idx} onClick={() => onReply && onReply(suggestion)} className="px-4 py-2 bg-white border border-[#051229]/10 rounded-full text-xs font-bold text-[#051229] hover:bg-[#051229] hover:text-white transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2">{suggestion}<ArrowRight size={10} className="opacity-50" /></button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </React.Fragment>
        ))}
        {isTyping && (<div className="flex items-center gap-3 animate-pulse"><div className="w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center p-0.5"><img src={SUPANSA_AVATAR} alt="Supansa" className="w-full h-full object-cover rounded-full" /></div><div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none"><div className="flex gap-1"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75" /><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" /></div></div></div>)}
        <div ref={endRef} className="h-4" />
      </div>
    </div>
  );
};

export default Chat;