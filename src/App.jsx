import React from 'react';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import IFTimerWithThemeWrapper from './IFTimerWithThemeWrapper';

const App = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <IFTimerWithThemeWrapper />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
