
import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, User, TrendingUp, Briefcase, Info, Loader2, Sparkles, Target, ChevronDown, Mail, Phone } from 'lucide-react';
import { PreAuditData, VisaType, ThemeMode } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

// Composant Input stylisé qui gère à la fois Input et Select
const InputField = ({ label, placeholder, isAiFilled, options, value, onChange, type = "text", ...props }: any) => (
  <div className="space-y-2 w-full font-sans">
    <div className="flex items-center justify-between">
       <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</label>
       {isAiFilled && <span className="text-[9px] font-black uppercase tracking-wider text-[#FF9F1C] flex items-center gap-1 animate-pulse"><Sparkles size={10} /> IA</span>}
    </div>
    <div className="relative">
        {options ? (
            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    className={`w-full bg-white border rounded-2xl px-5 py-4 text-[#051229] font-medium text-lg outline-none transition-all appearance-none cursor-pointer
                        ${isAiFilled 
                            ? 'border-[#FF9F1C] shadow-[0_0_0_1px_rgba(255,159,28,0.2)]' 
                            : 'border-slate-200 focus:border-[#051229] focus:ring-1 focus:ring-[#051229]/10'
                        }
                        ${!value ? 'text-slate-400' : ''}
                    `}
                    {...props}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((opt: {value: string, label: string}) => (
                        <option key={opt.value} value={opt.label} className="text-[#051229]">{opt.label}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
        ) : (
            <input 
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-white border rounded-2xl px-5 py-4 text-[#051229] font-medium text-lg outline-none transition-all placeholder:text-slate-300
                    ${isAiFilled 
                        ? 'border-[#FF9F1C] shadow-[0_0_0_1px_rgba(255,159,28,0.2)]' 
                        : 'border-slate-200 focus:border-[#051229] focus:ring-1 focus:ring-[#051229]/10'
                    }
                `} 
                {...props}
            />
        )}
    </div>
  </div>
);

// Section du formulaire (Gauche: Icône/Titre, Droite: Champs)
const FormSection = ({ icon, title, desc, children }: { icon: any, title: string, desc: string, children?: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 py-8 border-b border-slate-100 last:border-0">
        {/* Colonne Gauche: Identité Visuelle */}
        <div className="md:col-span-4 flex flex-row md:flex-col items-center md:items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#051229] text-[#FF9F1C] flex items-center justify-center shadow-lg flex-shrink-0">
                {icon}
            </div>
            <div className="text-left">
                <h3 className="font-bold text-[#051229] text-sm uppercase tracking-wide mb-1">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">{desc}</p>
            </div>
        </div>
        {/* Colonne Droite: Inputs */}
        <div className="md:col-span-8 w-full">
            {children}
        </div>
    </div>
);

interface PreAuditFormProps {
  visaType: VisaType;
  onBack: () => void;
  onSubmit: (data: PreAuditData) => void;
  isLoading: boolean;
  themeMode: ThemeMode;
  preFilledData?: PreAuditData;
}

const PreAuditForm: React.FC<PreAuditFormProps> = ({ visaType, onBack, onSubmit, isLoading, themeMode, preFilledData }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<PreAuditData>({ 
    age: '', savings: '', monthlyIncome: '', profession: '', projectDescription: '', nationality: '', passportExpiry: '', email: '', phoneNumber: ''
  });
  const [aiFields, setAiFields] = useState<string[]>([]); // Track which fields were filled by AI

  // Autofill Email si connecté
  useEffect(() => {
    if (user && user.email) {
        setFormData(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  useEffect(() => {
    if (preFilledData) {
        setFormData(prev => {
            const newState = { ...prev };
            const newAiFields = [...aiFields];
            let hasChange = false;

            Object.keys(preFilledData).forEach((key) => {
                const val = (preFilledData as any)[key];
                if (val && val !== (prev as any)[key]) {
                    (newState as any)[key] = val;
                    if (!newAiFields.includes(key)) newAiFields.push(key);
                    hasChange = true;
                }
            });
            
            if (hasChange) {
                setAiFields(newAiFields);
                return newState;
            }
            return prev;
        });
    }
  }, [preFilledData]);

  const setField = (field: keyof PreAuditData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const OPTIONS = {
    NATIONALITIES: [
        { value: "fr", label: t('pre_audit.options.nat_fr') },
        { value: "be", label: t('pre_audit.options.nat_be') },
        { value: "ch", label: t('pre_audit.options.nat_ch') },
        { value: "ca", label: t('pre_audit.options.nat_ca') },
        { value: "other", label: t('pre_audit.options.nat_other') }
    ],
    PROFESSIONS: [
        { value: "nomad", label: t('pre_audit.options.job_nomad') },
        { value: "retired", label: t('pre_audit.options.job_retired') },
        { value: "remote", label: t('pre_audit.options.job_remote') },
        { value: "business", label: t('pre_audit.options.job_business') },
        { value: "investor", label: t('pre_audit.options.job_investor') },
        { value: "teacher", label: t('pre_audit.options.job_teacher') },
        { value: "medical", label: t('pre_audit.options.job_medical') },
        { value: "engineer", label: t('pre_audit.options.job_engineer') },
        { value: "none", label: t('pre_audit.options.job_none') },
        { value: "other", label: t('pre_audit.options.job_other') }
    ],
    INCOMES: [
        { value: "1", label: "< 1,500 €" },
        { value: "2", label: "1,500 € - 2,500 €" },
        { value: "3", label: "2,500 € - 4,000 €" },
        { value: "4", label: "4,000 € - 6,000 €" },
        { value: "5", label: "> 6,000 €" }
    ],
    SAVINGS: [
        { value: "1", label: "< 15,000 €" },
        { value: "2", label: "15,000 € - 30,000 €" },
        { value: "3", label: "30,000 € - 60,000 €" },
        { value: "4", label: "> 60,000 €" }
    ]
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 pt-4 px-4 font-sans animate-in slide-in-from-bottom-8 duration-500">
      
      {/* 1. HEADER NAVY CARD (Merged Top) */}
      <div className="bg-[#051229] rounded-t-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl z-10">
         
         {/* Navigation Retour */}
         <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors mb-8 relative z-10"
         >
            <ChevronLeft size={14} /> {t('pre_audit.back')}
         </button>

         {/* Contenu Header */}
         <div className="relative z-10 w-full">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-white leading-none">
                {t('pre_audit.title', { type: visaType || 'Expert' })}
            </h1>
            <p className="text-slate-400 text-sm font-medium">
                {t('pre_audit.subtitle')}
            </p>
         </div>

         {/* Décoration Target/Radar (Right Side) */}
         <div className="absolute top-1/2 -right-16 -translate-y-1/2 w-64 h-64 pointer-events-none opacity-20">
             <div className="absolute inset-0 rounded-full border-[20px] border-white/10 scale-100" />
             <div className="absolute inset-8 rounded-full border-[20px] border-white/10 scale-75" />
             <div className="absolute inset-16 rounded-full border-[20px] border-white/10 scale-50" />
             <div className="absolute inset-[4.5rem] rounded-full bg-white/10" />
         </div>
      </div>

      {/* 2. FORMULAIRE (Merged Bottom) */}
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
        
        {/* Conteneur avec contour gris prononcé - Attaché au header */}
        <div className="bg-white rounded-b-[2.5rem] border-x-2 border-b-2 border-slate-300 p-8 md:p-12 shadow-sm relative z-20 -mt-0.5">
        
            {/* SECTION 1: IDENTITÉ */}
            <FormSection 
                icon={<User size={24} />} 
                title={t('pre_audit.section_identity')}
                desc={t('pre_audit.section_identity_desc')}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                        label={t('pre_audit.label_age')}
                        placeholder="Ex: 35" 
                        type="number"
                        value={formData.age}
                        isAiFilled={aiFields.includes('age')}
                        onChange={(e: any) => setField('age', e.target.value)}
                    />
                    <InputField 
                        label={t('pre_audit.label_profession')}
                        placeholder="Sélectionner..." 
                        options={OPTIONS.PROFESSIONS}
                        value={formData.profession}
                        isAiFilled={aiFields.includes('profession')}
                        onChange={(e: any) => setField('profession', e.target.value)}
                    />
                </div>
                <div className="mt-6">
                    <InputField 
                        label={t('pre_audit.label_nationality')}
                        placeholder="Sélectionner..." 
                        options={OPTIONS.NATIONALITIES}
                        value={formData.nationality}
                        isAiFilled={aiFields.includes('nationality')}
                        onChange={(e: any) => setField('nationality', e.target.value)}
                    />
                </div>
            </FormSection>

            {/* SECTION 2: CONTACT (NOUVEAU) */}
            <FormSection 
                icon={<Mail size={24} />} 
                title={t('pre_audit.section_contact')}
                desc={t('pre_audit.section_contact_desc')}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                        label={t('pre_audit.label_email')}
                        placeholder="votre@email.com" 
                        type="email"
                        value={formData.email}
                        isAiFilled={aiFields.includes('email')}
                        onChange={(e: any) => setField('email', e.target.value)}
                    />
                    <InputField 
                        label={t('pre_audit.label_phone')}
                        placeholder="+33 6 ..." 
                        type="tel"
                        value={formData.phoneNumber}
                        isAiFilled={aiFields.includes('phoneNumber')}
                        onChange={(e: any) => setField('phoneNumber', e.target.value)}
                    />
                </div>
            </FormSection>

            {/* SECTION 3: FINANCES */}
            <FormSection 
                icon={<TrendingUp size={24} />} 
                title={t('pre_audit.section_finance')}
                desc={t('pre_audit.section_finance_desc')}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                        label={t('pre_audit.label_savings')}
                        placeholder="Sélectionner une tranche" 
                        options={OPTIONS.SAVINGS}
                        value={formData.savings}
                        isAiFilled={aiFields.includes('savings')}
                        onChange={(e: any) => setField('savings', e.target.value)}
                    />
                    <InputField 
                        label={t('pre_audit.label_income')}
                        placeholder="Sélectionner une tranche" 
                        options={OPTIONS.INCOMES}
                        value={formData.monthlyIncome}
                        isAiFilled={aiFields.includes('monthlyIncome')}
                        onChange={(e: any) => setField('monthlyIncome', e.target.value)}
                    />
                </div>
            </FormSection>

            {/* SECTION 4: PROJET */}
            <FormSection 
                icon={<Briefcase size={24} />} 
                title={t('pre_audit.section_project')}
                desc={t('pre_audit.section_project_desc')}
            >
                <div className="space-y-2 w-full font-sans">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('pre_audit.label_notes')}</label>
                        {aiFields.includes('projectDescription') && <span className="text-[9px] font-black uppercase tracking-wider text-[#FF9F1C] flex items-center gap-1 animate-pulse"><Sparkles size={10} /> IA</span>}
                    </div>
                    <textarea 
                        placeholder={t('pre_audit.placeholder_notes')}
                        className={`w-full bg-white border rounded-3xl p-6 text-[#051229] font-medium text-lg outline-none transition-all placeholder:text-slate-300 min-h-[160px] resize-none
                            ${aiFields.includes('projectDescription')
                                ? 'border-[#FF9F1C] shadow-[0_0_0_1px_rgba(255,159,28,0.2)]' 
                                : 'border-slate-200 focus:border-[#051229] focus:ring-1 focus:ring-[#051229]/10'
                            }
                        `}
                        value={formData.projectDescription}
                        onChange={e => setField('projectDescription', e.target.value)}
                    />
                </div>
            </FormSection>

            {/* 3. FOOTER ACTION */}
            <div className="pt-10 mt-6 flex flex-col md:flex-row items-center gap-8 border-t border-slate-100">
                
                {/* Info Box */}
                <div className="flex-1 flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-start">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info size={16} />
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold text-[#051229] text-[10px] uppercase tracking-wider mb-1">{t('pre_audit.info_pdpa')}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            {t('pre_audit.info_pdpa_desc')}
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full md:w-auto px-10 py-5 bg-[#051229] hover:bg-[#0F264A] text-white rounded-2xl shadow-xl flex items-center justify-center gap-6 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 group"
                >
                    <div className="text-left">
                        <span className="block text-[10px] font-bold uppercase tracking-widest opacity-60">{t('pre_audit.btn_next')}</span>
                        <span className="block text-lg font-bold">{t('pre_audit.btn_analyze')}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                    </div>
                </button>
            </div>
        </div>

      </form>
    </div>
  );
};

export default PreAuditForm;
