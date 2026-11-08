import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes/AppRoutes';
import { BackgroundController } from './components/3d/BackgroundController';
import { TwinklingCornerStars } from './components/common/TwinklingCornerStars';

import { ActionSuccessOverlay } from './components/feedback/ActionSuccessOverlay';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {/* ── Single Persistent Global NEXUS 3D AI Universe ── */}
          <BackgroundController />
          {/* ── Continuous Twinkling Corner Stars Dot-Matrix (All Pages) ── */}
          <TwinklingCornerStars />
          <ActionSuccessOverlay />
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
