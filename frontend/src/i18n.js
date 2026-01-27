import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'hi', 'mr'],
    nonExplicitSupportedLngs: true,
    fallbackLng: 'en',
    detection: {
      order: ['path', 'cookie', 'htmlTag', 'localStorage', 'subdomain'],
      caches: ['localStorage', 'cookie'],
      // Read user's preferred language key we persist across pages
      lookupLocalStorage: 'preferredLanguage',
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    react: { useSuspense: false },
  });

// Keep <html lang> in sync for CSS font switching and accessibility
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('lang', i18n.language || 'en');
  i18n.on('languageChanged', (lng) => {
    document.documentElement.setAttribute('lang', lng);
  });
}

export default i18n;
