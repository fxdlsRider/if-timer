# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IF-Timer is a React + Supabase intermittent fasting tracker with real-time multi-device sync. Built with Create React App, Tailwind CSS, and Supabase for authentication and data persistence.

## Essential Commands

### Development
```bash
npm start           # Start dev server on http://localhost:3000
npm test            # Run Jest tests (interactive watch mode)
npm run build       # Production build to build/ folder
```

### Server Management
```bash
lsof -ti:3000 | xargs kill    # Kill port 3000 if occupied
npm start                      # Restart server
```

### Database Testing
```bash
node check-active-timers.js      # Check active timers in DB
node check-db-status.js          # Database connection status
node test-cleanup-function.js    # Test ghost timer cleanup
```

## Critical Architecture Patterns

### State Management: Context Hierarchy

The app uses React Context exclusively (no Redux). Provider nesting order in `App.jsx`:
```
LanguageProvider → ThemeProvider → AuthProvider → IFTimerWithThemeWrapper → Timer
```

**Three Global Contexts:**
1. **LanguageContext** (`src/contexts/LanguageContext.jsx`) - i18n (German/English), persists to localStorage
2. **ThemeContext** (`src/ThemeContext.jsx`) - Dark/light mode via CSS variables on `<html>` element
3. **AuthContext** (`src/AuthContext.jsx`) - Supabase auth, auto-creates anonymous users, handles data migration on signup

### Timer State Machine: Three Hooks Pattern

The timer logic is split across THREE custom hooks that MUST be used together:

**1. `useTimerState(hours, user)` - State Machine Logic**
- Core timer state: `isRunning`, `timeLeft`, `targetTime`, `isExtended`
- Methods: `startTimer()`, `stopFasting()`, `cancelTimer()`, `restoreState()`
- **Critical:** Does NOT manage `hours` state internally (received from parent)
- **Extended Mode:** Auto-activates when timer reaches zero, timer keeps running to track extra time
- Location: `src/hooks/useTimerState.js`

**2. `useTimerStorage(user, timerState, onStateLoaded)` - Persistence Layer**
- Dual persistence: Supabase (logged-in users) + localStorage (anonymous users)
- Real-time sync via Supabase subscriptions for multi-device support
- **Page Visibility API:** Forces refresh when tab becomes visible (handles sleep/wake)
- Retry logic with exponential backoff (1s, 2s, 4s delays)
- Location: `src/hooks/useTimerStorage.js`

**3. `useDragHandle(circleRef, isRunning, angle, setAngle, ...)` - UI Interaction**
- Circular dial drag interaction (mouse + touch)
- Maps angle (0-360°) to hours (14-48h range)
- Location: `src/hooks/useDragHandle.js`

**Why This Pattern:**
- Parent component (`Timer.jsx`) manages `angle` and `hours` state
- Hooks receive these as parameters to prevent stale closure bugs
- Clear separation: state machine logic vs persistence vs UI interaction

### Services Layer: Database Abstraction

**MANDATORY RULE:** NO direct Supabase calls in components. Always use services.

**Key Services:**

**`fastsService.js`** - Fast (completed fasting) CRUD:
- `saveFast(userId, fastData)` - Saves with deduplication check (prevents duplicate `start_time`)
- `updateFast(userId, startTime, updates)` - Updates existing fast by start_time
- `getFasts(userId, limit)` - Get fast history
- `getLastFast(userId)` - Most recent fast
- `getStatistics(userId)` - Calculates total/longest/average/streak
- **Important:** Only saves fasts ≥14h OR completed goals (configurable via `MINIMUM_FAST_HOURS`)

**`profileService.js`** - User profile CRUD:
- `fetchProfile(userId)`, `upsertProfile(userId, data)`
- Stores nickname (fantasy names for anonymous users)

**`audioService.js`** - Sound effects on completion
**`notificationService.js`** - Browser notifications
**`leaderboardService.js`** - Community features
**`communityService.js`** - Live fasting community data

### Multi-Device Sync Architecture

**Real-time Sync Flow:**
```
Device A: User stops timer
  → forceSyncToSupabase() writes to timer_states table
  → Supabase emits realtime event
  → Device B: useTimerStorage subscription fires
  → onStateLoaded() callback triggers
  → useTimerState.restoreState() updates UI
```

**Page Visibility Handling:**
```
User switches tabs or device sleeps
  → Timer continues in background
  → On return: visibilitychange event
  → Force refresh from Supabase
  → UI syncs to latest state
```

**Ghost Timer Prevention (3-Layer Defense):**
1. **Layer 1:** Explicit `forceSyncToSupabase()` in `stopFasting()` and `cancelTimer()`
2. **Layer 2:** Retry logic with exponential backoff
3. **Layer 3:** Server-side cleanup function (see `DEPLOYMENT_LAYER3.md`)

### Timer State 3: "Time Since Last Fast" as Default

**State 3 Philosophy:** For logged-in users with fasting history, State 3 (completion state) is the HOME state, not a temporary screen.

**Behavior:**
- App load: Shows "Time Since Last Fast" if user has completed fasts
- After completion: Shows "Well Done" for 8 seconds, then transitions to "Time Since Last Fast"
- User interaction (drag handle/click level): Fades to hours display
- After 30s inactivity: Fades back to "Time Since Last Fast"
- Implementation: Display mode system (`'well-done'` | `'hours'` | `'time-since'`) with smooth 600ms fade transitions

**Key Files:**
- State detection: `src/hooks/useTimerStorage.js` (checks fast history on load)
- Display logic: `src/components/Timer/TimerCircle.jsx` (State 3 rendering, lines 608-782)
- Fade system: `src/Timer.jsx` (manages display mode transitions)

## Database Schema (Supabase)

### Table: `fasts` (Completed fasts)
```sql
- id: UUID (PK)
- user_id: UUID (FK to auth.users)
- start_time: TIMESTAMPTZ (NOT NULL)
- end_time: TIMESTAMPTZ (NOT NULL)
- original_goal: INTEGER (planned duration: 14-48)
- duration: NUMERIC(10,1) (actual duration)
- cancelled: BOOLEAN (stopped before goal?)
- unit: VARCHAR(10) ('hours' or 'seconds' - Test Mode support)
- created_at: TIMESTAMPTZ
```

**CRITICAL COLUMN NAMES:** Use `duration` (NOT ~~actual_hours~~), `original_goal` (NOT ~~goal_hours~~), `cancelled` (NOT ~~was_cancelled~~)

### Table: `timer_states` (One per user)
```sql
- user_id: UUID (PK)
- hours: INTEGER (selected fasting goal)
- angle: DECIMAL(5,2) (dial position)
- is_running: BOOLEAN
- target_time: TIMESTAMPTZ (when timer completes)
- is_extended: BOOLEAN (extended mode active?)
- original_goal_time: TIMESTAMPTZ (original goal for extended mode)
```

### Table: `profiles` (User profiles)
```sql
- user_id: UUID (PK)
- nickname: VARCHAR (fantasy name for anonymous users)
- name, age, height, weight, target_weight: Various
- goal: TEXT (user's fasting goal)
- struggle: TEXT (user's current struggle)
```

**RLS (Row Level Security):** All tables use optimized policies with `(select auth.uid()) = user_id` pattern (NOT direct `auth.uid()` calls - see `database/migrations/README_RLS_OPTIMIZATION.md`)

## Critical File Size Rule

**MANDATORY:** Max 300 lines per file. Current violations:

**TimerCircle.jsx** (806 lines) - MUST be refactored into:
1. `TimerPreRun.jsx` (~200 lines) - State 1: Idle/setup
2. `TimerRunning.jsx` (~200 lines) - State 2: Active timer
3. `TimerCompletion.jsx` (~200 lines) - State 3: Completion/time since
4. `TimerCircle.jsx` (~150 lines) - Container/orchestrator

See `TODO_NEXT_SESSION.md` for detailed refactoring plan. This is a known technical debt item.

## Test Mode Configuration

**Location:** `src/config/constants.js` lines 18-22

```javascript
export const TEST_MODE = {
  ENABLED: false,  // Set to true for fast testing
  TIME_MULTIPLIER: 1,
  TIME_UNIT: 'seconds',
};
```

**When `ENABLED: true`:**
- Timer uses seconds instead of hours (1 minute fast = 60 seconds instead of 3600 seconds)
- Test mode banner appears (70% smaller than normal)
- Database correctly stores `unit: 'seconds'`
- Statistics auto-convert seconds → hours for display
- Perfect for testing completion flows without waiting hours

**CRITICAL:** ALWAYS set `ENABLED: false` before `git push` to main!

## Configuration Constants

**Location:** `src/config/constants.js` - SINGLE source of truth for all magic numbers

Key constants:
- `MINIMUM_FAST_HOURS = 14` - Threshold for saving cancelled fasts
- `TIMER_CONSTANTS` - Min/max hours, angle ranges, intervals
- `FASTING_LEVELS` - 6 levels: Novice (14h), Disciple (18h), Champion (24h), Warrior (36h), Monk (42h), Sage (48h)
- `BODY_MODES` - 5 phases: Digesting → Getting Ready → Fat Burning → Cell Renewal → Deep Healing
- `CIRCLE_CONFIG` - SVG circle dimensions
- `AUDIO_CONFIG` - Completion melody frequencies

**NEVER use magic numbers in code.** Extract to constants.js.

## Folder Structure (MANDATORY)

```
src/
├── components/           # UI components ONLY (no business logic)
│   ├── Timer/           # Timer display components
│   ├── Dashboard/       # "My Journey" page
│   ├── Hub/             # Statistics & profile
│   ├── Stats/           # Analytics displays
│   ├── Leaderboard/     # Community rankings
│   ├── Profile/         # User profile editor
│   ├── Auth/            # Login modal
│   ├── Navigation/      # Top navigation
│   ├── Legal/           # Terms, Privacy pages
│   └── Shared/          # Reusable components (DateTimePicker, TopBar, etc.)
├── hooks/               # Custom React hooks (business logic)
├── services/            # Supabase abstractions (DB calls)
├── utils/               # Pure functions (timeCalculations.js)
├── contexts/            # React Context providers
├── config/              # constants.js, themeConfig.js
├── data/                # Static data (philosophyQuotes.js)
└── translations/        # i18n files (prepared, not yet implemented)
```

**Separation of Concerns:**
- Components: Presentation only, receive props, use hooks
- Hooks: State + business logic
- Services: External API calls (Supabase)
- Utils: Pure functions, no side effects
- Config: Constants, no computation

## Styling Standards

**Current Approach:** Tailwind CSS v3 + CSS Variables (backwards compatibility)

**For New Components:**
- Use Tailwind utility classes: `className="bg-accent-teal hover:bg-accent-teal/80 text-white px-4 py-2 rounded-lg"`
- Custom theme colors in `tailwind.config.js`: `accent-teal`, `text-secondary`, `background`, etc.
- Responsive: `className="grid grid-cols-1 lg:grid-cols-3 gap-4"`
- Dark mode: `className="bg-background dark:bg-gray-900"`

**For Existing Components:**
- Inline styles using CSS variables are OK: `style={{ color: 'var(--color-text)' }}`
- Migrate gradually when touching files
- CSS variables defined in `src/themeConfig.js`

**UI Card Layout System (3-column pattern):**
- Standard card: 300px wide × 650px tall
- Light gray background `#F8FAFC`, border `#E2E8F0`, 16px radius
- Used in: Hub, Learn, Modes, Community, Support pages
- Mobile: stacks vertically, Desktop: 3 columns

## Important Development Notes

### Code Style
- Functional components only (no class components)
- Destructure props: `function Timer({ hours, isRunning }) { ... }`
- Use early returns for conditionals
- JSDoc comments for all service functions
- Import order: External deps → Hooks → Services → Utils → Constants → Styles

### Environment Variables
```
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_ANON_KEY=...
```
- Development: `.env` file (in .gitignore)
- Production: Vercel dashboard

### Git Workflow
```bash
git commit -m "type: Short description

Detailed explanation...
- Point 1
- Point 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

### Documentation Files
- `docs/conventions.md` - **READ FIRST** - Coding standards, folder structure rules
- `docs/session-guide.md` - Quick reference, Test Mode location, DB schema
- `docs/progress.md` - Detailed session logs (update after significant work)
- `docs/architecture.md` - Deep architectural documentation
- `docs/database.md` - Database schema and queries
- `TODO_NEXT_SESSION.md` - Known issues and next steps

### Known Issues

1. **TimerCircle.jsx is 806 lines** (violates 300-line rule)
   - Needs refactoring into 4 separate components
   - See `TODO_NEXT_SESSION.md` for detailed plan
   - Do NOT make this file larger

2. **No test files exist yet**
   - Jest + React Testing Library configured (`setupTests.js`)
   - Infrastructure ready, tests need to be written

## Testing Best Practices

**When Testing:**
1. Enable Test Mode: `src/config/constants.js` → `ENABLED: true`
2. Test fasting flows in seconds instead of hours
3. Verify database writes with `node check-active-timers.js`
4. Check multi-device sync by opening multiple tabs
5. Test Page Visibility by switching tabs (should force refresh)
6. Before pushing: `ENABLED: false` + verify `npm start` has no errors

**Debugging Supabase Errors:**
- 400 Bad Request: Usually wrong column name (check `docs/database.md`)
- PGRST116: No rows found (not necessarily an error)
- RLS Policy Error: User not authenticated or `auth.uid()` not set

## Key Utilities

**`utils/timeCalculations.js`** - Pure time functions:
- `formatTime(seconds)` → "HH:MM:SS"
- `getTimeLeft(target, current, isExtended)` → seconds remaining (or elapsed in extended mode)
- `getProgress(hours, timeLeft)` → 0-100%
- `getFastingLevel(hours)` → 0-5 (Novice to Sage)
- `getBodyMode(hours, timeLeft)` → 0-4 (Digesting to Deep Healing)
- `hoursToAngle(hours)`, `angleToHours(angle)` → circular dial mapping (14-48h to 0-360°)

**`data/philosophyQuotes.js`** - 280 philosophy quotes:
- Marcus Aurelius, Seneca, Epictetus, Rumi, Buddha, Lao Tzu, etc.
- Used in Dashboard "Meditation" section
- Random quote on mount, consistent during session

## Critical Data Flows

**Flow: Anonymous to Logged-In User**
1. No user → Auto-create anonymous user (Supabase)
2. Timer state in localStorage
3. User signs in with email OTP
4. `AuthContext` detects auth state change
5. `useTimerStorage` migrates localStorage → Supabase
6. Real-time sync activates

**Flow: Extended Mode Activation**
1. Timer reaches 0 → Auto-activate extended mode
2. Set: `isExtended = true`, `originalGoalTime = targetTime`
3. `getTimeLeft()` returns elapsed time (instead of countdown)
4. `getBodyMode()` uses goal + elapsed (shows deeper healing phases)
5. Progress stays at 100%
6. User can "Stop Fasting" to complete

**Flow: State Restoration (Multi-Device)**
1. Page loads → `useTimerStorage` checks Supabase
2. If `is_running: true` → Restore active timer
3. If logged-in + has fasts → Check last fast → Set State 3
4. Call `onStateLoaded(dbState)` → `useTimerState.restoreState()`
5. UI updates to correct state

## Contact & Deployment

- **Contact:** contact@if-timer.app
- **Repository:** https://github.com/fxdlsRider/if-timer
- **Main Branch:** `main`
- **Deployment:** Vercel (auto-deploy from main)
- **Database:** Supabase (project ref: kadskpttrlbdzywhxcdj)

## Before Every Commit

- [ ] Test Mode disabled (`ENABLED: false`)
- [ ] No console errors in browser
- [ ] Timer starts/stops correctly
- [ ] Database writes verified (check Supabase dashboard or `node check-active-timers.js`)
- [ ] File under 300 lines (or documented exception)
- [ ] Services used for DB calls (no direct Supabase in components)
- [ ] Constants used (no magic numbers)
- [ ] Code follows conventions.md standards
