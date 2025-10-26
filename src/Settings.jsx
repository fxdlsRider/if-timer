import React from 'react';
import { useTheme } from './ThemeContext';
import { getThemeColors } from './themeConfig';

const Settings = () => {
  const { theme, themePreference, setTheme } = useTheme();
  const colors = getThemeColors(theme === 'dark');

  const themeOptions = [
    {
      value: 'auto',
      label: 'Automatic',
      description: 'Follow system settings'
    },
    {
      value: 'light',
      label: 'Light',
      description: 'Always use light mode'
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Always use dark mode'
    }
  ];

  const styles = {
    container: {
      fontFamily: 'Poppins, sans-serif',
      background: colors.background,
      minHeight: '100vh',
      color: colors.text,
      padding: '80px 40px',
      maxWidth: '600px',
      margin: '0 auto'
    },
    title: {
      fontSize: '24px',
      fontWeight: '400',
      color: colors.text,
      marginBottom: '60px',
      letterSpacing: '-0.3px'
    },
    section: {
      marginBottom: '48px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '500',
      color: colors.text,
      marginBottom: '20px',
      letterSpacing: '-0.2px'
    },
    optionGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    option: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '16px',
      borderBottom: `1px solid ${colors.borderSubtle}`,
      cursor: 'pointer',
      transition: 'padding-left 0.2s'
    },
    radio: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      border: `2px solid ${colors.textTertiary}`,
      marginTop: '2px',
      position: 'relative',
      flexShrink: 0
    },
    radioSelected: {
      borderColor: colors.accentTeal
    },
    radioDot: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: colors.accentTeal
    },
    optionContent: {
      flex: 1
    },
    optionLabel: {
      fontSize: '15px',
      fontWeight: '400',
      color: colors.text,
      marginBottom: '4px',
      letterSpacing: '-0.2px'
    },
    optionDescription: {
      fontSize: '13px',
      color: colors.textTertiary,
      letterSpacing: '0.3px'
    },
    backButton: {
      background: 'transparent',
      border: 'none',
      color: colors.textSecondary,
      padding: '12px 0',
      fontSize: '14px',
      fontWeight: '400',
      cursor: 'pointer',
      fontFamily: 'Poppins, sans-serif',
      letterSpacing: '0.3px',
      marginTop: '40px',
      transition: 'color 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Settings</h1>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Appearance</div>
        
        <div style={styles.optionGroup}>
          {themeOptions.map(option => {
            const isSelected = themePreference === option.value;
            
            return (
              <div
                key={option.value}
                style={styles.option}
                onClick={() => setTheme(option.value)}
                onMouseEnter={(e) => e.currentTarget.style.paddingLeft = '20px'}
                onMouseLeave={(e) => e.currentTarget.style.paddingLeft = '16px'}
              >
                <div style={{
                  ...styles.radio,
                  ...(isSelected ? styles.radioSelected : {})
                }}>
                  {isSelected && <div style={styles.radioDot} />}
                </div>
                
                <div style={styles.optionContent}>
                  <div style={styles.optionLabel}>{option.label}</div>
                  <div style={styles.optionDescription}>{option.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button 
        style={styles.backButton}
        onMouseEnter={(e) => e.target.style.color = colors.accentTeal}
        onMouseLeave={(e) => e.target.style.color = colors.textSecondary}
      >
        ← Back
      </button>
    </div>
  );
};

export default Settings;
