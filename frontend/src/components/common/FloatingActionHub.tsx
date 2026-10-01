import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bug,
  Sparkles,
  Sliders,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  X,
  RotateCcw,
  Check,
  Keyboard,
  Compass,
  Palette
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TalentPilotCopilot } from './TalentPilotCopilot';
import { ReportIssue } from './ReportIssue';
import { cn } from '../../utils/cn';

export interface HubPreferences {
  viewMode: 'compact' | 'minimized' | 'expanded';
  position: 'bottom-right' | 'bottom-left' | 'bottom-center';
  style: 'glass' | 'stealth' | 'glow';
  showFeedback: boolean;
}

const DEFAULT_PREFS: HubPreferences = {
  viewMode: 'compact',
  position: 'bottom-right',
  style: 'glass',
  showFeedback: true,
};

const STORAGE_KEY = 'ats_action_hub_preferences';

export const FloatingActionHub: React.FC = () => {
  const { role } = useAuth();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load preferences from localStorage
  const [prefs, setPrefs] = useState<HubPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PREFS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load hub preferences', e);
    }
    return DEFAULT_PREFS;
  });

  const settingsRef = useRef<HTMLDivElement>(null);

  // Save preferences
  const updatePrefs = (newPrefs: Partial<HubPreferences>) => {
    setPrefs((prev) => {
      const updated = { ...prev, ...newPrefs };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save hub preferences', e);
      }
      return updated;
    });
  };

  // Close settings on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsOpen]);

  // Global hotkeys:
  // Alt+C for Copilot, Alt+R for Report Issue, Alt+H for Toggle Clear View
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setIsCopilotOpen((prev) => !prev);
      }
      if (e.altKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        setIsReportIssueOpen(true);
      }
      if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        updatePrefs({
          viewMode: prefs.viewMode === 'minimized' ? 'compact' : 'minimized',
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prefs.viewMode]);

  // Position styles
  const getPositionClass = () => {
    switch (prefs.position) {
      case 'bottom-left':
        return 'bottom-5 left-5 lg:left-72';
      case 'bottom-center':
        return 'bottom-5 left-1/2 -translate-x-1/2';
      case 'bottom-right':
      default:
        return 'bottom-5 right-5';
    }
  };

  // Visual container styles
  const getStyleClass = () => {
    switch (prefs.style) {
      case 'stealth':
        return 'opacity-40 hover:opacity-100 transition-opacity duration-300';
      case 'glow':
        return 'shadow-[0_0_25px_rgba(99,102,241,0.35)]';
      case 'glass':
      default:
        return 'shadow-2xl hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]';
    }
  };

  return (
    <>
      {/* Floating Action Controls */}
      <AnimatePresence>
        {!isCopilotOpen && (
          <motion.aside
            aria-label="Floating Action Controls"
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={cn(
              'fixed z-40 flex items-center select-none',
              getPositionClass(),
              getStyleClass()
            )}
          >
            {/* ── MODE 1: MINIMIZED / CLEAR VIEW ────────────────── */}
            {prefs.viewMode === 'minimized' && (
              <div className="relative group">
                <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#0a0f1d]/90 hover:bg-[#11182c] border border-white/15 hover:border-indigo-500/50 backdrop-blur-2xl transition-all shadow-xl">
                  {/* Minimized Orb Button: Click opens Copilot */}
                  <button
                    type="button"
                    onClick={() => setIsCopilotOpen(true)}
                    title={`Open AI Copilot (Alt+C) • Clear View Active`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-600/80 to-purple-600/80 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                    <span className="hidden sm:inline">Copilot</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </button>

                  {/* Restore / Expand Button */}
                  <button
                    type="button"
                    onClick={() => updatePrefs({ viewMode: 'compact' })}
                    title="Expand Action Hub (Alt+H)"
                    className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Settings quick icon */}
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    title="Customize Hub"
                    className="p-1.5 rounded-full text-slate-400 hover:text-indigo-300 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Floating Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                  <div className="px-2.5 py-1 text-[11px] font-medium text-slate-200 bg-slate-900/95 border border-white/10 rounded-lg shadow-xl whitespace-nowrap backdrop-blur-md">
                    Clear View Mode • Click to expand (Alt+H)
                  </div>
                </div>
              </div>
            )}

            {/* ── MODE 2: COMPACT DOCK (DEFAULT & CLEAN) ─────────── */}
            {prefs.viewMode === 'compact' && (
              <div className="relative group">
                <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#0a0f1d]/90 hover:bg-[#0e1426]/95 border border-white/15 hover:border-white/25 backdrop-blur-2xl transition-all shadow-2xl">
                  {/* AI Copilot Primary Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsCopilotOpen(true)}
                    title={`Open ${role || 'AI'} Copilot (Alt+C)`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-600/90 via-indigo-700/90 to-purple-600/90 hover:from-indigo-500 hover:to-purple-500 border border-indigo-400/40 text-white text-xs font-semibold shadow-md hover:shadow-indigo-500/25 transition-all duration-150 active:scale-95 cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center border border-white/20">
                      <Sparkles className="w-3 h-3 text-cyan-200" />
                    </div>
                    <span>AI Copilot</span>
                    <span className="flex h-2 w-2 relative ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                  </button>

                  {/* Feedback / Bug Report Button */}
                  {prefs.showFeedback && (
                    <button
                      type="button"
                      onClick={() => setIsReportIssueOpen(true)}
                      title="Report issue or feedback (Alt+R)"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 text-xs font-medium transition-all active:scale-95 cursor-pointer"
                    >
                      <Bug className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span className="hidden sm:inline">Feedback</span>
                    </button>
                  )}

                  {/* Small vertical divider */}
                  <div className="w-[1px] h-4 bg-white/15 mx-0.5" />

                  {/* Clear View Toggle Button (Instant Minimization) */}
                  <button
                    type="button"
                    onClick={() => updatePrefs({ viewMode: 'minimized' })}
                    title="Clear View: Minimize Hub to clear screen (Alt+H)"
                    className="p-1.5 rounded-full text-slate-400 hover:text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Clear View"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>

                  {/* Customization Settings Button */}
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    title="Customize Floating Hub"
                    className={cn(
                      'p-1.5 rounded-full transition-colors cursor-pointer',
                      isSettingsOpen
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-indigo-300 hover:bg-white/10'
                    )}
                    aria-label="Customize Hub"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── MODE 3: EXPANDED BANNERS (POLISHED) ───────────── */}
            {prefs.viewMode === 'expanded' && (
              <div className="flex items-center gap-2.5">
                {/* 1. Report Issue Pill */}
                {prefs.showFeedback && (
                  <button
                    type="button"
                    onClick={() => setIsReportIssueOpen(true)}
                    title="Report a bug or UI feedback (Alt+R)"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0a0f1d]/90 hover:bg-[#12192f] border border-fuchsia-500/40 hover:border-fuchsia-400 text-white text-xs font-medium shadow-lg backdrop-blur-xl transition-all cursor-pointer active:scale-95"
                  >
                    <div className="w-5 h-5 rounded-full bg-fuchsia-600/30 border border-fuchsia-400/50 flex items-center justify-center">
                      <Bug className="w-3 h-3 text-fuchsia-300" />
                    </div>
                    <span>Report Issue</span>
                  </button>
                )}

                {/* 2. AI Copilot Pill */}
                <button
                  type="button"
                  onClick={() => setIsCopilotOpen(true)}
                  title={`Open ${role || 'AI'} Copilot (Alt+C)`}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-900/90 via-[#13193e]/90 to-purple-900/90 hover:from-indigo-800 hover:to-purple-800 border border-indigo-500/50 hover:border-cyan-400/70 text-white shadow-lg backdrop-blur-xl transition-all cursor-pointer active:scale-95"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white border border-white/40">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold leading-tight">TalentPilot AI</span>
                    <span className="text-[10px] text-indigo-300 font-medium leading-tight">
                      {role || 'Recruiter'} Copilot
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
                </button>

                {/* Mini Control Dock for Expanded Mode */}
                <div className="flex items-center gap-1 p-1 rounded-full bg-[#0a0f1d]/90 border border-white/15 backdrop-blur-xl shadow-lg">
                  <button
                    type="button"
                    onClick={() => updatePrefs({ viewMode: 'minimized' })}
                    title="Clear View (Alt+H)"
                    className="p-1.5 rounded-full text-slate-400 hover:text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    title="Customize Hub"
                    className="p-1.5 rounded-full text-slate-400 hover:text-indigo-300 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── CUSTOMIZATION SETTINGS POPOVER ─────────────────── */}
            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div
                  ref={settingsRef}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute bottom-full mb-3 w-80 rounded-2xl bg-[#0b0f1d]/95 border border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl p-4 text-white z-50',
                    prefs.position === 'bottom-right' && 'right-0',
                    prefs.position === 'bottom-left' && 'left-0',
                    prefs.position === 'bottom-center' && 'left-1/2 -translate-x-1/2'
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
                        <Sliders className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold tracking-wide">Customize Action Hub</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="py-3 space-y-3.5 text-xs">
                    {/* View Mode */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Display Mode
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5">
                        <button
                          type="button"
                          onClick={() => updatePrefs({ viewMode: 'compact' })}
                          className={cn(
                            'py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-center',
                            prefs.viewMode === 'compact'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          )}
                        >
                          Compact
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePrefs({ viewMode: 'minimized' })}
                          className={cn(
                            'py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-center flex items-center justify-center gap-1',
                            prefs.viewMode === 'minimized'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          )}
                        >
                          <EyeOff className="w-3 h-3" />
                          Clear View
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePrefs({ viewMode: 'expanded' })}
                          className={cn(
                            'py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-center',
                            prefs.viewMode === 'expanded'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          )}
                        >
                          Full
                        </button>
                      </div>
                    </div>

                    {/* Position */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Dock Position
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5">
                        <button
                          type="button"
                          onClick={() => updatePrefs({ position: 'bottom-left' })}
                          className={cn(
                            'py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-center',
                            prefs.position === 'bottom-left'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          )}
                        >
                          Left
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePrefs({ position: 'bottom-center' })}
                          className={cn(
                            'py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-center',
                            prefs.position === 'bottom-center'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          )}
                        >
                          Center
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePrefs({ position: 'bottom-right' })}
                          className={cn(
                            'py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-center',
                            prefs.position === 'bottom-right'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          )}
                        >
                          Right
                        </button>
                      </div>
                    </div>

                    {/* Visual Style */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Visual Appearance
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5">
                        <button
                          type="button"
                          onClick={() => updatePrefs({ style: 'glass' })}
                          className={cn(
                            'py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-center',
                            prefs.style === 'glass'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          )}
                        >
                          Clean Glass
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePrefs({ style: 'stealth' })}
                          className={cn(
                            'py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-center',
                            prefs.style === 'stealth'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          )}
                        >
                          Auto-Dim
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePrefs({ style: 'glow' })}
                          className={cn(
                            'py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-center',
                            prefs.style === 'glow'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          )}
                        >
                          Vibrant
                        </button>
                      </div>
                    </div>

                    {/* Component Toggles */}
                    <div className="pt-1">
                      <label className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/5 cursor-pointer hover:bg-white/[0.03] transition-colors">
                        <span className="text-slate-300">Show Feedback Button</span>
                        <input
                          type="checkbox"
                          checked={prefs.showFeedback}
                          onChange={(e) => updatePrefs({ showFeedback: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </label>
                    </div>

                    {/* Hotkey Shortcuts Info */}
                    <div className="p-2 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-slate-300 space-y-1">
                      <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                        <Keyboard className="w-3 h-3" /> Shortcuts:
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Toggle Copilot</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-slate-200 font-mono text-[10px] border border-white/10">Alt+C</kbd>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Report Issue</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-slate-200 font-mono text-[10px] border border-white/10">Alt+R</kbd>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Toggle Clear View</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-slate-200 font-mono text-[10px] border border-white/10">Alt+H</kbd>
                      </div>
                    </div>
                  </div>

                  {/* Reset Defaults Footer */}
                  <div className="pt-2.5 border-t border-white/10 flex justify-end">
                    <button
                      type="button"
                      onClick={() => updatePrefs(DEFAULT_PREFS)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset to defaults
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Floating Report Issue button when Copilot is open on desktop screens */}
      <AnimatePresence>
        {isCopilotOpen && prefs.showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="fixed bottom-5 right-[444px] z-40 hidden xl:flex items-center"
          >
            <button
              type="button"
              onClick={() => setIsReportIssueOpen(true)}
              title="Report an issue or bug (Alt+R)"
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0a0f1d]/90 hover:bg-[#12192f] border border-fuchsia-500/40 hover:border-fuchsia-400 text-white shadow-xl backdrop-blur-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-fuchsia-600/30 flex items-center justify-center text-fuchsia-300">
                <Bug className="w-3 h-3" />
              </div>
              <span>Report Issue</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TalentPilot Copilot Drawer */}
      <TalentPilotCopilot
        isOpen={isCopilotOpen}
        onOpenChange={setIsCopilotOpen}
        hideTriggerButton={true}
      />

      {/* Report Issue Modal */}
      <ReportIssue
        isOpen={isReportIssueOpen}
        onOpenChange={setIsReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
        hideFloatingButton={true}
      />
    </>
  );
};
