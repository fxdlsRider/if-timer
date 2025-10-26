import React from 'react';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import IFTimerWithThemeWrapper from './IFTimerWithThemeWrapper';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <IFTimerWithThemeWrapper />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
