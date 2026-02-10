import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import ar from "./ar.json";
import en from "./en.json";

// Device language
const deviceLanguage = getLocales()[0]?.languageCode || "ar";
console.log('🌐 Device language detected:', deviceLanguage);

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: deviceLanguage === 'en' ? 'en' : 'ar', // Support both languages
  fallbackLng: "en", // Fallback to English
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false, // Disable suspense for better compatibility
  },
  debug: __DEV__, // Enable debug in development
});

// Add language change listener for debugging
i18n.on('languageChanged', (lng) => {
  console.log('🔄 i18n language changed to:', lng);
});

export default i18n;
