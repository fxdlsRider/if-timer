// src/App.js
import React from 'react';
import { AuthProvider } from './AuthContext';
import IFTimerFinal from './IFTimerFinal';

function App() {
  return (
    <AuthProvider>
      <IFTimerFinal />
    </AuthProvider>
  );
}

export default App;
