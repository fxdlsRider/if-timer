import React from 'react';
import { ThemeProvider } from './ThemeContext';
import IFTimerWithTheme from './IFTimerWithTheme';

const App = () => {
  return (
    <ThemeProvider>
      <IFTimerWithTheme />
    </ThemeProvider>
  );
};

export default App;
