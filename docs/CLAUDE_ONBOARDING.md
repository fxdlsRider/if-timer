# Claude Code - Session Onboarding

**WICHTIG:** Lies dieses Dokument VOR jeder neuen Session!

---

## 🚀 Schnellstart

### 1. Repository-Status prüfen

```bash
cd /home/user/if-timer && git status && git branch
```

### 2. Pflichtlektüre (in dieser Reihenfolge)

1. **`docs/conventions.md`** - Coding Standards & Folder-Struktur
   - ⚠️ **KRITISCH:** Befolge IMMER die Folder-Struktur!
   - React Component Patterns
   - Naming Conventions
   - File Organization

2. **`docs/progress.md`** - Aktueller Entwicklungsstand
   - Was wurde bereits gemacht?
   - Letzte Session-Zusammenfassung
   - Offene Punkte

3. **`docs/vision-alignment.md`** - Projekt-Vision
   - Kernphilosophie
   - Design-Prinzipien
   - Langfristige Ziele

---

## 📊 Projekt-Status

### Aktueller Fortschritt: **75% (Phase 1 komplett)**

**Phase 1 - Core Features:** ✅ **ABGESCHLOSSEN**
- Timer mit Drag-to-Select
- Fasting Levels & Body States
- Supabase Authentication
- Timer Persistence (Cloud-Sync)
- Leaderboard (Real-time)
- Responsive Design (1200px Breakpoint)

**Phase 2 - Social & Gamification:** 🚧 **IN PLANUNG**
- Streaks & Achievements
- Community Features
- Advanced Analytics

---

## 🎨 Aktuelle Design-Entscheidungen

### StatusPanel (Rechte Seite)
- **Main Page (Timer NICHT läuft):** Zeigt nur **Fasting Levels**
- **Timer läuft:** Zeigt nur **Body States** mit farbigen Balken
- **Styling:** CSS Variables (keine hardcoded Farben)
- **Toggle-Verhalten:** Entweder Fasting Levels ODER Body States

### Body States Colored Bars
- Digesting: Blau `#74b9ff`
- Getting ready: Gelb `#ffeaa7`
- Fat burning: Grün `#00b894`
- Cell renewal: Orange-Gelb `#fdcb6e`
- Deep healing: Lila `#a29bfe`

### Leaderboard (Linke Seite)
- Altes Design mit CSS Variables
- Gradient für Top 3 (Gold/Orange)
- Anonymisierte Usernames

### Responsive Layout
- **Desktop (>1200px):** 3-Spalten Grid
- **Tablet/Mobile (<1200px):** Single Column Stack

---

## 🏗️ Architektur-Übersicht

### Folder-Struktur (STRIKTE EINHALTUNG!)

```
src/
├── components/
│   ├── Auth/           # Login, Registration
│   ├── Celebration/    # Fast completion screens
│   ├── Dashboard/      # User dashboard
│   ├── Leaderboard/    # Real-time leaderboard
│   ├── Learn/          # Educational content
│   ├── Levels/         # Fasting levels & body states
│   ├── Navigation/     # Header, tabs
│   ├── Profile/        # User profile
│   ├── Stats/          # Statistics & analytics
│   └── Timer/          # Core timer components
├── config/
│   └── constants.js    # All constants (SINGLE SOURCE OF TRUTH)
├── hooks/
│   ├── useDragHandle.js
│   ├── useTimerState.js
│   └── useTimerStorage.js
├── services/
│   ├── leaderboardService.js
│   ├── statsService.js
│   └── timerService.js
├── utils/
│   ├── audioUtils.js
│   ├── notificationUtils.js
│   └── timeCalculations.js
├── Timer.jsx           # Main app component
├── AuthContext.jsx     # Auth state management
└── supabaseClient.js   # Supabase config
```

### Wichtige Dateien

- **`src/config/constants.js`**: ALLE Magic Numbers, Konfigurationswerte
- **`src/Timer.jsx`**: Root Component, Navigation
- **`src/components/Timer/TimerPage.jsx`**: Main Timer Page Layout
- **`src/components/Levels/StatusPanel.jsx`**: Fasting Levels / Body States Toggle

---

## 🔧 Technologie-Stack

- **Frontend:** React 18 (Functional Components, Hooks)
- **Styling:** Tailwind CSS + Inline Styles + CSS Variables
  - ⚠️ **WICHTIG:** Tailwind wird für Utility-Classes verwendet (z.B. Layout, Spacing)
  - Inline Styles für komponentenspezifisches Styling
  - CSS Variables für Theme-Konsistenz
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Magic Link)
- **Deployment:** Vercel
- **State Management:** React Context + Custom Hooks

---

## 📝 Wichtige Conventions

### React Patterns
- ✅ Functional Components (KEINE Class Components)
- ✅ Custom Hooks für Logic Extraction
- ✅ Props Destructuring
- ✅ Inline Styles mit CSS Variables

### Naming
- Components: PascalCase (`TimerPage.jsx`)
- Hooks: camelCase mit "use" Prefix (`useTimerState.js`)
- Services: camelCase mit "Service" Suffix (`leaderboardService.js`)
- Utils: camelCase (`timeCalculations.js`)

### Code Style
- Kommentare in Deutsch ODER Englisch (konsistent halten)
- JSDoc für komplexe Funktionen
- Keine TODO-Kommentare ohne Kontext

---

## 🚫 Was NICHT zu tun ist

1. ❌ **NIEMALS** hardcoded Farben (außer Body States Colored Bars)
2. ❌ **KEINE** Class Components erstellen
3. ❌ **KEINE** neue Folder-Struktur erfinden
4. ❌ **KEINE** direkten Pushes auf `main` (nur via PR)
5. ❌ **KEINE** Magic Numbers (immer in `constants.js`)

---

## ✅ Was ZU tun ist

1. ✅ **IMMER** CSS Variables verwenden
2. ✅ **IMMER** Folder-Struktur aus `conventions.md` befolgen
3. ✅ **IMMER** `progress.md` nach jeder Session updaten
4. ✅ **IMMER** ESLint-Warnings fixen
5. ✅ **IMMER** Code auf Vercel testen nach Merge

---

## 🔄 Git Workflow

### Branch-Naming
```
claude/<beschreibung>-<session-id>
```
Beispiel: `claude/fix-eslint-011CUvZLrBrtsoSUJL39uoF6`

### Commit Messages
```
<type>: <description>

Types:
- feat:     Neue Features
- fix:      Bug Fixes
- docs:     Dokumentation
- style:    Styling/Design
- refactor: Code Refactoring
- test:     Tests
- chore:    Maintenance
```

### Push Workflow
1. Branch erstellen: `git checkout -b claude/<name>-<session-id>`
2. Änderungen committen: `git commit -m "feat: description"`
3. Pushen: `git push -u origin claude/<name>-<session-id>`
4. PR auf GitHub erstellen und mergen
5. Lokalen main updaten: `git checkout main && git pull origin main`

**WICHTIG:** Direkter Push auf `main` ist BLOCKIERT (403 Fehler wegen Branch Protection)

---

## 🎯 Nächste Schritte (Phase 2)

### Geplante Features
- **Streaks System:** Track consecutive fasting days
- **Achievements:** Unlock badges for milestones
- **Social Feed:** Share fasting progress
- **Advanced Analytics:** Trends, insights, predictions

### Offene Punkte aus Phase 1
- Performance-Optimierungen
- Unit Tests für Core Logic
- E2E Tests mit Cypress

---

## 📚 Weitere Dokumentation

- **`docs/architecture.md`**: Detaillierte Architektur
- **`docs/database.md`**: Supabase Schema & Queries
- **`docs/deployment.md`**: Deployment-Prozess
- **`docs/COMPONENT_STRUCTURE.md`**: Component-Hierarchie

---

## 🆘 Hilfe & Troubleshooting

### ESLint Errors
- Immer sofort fixen
- Keine ungenutzten Variablen/Imports

### Vercel Build Fails
- Prüfe ESLint Warnings
- Prüfe TypeScript Errors (falls aktiviert)
- Checke Deployment Logs

### Git Push Fails (403)
- Nutze `claude/` Branch + PR
- NIEMALS direkt auf `main` pushen

---

**Letzte Aktualisierung:** 2025-11-09 (Session 9.2)
**Status:** Phase 1 komplett ✅
