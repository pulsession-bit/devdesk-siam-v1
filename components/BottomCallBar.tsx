
import React, { useEffect, useState } from 'react';
import { Phone, Mic, MicOff, Maximize2, Activity, MapPin } from 'lucide-react';
import { LiveAgent } from '../services/liveService';
import { ThemeMode } from '../types';

interface BottomCallBarProps {
  onMaximize: () => void;
  onEndCall: () => void;
  themeMode: ThemeMode;
  currentContextName: string;
}

const BottomCallBar: React.FC<BottomCallBarProps> = ({ onMaximize, onEndCall, themeMode, currentContextName }) => {
  const [volume, setVolume] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const vol = LiveAgent.getInstance().getOutputVolume();
      setVolume(vol);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] px-4 pb-4 md:pb-6 pointer-events-none font-sans">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        <div className="flex items-center justify-between gap-4 p-3 pr-4 rounded-[2rem] shadow-2xl backdrop-blur-xl border border-white/10 animate-in slide-in-from-bottom-20 duration-500 bg-[#051229]/95 text-white">
          
          {/* Section Gauche: Identité & Contexte */}
          <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={onMaximize}>
             <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FF9F1C]/30">
                    <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Supansa" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#051229] rounded-full animate-pulse" />
             </div>
             
             <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                   <p className="text-sm font-bold leading-tight truncate">Supansa</p>
                   {/* Context Badge */}
                   <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded-md">
                      <MapPin size={8} className="text-[#FF9F1C]" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#FF9F1C] truncate max-w-[100px]">{currentContextName}</span>
                   </div>
                </div>
                
                {/* Visualizer intégré au texte sur mobile */}
                <div className="flex items-center gap-1 h-3 mt-1">
                    {Array.from({length: 8}).map((_, i) => (
                        <div 
                        key={i}
                        className="w-0.5 bg-[#FF9F1C]/60 rounded-full transition-all duration-75"
                        style={{ 
                            height: `${Math.max(4, (volume/255) * 12 * (Math.random() + 0.5))}px`,
                            opacity: 0.5 + (volume/255) * 0.5
                        }}
                        />
                    ))}
                    <span className="text-[9px] text-slate-400 ml-1 font-medium sm:hidden truncate">{currentContextName}</span>
                </div>
             </div>
          </div>

          {/* Section Droite: Contrôles */}
          <div className="flex items-center gap-2 flex-shrink-0">
             <button 
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isMicMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
             >
                {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
             </button>
             
             <button 
                onClick={onMaximize}
                className="w-10 h-10 rounded-full bg-[#FF9F1C] text-[#051229] flex items-center justify-center hover:bg-white transition-all shadow-lg hidden sm:flex"
                title="Agrandir"
             >
                <Maximize2 size={18} />
             </button>
             
             <button 
                onClick={onEndCall}
                className="w-12 h-12 rounded-[1.2rem] bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg active:scale-95"
                title="Raccrocher"
             >
                <Phone size={20} className="rotate-[135deg]" />
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BottomCallBar;
