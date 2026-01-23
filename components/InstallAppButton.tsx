
import React, { useEffect, useState } from 'react';
import { Download, Smartphone, Check } from 'lucide-react';
import { ThemeMode } from '../types';
import { useTranslation } from 'react-i18next';

interface InstallAppButtonProps {
  themeMode?: ThemeMode;
  location?: 'sidebar' | 'welcome';
}

const InstallAppButton: React.FC<InstallAppButtonProps> = ({ themeMode = 'CONCORD', location = 'sidebar' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Vérifier si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  if (isInstalled) return null; // Ne rien afficher si déjà installé
  if (!deferredPrompt) return null; // Ne rien afficher si le navigateur ne le supporte pas

  const isPro = themeMode === 'PRO';
  const isExecutive = themeMode === 'EXECUTIVE';

  if (location === 'sidebar') {
    return (
      <button 
        onClick={handleInstallClick}
        className={`w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all animate-pulse ${
            isPro 
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30' 
            : isExecutive
              ? 'bg-white text-slate-900 hover:bg-slate-200'
              : 'bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-navy hover:to-yellow-400 shadow-lg shadow-brand-gold/20'
        }`}
      >
        <Smartphone size={14} />
        <span>{t('install.button_install')}</span>
      </button>
    );
  }

  // Version Welcome Screen (Plus large et stylée)
  return (
    <button 
        onClick={handleInstallClick}
        className="group relative overflow-hidden bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3 rounded-2xl flex items-center gap-4 transition-all shadow-2xl backdrop-blur-md"
    >
        <div className="w-8 h-8 rounded-lg bg-brand-gold text-brand-navy flex items-center justify-center">
            <Download size={16} />
        </div>
        <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">{t('install.mobile_exp')}</p>
            <p className="text-xs font-bold">{t('install.button_install')}</p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </button>
  );
};

export default InstallAppButton;
