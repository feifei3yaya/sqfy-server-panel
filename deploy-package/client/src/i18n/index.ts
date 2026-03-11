import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh/translation.json';
import enUS from './locales/en/translation.json';

const resources = {
  zh: {
    translation: zhCN,
  },
  en: {
    translation: enUS,
  },
};

const savedLanguage = localStorage.getItem('language') || 'zh';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;
