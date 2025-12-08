// components/Legal/TermsPage.jsx
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * TermsPage - Terms of Use & Disclaimer
 *
 * Legal terms and medical disclaimer for the IF-Timer app
 */
export default function TermsPage() {
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
    listStyleType: 'disc',
  };

  const warningStyle = {
    fontSize: '16px',
    lineHeight: '1.8',
    color: 'var(--color-text, #0F172A)',
    fontWeight: '600',
    marginBottom: '16px',
    padding: '16px',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  };

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--color-background, #FFFFFF)' }}>
      <div style={containerStyle}>

        <h1 style={headingStyle}>
          {language === 'de'
            ? 'Nutzungsbedingungen & Haftungsausschluss'
            : 'Terms of Use & Disclaimer'}
        </h1>

        <p style={paragraphStyle}>
          {language === 'de'
            ? 'Intervallfasten-Timer'
            : 'Intermittent Fasting Timer'
          }
        </p>

        {language === 'de' ? (
          // German version - compact format
          <>
            <h2 style={sectionHeadingStyle}>Verbindliche Zustimmung</h2>
            <p style={paragraphStyle}>
              Mit der Nutzung dieses Tools erklären Sie sich mit diesen Bedingungen einverstanden.
              Sind Sie nicht einverstanden, nutzen Sie das Tool nicht.
            </p>

            <h2 style={sectionHeadingStyle}>Keine medizinische Anwendung</h2>
            <p style={paragraphStyle}>
              Dieses Tool ist eine rein technische Hilfsfunktion zur Zeiterfassung. Es bietet keine
              medizinische, gesundheitliche oder ernährungsberatende Funktionen. Alle Inhalte dienen
              nur der allgemeinen Information.
            </p>

            <h2 style={sectionHeadingStyle}>Ärztlicher Rat erforderlich</h2>
            <p style={paragraphStyle}>
              Vor Beginn des Intervallfastens oder jeder Ernährungsumstellung müssen Sie einen Arzt
              konsultieren. Dies ist unabdingbar bei:
            </p>
            <ul style={listStyle}>
              <li>Bestehenden Erkrankungen</li>
              <li>Einnahme von Medikamenten</li>
              <li>Schwangerschaft oder Stillzeit</li>
              <li>Essstörungen in der Vorgeschichte</li>
              <li>Unter 18 Jahren oder über 65 Jahren</li>
            </ul>

            <h2 style={sectionHeadingStyle}>Eigenverantwortung & Risiken</h2>
            <div style={warningStyle}>
              Sie nutzen das Tool auf eigenes Risiko. Der Betreiber übernimmt keinerlei Verantwortung
              für gesundheitliche oder sonstige Schäden, die direkt oder indirekt aus der Nutzung
              entstehen. Intervallfasten birgt inhärente Risiken (z.B. Unterzuckerung, Verschlechterung
              von Vorerkrankungen).
            </div>

            <h2 style={sectionHeadingStyle}>Nutzungsbeschränkung</h2>
            <p style={paragraphStyle}>
              Personen unter 18 Jahren ist die Nutzung untersagt. Bei Nutzung trotz Zugehörigkeit zu
              einer genannten Risikogruppe handeln Sie grob fahrlässig.
            </p>

            <h2 style={sectionHeadingStyle}>Gewährleistungsausschluss</h2>
            <p style={paragraphStyle}>
              Das Tool wird "AS IS" bereitgestellt. Es wird keine Garantie für Verfügbarkeit,
              Fehlerfreiheit oder Korrektheit der Zeitberechnungen übernommen.
            </p>

            <h2 style={sectionHeadingStyle}>Haftungsbeschränkung</h2>
            <p style={paragraphStyle}>
              Die Haftung des Betreibers, gleich aus welchem Rechtsgrund, ist – soweit gesetzlich
              zulässig – ausgeschlossen. Dies gilt nicht bei Vorsatz, grober Fahrlässigkeit, Verletzung
              des Lebens, des Körpers oder der Gesundheit oder nach dem Produkthaftungsgesetz.
            </p>
          </>
        ) : (
          // English version - numbered sections
          <>
            <h2 style={sectionHeadingStyle}>1. Acceptance of Terms</h2>
            <p style={paragraphStyle}>
              By accessing or using this Intermittent Fasting Timer ("the Tool"), you agree to be
              bound by these Terms of Use & Disclaimer. If you do not agree to all terms, you must
              not use this Tool.
            </p>

            <h2 style={sectionHeadingStyle}>2. Nature of the Tool & No Medical Advice</h2>
            <p style={paragraphStyle}>
              This Tool is a simple time-tracking utility for informational and organizational
              purposes only. It provides no medical, healthcare, or nutritional advice. Any
              information presented is for general informational use and must not be considered
              a substitute for professional medical advice.
            </p>

            <h2 style={sectionHeadingStyle}>3. Mandatory Medical Consultation & Acknowledgment of Risks</h2>
            <p style={paragraphStyle}>
              You must consult with a physician or other qualified healthcare provider before
              starting intermittent fasting or any change in diet, especially if you:
            </p>
            <ul style={listStyle}>
              <li>Have any pre-existing health conditions.</li>
              <li>Are taking medication.</li>
              <li>Are pregnant, breastfeeding, or planning to become pregnant.</li>
              <li>Have a history of or are at risk of eating disorders.</li>
              <li>Are under the age of 18 or over 65.</li>
            </ul>

            <div style={warningStyle}>
              INTERMITTENT FASTING CARRIES INHERENT HEALTH RISKS, which may include but are not
              limited to dizziness, hypoglycemia, dehydration, nutrient deficiencies, and
              exacerbation of underlying conditions. You use this Tool and undertake any fasting
              protocol entirely at your own risk.
            </div>

            <h2 style={sectionHeadingStyle}>4. Limitation of Liability</h2>
            <p style={paragraphStyle}>
              To the fullest extent permitted by law, the operator of this Tool shall not be
              liable for any direct, indirect, incidental, special, consequential, or exemplary
              damages, including but not limited to damages for personal injury, health
              complications, data loss, or any other losses arising out of or relating to the
              use or inability to use this Tool.
            </p>

            <h2 style={sectionHeadingStyle}>5. No Warranties</h2>
            <p style={paragraphStyle}>
              The Tool is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties
              of any kind, express or implied. This includes, without limitation, no warranty of
              accuracy, reliability, fitness for a particular purpose, or non-infringement. Time
              calculations may be incorrect, and the service may be interrupted.
            </p>

            <h2 style={sectionHeadingStyle}>6. User Eligibility and Responsibility</h2>
            <p style={paragraphStyle}>
              The Tool is not intended for use by individuals under the age of 18. By using it,
              you represent that you are at least 18 years old. You are solely responsible for
              evaluating your suitability for intermittent fasting and for your own health
              decisions and actions.
            </p>
          </>
        )}

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
