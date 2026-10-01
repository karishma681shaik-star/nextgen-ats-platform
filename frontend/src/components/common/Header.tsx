import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Sparkles,
  User as UserIcon,
  LogOut,
  FileText,
  Settings,
  Search,
  Command,
  Shield,
  Briefcase,
  ChevronDown,
  Camera
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleSwitcher } from './RoleSwitcher';
import { NotificationsDropdown } from './NotificationsDropdown';
import { Avatar } from '../ui/Avatar';
import { UserAvatarModal } from './UserAvatarModal';
import { cn } from '../../utils/cn';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, role, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
        <div className="flex items-center gap-3">
          <RoleSwitcher />
          <NotificationsDropdown />

          {/* User Profile Dropdown */}
          <div className="relative flex items-center" ref={profileMenuRef}>
            <div className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/[0.06] transition-colors border border-transparent hover:border-white/10">
              {/* Direct Avatar Clicker with Camera Badge */}
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsAvatarModalOpen(true);
                }}
                className="relative group/avatar shrink-0 cursor-pointer p-0.5 rounded-full hover:ring-2 hover:ring-purple-500/50 transition-all"
                title="Click to change profile photo"
                aria-label="Change profile photo"
              >
                <Avatar src={user?.avatar} name={user?.name || 'User'} size="md" status="online" />
                <span className="absolute -bottom-0.5 -right-0.5 p-1 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-md border border-[#060b18] group-hover/avatar:scale-115 transition-transform">
                  <Camera className="w-2.5 h-2.5" />
                </span>
              </button>

              {/* Menu Toggle for Dropdown */}
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 text-left cursor-pointer pr-1"
                aria-label="Toggle user menu"
                aria-expanded={isProfileMenuOpen}
              >
                <div className="hidden md:flex flex-col">
                  <span className="text-xs font-bold text-white leading-none">{user?.name || 'Authorized User'}</span>
                  <span className={cn('text-[10px] font-bold uppercase tracking-wider capitalize mt-0.5 inline-flex items-center gap-1', roleTheme.pill.split(' ')[1])}>
                    <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', roleTheme.dot)} />
                    {role}
                  </span>
                </div>
                <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 hidden sm:inline transition-transform duration-200', isProfileMenuOpen && 'rotate-180')} />
              </button>
            </div>

            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-[#0a0f1d] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150 glass-card-elevated"
              >
                {/* User Info Header with Quick Edit Photo Trigger */}
                <div className="p-3.5 border-b border-white/[0.08] bg-white/[0.02] flex items-center gap-3">
                  <div
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsAvatarModalOpen(true);
                    }}
                    className="relative group/avatar cursor-pointer shrink-0"
                    title="Click to edit profile photo"
                  >
                    <Avatar src={user?.avatar} name={user?.name || 'User'} size="md" status="online" />
                    <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[1px]">
                      <Camera className="w-3.5 h-3.5 text-purple-300" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-white truncate">{user?.name || 'Authorized User'}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsAvatarModalOpen(true);
                        }}
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all cursor-pointer"
                        title="Edit profile photo"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                  </div>
                </div>

                <div className="py-1">
                  {/* Change Profile Photo Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsAvatarModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-purple-300 hover:text-white hover:bg-purple-500/10 transition-colors text-left cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-purple-400" />
                    <span>Change Profile Photo</span>
                  </button>

                  {role === 'candidate' && (
                    <>
                      <Link
                        to="/candidate/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-indigo-400" />
                        <span>Candidate Profile</span>
                      </Link>
                      <Link
                        to="/candidate/resumes"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <span>Resume Management</span>
                      </Link>
                    </>
                  )}
                  {role === 'recruiter' && (
                    <>
                      <Link
                        to="/recruiter/company"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <Settings className="w-4 h-4 text-purple-400" />
                        <span>Company Branding</span>
                      </Link>
                      <Link
                        to="/recruiter/jobs/new"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <Briefcase className="w-4 h-4 text-fuchsia-400" />
                        <span>Create Job Listing</span>
                      </Link>
                    </>
                  )}
                  {role === 'admin' && (
                    <Link
                      to="/admin/analytics"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Platform Analytics</span>
                    </Link>
                  )}
                </div>

                <div className="border-t border-white/[0.08] pt-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recruiter / User Profile Photo Editor Modal */}
      <UserAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </header>
  );
};
