# Internationalization (i18n) Guide

**Status:** ✅ Implemented (2025-11-28)
**Languages:** German (de), English (en)
**Method:** Browser language detection

---

## 🌍 How It Works

### Automatic Language Detection

When a user opens the app:
1. **Browser language is detected** (`navigator.language`)
2. **Language code extracted** (e.g., `de-DE` → `de`, `en-US` → `en`)
3. **Stored in localStorage** (persists across sessions)
4. **All text auto-translates** based on detected language

**Supported Languages:**
- 🇩🇪 German (`de`)
- 🇬🇧 English (`en`)
- Fallback: English (if browser language not supported)

---

## 📝 Usage in Components

### Simple Example

```jsx
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('timer.startFast')}</h1>
      {/* German browser: "Fasten starten" */}
      {/* English browser: "Start Fast" */}
    </div>
  );
}
```

### Get Current Language

```jsx
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t, language } = useTranslation();

  console.log(`Current language: ${language}`); // "de" or "en"

  return <p>{t('common.loading')}</p>;
}
```

### Change Language Manually (Optional)

```jsx
import { useLanguage } from '../contexts/LanguageContext';

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <button onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}>
      Switch to {language === 'de' ? 'English' : 'Deutsch'}
    </button>
  );
}
```

---

## 🗂️ File Structure

```
src/
├── contexts/
│   └── LanguageContext.jsx     # Language provider & detection
├── translations/
│   └── translations.js          # All translation strings
├── hooks/
│   └── useTranslation.js        # Translation hook
└── App.jsx                      # LanguageProvider wraps app
```

---

## ➕ Adding New Translations

### 1. Add Translation Keys

Edit `src/translations/translations.js`:

```javascript
export const translations = {
  de: {
    // Add your German translations
    'myFeature.title': 'Mein Feature',
    'myFeature.description': 'Eine tolle neue Funktion',
  },

  en: {
    // Add your English translations
    'myFeature.title': 'My Feature',
    'myFeature.description': 'A great new feature',
  }
};
```

### 2. Use in Component

```jsx
import { useTranslation } from '../hooks/useTranslation';

function MyFeature() {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('myFeature.title')}</h2>
      <p>{t('myFeature.description')}</p>
    </div>
  );
}
```

---

## 📋 Translation Categories

Translations are organized by category:

```javascript
{
  // Navigation
  'nav.timer': 'Timer',
  'nav.dashboard': 'Dashboard',

  // Timer
  'timer.startFast': 'Start Fast',
  'timer.stopFast': 'Stop Fast',

  // Community
  'community.title': 'Live Community',
  'community.activeFasters': 'Active Fasters',

  // Leaderboard
  'leaderboard.title': 'Top Fasters',
  'leaderboard.loading': 'Loading leaderboard...',

  // Dashboard
  'dashboard.myJourney': 'My Journey',
  'dashboard.totalFasts': 'Total Fasts',

  // Auth
  'auth.signIn': 'Sign In',
  'auth.signUp': 'Sign Up',

  // Common
  'common.loading': 'Loading...',
  'common.save': 'Save',
}
```

---

## ✅ Already Translated Components

1. ✅ **Leaderboard** - Fully translated (title, subtitle, button)

---

## 🔜 TODO: Components to Translate

### High Priority (User-facing)
- [ ] **Timer Controls** - Start/Stop/Cancel buttons
- [ ] **Navigation** - Menu items
- [ ] **Community Page** - Headers, descriptions
- [ ] **Dashboard** - Stats labels
- [ ] **Login Modal** - Auth prompts

### Medium Priority
- [ ] **Fasting Levels** - Level names (Novice, Warrior, etc.)
- [ ] **Body Modes** - Mode names (Ketosis, Autophagy, etc.)
- [ ] **Time Display** - Units (hours, minutes, days)

### Low Priority
- [ ] **About Page** - Content
- [ ] **Support Page** - Content
- [ ] **Error Messages** - Validation texts

---

## 🎨 Best Practices

### 1. Use Descriptive Keys
```javascript
// ✅ Good
'timer.startFast': 'Fasten starten'

// ❌ Bad
'btn1': 'Fasten starten'
```

### 2. Group Related Keys
```javascript
// ✅ Good - Grouped by feature
'timer.start': 'Start'
'timer.stop': 'Stop'
'timer.cancel': 'Cancel'

// ❌ Bad - Mixed
'start': 'Start'
'stopTimer': 'Stop'
'cancelBtn': 'Cancel'
```

### 3. Keep Keys Hierarchical
```javascript
// ✅ Good - Clear hierarchy
'dashboard.stats.totalFasts': 'Total Fasts'
'dashboard.stats.currentStreak': 'Current Streak'

// ❌ Bad - Flat
'dashboardTotalFasts': 'Total Fasts'
'dashboardStreak': 'Current Streak'
```

### 4. Provide Context in Comments
```javascript
de: {
  // User sees this when timer completes
  'timer.wellDone': 'Gut gemacht!',

  // Button to extend fast beyond goal
  'timer.continueFasting': 'Weiter fasten',
}
```

---

## 🔧 Technical Details

### Language Detection Priority

1. **localStorage** (`if-timer-language`) - User preference (highest priority)
2. **Browser language** (`navigator.language`) - Auto-detected
3. **Fallback** - English (`en`) if nothing matches

### Supported Formats

Browser language → Detected language:
- `de` → `de` ✅
- `de-DE` → `de` ✅
- `de-AT` → `de` ✅
- `de-CH` → `de` ✅
- `en` → `en` ✅
- `en-US` → `en` ✅
- `en-GB` → `en` ✅
- `fr` → `en` (fallback)
- `es` → `en` (fallback)

### Missing Translation Handling

If a translation key is missing:
1. **Console warning** logged: `Translation missing: de.myKey`
2. **Fallback to English** version
3. **If English also missing:** Returns the key itself

Example:
```javascript
t('nonExistent.key')  // Console: ⚠️ Translation missing: de.nonExistent.key
                      // Returns: 'Start Fast' (English fallback)
```

---

## 🌐 Future Enhancements (Optional)

### Add More Languages

Edit `src/contexts/LanguageContext.jsx`:

```javascript
function detectBrowserLanguage() {
  // ...

  // Support Spanish
  if (langCode === 'es') return 'es';

  // Support French
  if (langCode === 'fr') return 'fr';

  // Fallback
  return 'en';
}
```

Then add translations in `translations.js`:

```javascript
export const translations = {
  de: { /* German */ },
  en: { /* English */ },
  es: { /* Spanish */ },  // New!
  fr: { /* French */ },   // New!
};
```

### Language Switcher UI

Create a dropdown or toggle button:

```jsx
function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
      <option value="de">🇩🇪 Deutsch</option>
      <option value="en">🇬🇧 English</option>
    </select>
  );
}
```

### Date/Time Formatting

For locale-specific date formatting:

```javascript
const { language } = useLanguage();

// Format dates based on language
const formattedDate = new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US');
```

---

## 📊 Example: Full Component Translation

**Before (Hard-coded English):**

```jsx
function TimerControls({ onStart, onStop }) {
  return (
    <div>
      <h2>Timer Controls</h2>
      <button onClick={onStart}>Start Fast</button>
      <button onClick={onStop}>Stop Fast</button>
      <p>Loading...</p>
    </div>
  );
}
```

**After (Translated):**

```jsx
import { useTranslation } from '../hooks/useTranslation';

function TimerControls({ onStart, onStop }) {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('timer.controls')}</h2>
      <button onClick={onStart}>{t('timer.startFast')}</button>
      <button onClick={onStop}>{t('timer.stopFast')}</button>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

**Translation Keys:**

```javascript
// translations.js
de: {
  'timer.controls': 'Timer-Steuerung',
  'timer.startFast': 'Fasten starten',
  'timer.stopFast': 'Fasten beenden',
  'common.loading': 'Lädt...',
},
en: {
  'timer.controls': 'Timer Controls',
  'timer.startFast': 'Start Fast',
  'timer.stopFast': 'Stop Fast',
  'common.loading': 'Loading...',
}
```

---

## ✅ Summary

**What's Working:**
- ✅ Automatic browser language detection
- ✅ German + English support
- ✅ Persistent language preference (localStorage)
- ✅ Simple hook-based API (`useTranslation()`)
- ✅ Leaderboard component fully translated

**How to Use:**
1. Import `useTranslation()` hook
2. Call `t('key')` for any text
3. Add new keys to `translations.js`

**Next Steps:**
- Translate more components (Navigation, Timer, Dashboard)
- Optional: Add language switcher UI
- Optional: Add more languages (Spanish, French, etc.)

---

**Last Updated:** 2025-11-28
**Status:** Production Ready
**Maintainer:** Language system fully functional, ready to translate more components
