// hooks/useTranslation.js
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../translations/translations';

/**
 * Translation Hook
 *
 * Usage:
 * const { t } = useTranslation();
 * return <button>{t('timer.startFast')}</button>
 *
 * Result:
 * - German browser: "Fasten starten"
 * - English browser: "Start Fast"
 */
export function useTranslation() {
  const { language } = useLanguage();

  // Create translation function for current language
  const translate = (key) => t(language, key);

  return {
    t: translate,
    language,
  };
}
