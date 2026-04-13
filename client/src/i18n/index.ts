import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import he from './locales/he.json';
import en from './locales/en.json';
import ar from './locales/ar.json';
import fil from './locales/fil.json';
import th from './locales/th.json';
import am from './locales/am.json';
import hi from './locales/hi.json';

const savedLang = localStorage.getItem('ui-language') ?? 'he';

i18n.use(initReactI18next).init({
  lng: savedLang,
  fallbackLng: 'en',
  resources: {
    he: { translation: he },
    en: { translation: en },
    ar: { translation: ar },
    fil: { translation: fil },
    th: { translation: th },
    am: { translation: am },
    hi: { translation: hi },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
