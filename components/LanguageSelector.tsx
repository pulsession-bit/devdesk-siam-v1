
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' }
];

interface LanguageSelectorProps {
  onSelect?: () => void;
  variant?: 'sidebar' | 'dropdown';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect, variant = 'sidebar' }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Gestion RTL pour l'arabe
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
    if (onSelect) onSelect();
  };

  if (variant === 'sidebar') {
    return (
      <div className="px-4 mt-2">
        <p className="px-2 text-[9px] font-bold uppercase tracking-[0.2em] mb-2 opacity-40 text-white">
           Language
        </p>
        <div className="grid grid-cols-4 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center justify-center p-2 rounded-lg text-lg transition-all ${
                i18n.language === lang.code 
                  ? 'bg-[#FF9F1C] shadow-lg scale-110' 
                  : 'bg-white/5 hover:bg-white/10 text-white opacity-60 hover:opacity-100'
              }`}
              title={lang.label}
            >
              {lang.flag}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
       {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                i18n.language === lang.code 
                  ? 'bg-[#051229] text-white border-[#051229]' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-[#FF9F1C]'
              }`}
            >
              {lang.flag} {lang.label}
            </button>
       ))}
    </div>
  );
};

export default LanguageSelector;
