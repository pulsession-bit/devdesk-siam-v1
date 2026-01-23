
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, Calendar, Phone, Mail, Video, MessageCircle, Clock, User, Loader2, ArrowLeft, CheckCircle2, Hash } from 'lucide-react';
import { initRecaptcha, saveAppointment } from '../services/firebase';
import { useTranslation } from 'react-i18next';

interface BookingPageProps {
  onLoginRequest: (data?: any) => void;
  onBack: () => void;
}

const BookingPage: React.FC<BookingPageProps> = ({ onLoginRequest, onBack }) => {
  const { t, i18n } = useTranslation();
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'phone' | 'email' | 'zoom'>('whatsapp');
  const [formData, setFormData] = useState({ name: '', email: '', date: '', time: '', contactDetail: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [appointmentRef, setAppointmentRef] = useState<string | null>(null);

  useEffect(() => {
    try {
        initRecaptcha('recaptcha-container');
    } catch (e) {
        console.error("Recaptcha Init Error", e);
    }
  }, []);

  const getDynamicWhatsAppUrl = () => {
    const baseUrl = "https://wa.me/66824149840";
    const dateStr = formData.date ? new Date(formData.date).toLocaleDateString() : "...";
    const timeStr = formData.time || "...";
    
    const header = i18n.language === 'fr'
        ? `[PRISE DE RDV]\nNom : ${formData.name}\nEmail : ${formData.email}\nRDV souhaité : ${dateStr} à ${timeStr}\nContact : ${formData.contactDetail} (${contactMethod})\n\n`
        : `[APPOINTMENT BOOKING]\nName: ${formData.name}\nEmail: ${formData.email}\nPreferred Slot: ${dateStr} at ${timeStr}\nContact: ${formData.contactDetail} (${contactMethod})\n\n`;
    
    const message = header + t('whatsapp_msg.audit');
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  };

  const handleSubmit = async () => {
      if (!formData.name || !formData.email || !formData.date) return;
      
      setIsSubmitting(true);
      
      try {
          // 1. Sauvegarde Firebase
          const docId = await saveAppointment({
              userId: 'guest-prospect',
              visaType: 'Audit Expert (Direct Booking)',
              date: formData.date,
              time: formData.time || '10:00',
              name: formData.name,
              email: formData.email,
              contactDetail: formData.contactDetail,
              contactMethod: contactMethod,
              status: 'pending'
          });

          setAppointmentRef(docId);

          // 2. Ouverture WhatsApp
          const waUrl = getDynamicWhatsAppUrl();
          window.open(waUrl, '_blank');

          setIsSuccess(true);
      } catch (error) {
          console.error("Booking error", error);
      } finally {
          setIsSubmitting(false);
      }
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans overflow-y-auto scroll-container flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
          <div className="flex items-center gap-2"><div className="w-8 h-8 bg-[#051229] rounded-lg flex items-center justify-center text-[#FF9F1C]"><ShieldCheck size={18} strokeWidth={3} /></div><span className="text-[#051229] font-bold text-xl tracking-tight">SiamVisa<span className="text-[#FF9F1C]">Pro</span></span></div>
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-[#051229] transition-colors text-xs font-bold uppercase tracking-widest"><ArrowLeft size={16} /> {t('booking.back')}</button>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-100 animate-in slide-in-from-bottom-8 duration-700">
          <div className="lg:w-2/5 bg-[#051229] p-10 md:p-12 text-white flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Calendar size={200} /></div>
              <div className="relative z-10"><h2 className="text-3xl md:text-4xl font-black leading-tight mb-2">{t('booking.title_main')} <br/> <span className="text-[#FF9F1C]">{t('booking.title_highlight')}</span></h2><p className="text-slate-400 text-sm mb-10 leading-relaxed mt-4">{t('booking.subtitle')}</p><div className="space-y-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#FF9F1C]"><Check size={18} strokeWidth={3} /></div><div><p className="font-bold text-sm">{t('booking.feat_precision')}</p><p className="text-[10px] text-slate-500">{t('booking.feat_precision_sub')}</p></div></div><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#FF9F1C]"><ShieldCheck size={18} strokeWidth={3} /></div><div><p className="font-bold text-sm">{t('booking.feat_privacy')}</p><p className="text-[10px] text-slate-500">{t('booking.feat_privacy_sub')}</p></div></div></div></div>
          </div>

          <div className="lg:w-3/5 p-10 md:p-12 bg-white flex flex-col justify-center">
              {isSuccess ? (
                  <div className="text-center animate-in zoom-in duration-500">
                      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"><CheckCircle2 size={48} /></div>
                      <h3 className="text-3xl font-black text-[#051229] mb-4">{t('booking.success_title')}</h3>
                      <p className="text-lg font-bold text-emerald-600 mb-6">{t('booking.success_subtitle', { name: formData.name })}</p>
                      {appointmentRef && (
                          <div className="mb-6 inline-block bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 justify-center"><Hash size={12} /> {t('booking.ref_folder')}</p>
                              <p className="text-xl font-mono font-bold text-[#051229] tracking-wider">{appointmentRef.slice(0, 8).toUpperCase()}</p>
                          </div>
                      )}
                      <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">{t('booking.success_text', { date: new Date(formData.date).toLocaleDateString(), time: formData.time || '10:00' })}<br/>{t('booking.success_email')}</p>
                      <button onClick={() => { setIsSuccess(false); setAppointmentRef(null); setFormData({name:'', email:'', date:'', time:'', contactDetail:''}); }} className="block w-full max-w-xs mx-auto py-3 bg-[#051229] text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#0F264A] transition-all">{t('booking.btn_new')}</button>
                  </div>
              ) : (
                  <div className="max-w-md mx-auto">
                      <div className="text-center mb-8"><h3 className="text-xl font-bold text-[#051229]">{t('booking.form_title')}</h3><p className="text-xs text-slate-500">{t('booking.form_desc')}</p></div>
                      <div className="space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2"><User size={12} /> {t('booking.label_name')}</label><input type="text" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#051229] outline-none focus:border-[#051229]" /></div>
                              <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2"><Mail size={12} /> {t('booking.label_email')}</label><input type="email" placeholder="john@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#051229] outline-none focus:border-[#051229]" /></div>
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2"><Calendar size={12} /> {t('booking.label_date')}</label>
                              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 scroll-smooth">
                                  {calendarDays.map((d) => (<button key={d.date} type="button" onClick={() => setFormData({...formData, date: d.date})} className={`flex flex-col items-center justify-center min-w-[4.5rem] h-16 rounded-xl border transition-all duration-300 ${formData.date === d.date ? 'bg-[#051229] border-[#051229] text-white shadow-lg scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-[#FF9F1C] hover:bg-[#FF9F1C]/5'}`}><span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{d.dayName}</span><span className="text-lg font-black">{d.dayNumber}</span></button>))}
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                               <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2"><Clock size={12} /> {t('booking.label_slot1')}</label><select value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#051229] outline-none focus:border-[#051229]"><option value="">--:--</option><option value="10:00">10:00</option><option value="14:00">14:00</option></select></div>
                               <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2"><Clock size={12} /> {t('booking.label_slot2')}</label><select className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#051229] outline-none focus:border-[#051229]"><option>--:--</option><option>11:00</option><option>15:00</option></select></div>
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">{t('booking.label_contact')}</label>
                              <div className="grid grid-cols-4 gap-2">
                                  <button onClick={() => setContactMethod('whatsapp')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${contactMethod === 'whatsapp' ? 'border-[#FF9F1C] text-[#FF9F1C]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}><MessageCircle size={18} className="mb-1" /><span className="text-[9px] font-bold">WhatsApp</span></button>
                                  <button onClick={() => setContactMethod('phone')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${contactMethod === 'phone' ? 'border-[#FF9F1C] text-[#FF9F1C]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}><Phone size={18} className="mb-1" /><span className="text-[9px] font-bold">Tél</span></button>
                                  <button onClick={() => setContactMethod('email')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${contactMethod === 'email' ? 'border-[#FF9F1C] text-[#FF9F1C]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}><Mail size={18} className="mb-1" /><span className="text-[9px] font-bold">Email</span></button>
                                  <button onClick={() => setContactMethod('zoom')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${contactMethod === 'zoom' ? 'border-[#FF9F1C] text-[#FF9F1C]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}><Video size={18} className="mb-1" /><span className="text-[9px] font-bold">Zoom</span></button>
                              </div>
                          </div>
                          <input type="text" placeholder={t('booking.placeholder_contact')} value={formData.contactDetail} onChange={(e) => setFormData({...formData, contactDetail: e.target.value})} className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium text-[#051229] outline-none focus:border-[#051229]" />
                          <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-[#051229] hover:bg-[#0F264A] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-80">{isSubmitting ? <><Loader2 size={16} className="animate-spin" /> {t('booking.processing')}</> : t('booking.btn_validate')}</button>
                          <div id="recaptcha-container"></div>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default BookingPage;
