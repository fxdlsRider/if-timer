// components/Legal/PrivacyPage.jsx
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * PrivacyPage - Privacy Policy
 *
 * Data privacy and usage information
 */
export default function PrivacyPage() {
  const { language } = useTranslation();

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 24px',
    color: 'var(--color-text, #0F172A)',
  };

  const headingStyle = {
    fontSize: '32px',
    fontWeight: '600',
    color: 'var(--color-text, #0F172A)',
    marginBottom: '32px',
  };

  const sectionHeadingStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--color-text, #0F172A)',
    marginTop: '32px',
    marginBottom: '16px',
  };

  const paragraphStyle = {
    fontSize: '16px',
    lineHeight: '1.8',
    color: 'var(--color-text-secondary, #64748B)',
    marginBottom: '16px',
  };

  const listStyle = {
    fontSize: '16px',
    lineHeight: '1.8',
    color: 'var(--color-text-secondary, #64748B)',
    marginBottom: '16px',
    paddingLeft: '24px',
  };

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--color-background, #FFFFFF)' }}>
      <div style={containerStyle}>

        <h1 style={headingStyle}>
          {language === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}
        </h1>

        <p style={paragraphStyle}>
          {language === 'de' ? 'Zuletzt aktualisiert: Dezember 2025' : 'Last updated: December 2025'}
        </p>

        {/* Section 1 */}
        <h2 style={sectionHeadingStyle}>
          {language === 'de' ? '1. Datenerhebung' : '1. Data Collection'}
        </h2>
        <p style={paragraphStyle}>
          {language === 'de'
            ? 'IF-Timer ist auf Datenschutz ausgelegt. Wir sammeln nur die minimal notwendigen Daten, um die App-Funktionalität bereitzustellen.'
            : 'IF-Timer is designed with privacy in mind. We collect only the minimum data necessary to provide app functionality.'
          }
        </p>

        <h3 style={{ ...sectionHeadingStyle, fontSize: '18px', marginTop: '24px' }}>
          {language === 'de' ? 'Daten, die wir speichern:' : 'Data we store:'}
        </h3>
        <ul style={listStyle}>
          <li>
            {language === 'de'
              ? 'E-Mail-Adresse (nur wenn Sie sich für ein Konto anmelden)'
              : 'Email address (only if you sign up for an account)'
            }
          </li>
          <li>
            {language === 'de'
              ? 'Timer-Status und Fastenzeiten (in Ihrem Browser oder Datenbank, wenn angemeldet)'
              : 'Timer state and fasting times (in your browser or database if logged in)'
            }
          </li>
          <li>
            {language === 'de'
              ? 'Optionale Profildaten (Spitzname, Ziele, wenn bereitgestellt)'
              : 'Optional profile data (nickname, goals, if provided)'
            }
          </li>
        </ul>

        {/* Section 2 */}
        <h2 style={sectionHeadingStyle}>
          {language === 'de' ? '2. Wie wir Ihre Daten verwenden' : '2. How We Use Your Data'}
        </h2>
        <p style={paragraphStyle}>
          {language === 'de'
            ? 'Ihre Daten werden ausschließlich verwendet, um:'
            : 'Your data is used solely to:'
          }
        </p>
        <ul style={listStyle}>
          <li>
            {language === 'de'
              ? 'Timer-Funktionalität über Geräte hinweg bereitzustellen'
              : 'Provide timer functionality across devices'
            }
          </li>
          <li>
            {language === 'de'
              ? 'Ihre Fastenstatistiken zu speichern und anzuzeigen'
              : 'Store and display your fasting statistics'
            }
          </li>
          <li>
            {language === 'de'
              ? 'Authentifizierung per Magic Link zu ermöglichen'
              : 'Enable Magic Link authentication'
            }
          </li>
        </ul>

        <p style={paragraphStyle}>
          {language === 'de'
            ? 'Wir verkaufen, vermieten oder teilen Ihre persönlichen Daten NIEMALS mit Dritten.'
            : 'We NEVER sell, rent, or share your personal data with third parties.'
          }
        </p>

        {/* Section 3 */}
        <h2 style={sectionHeadingStyle}>
          {language === 'de' ? '3. Datenspeicherung' : '3. Data Storage'}
        </h2>
        <p style={paragraphStyle}>
          {language === 'de'
            ? 'Daten werden sicher in Supabase (PostgreSQL-Datenbank) gespeichert, gehostet in der Europäischen Union. Alle Daten sind verschlüsselt während der Übertragung (HTTPS) und im Ruhezustand.'
            : 'Data is stored securely in Supabase (PostgreSQL database), hosted in the European Union. All data is encrypted in transit (HTTPS) and at rest.'
          }
        </p>

        {/* Section 4 */}
        <h2 style={sectionHeadingStyle}>
          {language === 'de' ? '4. Ihre Rechte' : '4. Your Rights'}
        </h2>
        <p style={paragraphStyle}>
          {language === 'de' ? 'Sie haben das Recht zu:' : 'You have the right to:'}
        </p>
        <ul style={listStyle}>
          <li>
            {language === 'de'
              ? 'Zugriff auf Ihre gespeicherten Daten'
              : 'Access your stored data'
            }
          </li>
          <li>
            {language === 'de'
              ? 'Ihre Daten jederzeit exportieren'
              : 'Export your data at any time'
            }
          </li>
          <li>
            {language === 'de'
              ? 'Ihr Konto und alle Daten löschen'
              : 'Delete your account and all data'
            }
          </li>
          <li>
            {language === 'de'
              ? 'Die App anonym ohne Konto nutzen (LocalStorage nur)'
              : 'Use the app anonymously without an account (LocalStorage only)'
            }
          </li>
        </ul>

        {/* Section 5 */}
        <h2 style={sectionHeadingStyle}>
          {language === 'de' ? '5. Cookies und Tracking' : '5. Cookies and Tracking'}
        </h2>
        <p style={paragraphStyle}>
          {language === 'de'
            ? 'IF-Timer verwendet KEINE Tracking-Cookies oder Analyse-Tools Dritter. Wir verwenden nur essenzielle Cookies für Authentifizierung (Supabase Session-Token).'
            : 'IF-Timer uses NO tracking cookies or third-party analytics. We only use essential cookies for authentication (Supabase session token).'
          }
        </p>

        {/* Section 6 */}
        <h2 style={sectionHeadingStyle}>
          {language === 'de' ? '6. Kontakt' : '6. Contact'}
        </h2>
        <p style={paragraphStyle}>
          {language === 'de'
            ? 'Wenn Sie Fragen zu dieser Datenschutzerklärung haben, kontaktieren Sie uns unter:'
            : 'If you have questions about this Privacy Policy, contact us at:'
          }
        </p>
        <p style={paragraphStyle}>
          <a
            href="mailto:contact@if-timer.app"
            style={{
              color: '#4ECDC4',
              textDecoration: 'none',
            }}
          >
            contact@if-timer.app
          </a>
        </p>

        {/* Back Link */}
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--color-border, #E2E8F0)' }}>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'about' }))}
            style={{
              color: '#4ECDC4',
              textDecoration: 'none',
              fontSize: '16px',
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            ← {language === 'de' ? 'Zurück zur Info-Seite' : 'Back to About'}
          </button>
        </div>

      </div>
    </div>
  );
}
