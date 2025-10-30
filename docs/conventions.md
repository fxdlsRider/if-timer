# IF Timer - Coding Conventions & Standards

**Last Updated:** 2025-10-30
**Purpose:** Define project standards for consistent development

---

## 📁 Folder Structure (MANDATORY)

**Follow industry-standard React project structure:**

```
if-timer/
├── public/                    # Static assets (HTML, icons, manifest)
├── src/
│   ├── components/            # UI Components (Presentation layer)
│   │   ├── Timer/
│   │   ├── Dashboard/
│   │   ├── Stats/
│   │   ├── Social/
│   │   └── Shared/
│   ├── hooks/                 # Custom React Hooks (Business logic)
│   ├── services/              # External API abstractions
│   ├── utils/                 # Pure functions, helpers
│   ├── contexts/              # React Context (Global state)
│   ├── config/                # Configuration & constants
│   ├── styles/                # CSS, design system
│   ├── locales/               # i18n translations (EN/DE/SR)
│   ├── assets/                # Media files
│   │   ├── images/
│   │   ├── fonts/
│   │   └── audio/
│   ├── types/                 # TypeScript types (if used)
│   └── App.jsx
├── database/                  # Database scripts
│   ├── migrations/
│   └── seeds/
└── docs/                      # Documentation
```

**References:**
- [Airbnb React Style Guide](https://github.com/airbnb/javascript/tree/master/react)
- [React Official Docs](https://react.dev/learn/thinking-in-react)

---

## 🎯 Separation of Concerns

### **1. Components (UI Only)**
- Presentation components
- No business logic
- Receive data via props
- Use hooks for state/logic

**Example:**
```jsx
// ✅ Good
function TimerCircle({ hours, progress, onDrag }) {
  return <svg>...</svg>;
}

// ❌ Bad - Business logic in component
function TimerCircle() {
  const progress = calculateProgress(...); // No! Use hook
  return <svg>...</svg>;
}
```

### **2. Hooks (Business Logic)**
- Custom React hooks
- Encapsulate state + logic
- Reusable across components

**Example:**
```jsx
// hooks/useTimer.js
export function useTimer(initialHours) {
  const [hours, setHours] = useState(initialHours);
  const [isRunning, setIsRunning] = useState(false);

  const start = () => { ... };
  const stop = () => { ... };

  return { hours, isRunning, start, stop };
}
```

### **3. Utils (Pure Functions)**
- No side effects
- No React dependencies
- Easily testable

**Example:**
```js
// utils/timeCalculations.js
export function formatTime(seconds) {
  // Pure function - same input = same output
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${m}:${s}`;
}
```

### **4. Services (External APIs)**
- Wrap external APIs
- Provide clean interface
- Mockable for testing

**Example:**
```js
// services/audioService.js
export function playSound() {
  // Web Audio API abstracted
  const context = getAudioContext();
  // ...
}
```

### **5. Config (Constants)**
- Single source of truth
- No magic numbers in code
- Centralized configuration

**Example:**
```js
// config/constants.js
export const TIMER_CONSTANTS = {
  MIN_HOURS: 14,
  MAX_HOURS: 48,
};
```

---

## 📝 File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `TimerCircle.jsx` |
| Hooks | camelCase, prefix `use` | `useTimer.js` |
| Utils | camelCase | `timeCalculations.js` |
| Services | camelCase, suffix `Service` | `audioService.js` |
| Constants | camelCase | `constants.js` |
| Contexts | PascalCase, suffix `Context` | `AuthContext.jsx` |

---

## 🎨 Code Style

### **1. Prefer Functional Components**
```jsx
// ✅ Good
function Timer() {
  return <div>Timer</div>;
}

// ❌ Bad (no class components)
class Timer extends React.Component {
  render() { return <div>Timer</div>; }
}
```

### **2. Destructure Props**
```jsx
// ✅ Good
function Timer({ hours, isRunning }) {
  return <div>{hours}</div>;
}

// ❌ Bad
function Timer(props) {
  return <div>{props.hours}</div>;
}
```

### **3. Use Early Returns**
```jsx
// ✅ Good
function Timer({ user }) {
  if (!user) return <Login />;
  return <TimerDisplay />;
}

// ❌ Bad
function Timer({ user }) {
  return (
    <div>
      {user ? <TimerDisplay /> : <Login />}
    </div>
  );
}
```

### **4. Keep Components Small**
- **Max 200 lines** per component
- **Max 300 lines** per file
- If larger → split into smaller components

### **5. No Magic Numbers**
```jsx
// ✅ Good
import { TIMER_CONSTANTS } from '../config/constants';
if (hours >= TIMER_CONSTANTS.MIN_HOURS) { ... }

// ❌ Bad
if (hours >= 14) { ... }
```

---

## 🧪 Testing Standards (Future)

### **File Naming**
- Test files: `componentName.test.jsx`
- Place next to source file

### **Coverage Goals**
- Utils: 100% coverage
- Hooks: 80%+ coverage
- Components: 70%+ coverage

---

## 📦 Import Order

```jsx
// 1. External dependencies
import React, { useState } from 'react';
import { supabase } from '@supabase/supabase-js';

// 2. Internal hooks
import { useTimer } from '../hooks/useTimer';

// 3. Services
import { playSound } from '../services/audioService';

// 4. Utils
import { formatTime } from '../utils/timeCalculations';

// 5. Constants
import { TIMER_CONSTANTS } from '../config/constants';

// 6. Styles
import './Timer.css';
```

---

## 🌐 Multi-Language (i18n)

### **Structure**
```
src/locales/
├── en/
│   ├── common.json
│   └── timer.json
├── de/
│   ├── common.json
│   └── timer.json
└── sr/
    ├── common.json
    └── timer.json
```

### **Usage**
```jsx
import { useTranslation } from 'react-i18next';

function Timer() {
  const { t } = useTranslation('timer');
  return <button>{t('start')}</button>;
}
```

---

## 🔐 Environment Variables

### **Naming**
- Prefix: `REACT_APP_`
- Example: `REACT_APP_SUPABASE_URL`

### **Storage**
- Development: `.env` file (in .gitignore)
- Production: Vercel dashboard

---

## 📊 State Management

### **Local State**
- Use `useState` for component-specific state

### **Shared State**
- Use React Context for app-wide state
- Examples: Auth, Theme, Timer

### **Server State**
- Use Supabase Realtime for synced data

---

## 🚫 What NOT to Do

1. ❌ **No inline styles** (except temporary)
   - Use CSS modules or styled-components later

2. ❌ **No business logic in components**
   - Extract to hooks

3. ❌ **No direct Supabase calls in components**
   - Use services or hooks

4. ❌ **No magic numbers**
   - Use constants

5. ❌ **No files > 300 lines**
   - Split into smaller modules

6. ❌ **No emojis** (unless user requests)

---

## ✅ Checklist for New Features

Before committing:
- [ ] Correct folder structure used
- [ ] No magic numbers
- [ ] Component < 200 lines
- [ ] Business logic in hooks/utils
- [ ] External APIs in services
- [ ] Constants in config
- [ ] Imports ordered correctly
- [ ] docs/progress.md updated

---

## 📚 Resources

- [React Best Practices](https://react.dev/learn)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Airbnb Style Guide](https://github.com/airbnb/javascript)

---

**Last Updated:** 2025-10-30

**IMPORTANT:** These conventions are MANDATORY for all development.
Read this file at the start of every session!
