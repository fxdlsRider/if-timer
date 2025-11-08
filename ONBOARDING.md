# 🚀 IF Timer - Quick Start für neue Claude Sessions

**Last Updated:** 2025-11-08 (Session 8)
**Current Branch:** `claude/review-project-docs-011CUs3HjCq58gct9Tb5vDFu`
**Project Progress:** ~86% Complete

---

## ⚡ Start Here (60 Seconds)

### 1. Git Status checken
```bash
cd /home/user/if-timer
git status
git branch
```

### 2. PFLICHTLEKTÜRE (in dieser Reihenfolge!)
1. **`docs/conventions.md`** ← CODING STANDARDS (MANDATORY!)
2. **`docs/progress.md`** ← Aktueller Stand (Session 1-8)
3. **`docs/vision-alignment.md`** ← Product Vision

### 3. Projekt starten
```bash
npm install  # Falls noch nicht gemacht
npm start    # Dev-Server auf http://localhost:3000
```

---

## 📊 Aktueller Projekt-Status

### ✅ Was ist fertig (Phase 1 - 75%)

**Architektur & Code-Qualität:**
- ✅ Monolithic 1,624 Zeilen → 15 fokussierte Module refactored
- ✅ 3 Custom Hooks (useTimerState, useTimerStorage, useDragHandle)
- ✅ 5 UI Components (TimerCircle, CelebrationScreen, LoginModal, StatusPanel, TopBar)
- ✅ 2 Utils (timeCalculations, celebrationContent)
- ✅ 3 Services (audioService, notificationService, supabaseClient)
- ✅ 1 Config (constants.js - Single Source of Truth)
- ✅ Alle Dateien < 300 Zeilen (conventions.md compliant)

**Features:**
- ✅ Core Timer (14-48h Intervall)
- ✅ Drag & Drop Interface
- ✅ Supabase Auth (Magic Link)
- ✅ Cloud Sync + Realtime
- ✅ Dark/Light Theme
- ✅ Extended Mode (nach Ziel weiterfasten)
- ✅ Celebration Screens
- ✅ Browser Notifications
- ✅ Audio Feedback
- ✅ 6 Fasting Levels
- ✅ 5 Body Modes
- ✅ TEST_MODE (seconds statt hours)
- ✅ localStorage Fallback

**Bug Fixes (Sessions 5-8):**
- ✅ Session 5: 10 UI-Bugs behoben (Gradients, Buttons, Dark Theme, etc.)
- ✅ Session 6: Layout-Shift debugging (Root Cause: StatusPanel height)
- ✅ Session 7: iPad Layout + Notification Banner Persistence
- ✅ **Session 8: Extended Mode Progress Circle (bleibt jetzt bei 100%!)**

### 🔨 Was fehlt noch (Phase 2-4 - 14%)

**Phase 2 - Critical Features:**
- [ ] PWA Implementation (Background Timer)
- [ ] Service Worker (läuft auch wenn Tab geschlossen)
- [ ] Push Notifications
- [ ] Offline Support
- [ ] Install Prompt

**Phase 2.5 - UI Enhancements (+5%):**
- [ ] 3-Column Layout (Dashboard links, Timer mitte, Stats rechts)
- [ ] Premium Dashboard (Tacho-Style, Gauges)
- [ ] Social Live Feed (rechts)
- [ ] Motivational Quotes (Movies + Philosophen)

**Phase 3 - Premium Features:**
- [ ] Erweiterte Statistiken
- [ ] Achievements System
- [ ] Multi-Language (EN/DE/SR)
- [ ] Stripe Integration ($4.99/mo)

**Phase 4 - Polish:**
- [ ] Unit Tests (80%+ Coverage)
- [ ] Performance Optimization
- [ ] Accessibility (WCAG 2.1)
- [ ] SEO
- [ ] Deployment auf Vercel

---

## 🎯 Letzter Stand (Session 8)

### Was wurde in Session 8 gemacht:

**Bug-Fix: Extended Mode Progress Circle**

**Problem:**
- User erreicht 16h Ziel → Progress Circle 100% ✅
- User klickt "Extended" → Circle springt auf 0% ❌
- Erwartung: Circle soll bei 100% bleiben!

**Root Cause:**
1. `getProgress()` verwendete hardcoded `3600` statt `TIME_MULTIPLIER`
2. Im TEST_MODE: `16 * 3600 = 57,600` statt `16 * 1 = 16` → falsche Berechnung
3. Keine Bounds-Checking (negative Werte möglich)
4. Race Condition bei State-Transition (Normal → Extended)

**Fix:**
```javascript
// src/utils/timeCalculations.js - Line 50
export const getProgress = (totalHours, timeLeft, isExtended = false, timeMultiplier = 3600) => {
  if (isExtended) return 100;  // ✅ Sofort 100% in Extended Mode

  const totalSeconds = totalHours * timeMultiplier;  // ✅ Dynamischer Multiplier
  const elapsed = totalSeconds - timeLeft;
  const progress = (elapsed / totalSeconds) * 100;

  return Math.max(0, Math.min(100, progress));  // ✅ Clipping 0-100%
}

// src/Timer.jsx - Line 129
const progress = isRunning && targetTime
  ? calculateProgress(hours, timeLeft, isExtended, TIME_MULTIPLIER)  // ✅ Multiplier übergeben
  : 0;
```

**Commits:**
- `54e5295` - fix: Keep progress circle at 100% in Extended Mode
- `91d101b` - docs: Add Session 8 summary - Extended Mode progress fix

**Status:** ✅ Committed & Pushed

---

## 🗂️ Wichtige Folder-Struktur (MANDATORY!)

**Aus `docs/conventions.md` - IMMER befolgen:**

```
if-timer/
├── src/
│   ├── components/         # UI Components (nur Presentation)
│   │   ├── Timer/         # TimerCircle.jsx, TimerPage.jsx
│   │   ├── Celebration/   # CelebrationScreen.jsx
│   │   ├── Auth/          # LoginModal.jsx
│   │   ├── Levels/        # StatusPanel.jsx
│   │   ├── Navigation/    # NavigationHeader.jsx
│   │   ├── Dashboard/     # DashboardPanel.jsx
│   │   ├── Stats/         # (noch leer)
│   │   ├── Learn/         # LearnPage.jsx
│   │   ├── Profile/       # ProfilePage.jsx
│   │   └── Shared/        # Wiederverwendbare UI-Elemente
│   ├── hooks/             # Custom React Hooks (Business Logic)
│   │   ├── useTimerState.js
│   │   ├── useTimerStorage.js
│   │   └── useDragHandle.js
│   ├── services/          # External API Wrappers
│   │   ├── audioService.js
│   │   ├── notificationService.js
│   │   └── supabaseClient.js
│   ├── utils/             # Pure Functions (kein React)
│   │   ├── timeCalculations.js
│   │   └── celebrationContent.js
│   ├── config/            # Constants & Configuration
│   │   └── constants.js
│   ├── contexts/          # React Context (Theme, Auth)
│   │   ├── ThemeContext.jsx
│   │   └── AuthContext.jsx
│   └── App.jsx
└── docs/
    ├── conventions.md     # ← LESEN!
    ├── progress.md        # ← Session History
    ├── vision-alignment.md
    ├── architecture.md
    └── COMPONENT_STRUCTURE.md
```

**WICHTIG:**
- Keine Business Logic in Components → Use Hooks!
- Keine Magic Numbers → Use constants.js!
- Keine Files > 300 Zeilen → Split!
- Imports in korrekter Reihenfolge (siehe conventions.md)

---

## 🚨 Kritische Regeln

### 1. IMMER conventions.md befolgen
- Folder-Struktur ist MANDATORY
- Code Style ist MANDATORY
- Separation of Concerns ist MANDATORY

### 2. IMMER progress.md updaten
- Nach jedem Feature
- Nach jedem Bug-Fix
- Nach jeder Session

### 3. TEST_MODE beachten
```javascript
// src/config/constants.js
export const TEST_MODE = {
  ENABLED: true,        // true = Sekunden, false = Stunden
  TIME_MULTIPLIER: 1,   // 1 = seconds, 3600 = hours
  TIME_UNIT: 'seconds'
};
```

### 4. Git Workflow
```bash
# Immer auf Feature-Branch arbeiten
git checkout -b claude/feature-name-SESSION_ID

# Commits mit klarer Message
git commit -m "feat: Add new feature"
git commit -m "fix: Fix bug xyz"
git commit -m "docs: Update documentation"

# Push mit -u flag
git push -u origin claude/feature-name-SESSION_ID
```

---

## 📝 Nächste Schritte (Priorität)

### Immediate (User wartet drauf):
1. **User Testing:** Extended Mode Fix validieren
2. **iPad Testing:** Layout + Notification Banner testen

### High Priority (Phase 2):
1. **PWA Setup:** Service Worker + Manifest
2. **Background Timer:** Läuft auch bei geschlossenem Tab
3. **3-Column Layout:** Dashboard links, Timer mitte, Stats rechts

### Medium Priority:
4. **Premium Dashboard:** Tacho-Style Gauges
5. **Social Feed:** Live Activity Stream
6. **Multi-Language:** EN/DE/SR

### Low Priority:
7. **Unit Tests:** 80%+ Coverage
8. **Performance:** Lighthouse Score 90+

---

## 🐛 Bekannte Issues

**KEINE AKTUELL!** 🎉

**Alle bekannten Bugs gefixt:**
- ✅ Extended Mode Progress Circle (Session 8)
- ✅ iPad Layout Centering (Session 7)
- ✅ Notification Banner Persistence (Session 7)
- ✅ Layout Shift beim Timer-Start (Session 6)
- ✅ 10 UI-Bugs (Session 5)

---

## 💡 Hilfreiche Commands

```bash
# Dev Server starten
npm start

# Build für Production
npm run build

# Tests (wenn implementiert)
npm test

# ESLint
npm run lint

# Git Status
git status && git log --oneline -5

# Branch wechseln
git checkout main
git checkout claude/review-project-docs-011CUs3HjCq58gct9Tb5vDFu
```

---

## 📚 Dokumentation

| Datei | Zweck | Wann lesen? |
|-------|-------|------------|
| `ONBOARDING.md` | Quick Start | Jede neue Session (DU BIST HIER!) |
| `docs/conventions.md` | Coding Standards | **PFLICHT - Jede Session!** |
| `docs/progress.md` | Session History | Bei Bedarf / nach Update |
| `docs/vision-alignment.md` | Product Vision | Bei neuen Features |
| `docs/architecture.md` | Tech Details | Bei Refactoring |
| `docs/COMPONENT_STRUCTURE.md` | Component Guide | Bei Component-Arbeit |

---

## 🎯 Deine erste Aufgabe

1. **Lies diese Datei** ✅ (Du bist hier!)
2. **Lies `docs/conventions.md`** ← WICHTIG!
3. **Lies `docs/progress.md`** (Session 8 Eintrag)
4. **Frag den User:** "Was soll ich als nächstes machen?"

---

## 🤝 User Preferences

- **Sprache:** Deutsch (aber Code-Kommentare auf Englisch)
- **Commit Messages:** Englisch (Conventional Commits)
- **Kommunikation:** Direkt, technisch, keine Emojis (außer in Docs)
- **Code Style:** Clean Code, Separation of Concerns
- **Testing:** Erst Features, dann Tests

---

**Viel Erfolg! Der Code ist sauber, dokumentiert und bereit für die nächsten Features.** 🚀

**Status:** Ready for Phase 2 (PWA + Premium Features)
