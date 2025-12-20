import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { get, STORAGE_KEYS } from "@/redux/auth/secureStorage";
import enTranslations from "./locales/en";
import esTranslations from "./locales/es";

// Custom language detector that checks SecureStorage first
const customLanguageDetector = {
  type: "languageDetector" as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Check SecureStorage for saved locale
      const savedLocale = await get(STORAGE_KEYS.LOCALE);
      if (savedLocale) {
        callback(savedLocale);
        return;
      }

      // Fall back to device language or default
      callback("en");
    } catch (error) {
      console.error("Failed to detect language:", error);
      callback("en");
    }
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(customLanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: false,
    resources: {
      en: {
        translation: enTranslations,
      },
      es: {
        translation: esTranslations,
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
