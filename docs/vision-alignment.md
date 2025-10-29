# IF Timer - Vision Alignment & Updates

**Date:** 2025-10-29
**Purpose:** Align user's detailed vision with current implementation plan

---

## 📋 Summary of Changes

This document captures the user's detailed vision brainstorm and integrates it with existing documentation.

### Key New Requirements:
1. **Background Timer** (Tab unfocused + Standby support)
2. **Motivational Quotes** (Movies + Philosophers)
3. **Premium Dashboard** (Left side, Tacho-style)
4. **Extended User Profile** (Age, Weight, Goals, Challenges)
5. **Social Live Feed** (Right side, real-time activity)
6. **Multi-Language Support** (EN/DE/SR)
7. **3-Column Layout** (Dashboard-Timer-Stats)

---

## 🎯 Updated Vision Statement

> **Ein webbasierter, progressiver Intervallfasten-Timer, der ohne Anmeldung funktioniert und in der Grundfunktion kostenlos bleibt. Mit optionaler Premium-Version für erweiterte Tracking-, Social- und KI-gestützte Features.**

### Core Principles:
1. **Free Forever** - Basic timer always free
2. **No Login Required** - Works immediately
3. **Background Capable** - Timer runs even when tab unfocused
4. **Multi-Device Sync** - Optional with Magic Link
5. **Premium Optional** - Support the project, get advanced features

---

## 🎨 Layout Structure (Updated)

### Current Layout (2-Column):
```
┌────────────────────────────┐
│                            │
│  [Timer]      [Levels]     │
│   Center       Right       │
│                            │
└────────────────────────────┘
```

### Target Layout (3-Column):
```
┌──────────────────────────────────────────────┐
│                                              │
│  [Dashboard]    [Timer]    [Levels/Stats]   │
│     Left         Center         Right        │
│   (Premium)                                  │
│    - Tacho                    - Levels       │
│    - Goals                    - Statistics   │
│    - Profile                  - Social Feed  │
│                                              │
└──────────────────────────────────────────────┘
```

**Responsive Behavior:**
- Desktop: 3 columns
- Tablet: Timer center, other sections stack
- Mobile: Single column, swipeable

---

## 🆕 New Features Breakdown

### 1. Background Timer Support (CRITICAL)

**Current Problem:**
- Timer only runs when tab is active/focused
- Stops when computer goes to standby
- No mobile support when app is backgrounded

**Solution:**
- **Progressive Web App (PWA)**
  - Service Worker
  - Background Sync
  - Push Notifications API
- **Wake Lock API** (prevent sleep)
- **Foreground Service** (mobile)

**Technical Implementation:**
```javascript
// Service Worker for background timer
self.addEventListener('message', (event) => {
  if (event.data.type === 'START_TIMER') {
    // Run timer in background
  }
});

// Wake Lock to prevent sleep
const wakeLock = await navigator.wakeLock.request('screen');
```

**Files to Create:**
- `public/service-worker.js` - Background timer logic
- `src/hooks/useWakeLock.js` - Prevent standby
- `public/manifest.json` - PWA config (update)

---

### 2. Motivational Quotes System

**Requirements:**
- Display quotes from:
  - Famous movies (e.g., Rocky, Lord of the Rings)
  - Philosophers (e.g., Stoics, Marcus Aurelius)
- Rotate quotes during fasting
- Multi-language support (EN/DE/SR)

**Content Structure:**
```javascript
{
  id: 1,
  text: {
    en: "The world ain't all sunshine and rainbows",
    de: "Die Welt ist nicht nur Sonnenschein und Regenbogen",
    sr: "Svet nije samo sunce i duge"
  },
  author: "Rocky Balboa",
  source: "Rocky (1976)",
  category: "motivation"
}
```

**Database Schema:**
```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY,
  text_en TEXT NOT NULL,
  text_de TEXT NOT NULL,
  text_sr TEXT NOT NULL,
  author VARCHAR(100),
  source VARCHAR(200),
  category VARCHAR(50), -- motivation, philosophy, movie, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**UI Placement:**
- Below timer (center)
- Fades in/out every 30 minutes
- User can click for new quote

**Files to Create:**
- `src/data/quotes.js` - Quote collection
- `src/components/Quote/QuoteDisplay.jsx`
- `src/hooks/useQuoteRotation.js`

---

### 3. Premium Dashboard (Left Column)

**Design:** Tacho/Gauge-inspired dashboard (automotive style)

**Components:**

#### **User Profile Card**
- Name/Email
- Age (optional)
- Current Weight
- Target Weight
- Goals (dropdown: weight loss, health, autophagy, etc.)
- Challenges (text field)

#### **Quick Stats (Tacho-Style)**
```
Current Fast: [Gauge showing progress]
Total Fasted: 1,240h
Longest Fast: 42h
Current Streak: 7 days
```

#### **Visual Gauges:**
- Speed-meter style for current fast
- Ring charts for stats
- Animated transitions

**Database Schema:**
```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  age INTEGER,
  current_weight DECIMAL(5,2),
  target_weight DECIMAL(5,2),
  weight_unit VARCHAR(5) DEFAULT 'kg', -- kg or lbs
  goals TEXT[], -- Array of goals
  challenges TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Files to Create:**
- `src/components/Dashboard/Dashboard.jsx`
- `src/components/Dashboard/ProfileCard.jsx`
- `src/components/Dashboard/StatsGauge.jsx`
- `src/components/Dashboard/GoalTracker.jsx`

---

### 4. Extended Statistics (Right Column)

**Free Users See:**
- Fasting levels (current)
- Body modes (current)

**Premium Users See (additionally):**
- Last fast duration
- Total fasting time
- Most frequent level
- Weekly/Monthly trends
- Completion rate
- Average fast duration

**Visual Components:**
- Bar charts (weekly fasts)
- Line charts (weight trend)
- Donut charts (level distribution)

**Database Queries:**
```sql
-- Most frequent level
SELECT fasting_level, COUNT(*) as count
FROM fasting_sessions
WHERE user_id = $1
GROUP BY fasting_level
ORDER BY count DESC
LIMIT 1;

-- Total fasting time
SELECT SUM(EXTRACT(EPOCH FROM actual_duration)/3600) as total_hours
FROM fasting_sessions
WHERE user_id = $1;
```

**Files to Create:**
- `src/components/Stats/StatsPanel.jsx`
- `src/components/Stats/FastingChart.jsx`
- `src/components/Stats/LevelDistribution.jsx`

---

### 5. Social Live Feed

**Features:**
- Real-time activity feed
- Anonymized usernames (or first names only)
- Show events:
  - "Sara finished her 18h fast"
  - "Max started a Monk fast"
  - "Anna reached 24h milestone"

**Privacy Considerations:**
- Users opt-in (Settings toggle)
- No personal info shown (just first name)
- No exact timestamps (just "just now", "5 min ago")

**Database Schema:**
```sql
CREATE TABLE social_activities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  display_name VARCHAR(50), -- Anonymized
  activity_type VARCHAR(50), -- started, completed, milestone
  fasting_level VARCHAR(20),
  duration_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can read all activities, but only insert their own
CREATE POLICY "Anyone can view activities"
  ON social_activities FOR SELECT
  USING (true);

CREATE POLICY "Users can create own activities"
  ON social_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Realtime Subscription:**
```javascript
const { data } = await supabase
  .from('social_activities')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);

// Subscribe to new activities
supabase
  .channel('social_feed')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'social_activities'
  }, (payload) => {
    // Show new activity with animation
  })
  .subscribe();
```

**Files to Create:**
- `src/components/Social/SocialFeed.jsx`
- `src/components/Social/ActivityItem.jsx`
- `src/hooks/useSocialFeed.js`

---

### 6. Multi-Language Support (i18n)

**Languages:**
- English (en)
- German (de)
- Serbian (sr)

**Implementation:** React-i18next

**Setup:**
```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

**Structure:**
```
src/locales/
├── en/
│   ├── common.json
│   ├── timer.json
│   └── quotes.json
├── de/
│   ├── common.json
│   ├── timer.json
│   └── quotes.json
└── sr/
    ├── common.json
    ├── timer.json
    └── quotes.json
```

**Example Translation File:**
```json
// src/locales/en/timer.json
{
  "startTimer": "START",
  "stopFasting": "STOP FASTING",
  "levels": {
    "gentle": "Gentle",
    "classic": "Classic",
    "intensive": "Intensive",
    "warrior": "Warrior",
    "monk": "Monk",
    "extended": "Extended"
  }
}
```

**Usage:**
```javascript
import { useTranslation } from 'react-i18next';

function Timer() {
  const { t, i18n } = useTranslation('timer');

  return <button>{t('startTimer')}</button>;
}
```

**Language Switcher:**
```javascript
<select onChange={(e) => i18n.changeLanguage(e.target.value)}>
  <option value="en">English</option>
  <option value="de">Deutsch</option>
  <option value="sr">Српски</option>
</select>
```

**Files to Create:**
- `src/i18n.js` - i18next config
- `src/locales/` - Translation files
- `src/components/LanguageSwitcher.jsx`

---

### 7. Premium Monetization Model

**Free Tier:**
- Basic timer
- Fasting levels
- Magic Link auth
- Multi-device sync
- LocalStorage

**Premium Tier ($4.99/month or $39/year):**
- Dashboard (left column)
- Extended statistics
- User profile (age, weight, goals)
- Social feed access
- Weight tracking
- Fasting history (unlimited)
- Export data (CSV/PDF)
- Priority support
- Future: AI coaching

**Payment Integration:**
- Stripe Checkout
- One-click upgrade
- Cancel anytime

**Database Schema:**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id),
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  status VARCHAR(20), -- active, canceled, past_due
  plan VARCHAR(20), -- monthly, yearly
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Files to Create:**
- `src/components/Premium/UpgradeModal.jsx`
- `src/components/Premium/PricingCard.jsx`
- `src/hooks/useSubscription.js`
- `src/services/stripeService.js`

---

## 📊 Updated Database Schema

### New Tables Required:

```sql
-- 1. User Profiles (Premium)
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(50),
  age INTEGER CHECK (age >= 13 AND age <= 120),
  current_weight DECIMAL(5,2),
  target_weight DECIMAL(5,2),
  weight_unit VARCHAR(5) DEFAULT 'kg',
  goals TEXT[],
  challenges TEXT,
  show_in_social_feed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Motivational Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_en TEXT NOT NULL,
  text_de TEXT NOT NULL,
  text_sr TEXT NOT NULL,
  author VARCHAR(100),
  source VARCHAR(200),
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Social Activities
CREATE TABLE social_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(50),
  activity_type VARCHAR(50), -- started, completed, milestone
  fasting_level VARCHAR(20),
  duration_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Subscriptions (Premium)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  status VARCHAR(20),
  plan VARCHAR(20),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Weight Tracking (Premium)
CREATE TABLE weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  unit VARCHAR(5) DEFAULT 'kg',
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_social_activities_created_at ON social_activities(created_at DESC);
CREATE INDEX idx_weight_entries_user_id ON weight_entries(user_id, recorded_at DESC);
```

---

## 🏗️ Updated Architecture

### New Folder Structure:

```
src/
├── business-logic/
│   ├── hooks/
│   │   ├── useTimer.js
│   │   ├── useWakeLock.js          # NEW: Prevent standby
│   │   ├── useServiceWorker.js     # NEW: Background timer
│   │   ├── useQuotes.js            # NEW: Quote rotation
│   │   ├── useSocialFeed.js        # NEW: Live feed
│   │   ├── useSubscription.js      # NEW: Premium check
│   │   └── useI18n.js              # NEW: Language
│   ├── utils/
│   └── services/
│       ├── stripeService.js        # NEW: Payments
│       └── quotesService.js        # NEW: Quote management
│
├── components/
│   ├── Timer/
│   ├── Dashboard/                  # NEW: Left column
│   │   ├── Dashboard.jsx
│   │   ├── ProfileCard.jsx
│   │   ├── StatsGauge.jsx
│   │   └── GoalTracker.jsx
│   ├── Stats/                      # NEW: Right column stats
│   │   ├── StatsPanel.jsx
│   │   ├── FastingChart.jsx
│   │   └── LevelDistribution.jsx
│   ├── Social/                     # NEW: Social feed
│   │   ├── SocialFeed.jsx
│   │   └── ActivityItem.jsx
│   ├── Quote/                      # NEW: Motivational quotes
│   │   └── QuoteDisplay.jsx
│   ├── Premium/                    # NEW: Monetization
│   │   ├── UpgradeModal.jsx
│   │   └── PricingCard.jsx
│   └── Shared/
│       └── LanguageSwitcher.jsx    # NEW
│
├── locales/                        # NEW: Translations
│   ├── en/
│   ├── de/
│   └── sr/
│
├── data/
│   └── quotes.js                   # NEW: Quote collection
│
└── public/
    ├── service-worker.js           # NEW: Background timer
    └── manifest.json               # Update: PWA config
```

---

## 🎯 Updated Roadmap

### Phase 0: Foundation (CURRENT)
- [x] Documentation
- [x] Database schema
- [x] Deployment guide

### Phase 1: Refactoring (Next)
- [ ] Extract utils
- [ ] Extract hooks
- [ ] Split components
- [ ] Add tests

### Phase 2: Critical New Features
- [ ] **PWA + Service Worker** (Background timer)
- [ ] **3-Column Layout** (Dashboard-Timer-Stats)
- [ ] **Multi-Language Support** (i18n)

### Phase 3: Premium Features
- [ ] **User Profiles** (Age, weight, goals)
- [ ] **Dashboard** (Tacho-style)
- [ ] **Extended Statistics**
- [ ] **Stripe Integration**
- [ ] **Weight Tracking**

### Phase 4: Social & Content
- [ ] **Motivational Quotes System**
- [ ] **Social Live Feed**
- [ ] **Privacy Settings**

### Phase 5: AI Integration (Future)
- [ ] AI Coaching
- [ ] Personalized Recommendations
- [ ] Goal Suggestions

---

## ⚠️ Critical Technical Challenges

### 1. Background Timer (Highest Priority)

**Challenge:** Browsers restrict background execution

**Solutions:**
| Approach | Pros | Cons |
|----------|------|------|
| Service Worker | Works offline, PWA installable | Complex, limited API |
| Web Workers | Simpler than SW | Doesn't work when tab closed |
| Push Notifications | Wakes app | Requires user permission |
| Server-side Timer | Always accurate | Need backend, costs |

**Recommended:** Hybrid approach
- Service Worker for PWA + background
- Server-side check as backup (Supabase Edge Function)
- Push notification at completion

### 2. PWA Installation

**Requirements:**
- HTTPS (Vercel provides)
- manifest.json
- Service Worker
- Icons (multiple sizes)

**Manifest:**
```json
{
  "name": "IF Timer",
  "short_name": "IFTimer",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#333333",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 3. Multi-Language Content

**Challenge:** Quotes database needs 3 languages

**Solution:**
- Start with English quotes
- Crowdsource translations (community)
- Or use AI translation (DeepL API)

---

## 💰 Updated Pricing Model

### Free Forever:
- Basic timer (14-48h)
- Level selection
- Notifications + Sound
- Magic Link auth
- Multi-device sync

### Premium ($4.99/mo or $39/year):
- Dashboard (Tacho-style)
- User profile (age, weight, goals)
- Extended statistics
- Social feed
- Weight tracking
- Fasting history (unlimited)
- Export data
- Priority support
- **Future:** AI coaching

### Why This Pricing?
- Competitors: Zero ($14.99/mo), Vora ($9.99/mo)
- Our value: More affordable, better UX
- Free tier generous enough for most users

---

## 📋 Next Steps

1. **Update all docs** with this vision
2. **Create feature priority matrix**
3. **Start refactoring** (Phase 1)
4. **Implement PWA** (Phase 2 - Critical)
5. **Build premium features** (Phase 3)
6. **Launch MVP** with free + premium

---

## ✅ Action Items

- [ ] Update `brainstorming.md` with new features
- [ ] Update `architecture.md` with new structure
- [ ] Update `database.md` with new tables
- [ ] Update `progress.md` with vision alignment
- [ ] Create `pwa-implementation-plan.md`
- [ ] Create `premium-features-spec.md`

---

**Last Updated:** 2025-10-29
**Status:** Vision alignment in progress ⏳
