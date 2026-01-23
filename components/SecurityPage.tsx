
import React, { useState } from 'react';
import { ShieldCheck, Lock, ChevronLeft, Database, EyeOff, FileKey, CheckCircle2, Server, Globe, FileText, Scale, Fingerprint, Activity, Zap, Cpu, Verified } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SecurityPageProps {
  onBack: () => void;
}

const CloudflareLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="currentColor" className={className}>
     <path d="M12.91 22.82C13.29 17.96 17.37 14 22.3 14c4.07 0 7.57 2.56 9.07 6.13.7-.13 1.42-.2 2.14-.2 6.07 0 11 4.93 11 11s-4.93 11-11 11H13.5c-4.97 0-9-4.03-9-9 0-4.63 3.5-8.44 8.01-8.94.3-.67.75-1.26 1.4-1.17z" />
  </svg>
);

const SecurityPage: React.FC<SecurityPageProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<'TECH' | 'LEGAL'>('TECH');

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#F8FAFC] font-sans scroll-container min-h-0">
      
      {/* EXECUTIVE HEADER */}
      <div className="bg-[#051229] px-6 py-12 md:px-12 md:py-20 shadow-2xl relative overflow-hidden">
         <button 
           onClick={onBack} 
           className="absolute top-6 left-6 md:left-12 flex items-center gap-2 text-[#FF9F1C] hover:text-white transition-all font-bold text-xs uppercase tracking-widest z-20 group"
         >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {t('common.back')}
         </button>
         
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none -rotate-12">
            <ShieldCheck size={400} color="white" />
         </div>

         <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-8 text-[#FF9F1C] animate-in zoom-in duration-700">
                    <ShieldCheck size={48} strokeWidth={1.5} />
                </div>
                <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 tracking-tight">{t('security.title')}</h1>
                <p className="text-slate-400 max-w-2xl text-sm md:text-lg leading-relaxed font-medium">
                   {t('security.subtitle')}
                </p>
                
                <div className="mt-10 flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Protection</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <Verified size={14} className="text-blue-400" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">PDPA Compliant</span>
                    </div>
                </div>
            </div>
         </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 -mt-10 relative z-20">
        
        {/* TABS SELECTOR */}
        <div className="flex justify-center mb-12">
            <div className="bg-white p-1.5 rounded-2xl shadow-xl border border-slate-100 flex gap-2">
                <button 
                  onClick={() => setActiveSection('TECH')}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'TECH' ? 'bg-[#051229] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    Infrastructure
                </button>
                <button 
                  onClick={() => setActiveSection('LEGAL')}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'LEGAL' ? 'bg-[#051229] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    Legal & DPA
                </button>
            </div>
        </div>

        {activeSection === 'TECH' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                {/* CLOUDFLARE PILLAR */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-100 group transition-all hover:shadow-2xl">
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-14 h-14 bg-[#FFF0E0] rounded-2xl flex items-center justify-center text-[#F48120] shadow-inner">
                            <CloudflareLogo className="h-8 w-auto" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#051229] text-xl">{t('security.net_sec')}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WAF & DDoS Protection</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="text-xs font-black text-[#051229] uppercase mb-2">Network Cloaking</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Toutes les requêtes passent par le tunnel chiffré Cloudflare, masquant l'IP du serveur d'origine et neutralisant les attaques de force brute.</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="text-xs font-black text-[#051229] uppercase mb-2">TLS 1.3 / HSTS</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Chiffrement de bout en bout forcé. Vos documents ne transitent jamais "en clair" sur le réseau public.</p>
                        </div>
                    </div>
                </div>

                {/* GCP PILLAR */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-100 group transition-all hover:shadow-2xl">
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                            <Server size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#051229] text-xl">{t('security.data_sov')}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Google Cloud Platform</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-black text-[#051229] uppercase mb-1">Localisation</h4>
                                <p className="text-xs text-slate-500">Belgium (Europe West)</p>
                            </div>
                            <Globe size={20} className="text-blue-500 opacity-20" />
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="text-xs font-black text-[#051229] uppercase mb-1">Stockage Chiffré</h4>
                            <p className="text-xs text-slate-500">Base de données Firestore chiffrée au repos avec des clés gérées par Google Cloud Key Management.</p>
                        </div>
                    </div>
                </div>

                {/* AI PRIVACY */}
                <div className="bg-[#051229] rounded-[2.5rem] p-8 md:p-10 shadow-2xl text-white md:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Cpu size={140} /></div>
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-[#FF9F1C] mb-6 border border-white/10 shadow-xl">
                                <EyeOff size={32} />
                            </div>
                            <h3 className="text-2xl font-serif mb-2">{t('security.ai_priv')}</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Gemini Enterprise Protocol</p>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
                                <CheckCircle2 size={18} className="text-[#FF9F1C] mb-3" />
                                <h4 className="text-sm font-bold mb-2">Pas d'Entraînement</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">Siam Visa Pro utilise une instance isolée. Vos données ne sont JAMAIS utilisées pour entraîner les futurs modèles globaux de Google.</p>
                            </div>
                            <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
                                <Activity size={18} className="text-[#FF9F1C] mb-3" />
                                <h4 className="text-sm font-bold mb-2">Sessions Éphémères</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">Le contexte de l'audit est supprimé après 24h d'inactivité. L'IA ne conserve aucune mémoire résiduelle hors session active.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-6 mb-12">
                    <div className="w-16 h-16 bg-[#051229] rounded-2xl flex items-center justify-center text-[#FF9F1C] shadow-lg">
                        <Scale size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-serif text-[#051229] leading-tight">{t('security.terms_title')}</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Version 2.7.0 — Janvier 2025</p>
                    </div>
                </div>

                <div className="prose prose-slate max-w-none space-y-10 text-slate-600 font-medium leading-relaxed">
                    <section>
                        <h3 className="text-[#051229] font-bold text-lg mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-[#FF9F1C] rounded-full" />
                            1. Nature du Service
                        </h3>
                        <p className="text-sm">
                            Siam Visa Pro est une plateforme technologique d'assistance administrative exploitée par la branche technologique de CIM Visas. Nous agissons en tant qu'intermédiaire facilitateur et auditeur de conformité. Le paiement des frais d'audit active une obligation de moyens pour l'analyse et la préparation du dossier selon les directives consulaires en vigueur.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-[#051229] font-bold text-lg mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-[#FF9F1C] rounded-full" />
                            2. Protection des Données (PDPA & RGPD)
                        </h3>
                        <p className="text-sm mb-4">
                            En vertu de la Loi sur la protection des données personnelles (PDPA) de Thaïlande et du RGPD européen, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                                <Fingerprint size={20} className="text-slate-400 mt-1" />
                                <div>
                                    <p className="text-xs font-bold text-[#051229] mb-1">Identité & Biométrie</p>
                                    <p className="text-[10px] text-slate-500">Seuls les experts certifiés "Audit Senior" ont accès à vos copies de passeport.</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                                <Lock size={20} className="text-slate-400 mt-1" />
                                <div>
                                    <p className="text-xs font-bold text-[#051229] mb-1">Documents Financiers</p>
                                    <p className="text-[10px] text-slate-500">Les relevés bancaires sont traités par OCR sécurisé et ne font l'objet d'aucun archivage permanent après validation.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-[#051229] font-bold text-lg mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-[#FF9F1C] rounded-full" />
                            3. Responsabilité & Garantie
                        </h3>
                        <p className="text-sm">
                            Bien que Siam Visa Pro affiche un taux de réussite exceptionnel, la décision finale d'attribution d'un visa appartient exclusivement aux services de l'Immigration Thaïlandaise et du Ministère des Affaires Étrangères. Notre garantie porte sur la conformité absolue du dossier déposé par rapport aux exigences réglementaires.
                        </p>
                    </section>

                    <section className="bg-[#F8FAFC] p-8 rounded-[2rem] border border-slate-200 mt-12">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="text-center sm:text-left">
                                <h4 className="text-sm font-black text-[#051229] uppercase tracking-widest mb-1">Besoin de plus de détails ?</h4>
                                <p className="text-xs text-slate-500">Contactez notre délégué à la protection des données (DPO).</p>
                            </div>
                            <a href="mailto:legal@siamvisapro.com" className="px-8 py-4 bg-white border border-slate-200 text-[#051229] font-bold rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-sm">
                                legal@siamvisapro.com
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        )}

        <div className="mt-16 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] mb-8">End-to-End Encryption Protocol Active</p>
            <div className="flex items-center justify-center gap-12 opacity-30">
                <div className="h-8 w-24 bg-slate-300 rounded"></div>
                <div className="h-8 w-24 bg-slate-300 rounded"></div>
                <div className="h-8 w-24 bg-slate-300 rounded"></div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SecurityPage;
