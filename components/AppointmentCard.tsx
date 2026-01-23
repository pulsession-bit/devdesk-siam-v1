
import React, { useState } from 'react';
import { Calendar, Clock, Check, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AppointmentCardProps {
  visaType: string;
  score: number;
  onSchedule: (date: string, time: string) => void;
  isConfirmed?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ visaType, score, onSchedule, isConfirmed = false }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const { t } = useTranslation();

  const dates = [
    { label: t('appointment_card.dates.tomorrow'), value: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
    { label: t('appointment_card.dates.day_after'), value: new Date(Date.now() + 172800000).toISOString().split('T')[0] },
    { label: t('appointment_card.dates.in_3_days'), value: new Date(Date.now() + 259200000).toISOString().split('T')[0] },
  ];

  const slots = ["10:00", "11:00", "14:00", "15:00", "16:00"];

  if (isConfirmed) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-8 shadow-sm animate-in zoom-in-95 duration-500 font-sans">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Check size={28} />
          </div>
          <div>
            <h3 className="font-serif text-2xl text-emerald-900 leading-none">{t('appointment_card.confirmed_title')}</h3>
            <p className="text-emerald-700 text-[10px] font-bold uppercase tracking-widest mt-1">{t('appointment_card.concierge_unit')}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 flex justify-between items-center border border-emerald-100/50 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[9px] text-emerald-600/60 font-black uppercase tracking-widest mb-1">{t('appointment_card.base_folder')}</span>
            <span className="font-bold text-emerald-900">{visaType}</span>
          </div>
          <div className="w-px h-8 bg-emerald-100 mx-4" />
          <div className="flex flex-col text-right">
            <span className="text-[9px] text-emerald-600/60 font-black uppercase tracking-widest mb-1">{t('appointment_card.match_score')}</span>
            <span className="font-bold text-emerald-900">{score}% {t('appointment_card.match')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group font-sans">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#051229] via-[#FF9F1C] to-[#051229]" />
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#F8FAFC] text-[#051229] rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
          <Calendar size={22} />
        </div>
        <div>
          {/* Titre Serif */}
          <h3 className="font-serif text-2xl text-[#051229] leading-none">{t('appointment_card.consultation')}</h3>
          <p className="text-slate-400 text-[9px] uppercase font-bold tracking-[0.2em] mt-1">{t('appointment_card.vip_support', { type: visaType })}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-300 mb-3 block">{t('appointment_card.step1')}</label>
          <div className="grid grid-cols-1 gap-2">
            {dates.map((d) => (
              <button
                key={d.value}
                onClick={() => setSelectedDate(d.value)}
                className={`flex items-center justify-between py-3.5 px-5 rounded-2xl border text-[11px] font-bold uppercase tracking-widest transition-all ${
                  selectedDate === d.value 
                    ? 'bg-[#051229] text-white border-[#051229] shadow-lg' 
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'
                }`}
              >
                {d.label}
                <ChevronRight size={14} className={selectedDate === d.value ? 'text-[#FF9F1C]' : 'opacity-0'} />
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-500">
            <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-300 mb-3 block">{t('appointment_card.step2')}</label>
            <div className="grid grid-cols-3 gap-2">
              {slots.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedTime(s)}
                  className={`py-3 px-2 rounded-xl border text-[11px] font-bold transition-all ${
                    selectedTime === s 
                      ? 'bg-[#FF9F1C] text-[#051229] border-[#FF9F1C] shadow-md' 
                      : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          disabled={!selectedDate || !selectedTime}
          onClick={() => onSchedule(selectedDate, selectedTime)}
          className={`
            w-full mt-4 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl active:scale-[0.97] flex items-center justify-center gap-3
            ${!selectedDate || !selectedTime 
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
              : 'bg-[#051229] text-white hover:bg-slate-800 border-b-4 border-[#FF9F1C]'
            }
          `}
        >
          <Clock size={18} />
          {t('appointment_card.confirm_btn')}
        </button>
      </div>
    </div>
  );
};

export default AppointmentCard;
