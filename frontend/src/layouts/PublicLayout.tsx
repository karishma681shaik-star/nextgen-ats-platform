import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from '../components/landing/PublicNavbar';
import { Footer } from '../components/common/Footer';
import { BackgroundEffects } from '../components/ui/BackgroundEffects';
import { AICursor } from '../components/ui/AICursor';
import { ReportIssue } from '../components/common/ReportIssue';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      <BackgroundEffects role="public" showHudLabels={false} />

      {/* AI Recruitment Scanner Cursor Interaction Layer */}
      <AICursor />

      {/* Sticky High-End Public Navigation */}
      <PublicNavbar />

      {/* Main Public Content Area */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      {/* Structured Public Footer */}
      <Footer />

      {/* Floating Report Issue Button */}
      <ReportIssue />
    </div>
  );
};

