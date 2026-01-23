
import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Globe, Zap, Check, Calendar, Phone, Mail, Video, MessageCircle, Clock, Shield, User, Loader2, CheckCircle2, Hash, ChevronDown } from 'lucide-react';
import { AppStep } from '../types';
import Footer from './Footer';
import { initRecaptcha, saveAppointment } from '../services/firebase';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

interface LandingDTVProps {
  onLoginRequest: (data?: any) => void;
  onStartConcierge: () => void;
  onNavigateToSecurity: () => void;
  onNavigateToGeneral?: () => void;
  onNavigateToDashboard?: () => void;
}

const LandingDTV: React.FC<LandingDTVProps> = ({ onLoginRequest, onStartConcierge, onNavigateToSecurity, onNavigateToGeneral, onNavigateToDashboard }) => {
  const { t, i18n } = useTranslation();
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'phone' | 'email' | 'zoom'>('whatsapp');
  const [formData, setFormData] = useState({ name: '', email: '', date: '', time: '', contactDetail: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [appointmentRef, setAppointmentRef] = useState<string | null>(null);
  
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
        initRecaptcha('recaptcha-container');
    } catch (e) {
        console.error("Recaptcha Init Error", e);
    }
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getDynamicWhatsAppUrl = (refId?: string) => {
    const baseUrl = "https://wa.me/66824149840";
    const dateStr = formData.date ? new Date(formData.date).toLocaleDateString() : "...";
    const timeStr = formData.time || "...";
    const dossierRef = refId ? `[DOSSIER DTV: ${refId.toUpperCase()}]` : "[NOUVEAU DOSSIER DTV]";
    
    const header = i18n.language === 'fr'
        ? `${dossierRef}\nNom : ${formData.name}\nEmail : ${formData.email}\nRDV souhaité : ${dateStr} à ${timeStr}\nContact : ${formData.contactDetail} (${contactMethod})\n\n`
        : `${dossierRef}\nName: ${formData.name}\nEmail: ${formData.email}\nPreferred Slot: ${dateStr} at ${timeStr}\nContact: ${formData.contactDetail} (${contactMethod})\n\n`;
    
    const message = header + t('whatsapp_msg.audit');
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  };

  const handleSubmit = async () => {
      if (!formData.name || !formData.email || !formData.date) return;
      setIsSubmitting(true);
      
      try {
          const docId = await saveAppointment({
              userId: 'guest-prospect',
              visaType: 'Audit Expert (DTV)',
              date: formData.date,
              time: formData.time || '10:00',
              name: formData.name,
              email: formData.email,
              contactDetail: formData.contactDetail,
              contactMethod: contactMethod,
              status: 'pending'
          });

          if (docId) {
            setAppointmentRef(docId);
            const waUrl = getDynamicWhatsAppUrl(docId);
            window.open(waUrl, '_blank');
            setIsSuccess(true);
          }
      } catch (error) {
          console.error("DTV Submission error", error);
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleFooterNavigation = (step: AppStep) => {
      if (step === AppStep.SECURITY) onNavigateToSecurity();
      if (step === AppStep.DASHBOARD && onNavigateToDashboard) onNavigateToDashboard();
  };

  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push({
            date: d.toISOString().split('T')[0],
            dayName: d.toLocaleDateString(i18n.language, { weekday: 'short' }).replace('.', ''),
            dayNumber: d.getDate(),
            fullDate: d
        });
    }
    return days;
  };
  
  const calendarDays = getNextDays();

  return (
    <div className="min-h-screen bg-white font-sans overflow-y-auto scroll-container flex flex-col">
      <div className="relative bg-[#051229] min-h-[90vh] flex flex-col">
        <div className="absolute inset-0 z-0">
           <img src="https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=2600&auto=format&fit=crop" className="w-full h-full object-cover opacity-60" alt={t('alt.bangkok_temple')} />
           <div className="absolute inset-0 bg-gradient-to-b from-[#051229]/80 via-[#051229]/50 to-[#051229]" />
        </div>
        <nav className="relative z-20 px-6 md:px-12 py-6 flex justify-between items-center border-b border-white/5 flex-wrap gap-4">
            <div className="flex items-center gap-2"><div className="w-8 h-8 bg-[#FF9F1C] rounded-lg flex items-center justify-center text-[#051229]"><ShieldCheck size={18} strokeWidth={3} /></div><span className="text-white font-bold text-xl tracking-tight">SiamVisa<span className="text-[#FF9F1C]">Pro</span></span></div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300"><button onClick={onNavigateToGeneral} className="hover:text-[#FF9F1C] transition-colors">{t('nav.home')}</button><button className="text-white font-bold flex items-center gap-1">{t('nav.visas')} <ChevronDown size={14} /></button></div>
            <div className="flex items-center gap-4"><LanguageSelector variant="dropdown" /><button onClick={scrollToForm} className="bg-[#FF9F1C] hover:bg-amber-400 text-[#051229] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95">{t('landing.btn_submit')}</button></div>
        </nav>
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-20 pt-10">
            <div className="mb-8 animate-in slide-in-from-top-4 duration-700"><span className="px-5 py-2 rounded-full border border-[#FF9F1C]/50 bg-[#FF9F1C] text-[#051229] text-[10px] font-black uppercase tracking-[0.25em] shadow-lg">{t('welcome.new_opportunity')}</span></div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight drop-shadow-2xl max-w-5xl">{t('dtv.hero_title')} <br/><span className="text-[#FF9F1C]">{t('dtv.hero_highlight')}</span></h1>
            <p className="text-slate-200 text-lg font-medium leading-relaxed max-w-3xl mb-10 drop-shadow-md">{t('dtv.hero_sub')}</p>
            <button onClick={scrollToForm} className="w-full md:w-auto bg-[#FF9F1C] hover:bg-amber-400 text-[#051229] px-12 py-5 rounded-md font-black text-sm uppercase tracking-widest shadow-2xl shadow-[#FF9F1C]/20 transition-all transform hover:-translate-y-1 active:scale-95">{t('dtv.cta_check')}</button>
        </div>
      </div>
      <div className="py-24 px-6 bg-white relative z-20">
         <div className="text-center mb-16"><h2 className="text-3xl font-black text-[#051229]">{t('dtv.why_title')}</h2></div>
         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center space-y-6 group"><div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center text-[#051229] mb-2 shadow-sm group-hover:scale-110 transition-transform"><Globe size={28} strokeWidth={1.5} /></div><div><h3 className="font-black text-[#051229] text-lg uppercase tracking-wide mb-2">{t('dtv.feat_residency')}</h3><p className="text-sm text-slate-500 leading-relaxed px-4">{t('dtv.feat_residency_desc')}</p></div></div>
            <div className="flex flex-col items-center text-center space-y-6 group"><div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center text-[#051229] mb-2 shadow-sm group-hover:scale-110 transition-transform"><Shield size={28} strokeWidth={1.5} /></div><div><h3 className="font-black text-[#051229] text-lg uppercase tracking-wide mb-2">{t('dtv.feat_legal')}</h3><p className="text-sm text-slate-500 leading-relaxed px-4">{t('dtv.feat_legal_desc')}</p></div></div>
            <div className="flex flex-col items-center text-center space-y-6 group"><div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center text-[#051229] mb-2 shadow-sm group-hover:scale-110 transition-transform"><Zap size={28} strokeWidth={1.5} /></div><div><h3 className="font-black text-[#051229] text-lg uppercase tracking-wide mb-2">{t('dtv.feat_tax')}</h3><p className="text-sm text-slate-500 leading-relaxed px-4">{t('dtv.feat_tax_desc')}</p></div></div>
         </div>
      </div>
      <div ref={formRef} className="bg-[#F8FAFC] py-20 px-6 scroll-mt-20">
          <div className="max-w-6xl mx-auto bg-white rounded-[3rem] shadow-xl overflow-hidden flex flex-col lg:flex-row border border-slate-100">
              <div className="lg:w-2/5 bg-[#051229] p-12 text-white flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 p-8 opacity-5"><Globe size={300} /></div>
                  <div className="relative z-10"><h2 className="text-3xl md:text-4xl font-black leading-tight mb-2">{t('dtv.audit_title')} <br/> <span className="text-[#FF9F1C]">{t('dtv.audit_highlight')}</span></h2><p className="text-slate-400 text-sm mb-10 leading-relaxed mt-4">{t('dtv.audit_desc')}</p><ul className="space-y-4">{[t('dtv.audit_point1'), t('dtv.audit_point2'), t('dtv.audit_point3')].map((item, i) => (<li key={i} className="flex items-center gap-3 text-sm font-bold text-[#FF9F1C]"><Check size={16} /><span className="text-white">{item}</span></li>))}</ul></div>
              </div>
              <div className="lg:w-3/5 p-12 bg-white flex flex-col justify-center">
                  {isSuccess ? (
                      <div className="text-center animate-in zoom-in duration-500">
                          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"><CheckCircle2 size={48} /></div>
                          <h3 className="text-3xl font-black text-[#051229] mb-4">{t('dtv.success_title')}</h3>
                          <p className="text-lg font-bold text-emerald-600 mb-6">{t('dtv.success_subtitle')}</p>
                          {appointmentRef && (
                              <div className="mb-6 inline-block bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 justify-center"><Hash size={12} /> {t('landing.ref_file')}</p>
                                  <p className="text-xl font-mono font-bold text-[#051229] tracking-wider">{appointmentRef.toUpperCase()}</p>
                              </div>
                          )}
                          <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">{t('dtv.success_desc', { name: formData.name, date: new Date(formData.date).toLocaleDateString() })}</p>
                          <button onClick={() => { setIsSuccess(false); setAppointmentRef(null); setFormData({name:'', email:'', date:'', time:'', contactDetail:''}); }} className="block w-full max-w-xs mx-auto py-3 bg-[#051229] text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#0F264A] transition-all">{t('dtv.btn_return')}</button>
                      </div>
                  ) : (
                      <div className="max-w-md mx-auto pb-12"> 
                          <div className="text-center mb-8"><h3 className="text-xl font-bold text-[#051229]">{t('landing.form_title')}</h3><p className="text-xs text-slate-500">{t('landing.form_subtitle')}</p></div>
                          <div className="space-y-5">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2"><User size={12} /> {t('landing.label_name')}</label><input type="text" placeholder="Votre Nom" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#F8FAFC] border border-slate-200 rounded-md px-4 py-3 text-sm font-medium text-[#051229] outline-none focus:border-[#051229]" /></div>
                                  <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2"><Mail size={12} /> {t('landing.label_email')}</label><input type="email" placeholder="votre@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-[#F8FAFC] border border-slate-200 rounded-md px-4 py-3 text-sm font-medium text-[#051229] outline-none focus:border-[#051229]" /></div>
                              </div>
                              <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2"><Calendar size={12} /> {t('landing.label_date')}</label>
                                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 scroll-smooth">
                                      {calendarDays.map((d) => (<button key={d.date} type="button" onClick={() => setFormData({...formData, date: d.date})} className={`flex flex-col items-center justify-center min-w-[4.5rem] h-16 rounded-xl border transition-all duration-300 ${formData.date === d.date ? 'bg-[#051229] border-[#051229] text-white shadow-lg scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-[#FF9F1C] hover:bg-[#FF9F1C]/5'}`}><span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{d.dayName}</span><span className="text-lg font-black">{d.dayNumber}</span></button>))}
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                   <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2"><Clock size={12} /> {t('landing.label_time1')}</label><select value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full bg-[#F8FAFC] border border-slate-200 rounded-full px-4 py-3 text-sm font-medium text-[#051229] outline-none focus:border-[#051229]"><option value="">--:--</option><option value="10:00">10:00</option><option value="14:00">14:00</option></select></div>
                                   <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2"><Clock size={12} /> {t('landing.label_time2')}</label><select className="w-full bg-[#F8FAFC] border border-slate-200 rounded-full px-4 py-3 text-sm font-medium text-[#051229] outline-none focus:border-[#051229]"><option>--:--</option><option>11:00</option><option>15:00</option></select></div>
                              </div>
                              <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">{t('landing.label_contact')}</label>
                                  <div className="grid grid-cols-4 gap-2">
                                      <button onClick={() => setContactMethod('whatsapp')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${contactMethod === 'whatsapp' ? 'border-[#FF9F1C] text-[#FF9F1C]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}><MessageCircle size={18} className="mb-1" /><span className="text-[9px] font-bold">WhatsApp</span></button>
                                      <button onClick={() => setContactMethod('phone')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${contactMethod === 'phone' ? 'border-[#FF9F1C] text-[#FF9F1C]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}><Phone size={18} className="mb-1" /><span className="text-[9px] font-bold">Tél</span></button>
                                      <button onClick={() => setContactMethod('email')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${contactMethod === 'email' ? 'border-[#FF9F1C] text-[#FF9F1C]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}><Mail size={18} className="mb-1" /><span className="text-[9px] font-bold">Email</span></button>
                                      <button onClick={() => setContactMethod('zoom')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${contactMethod === 'zoom' ? 'border-[#FF9F1C] text-[#FF9F1C]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}><Video size={18} className="mb-1" /><span className="text-[9px] font-bold">Zoom</span></button>
                                  </div>
                              </div>
                              <input type="text" placeholder={contactMethod === 'email' || contactMethod === 'zoom' ? 'ID Zoom ou Email' : 'Numéro de téléphone'} value={formData.contactDetail} onChange={(e) => setFormData({...formData, contactDetail: e.target.value})} className="w-full bg-[#F8FAFC] border border-slate-200 rounded-md px-4 py-4 text-sm font-medium text-[#051229] outline-none focus:border-[#051229]" />
                              <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-[#051229] hover:bg-[#0F264A] text-white py-4 rounded-md font-bold text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-80">{isSubmitting ? <><Loader2 size={16} className="animate-spin" /> {t('landing.btn_processing')}</> : t('landing.btn_submit')}</button>
                              <div id="recaptcha-container"></div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>
      <div className="bg-white py-16 text-center">
          <h3 className="text-xl font-bold text-[#051229] mb-6">{t('welcome.need_help')}</h3>
          <a href={getDynamicWhatsAppUrl(appointmentRef || undefined)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1"><MessageCircle size={24} className="fill-current" /><span>{t('landing.whatsapp_button')}</span></a>
      </div>
      <Footer onNavigate={handleFooterNavigation} />
    </div>
  );
};

export default LandingDTV;
