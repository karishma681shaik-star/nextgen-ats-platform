import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { FloatingActionHub } from '../components/common/FloatingActionHub';
import { BackgroundEffects } from '../components/ui/BackgroundEffects';
import { AICursor } from '../components/ui/AICursor';

export const CandidateLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex relative overflow-x-hidden">
      <AICursor />
      <BackgroundEffects role="candidate" />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 sm:pb-28 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>

      {/* Coordinated Floating Actions (Copilot AI & Report Issue) */}
      <FloatingActionHub />
    </div>
  );
};

