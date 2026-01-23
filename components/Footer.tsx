
import React from 'react';
import { 
  ShieldCheck, 
  MessageCircle, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Building2,
  Globe,
  Lock
} from 'lucide-react';
import { AppStep } from '../types';
import { useTranslation } from 'react-i18next';

interface FooterProps {
  onNavigate?: (step: AppStep) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-[#051229] text-white pt-16 pb-8 border-t border-white/5 relative z-10 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Main Content: Branding & Contact Only (No Navigation Links) */}
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
          
          {/* Left: Branding & Trust */}
          <div className="space-y-6 max-w-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[#FF9F1C] w-8 h-8" />
              <h2 className="text-2xl font-black tracking-tighter">SiamVisa<span className="text-[#FF9F1C]">Pro</span></h2>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              {t('footer.partner_text')}
            </p>
            
            <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{t('footer.secure_payment')}</p>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5"><CreditCard size={16} className="text-slate-400" /></div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5"><Building2 size={16} className="text-slate-400" /></div>
                    <span className="text-[10px] font-bold text-slate-500">Stripe • Wise</span>
                </div>
            </div>
          </div>

          {/* Right: Contact Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-black tracking-tight">{t('footer.direct_contact')}</h3>
            <div className="space-y-4">
              <a 
                href={`https://wa.me/66824149840?text=${encodeURIComponent(t('whatsapp_msg.info'))}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start gap-4 group p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5"
              >
                <div className="p-2 bg-green-500/10 text-green-500 rounded-lg group-hover:scale-110 transition-transform">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="text-sm font-black">{t('footer.whatsapp_chat')}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">{t('footer.immediate_response')}</p>
                </div>
              </a>
              
              <div className="flex flex-col gap-4 pl-2">
                <a href="mailto:contact@siamvisapro.com" className="flex items-center gap-3 group text-slate-300 hover:text-white transition-colors">
                    <Mail size={16} className="text-[#FF9F1C]" />
                    <span className="text-sm font-bold">contact@siamvisapro.com</span>
                </a>

                <div className="flex items-center gap-3 text-slate-300">
                    <Phone size={16} className="text-[#FF9F1C]" />
                    <span className="text-sm font-bold">+66 82 414 9840</span>
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                    <MapPin size={16} className="text-[#FF9F1C]" />
                    <span className="text-sm font-bold">Paris, France & Bangkok, Thailand</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            {t('footer.rights_reserved')}
          </p>
          
          <div className="flex items-center gap-6">
            <button 
                onClick={() => onNavigate && onNavigate(AppStep.SECURITY)} 
                className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-[#FF9F1C] transition-colors flex items-center gap-2"
            >
                <Lock size={10} /> {t('footer.privacy_policy')}
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <Globe size={12} /> {t('footer.network_status')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
