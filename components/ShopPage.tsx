
import React from 'react';
import { ShoppingBag, Star, Zap, Shield, Globe, Plane, Headphones, FileCheck, Plus, Check } from 'lucide-react';
import { Product, ThemeMode } from '../types';
import { useCart } from '../contexts/CartContext';
import { useTranslation } from 'react-i18next';

interface ShopPageProps {
  themeMode: ThemeMode;
  onNavigateToPayment: () => void;
}

const ShopPage: React.FC<ShopPageProps> = ({ themeMode, onNavigateToPayment }) => {
  const { addToCart, cart } = useCart();
  const { t } = useTranslation();

  const SERVICES: Product[] = [
    {
      id: 'fast-track',
      title: t('shop_items.fast_track.title'),
      description: t('shop_items.fast_track.desc'),
      price: 3500,
      category: 'VIP',
      icon: 'Plane'
    },
    {
      id: 'insurance-health',
      title: t('shop_items.insurance.title'),
      description: t('shop_items.insurance.desc'),
      price: 15000,
      category: 'LEGAL',
      icon: 'Shield'
    },
    {
      id: 'translation',
      title: t('shop_items.translation.title'),
      description: t('shop_items.translation.desc'),
      price: 2000,
      category: 'LEGAL',
      icon: 'FileCheck'
    },
    {
      id: 'concierge',
      title: t('shop_items.concierge.title'),
      description: t('shop_items.concierge.desc'),
      price: 5000,
      category: 'LIFESTYLE',
      icon: 'Headphones'
    },
    {
      id: 'bank-opening',
      title: t('shop_items.bank.title'),
      description: t('shop_items.bank.desc'),
      price: 4500,
      category: 'VIP',
      icon: 'Globe'
    }
  ];

  const getIcon = (name: string) => {
    switch (name) {
      case 'Plane': return <Plane size={24} />;
      case 'Shield': return <Shield size={24} />;
      case 'FileCheck': return <FileCheck size={24} />;
      case 'Headphones': return <Headphones size={24} />;
      case 'Globe': return <Globe size={24} />;
      default: return <Star size={24} />;
    }
  };

  const isInCart = (id: string) => cart.some(item => item.id === id);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#F8FAFC] font-sans scroll-container min-h-0">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10 animate-in fade-in slide-in-from-top-4">
         <div className="flex items-start gap-5 mb-6">
            <div className="w-14 h-14 bg-[#051229] text-[#FF9F1C] rounded-3xl flex items-center justify-center shadow-xl flex-shrink-0">
               <ShoppingBag size={28} />
            </div>
            <div>
               <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-4xl md:text-5xl font-serif font-normal text-[#051229] tracking-tight leading-tight">
                      {t('shop.title')}
                  </h1>
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                      <Zap size={10} fill="currentColor" />
                      <span className="text-[9px] font-bold uppercase tracking-widest font-sans">{t('shop.recommended')}</span>
                  </div>
               </div>
               <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium max-w-2xl">
                  {t('shop.subtitle')}
               </p>
            </div>
         </div>
      </div>

      {/* Grid Services */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
        {SERVICES.map((service, index) => (
            <div 
              key={service.id}
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#FF9F1C]/30 transition-all duration-300 flex flex-col group animate-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#051229] flex items-center justify-center group-hover:bg-[#051229] group-hover:text-[#FF9F1C] transition-colors duration-300">
                        {getIcon(service.icon || 'Star')}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        {service.category}
                    </span>
                </div>
                
                <h3 className="font-bold text-lg text-[#051229] mb-2">{service.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow">
                    {service.description}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('shop.price_label')}</span>
                        <span className="text-xl font-black text-[#051229]">{service.price.toLocaleString()} <span className="text-xs font-medium text-slate-400">THB</span></span>
                    </div>
                    
                    <button
                        onClick={() => !isInCart(service.id) && addToCart(service)}
                        disabled={isInCart(service.id)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95 ${
                            isInCart(service.id)
                            ? 'bg-emerald-500 text-white cursor-default'
                            : 'bg-[#051229] text-white hover:bg-[#FF9F1C] hover:text-[#051229]'
                        }`}
                    >
                        {isInCart(service.id) ? <Check size={20} /> : <Plus size={20} />}
                    </button>
                </div>
            </div>
        ))}
      </div>

      {/* Floating Cart Button (Mobile/Desktop) if items in cart */}
      {cart.length > 0 && (
          <div className="fixed bottom-8 right-8 z-30 animate-in slide-in-from-bottom-10 fade-in duration-500">
              <button 
                onClick={onNavigateToPayment}
                className="group flex items-center gap-4 pl-6 pr-2 py-2 rounded-full bg-[#051229] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/10"
              >
                 <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-[#FF9F1C] uppercase tracking-widest">{cart.length} {t('shop.items_count')}</span>
                    <span className="text-sm font-bold">{t('shop.view_cart')}</span>
                 </div>
                 <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#FF9F1C] group-hover:text-[#051229] transition-colors">
                    <ShoppingBag size={20} />
                 </div>
              </button>
          </div>
      )}
    </div>
  );
};

export default ShopPage;
