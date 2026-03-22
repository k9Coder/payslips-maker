import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import he from './locales/he.json';

i18n.use(initReactI18next).init({
  lng: 'he',
  fallbackLng: 'he',
  resources: {
    he: { translation: he },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
