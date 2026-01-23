
import React from 'react';
import { Globe, Zap, ShieldCheck, LogIn, CheckCircle2, Award, MessageSquare } from 'lucide-react';
import { ThemeMode } from '../types';
import { useAuth } from '../contexts/AuthContext';
import InstallAppButton from './InstallAppButton';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

interface WelcomeScreenProps {
  onSelectTheme: (theme: ThemeMode) => void;
  onLoginRequest: () => void;
  onStartConcierge: () => void;
  onNavigateToSecurity: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectTheme, onLoginRequest, onStartConcierge, onNavigateToSecurity }) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 z-[100] bg-brand-navy overflow-y-auto scroll-container">
      {/* Background Image Fixed */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <img 
            src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2600&auto=format&fit=crop" 
            className="w-full h-full object-cover"
            alt={t('alt.thailand_boats')}
         />
         {/* Gradient Overlay pour lisibilité texte - Exactement comme l'image */}
         <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/80 via-brand-navy/40 to-brand-navy/90" />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-full">
        
        {/* Navigation Header */}
        <div className="w-full p-6 flex flex-wrap justify-between items-center gap-4">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center text-brand-navy shadow-lg">
                  <ShieldCheck size={18} strokeWidth={3} />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">SiamVisa<span className="text-brand-gold">Pro</span></span>
           </div>
           
           <div className="flex items-center gap-4">
               <LanguageSelector variant="dropdown" />
               {!user && (
                   <button 
                     onClick={onLoginRequest}
                     className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-2 rounded-full text-xs font-bold transition-all border border-white/10"
                   >
                     {t('auth.title')}
                   </button>
               )}
           </div>
        </div>

        {/* Main Content Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-10 pb-20">
          
          {/* Badge "Nouvelle Opportunité" */}
          <div className="mb-6 animate-in slide-in-from-top-4 duration-700">
             <span className="px-4 py-1.5 rounded-full border border-brand-gold/50 bg-brand-gold/10 text-brand-gold text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-sm">
               {t('welcome.new_opportunity')}
             </span>
          </div>

          {/* Headline Massive */}
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight drop-shadow-lg animate-in zoom-in-95 duration-700">
            {t('welcome.headline')} <br/>
            <span className="text-brand-gold">{t('welcome.headline_highlight')}</span>
          </h1>

          {/* Subtext */}
          <p className="text-slate-200 text-sm md:text-lg font-medium leading-relaxed max-w-2xl mb-10 drop-shadow-md animate-in slide-in-from-bottom-4 duration-700 delay-100">
            {t('welcome.subtext')}
          </p>

          {/* CTA Button - Orange Vibrant */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-700 delay-200 w-full md:w-auto px-4 md:px-0">
              <button 
                onClick={onLoginRequest}
                className="w-full md:w-auto bg-brand-gold hover:bg-amber-400 text-brand-navy px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl shadow-brand-gold/20 transform hover:-translate-y-1 transition-all active:scale-95"
              >
                {t('welcome.cta_start')}
              </button>

              <button
                onClick={onStartConcierge}
                className="w-full md:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-5 rounded-full font-bold text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 group"
              >
                 <MessageSquare size={18} className="text-brand-gold group-hover:scale-110 transition-transform" />
                 <span>{t('welcome.cta_chat')}</span>
              </button>
          </div>
          
          <div className="mt-8 flex items-center gap-2 text-slate-300 text-xs font-bold animate-in fade-in delay-500">
              <ShieldCheck size={16} className="text-green-400" />
              <span>{t('welcome.secure_badge')}</span>
          </div>

        </div>

        {/* Features Footer (Like image) */}
        <div className="bg-white py-10 px-6 md:rounded-t-[3rem] w-full">
           <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="flex flex-col items-center text-center space-y-3">
                 <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-brand-navy mb-1">
                    <Globe size={24} strokeWidth={1.5} />
                 </div>
                 <h3 className="font-black text-brand-navy text-sm uppercase tracking-wide">{t('welcome.feature_freedom')}</h3>
                 <p className="text-xs text-slate-500 max-w-[200px]">{t('welcome.feature_freedom_desc')}</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3">
                 <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-brand-navy mb-1">
                    <Award size={24} strokeWidth={1.5} />
                 </div>
                 <h3 className="font-black text-brand-navy text-sm uppercase tracking-wide">{t('welcome.feature_expert')}</h3>
                 <p className="text-xs text-slate-500 max-w-[200px]">{t('welcome.feature_expert_desc')}</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3">
                 <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-brand-navy mb-1">
                    <Zap size={24} strokeWidth={1.5} />
                 </div>
                 <h3 className="font-black text-brand-navy text-sm uppercase tracking-wide">{t('welcome.feature_speed')}</h3>
                 <p className="text-xs text-slate-500 max-w-[200px]">{t('welcome.feature_speed_desc')}</p>
              </div>

           </div>
           
           <div className="mt-8 flex flex-col items-center gap-4">
               <button 
                 onClick={onNavigateToSecurity} 
                 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-[#051229] transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-50"
               >
                   <ShieldCheck size={12} /> {t('sidebar.security')}
               </button>
               
               <div className="md:hidden">
                   <InstallAppButton location="sidebar" />
               </div>
           </div>
        </div>

      </div>

      {/* Floating Concierge Button (Desktop/Mobile) */}
      <button 
        onClick={onStartConcierge}
        className="fixed bottom-8 right-8 z-50 group flex items-center gap-3 pl-6 pr-4 py-4 rounded-full bg-[#051229] text-white shadow-2xl transition-all hover:scale-105 active:scale-95 border border-white/10"
      >
         <span className="text-xs font-bold uppercase tracking-widest hidden md:block">{t('welcome.need_help')}</span>
         <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-brand-gold group-hover:text-brand-navy transition-colors">
            <MessageSquare size={20} className="text-brand-gold group-hover:text-brand-navy" />
         </div>
      </button>

    </div>
  );
};

export default WelcomeScreen;
