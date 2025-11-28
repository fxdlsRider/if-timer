// translations/translations.js

/**
 * Translations for IF-Timer App
 *
 * Structure: translations[language][key]
 * Languages: 'de' (German), 'en' (English)
 */

export const translations = {
  de: {
    // Navigation
    'nav.timer': 'Timer',
    'nav.dashboard': 'Dashboard',
    'nav.learn': 'Lernen',
    'nav.modes': 'App-Modi',
    'nav.community': 'Community',
    'nav.about': 'Über',
    'nav.support': 'Unterstützen',

    // Timer Page
    'timer.startFast': 'Fasten starten',
    'timer.cancelFast': 'Fasten abbrechen',
    'timer.stopFast': 'Fasten beenden',
    'timer.continueFasting': 'Weiter fasten',
    'timer.wellDone': 'Gut gemacht!',
    'timer.goalReached': 'Ziel erreicht!',
    'timer.timeSinceLastFast': 'Zeit seit letztem Fasten',
    'timer.selectGoal': 'Wähle dein Fastenziel',
    'timer.changeGoal': 'Ziel ändern',
    'timer.changeStartTime': 'Startzeit ändern',

    // Leaderboard
    'leaderboard.title': 'Top-Faster',
    'leaderboard.subtitle': 'Jetzt gerade',
    'leaderboard.peopleFasting': 'Personen fasten gerade',
    'leaderboard.signUpToCompete': 'Registrieren und mitfasten',
    'leaderboard.loading': 'Lade Bestenliste...',

    // Community
    'community.title': 'Live Community',
    'community.activeFasters': 'Aktive Faster',
    'community.fastingNow': 'fasten gerade',
    'community.noOneFasting': 'Niemand fastet gerade',
    'community.beTheFirst': 'Sei der Erste!',
    'community.loading': 'Lade Community...',

    // Dashboard
    'dashboard.myJourney': 'Meine Reise',
    'dashboard.totalFasts': 'Gesamt-Fasten',
    'dashboard.currentStreak': 'Aktuelle Serie',
    'dashboard.totalHours': 'Gesamt-Stunden',
    'dashboard.longestFast': 'Längstes Fasten',
    'dashboard.averageFast': 'Durchschnitt',
    'dashboard.completedSessions': 'abgeschlossene Sessions',
    'dashboard.daysInRow': 'Tage in Folge',

    // Auth
    'auth.signIn': 'Anmelden',
    'auth.signUp': 'Registrieren',
    'auth.signOut': 'Abmelden',
    'auth.signInWithEmail': 'Mit E-Mail anmelden',
    'auth.enterEmail': 'E-Mail eingeben',
    'auth.sendLink': 'Link senden',
    'auth.checkEmail': 'Prüfe deine E-Mails',
    'auth.anonymous': 'Anonym',

    // Fasting Levels
    'level.novice': 'Anfänger',
    'level.disciple': 'Schüler',
    'level.champion': 'Champion',
    'level.warrior': 'Krieger',
    'level.monk': 'Mönch',
    'level.sage': 'Weiser',

    // Body Modes
    'mode.fed': 'Gesättigt',
    'mode.fasting': 'Fasten',
    'mode.fatBurning': 'Fettverbrennung',
    'mode.ketosis': 'Ketose',
    'mode.deepKetosis': 'Tiefe Ketose',
    'mode.autophagy': 'Autophagie',

    // Common
    'common.loading': 'Lädt...',
    'common.error': 'Fehler',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.close': 'Schließen',
    'common.hours': 'Stunden',
    'common.minutes': 'Minuten',
    'common.days': 'Tage',
  },

  en: {
    // Navigation
    'nav.timer': 'Timer',
    'nav.dashboard': 'Dashboard',
    'nav.learn': 'Learn',
    'nav.modes': 'App Modes',
    'nav.community': 'Community',
    'nav.about': 'About',
    'nav.support': 'Support',

    // Timer Page
    'timer.startFast': 'Start Fast',
    'timer.cancelFast': 'Cancel Fast',
    'timer.stopFast': 'Stop Fast',
    'timer.continueFasting': 'Continue Fasting',
    'timer.wellDone': 'Well Done!',
    'timer.goalReached': 'Goal Reached!',
    'timer.timeSinceLastFast': 'Time Since Last Fast',
    'timer.selectGoal': 'Select Your Fasting Goal',
    'timer.changeGoal': 'Change Goal',
    'timer.changeStartTime': 'Change Start Time',

    // Leaderboard
    'leaderboard.title': 'Top Fasters',
    'leaderboard.subtitle': 'Right Now',
    'leaderboard.peopleFasting': 'people fasting now',
    'leaderboard.signUpToCompete': 'Sign Up to Compete',
    'leaderboard.loading': 'Loading leaderboard...',

    // Community
    'community.title': 'Live Community',
    'community.activeFasters': 'Active Fasters',
    'community.fastingNow': 'fasting right now',
    'community.noOneFasting': 'No one is fasting right now',
    'community.beTheFirst': 'Be the first to start!',
    'community.loading': 'Loading community...',

    // Dashboard
    'dashboard.myJourney': 'My Journey',
    'dashboard.totalFasts': 'Total Fasts',
    'dashboard.currentStreak': 'Current Streak',
    'dashboard.totalHours': 'Total Hours',
    'dashboard.longestFast': 'Longest Fast',
    'dashboard.averageFast': 'Average Fast',
    'dashboard.completedSessions': 'completed sessions',
    'dashboard.daysInRow': 'days in a row',

    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.signOut': 'Sign Out',
    'auth.signInWithEmail': 'Sign In with Email',
    'auth.enterEmail': 'Enter your email',
    'auth.sendLink': 'Send Link',
    'auth.checkEmail': 'Check Your Email',
    'auth.anonymous': 'Anonymous',

    // Fasting Levels
    'level.novice': 'Novice',
    'level.disciple': 'Disciple',
    'level.champion': 'Champion',
    'level.warrior': 'Warrior',
    'level.monk': 'Monk',
    'level.sage': 'Sage',

    // Body Modes
    'mode.fed': 'Fed State',
    'mode.fasting': 'Fasting',
    'mode.fatBurning': 'Fat Burning',
    'mode.ketosis': 'Ketosis',
    'mode.deepKetosis': 'Deep Ketosis',
    'mode.autophagy': 'Autophagy',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.close': 'Close',
    'common.hours': 'hours',
    'common.minutes': 'minutes',
    'common.days': 'days',
  }
};

/**
 * Get translation for a key
 * @param {string} language - Language code ('de' or 'en')
 * @param {string} key - Translation key (e.g., 'timer.startFast')
 * @returns {string} Translated text
 */
export function t(language, key) {
  const translation = translations[language]?.[key];

  if (!translation) {
    console.warn(`Translation missing: ${language}.${key}`);
    // Fallback to English
    return translations.en[key] || key;
  }

  return translation;
}

/**
 * Create translation function for a specific language
 * @param {string} language - Language code
 * @returns {function} Translation function
 */
export function createTranslator(language) {
  return (key) => t(language, key);
}
