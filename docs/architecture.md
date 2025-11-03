# IF Timer - Architektur Dokumentation

**Version:** 1.0
**Datum:** 2025-10-29
**Status:** Foundation Phase

---

## 📋 Inhaltsverzeichnis

1. [IST-Architektur](#ist-architektur)
2. [SOLL-Architektur](#soll-architektur)
3. [Refactoring-Strategie](#refactoring-strategie)
4. [Migration Path](#migration-path)
5. [Design Patterns](#design-patterns)

---

## 🏗️ IST-Architektur

### Aktuelle Struktur

```
src/
├── App.jsx                          # Entry Point
├── IFTimerFinal.jsx                 # 🔴 MONOLITH (1,624 Zeilen)
├── IFTimerWithThemeWrapper.jsx      # Theme Wrapper
├── AuthContext.jsx                  # Auth State Management
├── ThemeContext.jsx                 # Theme State Management
├── themeConfig.js                   # Theme Colors
├── supabaseClient.js                # Supabase Init
└── index.js                         # React Root
```

### Problem: Monolithische Komponente

**`IFTimerFinal.jsx` enthält ALLES:**

```jsx
// State Management (15+ useState)
const [hours, setHours] = useState(16);
const [isRunning, setIsRunning] = useState(false);
const [targetTime, setTargetTime] = useState(null);
// ... 12 weitere states

// Business Logic
const getTimeLeft = () => { ... }
const getProgress = () => { ... }
const getFastingLevel = () => { ... }

// Side Effects (10+ useEffect)
useEffect(() => { /* Update time */ }, []);
useEffect(() => { /* Notifications */ }, []);
useEffect(() => { /* LocalStorage */ }, []);
// ... 7 weitere effects

// Event Handlers
const handlePointerDown = () => { ... }
const startTimer = () => { ... }
const cancelTimer = () => { ... }

// UI Components
return (
  <div>
    {/* Timer Circle */}
    {/* Celebration Screen */}
    {/* Login Modal */}
    {/* Controls */}
  </div>
);
```

### Probleme

❌ **Single Responsibility Principle verletzt**
❌ **Keine Testbarkeit** (Business Logic in UI)
❌ **Keine Wiederverwendbarkeit**
❌ **Schwer zu warten** (1,624 Zeilen)
❌ **Tight Coupling** (alles hängt zusammen)

---

## 🎯 SOLL-Architektur

### Ziel: Clean Architecture mit Layer Separation

```
src/
├── 📁 business-logic/               # Layer 1: Domain Logic
│   ├── hooks/                       # Custom Hooks
│   │   ├── useTimer.js              # Timer State & Logic
│   │   ├── useFastingLevel.js       # Level Calculations
│   │   ├── useBodyMode.js           # Body Mode Logic
│   │   ├── useTimerSync.js          # Supabase Sync
│   │   ├── useNotifications.js      # Browser Notifications
│   │   ├── useAudioPlayer.js        # Sound Effects
│   │   └── useDragHandle.js         # Drag & Drop Logic
│   │
│   ├── utils/                       # Pure Functions
│   │   ├── timeCalculations.js      # formatTime, getTimeLeft, etc.
│   │   ├── fastingLevels.js         # Level definitions & mapping
│   │   ├── celebrationContent.js    # Celebration messages
│   │   └── angleCalculations.js     # Circle math
│   │
│   └── services/                    # External Services
│       ├── supabaseService.js       # DB Operations
│       ├── storageService.js        # LocalStorage Abstraction
│       ├── notificationService.js   # Notification API
│       └── audioService.js          # Web Audio API
│
├── 📁 components/                   # Layer 2: Presentation
│   ├── Timer/
│   │   ├── Timer.jsx                # Container Component
│   │   ├── TimerCircle.jsx          # Circle + Progress
│   │   ├── TimerDisplay.jsx         # Hours/Countdown Display
│   │   ├── TimerControls.jsx        # Start/Stop Buttons
│   │   └── DragHandle.jsx           # Draggable Handle
│   │
│   ├── Celebration/
│   │   ├── CelebrationScreen.jsx    # Fullscreen Overlay
│   │   ├── CelebrationCard.jsx      # Content Card
│   │   └── CelebrationActions.jsx   # Action Buttons
│   │
│   ├── Info/
│   │   ├── InfoPanel.jsx            # Levels/Modes Panel
│   │   ├── FastingLevelList.jsx     # Levels Display
│   │   └── BodyModeList.jsx         # Body Modes Display
│   │
│   ├── Auth/
│   │   ├── LoginModal.jsx           # Login Dialog
│   │   ├── LoginForm.jsx            # Email Form
│   │   └── LoginSuccess.jsx         # Success Screen
│   │
│   └── Shared/                      # Reusable Components
│       ├── Button.jsx               # Styled Button
│       ├── Modal.jsx                # Modal Wrapper
│       ├── Banner.jsx               # Notification Banner
│       └── Icon.jsx                 # Icon Component
│
├── 📁 contexts/                     # Layer 3: Global State
│   ├── AuthContext.jsx              # ✅ Bereits vorhanden
│   ├── ThemeContext.jsx             # ✅ Bereits vorhanden
│   └── TimerContext.jsx             # Optional: Global Timer State
│
├── 📁 styles/                       # Layer 4: Design System
│   ├── theme.js                     # Colors, Spacing, Typography
│   ├── animations.js                # Keyframes & Transitions
│   └── constants.js                 # Magic Numbers
│
├── 📁 config/
│   ├── constants.js                 # App-wide Constants
│   └── featureFlags.js              # Feature Toggles
│
└── App.jsx                          # Root Component
```

---

## 🔄 Refactoring-Strategie

### Prinzipien

1. **Incremental Refactoring** - Schritt für Schritt, nicht alles auf einmal
2. **Keep it working** - App muss während Refactoring funktionieren
3. **Test as you go** - Jeden extrahierten Teil testen
4. **Document changes** - Progress log führen

### Strategie: Strangler Fig Pattern

> Neue Architektur wächst neben der alten, bis alte ersetzt werden kann

```
Phase 1: Extract Business Logic
IFTimerFinal.jsx  →  useTimer.js
                  →  useTimerSync.js
                  →  useNotifications.js

Phase 2: Extract UI Components
IFTimerFinal.jsx  →  TimerCircle.jsx
                  →  CelebrationScreen.jsx
                  →  LoginModal.jsx

Phase 3: Compose New Structure
Timer.jsx (Container)
  ├── TimerCircle (useTimer)
  ├── TimerControls
  └── InfoPanel
```

---

## 🛣️ Migration Path

### Phase 1: Foundation (1-2 Tage)

#### Step 1.1: Utils extrahieren
```javascript
// utils/timeCalculations.js
export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const getTimeLeft = (targetTime, currentTime, isExtended, originalGoalTime) => {
  // ... logic from IFTimerFinal
};
```

#### Step 1.2: Konstanten extrahieren
```javascript
// styles/constants.js
export const TIMER_CONSTANTS = {
  MIN_HOURS: 14,
  MAX_HOURS: 48,
  HOUR_RANGE: 34,
  CIRCLE_RADIUS: 120,
  HANDLE_RADIUS: 114
};

export const FASTING_LEVELS = [
  { range: '14-16h', label: 'Gentle', startHour: 14 },
  { range: '16-18h', label: 'Classic', startHour: 16 },
  // ...
];
```

#### Step 1.3: Services extrahieren
```javascript
// services/notificationService.js
export const requestPermission = async () => {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showNotification = (title, body) => {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
};
```

### Phase 2: Business Logic Hooks (3-4 Tage)

#### Step 2.1: useTimer Hook
```javascript
// business-logic/hooks/useTimer.js
export const useTimer = (initialHours = 16) => {
  const [hours, setHours] = useState(initialHours);
  const [isRunning, setIsRunning] = useState(false);
  const [targetTime, setTargetTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeLeft = getTimeLeft(targetTime, currentTime);
  const progress = getProgress(hours, timeLeft);

  const start = () => { /* ... */ };
  const cancel = () => { /* ... */ };

  return {
    hours,
    setHours,
    isRunning,
    timeLeft,
    progress,
    start,
    cancel
  };
};
```

#### Step 2.2: useTimerSync Hook
```javascript
// business-logic/hooks/useTimerSync.js
export const useTimerSync = (user, timerState) => {
  const [syncing, setSyncing] = useState(false);

  // Load from Supabase
  useEffect(() => {
    if (!user) return;
    loadFromSupabase();
  }, [user]);

  // Save to Supabase
  useEffect(() => {
    if (!user) return;
    saveToSupabase(timerState);
  }, [timerState]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = subscribeToChanges();
    return () => channel.unsubscribe();
  }, [user]);

  return { syncing };
};
```

#### Step 2.3: useFastingLevel Hook
```javascript
// business-logic/hooks/useFastingLevel.js
export const useFastingLevel = (hours) => {
  const level = getFastingLevel(hours);
  const levelInfo = FASTING_LEVELS[level];

  return {
    level,
    levelInfo,
    celebrationContent: getCelebrationContent(hours)
  };
};
```

### Phase 3: UI Components (4-5 Tage)

#### Step 3.1: TimerCircle Component
```javascript
// components/Timer/TimerCircle.jsx
export const TimerCircle = ({
  hours,
  isRunning,
  progress,
  angle,
  onDrag
}) => {
  return (
    <div className="circle-container">
      <svg>{/* Circle SVG */}</svg>
      <DragHandle angle={angle} onDrag={onDrag} />
      {isRunning ? (
        <CountdownDisplay time={timeLeft} />
      ) : (
        <HoursDisplay hours={hours} />
      )}
    </div>
  );
};
```

#### Step 3.2: Timer Container
```javascript
// components/Timer/Timer.jsx
export const Timer = () => {
  const { user } = useAuth();
  const timer = useTimer();
  const { syncing } = useTimerSync(user, timer);
  const { levelInfo } = useFastingLevel(timer.hours);
  const dragHandle = useDragHandle(timer.hours, timer.setHours);

  return (
    <div>
      <TimerCircle
        {...timer}
        {...dragHandle}
      />
      <TimerControls
        isRunning={timer.isRunning}
        onStart={timer.start}
        onCancel={timer.cancel}
      />
      <InfoPanel levelInfo={levelInfo} />
    </div>
  );
};
```

### Phase 4: Tests & Polish (2-3 Tage)

- Unit Tests für Utils
- Hook Tests
- Component Tests
- Integration Tests
- Performance Optimierung
- Accessibility Audit

---

## 🎨 Design Patterns

### 1. Custom Hooks Pattern
**Wann:** Business Logic extrahieren
**Warum:** Reusability, Testability, Separation of Concerns

### 2. Container/Presentation Pattern
**Wann:** UI Components aufteilen
**Warum:** Logic vs. Presentation Separation

### 3. Service Layer Pattern
**Wann:** External APIs abstrahieren
**Warum:** Loose Coupling, Testability, Swappable

### 4. Compound Components Pattern
**Wann:** Flexible Component APIs
**Beispiel:** Timer.Circle, Timer.Display, Timer.Controls

### 5. Context + Hooks Pattern
**Wann:** Global State Management
**Aktuell:** AuthContext, ThemeContext

---

## 📊 Vorher/Nachher Vergleich

### Vorher
```jsx
// IFTimerFinal.jsx - 1,624 Zeilen
export default function IFTimerFinal() {
  // 15+ useState
  // 10+ useEffect
  // 20+ functions
  // 1000+ Zeilen JSX
  // Inline styles
}
```

### Nachher
```jsx
// Timer.jsx - ~50 Zeilen
export const Timer = () => {
  const timer = useTimer();
  const sync = useTimerSync(user, timer);
  const level = useFastingLevel(timer.hours);

  return (
    <TimerContainer>
      <TimerCircle {...timer} />
      <TimerControls {...timer} />
      <InfoPanel level={level} />
    </TimerContainer>
  );
};

// + 20 kleine, fokussierte Komponenten
// + 7 wiederverwendbare Hooks
// + 5 testbare Services
```

---

## ✅ Success Metrics

- [ ] Durchschnittliche Dateigröße < 200 Zeilen
- [ ] Test Coverage > 80%
- [ ] Keine Komponente > 300 Zeilen
- [ ] Alle Utils haben Unit Tests
- [ ] Alle Hooks sind extrahiert
- [ ] Build Size < 500KB
- [ ] Lighthouse Score > 90

---

## 🔗 Abhängigkeiten

### Externe Dependencies (behalten)
- React 19.2.0
- Supabase 2.76.1
- Lucide Icons

### Potenzielle Additions
- `@testing-library/react` - Testing
- `@testing-library/hooks` - Hook Testing
- `vitest` - Modern Test Runner (optional)
- `tailwindcss` - Styling (optional)

---

## 📚 Referenzen

- [React Hooks Best Practices](https://react.dev/reference/react)
- [Clean Architecture by Robert Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [Container/Presentation Pattern](https://www.patterns.dev/posts/presentational-container-pattern/)
