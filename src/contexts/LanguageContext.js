import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../locales/i18n";

// Create context
const LanguageContext = createContext();

// Language options
export const LANGUAGES = [
  { code: "ar", name: "العربية", nativeName: "العربية", flag: "🇸🇦" },
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
];

// Provider component
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("ar"); // Default to Arabic
  const [isRTL, setIsRTL] = useState(true);
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0); // Add force update trigger

  // Load language on mount
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  // Add listener for i18n language changes
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      console.log("🔄 i18n language changed, updating context:", lng);
      setCurrentLanguage(lng);
      setIsRTL(lng === "ar");
      setForceUpdate((prev) => prev + 1); // Force components to re-render
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);

  // Load saved language from storage
  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("@app_language");
      console.log(`🔍 Checking saved language: ${savedLanguage}`);

      if (savedLanguage && ["ar", "en"].includes(savedLanguage)) {
        console.log(`✅ Using saved language: ${savedLanguage}`);
        await changeLanguage(savedLanguage);
      } else {
        // Default to Arabic
        console.log(`📱 Using default language: ar`);
        await changeLanguage("ar");
      }
    } catch (error) {
      console.error("❌ Load language error:", error);
      await changeLanguage("ar"); // Fallback to Arabic
    } finally {
      setLoading(false);
    }
  };

  // Change language
  const changeLanguage = async (languageCode) => {
    try {
      // Validate language code
      if (!LANGUAGES.find((lang) => lang.code === languageCode)) {
        throw new Error("Unsupported language");
      }

      console.log(`🌐 Changing language to: ${languageCode}`);

      // Update i18n first
      await i18n.changeLanguage(languageCode);

      // Force immediate state update
      setCurrentLanguage(languageCode);
      setIsRTL(languageCode === "ar");
      setForceUpdate((prev) => prev + 1);

      // Save to storage
      await AsyncStorage.setItem("@app_language", languageCode);

      console.log(`✅ Language changed successfully to: ${languageCode}`);
      console.log(`📖 Current i18n language: ${i18n.language}`);

      // Additional force update after a brief delay
      setTimeout(() => {
        setForceUpdate((prev) => prev + 1);
        console.log("🔄 Secondary force update triggered");
      }, 100);

      return true;
    } catch (error) {
      console.error("❌ Change language error:", error);
      return false;
    }
  };

  // Get current language info
  const getCurrentLanguageInfo = () => {
    return (
      LANGUAGES.find((lang) => lang.code === currentLanguage) || LANGUAGES[0]
    );
  };

  // Get opposite language (for toggle)
  const getOppositeLanguage = () => {
    return currentLanguage === "ar" ? "en" : "ar";
  };

  // Toggle language (Arabic ↔ English)
  const toggleLanguage = async () => {
    const newLanguage = getOppositeLanguage();
    return await changeLanguage(newLanguage);
  };

  const value = {
    // Current state
    currentLanguage,
    isRTL,
    loading,
    forceUpdate,

    // Language info
    languages: LANGUAGES,
    currentLanguageInfo: getCurrentLanguageInfo(),
    oppositeLanguage: getOppositeLanguage(),

    // Actions
    changeLanguage,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

export default LanguageContext;
