import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes/AppRoutes';
import { BackgroundController } from './components/3d/BackgroundController';

import { ActionSuccessOverlay } from './components/feedback/ActionSuccessOverlay';

export function App() {
  return (
    <BrowserRouter>
      {/* ── Single Persistent Global NEXUS 3D AI Universe ── */}
      <BackgroundController />
      <AuthProvider>
        <ToastProvider>
          <ActionSuccessOverlay />
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
