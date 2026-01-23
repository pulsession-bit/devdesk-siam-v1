
import React, { useEffect, useRef, useState } from 'react';
import { Phone, X, Mic, MicOff, Signal, MessageSquare, Minimize2, ShieldCheck } from 'lucide-react';
import { CallPayload, ThemeMode, LiveContext } from '../types';
import { LiveAgent, TranscriptUpdate } from '../services/liveService';
import { useTranslation } from 'react-i18next';

interface CallModalProps {
  payload: CallPayload;
  contextData?: LiveContext;
  onClose: (transcript?: string | null) => void;
  onMinimize: () => void;
  themeMode: ThemeMode;
}

const CallModal: React.FC<CallModalProps> = ({ payload, contextData, onClose, onMinimize, themeMode }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<TranscriptUpdate | null>(null);
  const [volume, setVolume] = useState(0);
  
  const liveAgent = LiveAgent.getInstance();
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const volumeIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const unsubscribeStatus = liveAgent.onStatus((s) => {
        if (s === 'connected') {
            setStatus('connected');
            if (!volumeIntervalRef.current) {
                volumeIntervalRef.current = window.setInterval(() => {
                    setVolume(liveAgent.getOutputVolume());
                }, 100);
            }
        }
        else if (s === 'connecting') setStatus('connecting');
        else if (s === 'error' || s === 'error_mic') setStatus('error');
        else if (s === 'disconnected') setStatus('idle');
    });

    const unsubscribeTranscript = liveAgent.onTranscript((update) => {
        setLiveTranscript(update);
    });

    if (!liveAgent.isConnected) {
        liveAgent.connect(contextData);
    } else {
        setStatus('connected');
         if (!volumeIntervalRef.current) {
            volumeIntervalRef.current = window.setInterval(() => {
                setVolume(liveAgent.getOutputVolume());
            }, 100);
        }
    }

    return () => {
      unsubscribeStatus();
      unsubscribeTranscript();
      if (volumeIntervalRef.current) {
          window.clearInterval(volumeIntervalRef.current);
          volumeIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveTranscript]);

  const endCall = () => {
    const transcript = liveAgent.getFormattedTranscript();
    liveAgent.disconnect();
    onClose(transcript);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 md:p-8 bg-[#051229]/80 backdrop-blur-md animate-in fade-in duration-300 font-sans">
      <div className="relative w-full max-w-5xl h-full md:h-[85vh] bg-[#051229] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/10 animate-in zoom-in-95 duration-500">
        <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#051229] via-[#0F264A] to-[#051229]" />
            <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none"><ShieldCheck size={400} /></div>
        </div>
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[#051229]/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#FF9F1C] rounded-xl flex items-center justify-center text-[#051229] shadow-lg"><ShieldCheck size={24} /></div>
                <div><h2 className="text-white font-serif text-xl leading-none">{t('call.title')}</h2><p className="text-[9px] text-[#FF9F1C] font-bold uppercase tracking-[0.2em] mt-1">{t('call.secure_audit')} • {payload.visaType}</p></div>
            </div>
            <div className="flex items-center gap-2"><button onClick={onMinimize} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><Minimize2 size={24} /></button><button onClick={onMinimize} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><X size={24} /></button></div>
        </div>
        <div className="relative z-10 flex-1 flex flex-col p-6 overflow-hidden">
            {status === 'connecting' && (
            <div className="flex-1 flex-col items-center justify-center space-y-8 animate-in zoom-in-95 flex">
                <div className="relative w-32 h-32"><div className="absolute inset-0 border-4 border-white/5 rounded-full" /><div className="absolute inset-0 border-4 border-[#FF9F1C] rounded-full border-t-transparent animate-spin" /><div className="absolute inset-0 flex items-center justify-center text-[#FF9F1C]"><Signal size={40} className="animate-pulse" /></div></div>
                <p className="text-white font-bold text-lg uppercase tracking-widest text-center">{t('call.connecting')}</p>
            </div>
            )}
            {status === 'connected' && (
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide pb-20 px-4">
                {liveTranscript ? (
                    <div className={`max-w-[90%] p-6 rounded-3xl shadow-2xl border transition-all duration-300 ${liveTranscript.role === 'agent' ? 'bg-white border-slate-100 text-[#051229] mr-auto rounded-tl-none' : 'bg-white/10 border-white/10 text-white ml-auto rounded-tr-none'}`}>
                    <div className="flex items-center gap-2 mb-3"><div className={`w-2 h-2 rounded-full ${liveTranscript.role === 'agent' ? 'bg-[#FF9F1C] animate-pulse' : 'bg-white'}`} /><span className="text-[9px] font-black uppercase tracking-widest opacity-50">{liveTranscript.role === 'agent' ? t('call.agent') : t('call.you')}</span></div>
                    <p className="text-lg font-medium leading-relaxed">{liveTranscript.text}{!liveTranscript.isFinal && <span className="inline-block w-1 h-5 bg-[#FF9F1C] ml-1 animate-pulse" />}</p></div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-6"><div className="w-24 h-24 border-2 border-white/20 rounded-full flex items-center justify-center"><MessageSquare size={48} className="text-white" /></div><p className="text-white font-bold uppercase tracking-[0.3em] text-xs">{t('call.waiting')}</p></div>
                )}
                <div ref={transcriptEndRef} />
                </div>
                <div className="absolute bottom-32 left-0 right-0 px-10 flex items-center justify-center gap-1">{Array.from({length: 24}).map((_, i) => (<div key={i} className="w-1 bg-[#FF9F1C] rounded-full transition-all duration-75" style={{ height: `${Math.max(4, (volume/255) * 60 * Math.sin(i * 0.5))}px`, opacity: 0.2 + (volume/255) * 0.8 }} />))}</div>
            </div>
            )}
        </div>
        {status === 'connected' && (
            <div className="p-8 pb-12 bg-[#051229]/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around">
            <div className="flex flex-col items-center gap-3"><button onClick={() => setIsMuted(!isMuted)} className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-xl ${isMuted ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-400'}`}>{isMuted ? <MicOff size={24} /> : <Mic size={24} />}</button><span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{isMuted ? t('call.mute') : t('call.mic')}</span></div>
            <div className="flex flex-col items-center gap-3"><button onClick={onMinimize} className="w-20 h-20 bg-[#FF9F1C] text-[#051229] rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-[#FF9F1C]/20 transform active:scale-95 transition-all"><Minimize2 size={32} /></button><span className="text-[9px] font-black text-[#FF9F1C] uppercase tracking-widest">{t('call.minimize')}</span></div>
            <div className="flex flex-col items-center gap-3"><button onClick={endCall} className="w-16 h-16 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Phone size={24} className="rotate-[135deg]" /></button><span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('call.quit')}</span></div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CallModal;
