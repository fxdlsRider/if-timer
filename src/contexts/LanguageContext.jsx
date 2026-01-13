// contexts/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FEATURE_FLAGS } from '../config/constants';

/**
 * Language Context
 *
 * Detects browser language and provides translation functions
 * Supports: German (de), English (en)
 * Fallback: English
 */

const LanguageContext = createContext();

/**
 * Detect browser language
 * @returns {string} Language code ('de' or 'en')
 */
function detectBrowserLanguage() {
  // If language detection is disabled, always return English
  if (!FEATURE_FLAGS.LANGUAGE_DETECTION_ENABLED) {
    return 'en';
  }

  // Check localStorage first (user preference)
  const savedLang = localStorage.getItem('if-timer-language');
  if (savedLang && ['de', 'en'].includes(savedLang)) {
    return savedLang;
  }

  // Detect from browser
  const browserLang = navigator.language || navigator.userLanguage;

  // Extract language code (e.g., 'de-DE' -> 'de')
  const langCode = browserLang.split('-')[0].toLowerCase();

  // Support German and English, fallback to English
  return langCode === 'de' ? 'de' : 'en';
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => detectBrowserLanguage());

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('if-timer-language', language);
    console.log(`🌍 Language set to: ${language}`);
  }, [language]);

  const value = {
    language,
    setLanguage,
    isGerman: language === 'de',
    isEnglish: language === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
