
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

  const { loginWithGoogle, loginAsGuest } = useAuth();

  return (
    <div className="absolute inset-0 z-[100] bg-gradient-to-br from-brand-navy via-[#0a1e3d] to-brand-navy overflow-y-auto scroll-container">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,159,28,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex items-center justify-center min-h-full p-6">

        {/* Login Card */}
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-8 animate-in fade-in duration-700">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-brand-gold rounded-2xl flex items-center justify-center text-brand-navy shadow-2xl shadow-brand-gold/20">
                <ShieldCheck size={28} strokeWidth={2.5} />
              </div>
              <span className="text-white font-black text-3xl tracking-tight">
                SiamVisa<span className="text-brand-gold">Pro</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">
              {t('welcome.subtext')}
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-700 delay-100">

            <h2 className="text-2xl font-black text-white text-center mb-2">
              {t('auth.title')}
            </h2>
            <p className="text-slate-400 text-sm text-center mb-8">
              Connectez-vous pour accéder à votre espace
            </p>

            {/* Google Login Button */}
            <button
              onClick={async () => {
                try {
                  // DEBUG: Check if we are in mock mode
                  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
                    alert("⚠️ ATTENTION : Firebase API Key manquante. Mode Mock activé.");
                  }
                  await loginWithGoogle();
                  onStartConcierge();
                } catch (error) {
                  console.error('Login failed:', error);
                }
              }}
              className="w-full bg-white hover:bg-slate-50 text-brand-navy px-6 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 shadow-lg transition-all hover:scale-105 active:scale-95 mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuer avec Google
            </button>



            {/* Info Text */}
            <p className="text-slate-500 text-xs text-center mt-6 leading-relaxed">
              En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </p>
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs animate-in fade-in delay-300">
            <ShieldCheck size={14} className="text-green-400" />
            <span className="font-medium">{t('welcome.secure_badge')}</span>
          </div>

          {/* Language Selector */}
          <div className="mt-6 flex justify-center">
            <LanguageSelector variant="dropdown" />
          </div>

        </div>

      </div>
    </div>
  );
};

export default WelcomeScreen;
