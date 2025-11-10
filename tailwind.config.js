/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Light theme colors (default)
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8FAFC',
        },
        text: {
          DEFAULT: '#0F172A',
          secondary: '#64748B',
          tertiary: '#94A3B8',
        },
        border: {
          DEFAULT: '#E2E8F0',
          subtle: '#F1F5F9',
        },
        ring: {
          background: '#F1F5F9',
        },
        accent: {
          teal: '#4ECDC4',
          red: '#FF6B6B',
          green: '#34C759',
          orange: '#FF9500',
          yellow: '#FFE66D',
          purple: '#A855F7',
        },
        // Body State Colors (from colored bars)
        bodyState: {
          digesting: '#74b9ff',
          gettingReady: '#ffeaa7',
          fatBurning: '#00b894',
          cellRenewal: '#fdcb6e',
          deepHealing: '#a29bfe',
        }
      },
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
        mono: ['source-code-pro', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
      },
      maxWidth: {
        'container': '1400px',
      },
      gridTemplateColumns: {
        'timer-layout': '1fr auto 1fr',
      }
    },
  },
  plugins: [],
}
