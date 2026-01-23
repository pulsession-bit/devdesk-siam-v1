
import React, { useState } from 'react';
import { Share2, Copy, Check, Code, ShieldCheck, Globe, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WidgetGenerator: React.FC = () => {
  const { t } = useTranslation();
  const [target, setTarget] = useState<'HOME' | 'BOOKING'>('BOOKING');
  const [label, setLabel] = useState(t('widget.default_label'));
  const [copied, setCopied] = useState(false);

  // URL de base de l'application (en production, utilisez l'URL réelle)
  const baseUrl = window.location.origin;
  const targetUrl = target === 'HOME' ? baseUrl : `${baseUrl}?page=booking`; // On simule le routing query param pour l'exemple

  // Génération du code du widget
  const widgetCode = `
<!-- Siam Visa Pro Widget -->
<div id="svp-widget-container" style="position:fixed; bottom:20px; right:20px; z-index:9999; font-family:sans-serif;">
  <a href="${targetUrl}" target="_blank" style="text-decoration:none;">
    <div style="background-color:#051229; color:white; padding:12px 24px; border-radius:50px; display:flex; align-items:center; gap:12px; box-shadow:0 10px 25px rgba(5,18,41,0.3); border:2px solid #FF9F1C; transition: transform 0.2s;">
      <div style="background-color:#FF9F1C; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; color:#051229; font-weight:bold;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <div>
        <div style="font-size:12px; font-weight:bold; color:#FF9F1C; text-transform:uppercase; letter-spacing:1px; line-height:1;">Siam Visa Pro</div>
        <div style="font-size:14px; font-weight:700; margin-top:2px;">${label}</div>
      </div>
    </div>
  </a>
</div>
<!-- End Widget -->
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#F8FAFC] font-sans scroll-container min-h-0">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="bg-[#051229] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-8">
           {/* Decor */}
           <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none"><Share2 size={200} /></div>
           
           <div>
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-[#FF9F1C] text-[#051229] rounded-2xl flex items-center justify-center shadow-lg">
                    <Share2 size={24} />
                 </div>
                 <h1 className="text-3xl md:text-4xl font-serif font-normal">{t('widget.title')}</h1>
              </div>
              <p className="text-slate-300 max-w-xl text-sm font-medium leading-relaxed">
                 {t('widget.desc')}
              </p>
           </div>
           
           <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
              <Globe size={20} className="text-[#FF9F1C]" />
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('widget.domain_label')}</p>
                 <p className="text-sm font-bold">{t('widget.universal')}</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* CONFIGURATION */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-[#051229] mb-6 flex items-center gap-2">
                    <ShieldCheck size={20} /> {t('widget.config_title')}
                </h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('widget.destination_label')}</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setTarget('BOOKING')}
                                className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all ${target === 'BOOKING' ? 'bg-[#051229] text-white border-[#051229]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-white'}`}
                            >
                                {t('widget.page_booking')}
                            </button>
                            <button 
                                onClick={() => setTarget('HOME')}
                                className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all ${target === 'HOME' ? 'bg-[#051229] text-white border-[#051229]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-white'}`}
                            >
                                {t('widget.page_home')}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('widget.btn_text_label')}</label>
                        <input 
                            type="text" 
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-[#051229] outline-none focus:border-[#FF9F1C]"
                        />
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">{t('widget.note_title')}</p>
                        <p className="text-xs text-amber-900 leading-relaxed">
                            {t('widget.note_desc')}
                        </p>
                    </div>
                </div>
            </div>

            {/* PREVIEW & CODE */}
            <div className="space-y-6">
                
                {/* LIVE PREVIEW AREA */}
                <div className="bg-slate-200 rounded-[2rem] h-64 relative overflow-hidden border-4 border-white shadow-inner flex items-center justify-center group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute top-4 left-4 bg-white/50 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Eye size={12} /> {t('widget.preview_live')}
                    </div>
                    <p className="text-slate-400 font-bold text-xl uppercase tracking-widest opacity-20 rotate-[-15deg]">{t('widget.your_site')}</p>

                    {/* THE WIDGET PREVIEW */}
                    <div className="absolute bottom-6 right-6 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="bg-[#051229] text-white py-3 px-6 rounded-full flex items-center gap-3 shadow-2xl border-2 border-[#FF9F1C] cursor-pointer hover:scale-105 transition-transform">
                            <div className="bg-[#FF9F1C] rounded-full w-8 h-8 flex items-center justify-center text-[#051229]">
                                <ShieldCheck size={16} strokeWidth={3} />
                            </div>
                            <div>
                                <div className="text-[9px] font-black text-[#FF9F1C] uppercase tracking-widest leading-tight">Siam Visa Pro</div>
                                <div className="text-sm font-bold leading-tight mt-0.5">{label}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CODE BLOCK */}
                <div className="bg-[#1e293b] rounded-[2rem] p-6 shadow-xl relative group">
                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-2 text-white">
                            <Code size={16} className="text-[#FF9F1C]" />
                            <span className="text-xs font-bold uppercase tracking-widest">{t('widget.integration_code')}</span>
                        </div>
                        <button 
                            onClick={handleCopy}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                        >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? t('widget.copied') : t('widget.copy_code')}
                        </button>
                    </div>
                    
                    <pre className="font-mono text-[10px] text-slate-300 overflow-x-auto p-2 scrollbar-hide leading-relaxed">
                        {widgetCode}
                    </pre>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetGenerator;
