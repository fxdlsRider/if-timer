# Session Setup Guide für IF-Timer

**Zuletzt aktualisiert:** 2025-11-20
**Zweck:** Schneller Einstieg für neue Claude Code Sessions

---

## ⚡ ERSTE SCHRITTE - ZU BEGINN JEDER SESSION LESEN!

### Pflichtlektüre (in dieser Reihenfolge):

1. **`docs/conventions.md`** - Coding Standards!
   - ⚠️ **WICHTIG:** Folder-Struktur ist ZWINGEND einzuhalten!
   - Services für DB-Calls, keine direkten Supabase-Calls in Components
   - JSDoc Comments, Naming Conventions

2. **`docs/progress.md`** - Aktueller Stand
   - Letzte Session: Was wurde implementiert?
   - Bekannte Issues
   - Next Steps

3. **`docs/vision-alignment.md`** - Vision
   - Projekt-Ziele und Philosophie
   - Langfristige Roadmap

4. **`docs/session-guide.md`** - Diese Datei (Quick Reference)
   - Test Mode Location
   - Wichtige Dateipfade
   - Database Schema

**→ Diese 4 Dateien geben dir den kompletten Kontext!**

---

## 🔧 Test Mode Toggle (Wichtigste Info!)

### Location
**Datei:** `src/config/constants.js`
**Zeilen:** 18-22

```javascript
export const TEST_MODE = {
  ENABLED: false, // ← HIER ÄNDERN: true = Test Mode ON, false = Production
  TIME_MULTIPLIER: 1,
  TIME_UNIT: 'seconds',
};
```

### Aktivieren/Deaktivieren

**Test Mode EIN (für schnelles Testen):**
```javascript
ENABLED: true
```

**Test Mode AUS (für Production/Push):**
```javascript
ENABLED: false
```

### Was macht Test Mode?

- ✅ Timer läuft in **Sekunden** statt Stunden
  - 1 Minute Fast = 60 Sekunden (statt 1 Stunde = 3600 Sekunden)
  - Perfekt zum schnellen Testen von Fast Completion
- ✅ Test Mode Banner erscheint oben (klein, 70% reduziert)
- ✅ Datenbank speichert korrekt: `unit: 'seconds'`
- ✅ Statistiken rechnen automatisch um: Sekunden → Stunden
- ✅ Keine Code-Änderungen nötig, nur Toggle

**⚠️ WICHTIG:** Immer ausschalten vor `git push` zu main!

---

## 📂 Projekt-Struktur & Wichtige Dateien

### Timer System

**Timer States (3 Zustände):**
- **State 1 - Idle:** `src/components/Timer/TimerCircle.jsx:369-449`
  - Draggable Handle zum Einstellen der Fastenzeit
  - Fasting Level Buttons (14-48h)

- **State 2 - Running:** `src/components/Timer/TimerCircle.jsx:451-606`
  - Laufender Timer mit Live-Countdown
  - Pause/Stop Buttons
  - Fasting Info Panel (Start Time, Goal Time, Elapsed)

- **State 3 - Complete:** `src/components/Timer/TimerCircle.jsx:608-782`
  - **Dynamic Center Display (NEW 2025-11-24):**
    - Shows selected hours when dragging handle or clicking levels
    - Shows "Time since last fast" after 30 seconds of inactivity
    - Shows completion message (Cancelled/Well done) by default
  - Draggable Handle (50% transparent) für nächsten Fast
  - Editable start/end times with DateTimePicker
  - Hint text: "Set your next fast by dragging..."

**Timer Hook:**
- `src/hooks/useTimerState.js`
- Verwaltet gesamte Timer-Logik
- Zeile 75-98: `saveCompletedFast()` - Fast zu DB speichern
- Zeile 134-161: `startTimer()`
- Zeile 166-198: `cancelTimer()`

**Timer Page:**
- `src/Timer.jsx` - Main Timer Component
- `src/components/Timer/TimerPage.css` - Styles

### Fast Tracking System

**Service Layer:**
- `src/services/fastsService.js` (219 Zeilen)
  - `saveFast(userId, fastData)` - Fast speichern (mit Deduplication)
  - `getFasts(userId, limit)` - History laden
  - `getLastFast(userId)` - Letzter Fast
  - `getStatistics(userId)` - Stats berechnen
  - `calculateStreak(fasts)` - Streak-Logik
  - **Deduplication:** Prüft vor Insert ob Fast mit gleicher `start_time` existiert

**Integration:**
- Timer Hook ruft `saveFast()` auf bei:
  - Fast Completion (Zeile 256)
  - **WICHTIG:** Cancelled Fasts werden NICHT mehr gespeichert (conditional check)

### Dashboard & Hub

**Dashboard (My Journey):**
- `src/components/Dashboard/DashboardPanel.jsx`
- Zeile 38-41: `loadLastFast()` - Lädt letzten Fast
- **Layout (neue Struktur ab 2025-11-20):**
  1. My Goal (grünes dashed gradient box)
  2. Last Fast (completion status, date)
  3. Meditation (philosophy quotes - 280 Stück)
  4. My Struggle (blaues dashed gradient box)
- **Philosophy Quotes:** `src/data/philosophyQuotes.js` (280 quotes)
  - Marcus Aurelius, Seneca, Epictetus, Rumi, Buddha, Lao Tzu, etc.
  - Random quote on mount, stays consistent during session

**Hub (Statistiken & Profil):**
- `src/components/Hub/HubPage.jsx`
- Zeile 26-40: `loadStats()` - Lädt Statistiken
- 3-Column Layout: Profile | Statistics | Achievements

**Profile Card:**
- `src/components/Hub/ProfileCard.jsx`
- Editable Profile mit Supabase Integration
- **Felder:** Name, Nickname, Age, Height, Weight, Target Weight, Goal, Struggle
- **Compact Layout (ab 2025-11-20):** Reduzierte Gaps, Units inside fields
- **Textareas:** Goal & Struggle (multi-line, vertical layout)
- **Weight to Go:** Compact gradient card (horizontal layout)

### Services

**Profile Service:**
- `src/services/profileService.js`
- `fetchProfile(userId)` - Profil laden
- `upsertProfile(userId, data)` - Profil speichern

**Fasts Service:**
- `src/services/fastsService.js`
- Siehe oben unter "Fast Tracking System"

**Community Service:**
- `src/services/communityService.js`
- `getActiveFasters()` - Lädt aktive Faster von Supabase
- `getCommunityStats()` - Berechnet Community-Statistiken
- Queries: `timer_states` (is_running=true) + `profiles` (nicknames)

### Config & Constants

**Constants:**
- `src/config/constants.js`
- Test Mode Toggle (Zeile 18-22)
- **MINIMUM_FAST_HOURS** (Zeile 16) - 14h threshold for saving cancelled fasts
- Fasting Levels (Zeile 42-103)
- Body Modes (Zeile 107-143)
- Circle Config, Audio, etc.

### UI Standardization - Card Layout System

**Design Pattern (NEU ab 2025-11-19):**

Alle Hauptseiten verwenden jetzt ein einheitliches 3-Karten-Layout:

**Card Dimensions:**
```javascript
const cardStyle = {
  width: '300px',
  height: '650px',
  background: 'var(--color-background-secondary, #F8FAFC)',
  border: '1px solid var(--color-border, #E2E8F0)',
  borderRadius: '16px',
  padding: '40px',
  overflow: 'auto'
};
```

**Page Layout:**
```javascript
<div style={{ background: 'var(--color-background, #FFFFFF)' }}>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <Card1 /> <Card2 /> <Card3 />
  </div>
</div>
```

**Pages mit Card Layout:**

1. **Dashboard (Hub)** - `src/components/Hub/HubPage.jsx`
   - Profile Card | Statistics Card | Achievements Card
   - Alle 300x650px

2. **Learn** - `src/components/Training/TrainingPage.jsx`
   - The Foundation | Choose Your Method | Advanced Insights
   - IF-Education Content

3. **App-Modes** - `src/components/Modes/ModesPage.jsx`
   - Scientific Mode | Hippie Mode | Pro Mode
   - Theme Switcher in Hippie Mode Card

4. **Community** - `src/components/Community/CommunityPage.jsx`
   - Live Community | Fasting Levels | Active Fasters
   - Real Supabase data, auto-refresh every 30s
   - Service: `src/services/communityService.js`

5. **About** - `src/components/About/AboutPage.jsx`
   - Our Mission | Tech Stack | Get Involved
   - GitHub Link, Contact Info

6. **Support** - `src/components/Support/SupportPage.jsx`
   - Buy Me a Coffee | Affiliate Links | Merch Shop
   - Donation Button, Coming Soon items

**Color Scheme:**
- Page Background: White `#FFFFFF`
- Card Background: Light Gray `#F8FAFC`
- Borders: `#E2E8F0`
- Accent: Teal `#4ECDC4`

**⚠️ WICHTIG:** Alle neuen Pages sollten diesem Pattern folgen!

---

## 🗄️ Database Schema (Supabase)

### Tabelle: `fasts`

**Aktuelle Spalten:**
```sql
CREATE TABLE fasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  original_goal INTEGER NOT NULL,      -- Geplante Dauer (14-48)
  duration NUMERIC(10,1) NOT NULL,      -- Tatsächliche Dauer
  cancelled BOOLEAN DEFAULT false,      -- Abgebrochen?
  unit VARCHAR(10) DEFAULT 'hours',     -- 'hours' oder 'seconds'
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**⚠️ WICHTIG - Spalten-Namen:**

✅ **RICHTIG (aktuell):**
- `duration` (nicht ~~actual_hours~~)
- `original_goal` (nicht ~~goal_hours~~)
- `cancelled` (nicht ~~was_cancelled~~)
- `unit` (neu hinzugefügt)

❌ **FALSCH (alte Namen, NICHT verwenden!):**
- ~~actual_hours~~
- ~~goal_hours~~
- ~~was_cancelled~~

### Tabelle: `timer_states`

```sql
CREATE TABLE timer_states (
  user_id UUID PRIMARY KEY,
  hours INTEGER NOT NULL,
  angle DECIMAL(5,2) NOT NULL,
  is_running BOOLEAN NOT NULL,
  target_time TIMESTAMPTZ,
  is_extended BOOLEAN NOT NULL,
  original_goal_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

### Tabelle: `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR,
  nickname VARCHAR,
  age INTEGER,
  height NUMERIC,
  weight NUMERIC,
  target_weight NUMERIC,
  goal TEXT,
  struggle TEXT,                -- NEU: User's current struggle (ab 2025-11-20)
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Migration für `struggle` field:**
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS struggle TEXT;
```

**RLS Policies:** Alle Tabellen haben Row Level Security aktiviert.
- User kann nur eigene Daten sehen/bearbeiten
- Filter: `auth.uid() = user_id`

---

## 🎯 Aktueller Stand (Session 2025-11-24)

### ✅ Implementiert

**Fast Tracking System (komplett):**
- ✅ Fasts werden automatisch in DB gespeichert
- ✅ Hub zeigt echte Statistiken (Total Fasts, Streak, Hours, etc.)
- ✅ Dashboard zeigt Last Fast mit Datum + Status
- ✅ Test Mode funktioniert (Sekunden ↔ Stunden Konvertierung)
- ✅ Streak Calculation (consecutive days)
- ✅ Database Schema korrekt gemappt
- ✅ **DEDUPLICATION:** Multi-Device Race Condition gelöst (prüft start_time vor Insert)
- ✅ **14h MINIMUM THRESHOLD:** Fasts ≥14h werden gespeichert (auch bei Abbruch)
- ✅ **BUG FIX:** Extended Mode Progress Bar bleibt bei 100%

**Ghost Timer Prevention (3-Layer Defense):**
- ✅ **Layer 1:** Explicit forceSync() in stopFasting() + cancelTimer()
- ✅ **Layer 2:** Retry logic with exponential backoff (1s, 2s, 4s)
- ✅ **Layer 3:** Server-side SQL cleanup + Edge Function (5min cron)
- ✅ Successfully tested and deployed to production

**Database Performance (2025-11-24):**
- ✅ **RLS Optimization:** 41+ policies optimized (auth.uid() → (select auth.uid()))
- ✅ **Function Security:** Fixed mutable search_path warnings (3 functions)
- ✅ **Slow Queries:** Analyzed and determined non-critical

**My Journey Redesign (2025-11-20):**
- ✅ Philosophy Quotes (280 Stück) statt Movie Quotes
- ✅ Meditation Section mit zufälligen Philosophen-Zitaten
- ✅ My Goal (grünes gradient box, left-aligned)
- ✅ My Struggle (blaues gradient box, left-aligned)
- ✅ Last Fast mit Status und Datum
- ✅ Weight to Go entfernt (nur noch im Hub Profile Card)
- ✅ Stats entfernt (redundant, sind im Hub Dashboard)

**Profile Card Improvements (2025-11-20):**
- ✅ Struggle Field hinzugefügt (editable, textarea)
- ✅ Goal & Struggle als vertikale Textareas (multi-line)
- ✅ Units inside input fields (absolute positioning)
- ✅ Compact Layout (reduzierte Gaps: 12→8→6px)
- ✅ Weight to Go als kompakte gradient card (horizontal)

**UI Improvements:**
- ✅ **State 3 Dynamic Display (2025-11-24):**
  - User drags handle/clicks level → Center shows selected hours
  - After 30 seconds inactivity → Shows "Time since last fast"
  - Time calculation updates every minute
  - Interaction detection with timer reset logic
  - Files: Timer.jsx (state), TimerCircle.jsx (UI), useDragHandle.js (callbacks)
- ✅ Complete-State (State 3) hat draggable Handle (50% transparent)
- ✅ Dashboard: Statische Profildaten entfernt (sind im Hub)
- ✅ Dashboard Layout: Goal → Last Fast → Meditation → Struggle
- ✅ Kompaktere Abstände im Dashboard
- ✅ Test Mode Banner 70% kleiner
- ✅ Timer spacing optimized (60px margin-top)

**Database:**
- ✅ `fasts` Table mit korrekten Column Names
- ✅ `profiles` Table mit struggle field
- ✅ RLS Policies aktiv
- ✅ Unit-aware (hours/seconds)
- ✅ Migration Script: `supabase_add_struggle_field.sql`

### 🐛 Bekannte Issues

Aktuell keine kritischen Bugs.

### 📋 Next Steps (Priorität)

Aus `docs/progress.md`:

1. **Achievement System** basierend auf echten Daten
   - Badges für Milestones (First Fast, 7-Day Streak, etc.)
   - Unlock-Logik implementieren

2. **Fast History View/Timeline**
   - Chronologische Liste aller Fasts
   - Filter (completed/cancelled, date range)

3. **Export/Download Feature**
   - CSV/JSON Export der Fasting Data

4. **Fasting Level Detection**
   - Automatisch erkennen: Gentle, Classic, Intensive, etc.
   - Basierend auf `original_goal`

5. **Notes Field**
   - Optional: Notizen zu einzelnen Fasts
   - Schema-Migration: `ALTER TABLE fasts ADD COLUMN notes TEXT`

---

## 🚀 Development Workflow

### Server starten

```bash
npm start
```

**URL:** http://localhost:3000
**Port:** 3000

### Server läuft bereits?

```bash
# Stoppen
lsof -ti:3000 | xargs kill

# Neu starten
npm start
```

### Hot Reload

- Änderungen an `.jsx`, `.js`, `.css` → Auto-Reload
- Änderungen an `.env` → Server neu starten!

---

## 📝 Coding Standards (aus conventions.md)

### Folder Structure (ZWINGEND!)

```
src/
├── components/     # UI Components
│   ├── Timer/
│   ├── Dashboard/
│   ├── Hub/
│   └── Shared/
├── services/       # Business Logic (DB Calls, API)
├── hooks/          # Custom React Hooks
├── utils/          # Helper Functions
└── config/         # Constants, Config
```

**Regel:**
- ❌ KEINE direkten Supabase Calls in Components
- ✅ Immer über Services (z.B. `fastsService.js`)

### Styling

**Component-Spezifisch:**
```javascript
const styles = {
  container: {
    background: 'var(--color-background)',
    padding: '24px'
  }
};
```

**Layout & Utilities:**
```jsx
<div className="flex justify-between items-center gap-4">
```

**Globale Styles:**
- `src/index.css` - Theme Variables
- `src/components/Timer/TimerPage.css` - Page-Level

### JSDoc Comments

```javascript
/**
 * Save a completed fast to database
 * @param {string} userId - User ID
 * @param {object} fastData - Fast data
 * @returns {object|null} Saved fast or null
 */
export async function saveFast(userId, fastData) {
  // ...
}
```

### Sprachen

- UI: Englisch (vorbereitet für Multi-Language)
- Code/Comments: Englisch
- Commit Messages: Englisch

---

## 🔄 Git Workflow

### Commit Format

```bash
git add <files>

git commit -m "type: Short description

Detailed explanation of changes...
- Point 1
- Point 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Types:**
- `feat` - Neues Feature
- `fix` - Bug Fix
- `docs` - Dokumentation
- `refactor` - Code-Refactoring
- `test` - Tests
- `chore` - Maintenance

### Branch & Remote

- **Main Branch:** `main`
- **Remote:** `https://github.com/fxdlsRider/if-timer`

### Vor jedem Push

1. ✅ Test Mode ausschalten (`ENABLED: false`)
2. ✅ `npm start` → Keine Errors
3. ✅ Funktionalität testen
4. ✅ Commit mit aussagekräftiger Message
5. ✅ Push zu `main`

---

## 📖 Dokumentation

### Dateien

- **Progress Log:** `docs/progress.md`
  Detaillierte Session-Logs mit allen Änderungen

- **Database Docs:** `docs/database.md`
  Schema, Queries, Setup Instructions

- **Coding Standards:** `docs/conventions.md`
  Folder Structure, Naming, Best Practices

- **Vision:** `docs/vision-alignment.md`
  Projekt-Vision und Roadmap

- **Session Guide:** `docs/session-guide.md` ← Diese Datei!

### Vor jeder Session lesen

1. `docs/session-guide.md` (diese Datei)
2. `docs/progress.md` (letzter Eintrag)

---

## 💡 Schnell-Befehle für Sessions

### Test Mode ein/aus

**Einschalten:**
> "Schalte Test Mode ein"

→ Ich weiß: `src/config/constants.js:19` → `ENABLED: true`

**Ausschalten:**
> "Schalte Test Mode aus"

→ Ich weiß: `src/config/constants.js:19` → `ENABLED: false`

### Session Ende Workflow

> "Sichere und dokumentiere"

→ Ich führe aus:
1. Test Mode ausschalten (falls aktiviert)
2. Code testen (`npm start` checken)
3. **`docs/progress.md` updaten** (Session-Log hinzufügen)
4. **`docs/session-guide.md` updaten** (Current State aktualisieren)
5. `git add` (alle Änderungen stagen)
6. `git commit` (mit aussagekräftiger Message)
7. `git push origin main`

### Nur Code sichern (ohne Doku-Update)

> "Sichere und pushe zu main"

→ Ich führe aus:
1. `git status` (Check)
2. `git add` (Stage)
3. `git commit` (mit Format)
4. `git push origin main`

### Server Check

> "Läuft der Server?"

→ Ich checke: `lsof -ti:3000` oder schaue auf Background Bash

---

## 🔍 Debugging Cheatsheet

### Supabase Errors

**400 Bad Request:**
- Meist: Falscher Column Name
- Check: `docs/database.md` für aktuelle Schema

**PGRST116 Error:**
- Bedeutet: Keine Rows gefunden
- Nicht unbedingt ein Error (z.B. bei `getLastFast()` wenn noch kein Fast)

**RLS Policy Error:**
- User nicht eingeloggt oder `auth.uid()` nicht gesetzt
- Check: `user` prop wird korrekt durchgereicht

### Timer Issues

**Timer läuft nicht:**
- Check: `isRunning` State
- Check: `targetTime` gesetzt?
- Check: Test Mode richtig konfiguriert?

**Fast wird nicht gespeichert:**
- Check: User eingeloggt? (`user?.id`)
- Check: `saveCompletedFast()` wird aufgerufen?
- Console: Supabase Error Messages

---

## ✅ Session Checklist

### Session Start (PFLICHT!)

- [ ] **`docs/conventions.md`** lesen (Coding Standards + Folder-Struktur!)
- [ ] **`docs/progress.md`** lesen (letzter Eintrag = aktueller Stand)
- [ ] **`docs/vision-alignment.md`** lesen (Projekt-Vision)
- [ ] **`docs/session-guide.md`** lesen (Quick Reference = diese Datei)
- [ ] Server Status prüfen (`npm start` falls nötig)
- [ ] Test Mode Status checken (`src/config/constants.js:19`)

### Während der Session

- [ ] Coding Standards befolgen (conventions.md)
- [ ] Services für DB-Calls nutzen (nicht direkt in Components)
- [ ] JSDoc Comments schreiben
- [ ] Console Errors beachten

### Session Ende

**User sagt:** "Sichere und dokumentiere"

**Dann ausführen:**
- [ ] Test Mode ausschalten (falls aktiviert - `src/config/constants.js:19`)
- [ ] Code testen (keine Errors, `npm start` checken)
- [ ] **`docs/progress.md` updaten** - Chronologisches Log dieser Session
  - Was wurde implementiert?
  - Welche Commits?
  - Bekannte Issues?
  - Next Steps?
- [ ] **`docs/session-guide.md` updaten** - Current State Snapshot
  - "🎯 Aktueller Stand" Sektion aktualisieren
  - Bekannte Issues updaten
  - Next Steps anpassen
  - Status-Zeile am Ende updaten
  - Zeilen-Nummern prüfen (falls Code verschoben)
- [ ] Commit mit aussagekräftiger Message
- [ ] Push zu main (`git push origin main`)

---

**Letzte Aktualisierung:** 2025-11-24
**Status:** Test Mode OFF | State 3 Dynamic Display (30s inactivity timer) | Ghost Timer Prevention (3 Layers) | 14h Minimum Fast Threshold | RLS Performance Optimization (41+ policies)
