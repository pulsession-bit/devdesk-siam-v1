
import React, { useState, useEffect } from 'react';
import { ShieldCheck, LogIn, AlertCircle, X, Mail, Smartphone, ArrowRight, Check, Loader2, Chrome, Lock, RefreshCw, Send } from 'lucide-react';
import { signInWithGoogle, registerWithEmail, loginWithEmail, initRecaptcha, sendPhoneOtp, verifyPhoneOtp, sendUserVerificationEmail, logout } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmationResult } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

interface LoginModalProps {
    onClose?: () => void;
    onNavigateToSecurity?: () => void;
}

type AuthMethod = 'google' | 'email' | 'phone';
type EmailMode = 'login' | 'register';
type PhoneStep = 'input' | 'verify';

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onNavigateToSecurity }) => {
    const [error, setError] = useState<{ code?: string; message: string; domain?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { user, loginAsGuest, loginWithGoogle } = useAuth();
    const { t } = useTranslation();

    // State for Tabs
    const [authMethod, setAuthMethod] = useState<AuthMethod>('google');

    // State for Email
    const [emailMode, setEmailMode] = useState<EmailMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isVerificationSent, setIsVerificationSent] = useState(false);

    // State for Phone
    const [phoneStep, setPhoneStep] = useState<PhoneStep>('input');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    // Image de fond Premium
    const backgroundImage = "https://images.unsplash.com/photo-1529154031157-1fbe807f6d14?q=80&w=2600&auto=format&fit=crop";

    useEffect(() => {
        // Si l'utilisateur est connecté ET que l'email est vérifié (ou provider Google/Phone), on ferme
        // Si on vient d'envoyer la verif, on ne ferme pas
        if (user && !isVerificationSent) {
            if (user.emailVerified || user.providerData[0]?.providerId !== 'password') {
                const timer = setTimeout(() => onClose && onClose(), 500);
                return () => clearTimeout(timer);
            }
        }
    }, [user, onClose, isVerificationSent]);

    // Initialisation Recaptcha Invisible pour Phone Auth
    useEffect(() => {
        if (authMethod === 'phone' && phoneStep === 'input') {
            try {
                initRecaptcha('recaptcha-container');
            } catch (e) { console.error("Recaptcha Init Error", e); }
        }
    }, [authMethod, phoneStep]);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await loginWithGoogle();
        } catch (err: any) {
            console.error("Google Login Error:", err);
            handleAuthError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        setIsLoading(true);
        setError(null);
        try {
            if (emailMode === 'register') {
                await registerWithEmail(email, password, name);
                // ENVOI DE L'EMAIL DE VÉRIFICATION
                await sendUserVerificationEmail();
                setIsVerificationSent(true);
                // On ne déconnecte pas forcément, mais Firebase Auth considère l'utilisateur connecté.
                // L'UI va changer pour montrer l'état "Vérification Requise".
            } else {
                const userCred = await loginWithEmail(email, password);
                if (!userCred.user.emailVerified) {
                    // Si l'email n'est pas vérifié lors du LOGIN
                    // On peut soit bloquer, soit avertir. Ici on avertit et on propose de renvoyer.
                    setError({ message: "Veuillez valider votre email pour accéder à votre espace." });
                    setIsVerificationSent(true); // Affiche l'écran de vérif
                }
            }
        } catch (err: any) {
            console.error("Email Auth Error:", err);
            handleAuthError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setIsLoading(true);
        try {
            await sendUserVerificationEmail();
            alert("Email renvoyé ! Vérifiez vos spams.");
        } catch (e: any) {
            setError({ message: "Impossible de renvoyer l'email. Veuillez patienter." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber) return;
        setIsLoading(true);
        setError(null);
        try {
            const confirmation = await sendPhoneOtp(phoneNumber);
            setConfirmationResult(confirmation);
            setPhoneStep('verify');
        } catch (err: any) {
            console.error("Phone Auth Error:", err);
            handleAuthError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || !confirmationResult) return;
        setIsLoading(true);
        setError(null);
        try {
            await verifyPhoneOtp(confirmationResult, otp);
        } catch (err: any) {
            console.error("OTP Verify Error:", err);
            handleAuthError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthError = (err: any) => {
        if (err.code === 'auth/unauthorized-domain' || err.code === 'auth/operation-not-allowed') {
            setError({
                code: err.code,
                message: "Domaine non autorisé. Veuillez configurer Firebase ou utiliser le mode invité.",
                domain: window.location.hostname
            });
            // Ne pas auto-login en mode invité - laisser l'utilisateur choisir
            return;
        }
        if (err.code === 'auth/popup-closed-by-user') {
            setIsLoading(false);
            return;
        }

        let msg = t('auth.error_generic');
        // Pourrait être amélioré avec des clés de traduction spécifiques pour les erreurs
        if (err.code === 'auth/invalid-email') msg = "L'adresse email est invalide.";
        if (err.code === 'auth/user-disabled') msg = "Ce compte a été désactivé.";
        if (err.code === 'auth/user-not-found') msg = "Aucun compte trouvé avec cet email.";
        if (err.code === 'auth/wrong-password') msg = "Mot de passe incorrect.";
        if (err.code === 'auth/email-already-in-use') msg = "Cet email est déjà utilisé.";
        if (err.code === 'auth/weak-password') msg = "Le mot de passe doit faire au moins 6 caractères.";
        if (err.code === 'auth/invalid-phone-number') msg = "Numéro de téléphone invalide (format E.164 requis, ex: +33...)";
        if (err.code === 'auth/invalid-verification-code') msg = "Code OTP incorrect.";
        if (err.code === 'auth/too-many-requests') msg = "Trop de tentatives. Veuillez patienter.";

        setError({ code: err.code, message: msg });
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 font-sans">
            {/* Image de fond avec overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                    src={backgroundImage}
                    className="w-full h-full object-cover"
                    alt="Voyageur aéroport"
                />
                <div className="absolute inset-0 bg-[#051229]/80 backdrop-blur-sm"></div>
            </div>

            <div className="relative z-10 bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden text-center p-8 animate-in zoom-in-95 duration-300 border-2 border-slate-200/50 flex flex-col max-h-[90vh]">

                {onClose && (
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors border border-slate-100 z-20">
                        <X size={24} />
                    </button>
                )}

                <div className="w-16 h-16 bg-[#F8FAFC] text-[#051229] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border-2 border-[#051229]/10 shrink-0">
                    <ShieldCheck size={36} />
                </div>

                {/* ÉCRAN DE VÉRIFICATION EMAIL */}
                {isVerificationSent ? (
                    <div className="flex-1 flex flex-col items-center animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Mail size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-[#051229] mb-4">Vérifiez votre email</h2>
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed px-4">
                            Un lien de confirmation sécurisé a été envoyé à <strong>{email}</strong>.
                            <br /><br />
                            Cliquez sur le lien dans l'email pour activer votre Espace Candidat et sécuriser votre dossier.
                        </p>

                        <button
                            onClick={handleResendVerification}
                            disabled={isLoading}
                            className="w-full bg-white border-2 border-[#051229] text-[#051229] font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 mb-3"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            Renvoyer l'email
                        </button>

                        <button
                            onClick={() => { logout(); setIsVerificationSent(false); setEmailMode('login'); }}
                            className="text-xs text-slate-400 font-bold hover:text-[#051229] underline decoration-slate-300 underline-offset-4"
                        >
                            Retour à la connexion
                        </button>
                    </div>
                ) : (
                    // ÉCRAN DE CONNEXION / INSCRIPTION CLASSIQUE
                    <>
                        <h2 className="text-3xl font-black text-[#051229] mb-2 leading-none tracking-tight">{t('auth.title')}</h2>
                        <p className="text-slate-500 mb-6 leading-relaxed font-medium text-xs">
                            {t('auth.subtitle')}
                        </p>

                        {/* TABS NAVIGATION */}
                        <div className="flex p-1 bg-slate-100 rounded-xl mb-6 shrink-0">
                            <button
                                onClick={() => setAuthMethod('google')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${authMethod === 'google' ? 'bg-white shadow-sm text-[#051229]' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Chrome size={14} /> Google
                            </button>
                            <button
                                onClick={() => setAuthMethod('email')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${authMethod === 'email' ? 'bg-white shadow-sm text-[#051229]' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Mail size={14} /> Email
                            </button>
                            <button
                                onClick={() => setAuthMethod('phone')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${authMethod === 'phone' ? 'bg-white shadow-sm text-[#051229]' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Smartphone size={14} /> SMS
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl mb-4 text-xs text-left bg-amber-50 border border-amber-200 text-amber-800 animate-in fade-in slide-in-from-top-2 shrink-0">
                                <div className="flex items-start gap-2">
                                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold">Erreur</p>
                                        <p className="opacity-90">{error.message}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto px-1 pb-1">
                            {/* GOOGLE AUTH VIEW */}
                            {authMethod === 'google' && (
                                <div className="space-y-4 py-4">
                                    <button
                                        onClick={handleGoogleLogin}
                                        disabled={isLoading}
                                        className="w-full bg-[#051229] hover:bg-[#0F264A] text-white font-black py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] group border-b-4 border-[#FF9F1C] disabled:opacity-80"
                                    >
                                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />}
                                        <span className="uppercase tracking-widest text-xs">{isLoading ? t('common.loading') : t('auth.btn_google')}</span>
                                    </button>
                                    <p className="text-[10px] text-slate-400">Rapide, sécurisé et sans mot de passe à retenir.</p>
                                </div>
                            )}

                            {/* EMAIL AUTH VIEW */}
                            {authMethod === 'email' && (
                                <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
                                    {emailMode === 'register' && (
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{t('auth.label_name')}</label>
                                            <input
                                                type="text"
                                                placeholder="Jean Dupont"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-[#051229] transition-colors mt-1"
                                                required
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{t('auth.label_email')}</label>
                                        <input
                                            type="email"
                                            placeholder="exemple@email.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-[#051229] transition-colors mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{t('auth.label_password')}</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-[#051229] transition-colors mt-1"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-[#051229] hover:bg-[#0F264A] text-white font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-4 disabled:opacity-70"
                                    >
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                                        <span className="uppercase tracking-widest text-xs">{emailMode === 'login' ? t('auth.btn_login') : t('auth.btn_register')}</span>
                                    </button>

                                    <div className="text-center pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setEmailMode(emailMode === 'login' ? 'register' : 'login')}
                                            className="text-xs text-slate-500 hover:text-[#051229] font-bold underline decoration-slate-300 underline-offset-4"
                                        >
                                            {emailMode === 'login' ? t('auth.toggle_register') : t('auth.toggle_login')}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* PHONE AUTH VIEW */}
                            {authMethod === 'phone' && (
                                <form onSubmit={phoneStep === 'input' ? handleSendOtp : handleVerifyOtp} className="space-y-4 text-left">
                                    <div id="recaptcha-container"></div>

                                    {phoneStep === 'input' ? (
                                        <>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{t('auth.label_phone')}</label>
                                                <input
                                                    type="tel"
                                                    placeholder="+33 6 12 34 56 78"
                                                    value={phoneNumber}
                                                    onChange={e => setPhoneNumber(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-[#051229] transition-colors mt-1"
                                                    required
                                                />
                                                <p className="text-[10px] text-slate-400 mt-1">Nous vous enverrons un code de vérification SMS.</p>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isLoading || !phoneNumber}
                                                className="w-full bg-[#051229] hover:bg-[#0F264A] text-white font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-4 disabled:opacity-70"
                                            >
                                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Smartphone size={18} />}
                                                <span className="uppercase tracking-widest text-xs">{t('auth.btn_send_code')}</span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-center mb-4">
                                                <p className="text-sm font-bold text-slate-700">Code envoyé au {phoneNumber}</p>
                                                <button type="button" onClick={() => setPhoneStep('input')} className="text-[10px] text-blue-600 font-bold hover:underline">Modifier le numéro</button>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Code de Vérification</label>
                                                <input
                                                    type="text"
                                                    placeholder="123456"
                                                    value={otp}
                                                    onChange={e => setOtp(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xl font-bold tracking-widest text-center text-slate-900 outline-none focus:border-[#051229] transition-colors mt-1"
                                                    maxLength={6}
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isLoading || otp.length < 6}
                                                className="w-full bg-[#051229] hover:bg-[#0F264A] text-white font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-4 disabled:opacity-70"
                                            >
                                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                                <span className="uppercase tracking-widest text-xs">{t('auth.btn_verify')}</span>
                                            </button>
                                        </>
                                    )}
                                </form>
                            )}
                        </div>

                        {/* Footer: Guest Mode + Privacy */}
                        <div className="mt-6 pt-6 border-t border-slate-100 w-full shrink-0 flex flex-col items-center gap-3">
                            <button
                                onClick={() => { loginAsGuest(); onClose && onClose(); }}
                                className="text-xs text-slate-500 hover:text-[#051229] font-bold underline decoration-slate-300 underline-offset-4"
                            >
                                Continuer en mode démo (invité)
                            </button>
                            <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                                <button onClick={onNavigateToSecurity} className="hover:text-[#051229] underline decoration-slate-300 underline-offset-2">
                                    {t('auth.privacy_link')}
                                </button>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginModal;
