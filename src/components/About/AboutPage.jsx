// components/About/AboutPage.jsx
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * AboutPage - About the Project
 *
 * Personal story, technical details, feedback, and contact
 */
export default function AboutPage() {
  const { language } = useTranslation();

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 24px',
    color: 'var(--color-text, #0F172A)',
  };

  const sectionStyle = {
    marginBottom: '48px',
  };

  const headingStyle = {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--color-text, #0F172A)',
    marginBottom: '16px',
  };

  const paragraphStyle = {
    fontSize: '16px',
    lineHeight: '1.8',
    color: 'var(--color-text-secondary, #64748B)',
    marginBottom: '16px',
  };

  const linkStyle = {
    color: '#4ECDC4',
    textDecoration: 'none',
    borderBottom: '1px solid transparent',
    transition: 'border-color 0.2s',
  };

  const disclaimerStyle = {
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'var(--color-text-tertiary, #94A3B8)',
    padding: '24px',
    background: 'var(--color-background-secondary, #F8FAFC)',
    borderRadius: '8px',
    border: '1px solid var(--color-border, #E2E8F0)',
    marginTop: '48px',
  };

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--color-background, #FFFFFF)' }}>
      <div style={containerStyle}>

        {/* About This Project */}
        <section style={sectionStyle}>
          <h1 style={headingStyle}>
            {language === 'de' ? 'Über dieses Projekt' : 'About This Project'}
          </h1>
          <p style={paragraphStyle}>
            {language === 'de'
              ? 'Ich habe den IF-Timer ursprünglich für meinen eigenen Gebrauch entwickelt – als Tool für meine tägliche Intervallfasten-Praxis. Falls er auch für dich nützlich ist, kannst du ihn gerne verwenden.'
              : 'I originally developed the IF-Timer for my own use – as a tool for my daily intermittent fasting practice. If it\'s also useful for you, feel free to use it.'
            }
          </p>
          <p style={paragraphStyle}>
            {language === 'de'
              ? 'Der Timer verbindet praktische Funktionalität mit Elementen stoischer Philosophie. Er soll dich dabei unterstützen, achtsam mit deiner Fastenpraxis umzugehen. Die Meditationen sind dazu gedacht, dich zum Nachdenken über deinen eigenen Weg zu motivieren. Fasten kann Verzicht bedeuten, es kann dir aber auch dabei helfen Klarheit zu gewinnen.'
              : 'The timer combines practical functionality with elements of Stoic philosophy. It\'s designed to support you in approaching your fasting practice mindfully. The meditations are intended to encourage reflection on your own path. Fasting can mean sacrifice, but it can also help you gain clarity.'
            }
          </p>
        </section>

        {/* Technical Details */}
        <section style={sectionStyle}>
          <h2 style={headingStyle}>
            {language === 'de' ? 'Technische Details' : 'Technical Details'}
          </h2>
          <p style={paragraphStyle}>
            {language === 'de'
              ? 'Der IF-Timer wurde mit modernen Web-Technologien und Unterstützung von Claude AI (Anthropic) entwickelt. Der vollständige Quellcode ist frei auf GitHub verfügbar – Transparenz und Offenheit sind mir wichtig.'
              : 'The IF-Timer was developed using modern web technologies with support from Claude AI (Anthropic). The complete source code is freely available on GitHub – transparency and openness are important to me.'
            }
          </p>
          <p style={paragraphStyle}>
            <a
              href="https://github.com/fxdlsRider/if-timer"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
              onMouseEnter={(e) => e.target.style.borderColor = '#4ECDC4'}
              onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
            >
              github.com/fxdlsRider/if-timer
            </a>
          </p>
        </section>

        {/* Feedback Welcome */}
        <section style={sectionStyle}>
          <h2 style={headingStyle}>
            {language === 'de' ? 'Feedback willkommen' : 'Feedback Welcome'}
          </h2>
          <p style={paragraphStyle}>
            {language === 'de'
              ? 'Dies ist ein Projekt im Werden. Fehler können passieren, Verbesserungen sind immer möglich. Wenn du Vorschläge hast oder auf Probleme stößt, freue ich mich über dein Feedback.'
              : 'This is a work in progress. Mistakes can happen, improvements are always possible. If you have suggestions or encounter problems, I welcome your feedback.'
            }
          </p>
        </section>

        {/* Contact */}
        <section style={sectionStyle}>
          <h2 style={headingStyle}>
            {language === 'de' ? 'Kontakt' : 'Contact'}
          </h2>
          <p style={paragraphStyle}>
            <a
              href="mailto:contact@if-timer.app"
              style={linkStyle}
              onMouseEnter={(e) => e.target.style.borderColor = '#4ECDC4'}
              onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
            >
              contact@if-timer.app
            </a>
          </p>
        </section>

        {/* Legal Links */}
        <section style={sectionStyle}>
          <h2 style={headingStyle}>
            {language === 'de' ? 'Rechtliches' : 'Legal'}
          </h2>
          <p style={paragraphStyle}>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'terms' }))}
              style={{
                ...linkStyle,
                marginRight: '24px',
                background: 'none',
                border: 'none',
                padding: 0,
                font: 'inherit',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.target.style.borderColor = '#4ECDC4'}
              onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
            >
              {language === 'de' ? 'Nutzungsbedingungen' : 'Terms of Use'}
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'privacy' }))}
              style={{
                ...linkStyle,
                background: 'none',
                border: 'none',
                padding: 0,
                font: 'inherit',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.target.style.borderColor = '#4ECDC4'}
              onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
            >
              {language === 'de' ? 'Datenschutz' : 'Privacy Policy'}
            </button>
          </p>
        </section>

        {/* Health Disclaimer */}
        <div style={disclaimerStyle}>
          <p style={{ fontWeight: '600', marginBottom: '12px', color: 'var(--color-text, #0F172A)' }}>
            {language === 'de' ? 'Medizinischer Hinweis' : 'Medical Disclaimer'}
          </p>
          <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '12px' }}>
            {language === 'de'
              ? 'Dieser Timer ist ein einfaches Werkzeug zur Zeitmessung und bietet keine medizinische, gesundheitliche oder ernährungswissenschaftliche Beratung. Konsultiere vor Beginn des Intervallfastens oder jeder Ernährungsumstellung einen Arzt oder qualifizierten Gesundheitsdienstleister.'
              : 'This timer is a simple time-tracking tool and provides no medical, healthcare, or nutritional advice. Consult with a physician or qualified healthcare provider before starting intermittent fasting or any change in diet.'
            }
          </p>
          <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '0' }}>
            {language === 'de'
              ? 'Intervallfasten birgt gesundheitliche Risiken. Du nutzt dieses Tool und praktizierst Fasten vollständig auf eigene Verantwortung. Weitere Details findest du in den Nutzungsbedingungen.'
              : 'Intermittent fasting carries inherent health risks. You use this tool and undertake any fasting protocol entirely at your own risk. See Terms of Use for full details.'
            }
          </p>
        </div>

      </div>
    </div>
  );
}
