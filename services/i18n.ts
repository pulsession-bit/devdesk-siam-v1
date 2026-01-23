
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { commonEn } from './locales/en';
import { fr } from './locales/fr';
import { es } from './locales/es';

const resources = {
  en: { translation: commonEn },
  fr: fr,
  es: es,

  // Placeholders mapping to English for now (to prevent empty selection)
  it: { translation: commonEn },
  de: { translation: commonEn },
  pl: { translation: commonEn },
  ru: { translation: commonEn },
  ja: { translation: commonEn },
  ko: { translation: commonEn },
  zh: { translation: commonEn },
  ar: { translation: commonEn },
};

i18n.use(initReactI18next).init({ resources, lng: 'en', fallbackLng: 'en', interpolation: { escapeValue: false } });
export default i18n;
