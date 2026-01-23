
import React from 'react';
import { VisaType, ThemeMode } from '../types';
import { Briefcase, ChevronRight, User, Plane, Sun, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VisaSelectProps {
  onSelect: (type: VisaType) => void;
  selected: VisaType;
  themeMode: ThemeMode;
}

const VisaSelect: React.FC<VisaSelectProps> = ({ onSelect, selected, themeMode }) => {
  const { t } = useTranslation();

  const options = [
    {
      type: 'DTV',
      title: t('visa_select.dtv_title'),
      desc: t('visa_select.dtv_desc'),
      icon: <Briefcase size={22} strokeWidth={1.5} />,
      badge: t('visa_select.badge_popular')
    },
    {
      type: 'Retirement',
      title: t('visa_select.retirement_title'),
      desc: t('visa_select.retirement_desc'),
      icon: <User size={22} strokeWidth={1.5} />,
    },
    {
      type: 'Tourism',
      title: t('visa_select.tourism_title'),
      desc: t('visa_select.tourism_desc'),
      icon: <Plane size={22} strokeWidth={1.5} />,
    },
    {
      type: 'Business',
      title: t('visa_select.business_title'),
      desc: t('visa_select.business_desc'),
      icon: <Sun size={22} strokeWidth={1.5} />,
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto font-sans animate-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mb-10 md:mb-14">
        <div className="w-20 h-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-center mb-6">
           <ShieldCheck size={36} className="text-[#051229]" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-[#051229] mb-4 tracking-tight leading-tight">
          {t('visa_select.title')}
        </h1>
        
        <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed max-w-md">
          {t('visa_select.subtitle')}
        </p>
      </div>

      {/* Options List */}
      <div className="space-y-4">
        {options.map((opt) => (
          <button
            key={opt.type}
            onClick={() => onSelect(opt.type as VisaType)}
            className="w-full bg-white border border-slate-200 hover:border-[#051229] hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 rounded-[2rem] p-5 md:p-6 flex items-center gap-5 md:gap-6 group text-left"
          >
            {/* Icon Box */}
            <div className="w-14 h-14 bg-[#F8FAFC] border border-slate-100 rounded-2xl flex items-center justify-center text-[#051229] group-hover:bg-[#051229] group-hover:text-white transition-colors duration-300 flex-shrink-0">
               {opt.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
               <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                  <h3 className="font-bold text-lg text-[#051229] leading-tight">{opt.title}</h3>
                  {opt.badge && (
                      <span className="bg-[#FF9F1C] text-[#051229] text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {opt.badge}
                      </span>
                  )}
               </div>
               <p className="text-slate-500 text-xs md:text-sm font-medium truncate group-hover:text-slate-600 transition-colors">
                  {opt.desc}
               </p>
            </div>

            {/* Arrow */}
            <div className="text-slate-300 group-hover:text-[#051229] transition-colors pr-2">
               <ChevronRight size={24} strokeWidth={2} />
            </div>
          </button>
        ))}
      </div>

    </div>
  );
};

export default VisaSelect;
