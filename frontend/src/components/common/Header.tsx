import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Sparkles,
  User as UserIcon,
  LogOut,
  Settings,
  Search,
  Command,
  Shield,
  Briefcase,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Camera,
  Volume2,
  Building,
  Sliders,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleSwitcher } from './RoleSwitcher';
import { NotificationsDropdown } from './NotificationsDropdown';
import { Avatar } from '../ui/Avatar';
import { UserAvatarModal } from './UserAvatarModal';
import { ExperiencePreferencesModal } from './ExperiencePreferencesModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { cn } from '../../utils/cn';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, role, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileMenuOpen]);

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      sessionStorage.removeItem('ai_ats_play_intro_candidate');
      sessionStorage.removeItem('ai_ats_play_intro_recruiter');
      sessionStorage.removeItem('ai_ats_play_intro_admin');
      sessionStorage.removeItem('ai_ats_intro_seen_candidate');
      sessionStorage.removeItem('ai_ats_intro_seen_recruiter');
      sessionStorage.removeItem('ai_ats_intro_seen_admin');
      setShowLogoutConfirm(false);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getRoleTheme = () => {
    switch (role) {
      case 'recruiter':
        return {
          pill: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          dot: 'bg-purple-400',
        };
      case 'admin':
        return {
          pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
      case 'candidate':
      default:
        return {
          pill: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          dot: 'bg-indigo-400',
        };
    }
  };

  const roleTheme = getRoleTheme();

  return (
    <header className="sticky top-0 z-40 bg-[#060b18]/85 backdrop-blur-2xl border-b border-white/[0.08] px-4 lg:px-8 py-3 transition-all shadow-md">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          {/* Quick Command / Search Bar */}
          <div className="hidden sm:flex items-center gap-2.5 w-full bg-[#0a1024]/90 border border-white/10 rounded-xl px-3.5 py-1.5 text-slate-400 text-xs focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={
                role === 'recruiter'
                  ? 'Search candidates, skills, or job postings...'
                  : role === 'admin'
                  ? 'Search users, logs, or moderate listings...'
                  : 'Search open tech roles, skills, or companies...'
              }
              className="bg-transparent text-slate-200 placeholder:text-slate-500 text-xs w-full focus:outline-none"
            />
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/10 text-[9px] font-mono text-slate-400">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </div>
        </div>

        {/* Right Side: Role Persona Badge, Role Switcher, Notifications, User Menu */}
        <div className="flex items-center gap-2.5">
          <RoleSwitcher />
          <NotificationsDropdown />

          {/* Quick Experience & Voice Assistant Preferences */}
          <button
            type="button"
            onClick={() => setIsExpModalOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/[0.06] border border-transparent hover:border-slate-700/60 transition-all cursor-pointer"
            title="Experience & Voice Preferences"
            aria-label="Experience & Voice Preferences"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative flex items-center" ref={profileMenuRef}>
            {/* Unified Profile Trigger Button */}
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className={cn(
                'flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50',
                isProfileMenuOpen
                  ? 'bg-white/[0.08] border border-white/15'
                  : 'hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60'
              )}
              aria-label="User account menu"
              aria-haspopup="true"
              aria-expanded={isProfileMenuOpen}
            >
              <div className="relative shrink-0">
                <Avatar src={user?.avatar} name={user?.name || 'User'} size="md" status="online" />
              </div>

              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                  {user?.name || 'Authorized User'}
                </span>
                <span className={cn('text-[10px] font-semibold uppercase tracking-wider mt-0.5 inline-flex items-center gap-1', roleTheme.pill.split(' ')[1])}>
                  <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', roleTheme.dot)} />
                  {role}
                </span>
              </div>

              <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 hidden sm:inline transition-transform duration-200', isProfileMenuOpen && 'rotate-180')} />
            </button>

            {/* Dropdown Menu Container */}
            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  role="menu"
                  aria-label="User profile options"
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-2rem)] bg-[#0c1328]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/90 z-50 overflow-hidden text-left"
                >
                  {/* Profile Header */}
                  <div className="p-4 border-b border-white/[0.08] bg-white/[0.02]">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="relative shrink-0 group cursor-pointer"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsAvatarModalOpen(true);
                        }}
                        title="Click to edit profile photo"
                      >
                        <Avatar
                          src={user?.avatar}
                          name={user?.name || 'User'}
                          size="lg"
                          status="online"
                          className="ring-2 ring-white/10 group-hover:ring-indigo-500/60 transition-all duration-200"
                        />
                        <div className="absolute inset-0 rounded-full bg-black/45 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                          <Camera className="w-3.5 h-3.5 text-white drop-shadow" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-100 truncate tracking-tight" title={user?.name || 'Authorized User'}>
                            {user?.name || 'Authorized User'}
                          </p>
                        </div>

                        <div className="mt-1 flex items-center gap-2">
                          <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 inline-flex items-center gap-1.5', roleTheme.pill)}>
                            <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', roleTheme.dot)} />
                            {role === 'admin' ? 'ADMINISTRATOR' : role.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 font-mono truncate mt-1.5 block max-w-full" title={user?.email || 'No email registered'}>
                          {user?.email || 'authenticated@session'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Role-Aware Menu Options */}
                  <div className="p-2 space-y-1">
                    {/* Common Option: Edit Profile & Photo */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsAvatarModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150 hover:bg-white/[0.06] focus:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 group-hover:text-indigo-300 group-hover:scale-105 transition-all">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                          Edit Profile & Photo
                        </div>
                        <div className="text-[11px] text-slate-400 group-hover:text-slate-300 truncate leading-tight mt-0.5">
                          Update your name, picture, and personal details.
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>

                    {/* CANDIDATE ROLE OPTIONS */}
                    {role === 'candidate' && (
                      <Link
                        to="/candidate/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150 hover:bg-white/[0.06] focus:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 group-hover:text-indigo-300 group-hover:scale-105 transition-all">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                            Candidate Profile
                          </div>
                          <div className="text-[11px] text-slate-400 group-hover:text-slate-300 truncate leading-tight mt-0.5">
                            View and manage your professional candidate information.
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    )}

                    {/* RECRUITER ROLE OPTIONS */}
                    {role === 'recruiter' && (
                      <>
                        <Link
                          to="/recruiter/company"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150 hover:bg-white/[0.06] focus:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 group cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400 group-hover:text-purple-300 group-hover:scale-105 transition-all">
                            <Building className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                              Company Profile
                            </div>
                            <div className="text-[11px] text-slate-400 group-hover:text-slate-300 truncate leading-tight mt-0.5">
                              Manage company profile and branding assets.
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>

                        <Link
                          to="/recruiter/jobs"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150 hover:bg-white/[0.06] focus:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 group cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center shrink-0 text-fuchsia-400 group-hover:text-fuchsia-300 group-hover:scale-105 transition-all">
                            <Sliders className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                              Recruitment Preferences
                            </div>
                            <div className="text-[11px] text-slate-400 group-hover:text-slate-300 truncate leading-tight mt-0.5">
                              Manage job listings and candidate pipelines.
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>
                      </>
                    )}

                    {/* ADMINISTRATOR ROLE OPTIONS */}
                    {role === 'admin' && (
                      <Link
                        to="/admin/audit"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150 hover:bg-white/[0.06] focus:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 group-hover:text-emerald-300 group-hover:scale-105 transition-all">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                            Account & Security
                          </div>
                          <div className="text-[11px] text-slate-400 group-hover:text-slate-300 truncate leading-tight mt-0.5">
                            Review audit logs, system health, and security.
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    )}

                    {/* Experience & Audio (Available for Recruiter & Admin) */}
                    {role !== 'candidate' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsExpModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150 hover:bg-white/[0.06] focus:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400 group-hover:text-cyan-300 group-hover:scale-105 transition-all">
                          <Volume2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                            Experience & Audio
                          </div>
                          <div className="text-[11px] text-slate-400 group-hover:text-slate-300 truncate leading-tight mt-0.5">
                            Personalize voice assistance and interface preferences.
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    )}
                  </div>

                  {/* Restrained & Safe Sign Out Option */}
                  <div className="border-t border-white/[0.08] p-2 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150 hover:bg-rose-500/[0.08] focus:bg-rose-500/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 text-rose-400 group-hover:text-rose-300 group-hover:scale-105 transition-all">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-rose-300 group-hover:text-rose-200 transition-colors">
                          Sign Out
                        </div>
                        <div className="text-[11px] text-slate-400 group-hover:text-slate-300 truncate leading-tight mt-0.5">
                          Securely end your current session.
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-rose-400/50 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Recruiter / User Profile Photo Editor Modal */}
      <UserAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />

      {/* Experience & Voice Preferences Modal */}
      <ExperiencePreferencesModal
        isOpen={isExpModalOpen}
        onClose={() => setIsExpModalOpen(false)}
      />

      {/* Safe Sign Out Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out of Session"
        message="Are you sure you want to end your current authenticated session? Any unsaved edits will be discarded."
        confirmText="Sign Out"
        variant="danger"
        isLoading={isLoggingOut}
      />
    </header>
  );
};
