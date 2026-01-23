
import React, { useState } from 'react';
import { CreditCard, Lock, ShieldCheck, CheckCircle2, ChevronLeft, Loader2, ExternalLink, Landmark, ShoppingBag, Trash2, Plus } from 'lucide-react';
import { ThemeMode, VisaType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession } from '../services/firebase';
import { useCart } from '../contexts/CartContext';
import { useTranslation } from 'react-i18next';

interface PaymentGatewayProps {
  themeMode: ThemeMode;
  visaType: VisaType;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ themeMode, visaType, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { cart, cartTotal, removeFromCart } = useCart();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<'stripe' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const MANDAT_PRICE = 2500;
  const totalAmount = MANDAT_PRICE + cartTotal;
  const priceDisplay = totalAmount.toLocaleString('th-TH');
  
  const handleStripePayment = async () => {
    if (!user) return;
    setLoading('stripe');
    setError(null);

    try {
      // 1. L'élément de base obligatoire : Le Mandat
      const lineItems = [{
        price_data: {
          currency: 'thb',
          product_data: {
            name: `Mandat Visa ${visaType || 'DTV'}`,
            description: "Activation officielle dossier & Audit Juridique"
          },
          unit_amount: MANDAT_PRICE * 100, // Conversion en satangs
        },
        quantity: 1
      }];

      // 2. Ajout des services du panier
      cart.forEach(item => {
        lineItems.push({
            price_data: {
                currency: 'thb',
                product_data: {
                    name: item.title,
                    description: item.category
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        });
      });

      await createCheckoutSession(user, lineItems);
      onSuccess();
    } catch (err: any) {
      console.error("Payment Error:", err);
      setError(err.message || "Erreur de communication avec le serveur de paiement.");
      setLoading(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 md:p-10 font-sans scroll-container min-h-0">
      <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
        
        {/* Navigation Retour */}
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-400 hover:text-[#051229] transition-colors font-bold text-xs uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> {t('common.back')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLONNE GAUCHE : RÉCAPITULATIF COMMANDE */}
          <div className="lg:col-span-7 space-y-6">
             
             {/* Header Titre */}
             <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-serif font-normal text-[#051229] leading-tight mb-2">
                   {t('payment.title')}
                </h1>
                <p className="text-slate-500 text-sm">{t('payment.subtitle')}</p>
             </div>

             {/* Carte 1 : Mandat Obligatoire */}
             <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:border-[#051229]/20 transition-all">
                <div className="flex items-start gap-5">
                   <div className="w-14 h-14 bg-[#051229] text-[#FF9F1C] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Landmark size={24} strokeWidth={1.5} />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-[#051229] text-lg">{t('payment.mandate_title')}</h3>
                            <p className="text-slate-500 text-xs mt-1">{t('payment.mandate_item_desc')}</p>
                          </div>
                          <span className="font-bold text-[#051229]">{MANDAT_PRICE.toLocaleString()} THB</span>
                      </div>
                      
                      {/* Features List */}
                      <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                             <CheckCircle2 size={14} className="text-emerald-500" />
                             <span>{t('payment.guarantee_compliance')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                             <CheckCircle2 size={14} className="text-emerald-500" />
                             <span>{t('payment.support_unlimited')}</span>
                          </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Liste des Services Ajoutés (Panier) */}
             {cart.length > 0 && (
                 <div className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">{t('payment.services_added')}</h4>
                     {cart.map((item) => (
                         <div key={item.id} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 flex items-center justify-between group">
                             <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
                                     <ShoppingBag size={18} />
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-[#051229] text-sm">{item.title}</h4>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.category}</p>
                                 </div>
                             </div>
                             <div className="flex items-center gap-4">
                                 <span className="font-bold text-[#051229] text-sm">{(item.price * item.quantity).toLocaleString()} THB</span>
                                 <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Retirer"
                                 >
                                     <Trash2 size={16} />
                                 </button>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
             
             {/* Bouton pour retourner au shop si besoin */}
             <div className="pt-4">
                <button onClick={onCancel} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#FF9F1C] transition-colors">
                    <Plus size={14} /> {t('payment.btn_add_more')}
                </button>
             </div>

          </div>

          {/* COLONNE DROITE : CHECKOUT */}
          <div className="lg:col-span-5 space-y-6">
             <div className="bg-[#051229] text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-center sticky top-6">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><CreditCard size={140} /></div>

                {loading === 'stripe' ? (
                    // VUE DE CHARGEMENT SÉCURISÉ (2 SECONDES)
                    <div className="absolute inset-0 z-50 bg-[#051229] flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-300">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse"></div>
                            <ShieldCheck size={80} className="text-emerald-400 relative z-10 animate-bounce" strokeWidth={1} />
                        </div>
                        <h3 className="text-white font-serif text-xl mb-2">{t('payment.secure_loading')}</h3>
                        <p className="text-slate-400 text-xs uppercase tracking-widest mb-6 font-bold">Chiffrement SSL & Création Dossier</p>
                        
                        {/* Barre de progression visuelle */}
                        <div className="w-full max-w-[200px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 animate-[pulse_1s_ease-in-out_infinite] w-2/3 mx-auto rounded-full"></div>
                        </div>
                    </div>
                ) : (
                    // VUE STANDARD CHECKOUT
                    <div className="relative z-10">
                    <div className="flex flex-col mb-8">
                        <p className="text-[#FF9F1C] text-[10px] font-black uppercase tracking-[0.2em] mb-2">{t('payment.total_pay')}</p>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-5xl font-serif font-normal">{priceDisplay}</h2>
                            <span className="text-lg font-sans font-bold opacity-50">THB</span>
                        </div>
                        {cart.length > 0 && (
                            <p className="text-slate-400 text-xs mt-2">{t('payment.total_includes', { count: cart.length })}</p>
                        )}
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button 
                            onClick={handleStripePayment}
                            disabled={loading !== null}
                            className="w-full py-5 bg-[#FF9F1C] hover:bg-amber-400 text-[#051229] rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <CreditCard size={18} />
                            <span>{t('payment.btn_pay_card')}</span>
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('payment.secure_guarantee')}</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>
                        
                        <div className="flex items-center justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                             {/* Mock Logos Paiement */}
                             <div className="h-6 w-10 bg-white/20 rounded"></div>
                             <div className="h-6 w-10 bg-white/20 rounded"></div>
                             <div className="h-6 w-10 bg-white/20 rounded"></div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-2">
                         <div className="flex items-center justify-center gap-2 text-[#FF9F1C] text-[10px] font-bold uppercase tracking-widest">
                            <ShieldCheck size={12} /> {t('payment.encrypted_payment')}
                         </div>
                        <p className="text-[9px] text-slate-400 font-medium">
                            {t('payment.terms')}
                        </p>
                    </div>
                    </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
