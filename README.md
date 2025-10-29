# IF Timer

> A minimalist, motivating intermittent fasting timer with cloud sync

**Status:** 🚧 Active Development | **Phase:** Foundation & Refactoring

---

## 🎯 Vision

A beautiful, science-backed intermittent fasting tracker that:
- Makes fasting feel like an achievement
- Syncs seamlessly across all your devices
- Educates you about what's happening in your body
- Motivates with gamification (without being annoying)

---

## ✨ Features

### Core Timer
- ⏱️ **Flexible Duration:** Set anything from 14-48 hours
- 🎨 **Intuitive Interface:** Drag-and-drop timer adjustment
- 📊 **Visual Progress:** Color-coded progress ring
- 🔔 **Smart Notifications:** Browser notifications + audio feedback
- ⚡ **Extended Mode:** Continue fasting beyond your goal

### Gamification
Six fasting levels with unique achievements:
- 🟢 **Gentle** (14-16h) - "Gentle Warrior"
- 🔵 **Classic** (16-18h) - "Classic Achiever"
- 🟠 **Intensive** (18-20h) - "Intensive Champion"
- 🔴 **Warrior** (20-24h) - "Warrior Elite"
- 🟣 **Monk** (24-36h) - "Monk Mode Master"
- 🟡 **Extended** (36+h) - "Legend Status"

### Education
Real-time body mode tracking:
- 🍽️ **0-4h:** Digesting
- 🔄 **4-12h:** Getting ready
- 🔥 **12-18h:** Fat burning
- ♻️ **18-24h:** Cell renewal (autophagy)
- ✨ **24+h:** Deep healing

### User Experience
- 🌓 **Dark/Light Theme** with system auto-detection
- ☁️ **Cloud Sync** with Supabase Realtime
- 📱 **Responsive Design** - works on all devices
- 🔐 **Privacy First** - passwordless magic link auth
- 💾 **Offline Support** - LocalStorage fallback

---

## 🛠️ Tech Stack

- **Frontend:** React 19.2.0
- **Backend:** Supabase (Auth + PostgreSQL + Realtime)
- **Hosting:** Vercel (planned)
- **Styling:** Inline styles (migrating to design system)
- **Icons:** Lucide React

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/fxdlsRider/if-timer.git
cd if-timer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials to .env

# Start development server
npm start
```

The app will open at `http://localhost:3000`

### Environment Variables

Create a `.env` file with:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Brainstorming & Vision](docs/brainstorming.md)** - Project goals, features, ideas
- **[Architecture](docs/architecture.md)** - Technical design, refactoring plan
- **[Progress Log](docs/progress.md)** - Development timeline and decisions
- **[Database Schema](docs/database.md)** - Supabase database documentation
- **[Deployment Guide](docs/deployment.md)** - Vercel & Supabase setup

---

## 🏗️ Project Status

### Current Phase: Foundation & Refactoring

We're refactoring a monolithic 1,624-line component into a clean, maintainable architecture using the **Strangler Fig Pattern**.

**Progress:** 10% complete

```
Planning     [████████████████████] 100%
Phase 1      [░░░░░░░░░░░░░░░░░░░░]   0%  Utils/Services
Phase 2      [░░░░░░░░░░░░░░░░░░░░]   0%  Custom Hooks
Phase 3      [░░░░░░░░░░░░░░░░░░░░]   0%  UI Components
Phase 4      [░░░░░░░░░░░░░░░░░░░░]   0%  Tests & Polish
```

See [progress.md](docs/progress.md) for detailed status.

### Roadmap

- [x] **v0.1** - Core timer functionality
- [x] **v0.2** - Supabase integration
- [x] **v0.3** - Theme support
- [ ] **v0.4** - Clean architecture refactoring ⬅️ **YOU ARE HERE**
- [ ] **v0.5** - Fasting history & statistics
- [ ] **v0.6** - PWA support
- [ ] **v1.0** - Public launch

---

## 🧪 Testing

```bash
# Run tests (once implemented)
npm test

# Run tests with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e
```

**Note:** Tests are being added as part of the refactoring process.

---

## 🤝 Contributing

This is currently a personal project, but contributions are welcome!

### Development Workflow

1. Read the [Architecture Guide](docs/architecture.md)
2. Check [Progress Log](docs/progress.md) for current status
3. Create a feature branch
4. Make your changes
5. Add tests
6. Submit a pull request

### Code Style

- Prefer functional components
- Use custom hooks for business logic
- Keep components under 200 lines
- Write tests for new features

---

## 📦 Available Scripts

```bash
npm start          # Start development server
npm test           # Run tests
npm run build      # Build for production
npm run eject      # Eject from Create React App (not recommended)
```

---

## 🔒 Privacy & Security

- **No tracking:** We don't track your activity
- **Minimal data:** Only email and timer state stored
- **Secure auth:** Passwordless magic links via Supabase
- **Open source:** You can review all code

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- Design inspiration: Apple's minimalist aesthetic
- Fasting science: Dr. Jason Fung, Dr. Rhonda Patrick
- Icons: [Lucide](https://lucide.dev/)
- Backend: [Supabase](https://supabase.com/)

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/fxdlsRider/if-timer/issues)
- **Discussions:** [GitHub Discussions](https://github.com/fxdlsRider/if-timer/discussions)

---

## 🗺️ Future Plans

See [brainstorming.md](docs/brainstorming.md) for the full vision, including:

- 📊 Detailed statistics dashboard
- 🏆 Achievements & badges system
- 📱 Native mobile apps
- 🍎 Apple Health / Google Fit integration
- 👥 Social features & challenges
- 🌍 Multi-language support

---

**Built with ❤️ for the IF community**
