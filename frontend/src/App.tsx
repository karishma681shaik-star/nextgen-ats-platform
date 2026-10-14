import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes/AppRoutes';
import { BackgroundController } from './components/3d/BackgroundController';

export function App() {
  return (
    <BrowserRouter>
      {/* ── Single Persistent Global NEXUS 3D AI Universe ── */}
      <BackgroundController />
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
