import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  FileText,
  ScanLine,
  Gauge,
  Briefcase,
  Layers,
  Bookmark,
  Building2,
  PlusCircle,
  Users,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  ChevronRight,
  Zap,
  Bot,
  Camera,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatarModal } from './UserAvatarModal';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  group: string;
  highlight?: boolean;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, user } = useAuth();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const candidateNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/candidate', icon: LayoutDashboard, exact: true, group: 'overview' },
    { label: 'My Profile', path: '/candidate/profile', icon: UserCheck, group: 'profile' },
    { label: 'Resume Management', path: '/candidate/resumes', icon: FileText, group: 'profile' },
    { label: 'Explore Jobs', path: '/candidate/jobs', icon: Briefcase, group: 'jobs' },
    { label: 'My Applications', path: '/candidate/applications', icon: Layers, group: 'jobs' },
    { label: 'Saved Jobs', path: '/candidate/saved-jobs', icon: Bookmark, group: 'jobs' },
  ];

  const recruiterNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/recruiter', icon: LayoutDashboard, exact: true, group: 'overview' },
    { label: 'Company Profile', path: '/recruiter/company', icon: Building2, group: 'company' },
    { label: 'Verification Center', path: '/recruiter/verification', icon: ShieldCheck, group: 'company' },
    { label: 'Job Postings', path: '/recruiter/jobs', icon: Briefcase, group: 'jobs' },
    { label: 'Applicant Pipeline', path: '/recruiter/applicants', icon: Users, group: 'pipeline' },
  ];

  const adminNavItems: NavItem[] = [
    { label: 'System Overview', path: '/admin', icon: LayoutDashboard, exact: true, group: 'overview' },
    { label: 'User Management', path: '/admin/users', icon: Users, group: 'users' },
    { label: 'Recruiter Verification', path: '/admin/recruiters', icon: ShieldCheck, group: 'users' },
    { label: 'Job Moderation', path: '/admin/jobs', icon: CheckCircle, group: 'content' },
    { label: 'Audit & Security', path: '/admin/audit', icon: ShieldAlert, highlight: true, badge: 'SEC', group: 'security' },
  ];

  const currentNavItems: NavItem[] =
    role === 'candidate'
      ? candidateNavItems
      : role === 'recruiter'
      ? recruiterNavItems
      : adminNavItems;

  // Role-specific accent colors
  const roleAccent =
    role === 'recruiter'
      ? 'from-purple-600 to-indigo-600'
      : role === 'admin'
      ? 'from-emerald-600 to-teal-600'
      : 'from-indigo-600 via-purple-600 to-cyan-500';

  const roleBadgeColor =
    role === 'recruiter'
      ? 'text-purple-300 bg-purple-500/15 border-purple-500/30'
      : role === 'admin'
      ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
      : 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30';

  const highlightIconColor =
    role === 'recruiter'
      ? 'text-purple-400'
      : role === 'admin'
      ? 'text-emerald-400'
      : 'text-cyan-400';

  const badgeBg =
    role === 'recruiter'
      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      : role === 'admin'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#040711]/85 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 z-50 h-screen w-72 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
          'bg-[#060a17]/95 backdrop-blur-3xl border-r border-white/[0.08] relative overflow-hidden',
          isOpen ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full'
        )}
      >
        {/* Subtle Ambient Depth Lighting within the Sidebar */}
        <div className="absolute top-20 -left-14 w-40 h-40 bg-purple-600/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-36 -left-10 w-36 h-36 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-1/2 -right-16 w-36 h-36 bg-indigo-500/[0.06] blur-3xl pointer-events-none rounded-full" />

        {/* Top Accent Line */}
        <div className={cn('h-[2px] w-full bg-gradient-to-r opacity-90 shadow-[0_0_12px_rgba(99,102,241,0.5)]', roleAccent)} />

        {/* Top Branding Section */}
        <div className="p-4.5 sm:p-5 border-b border-white/[0.08] flex items-center gap-3 relative overflow-hidden z-10">
          {/* Subtle ambient light */}
          <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />

          <div className={cn('w-10 h-10 rounded-2xl bg-gradient-to-tr flex items-center justify-center text-white shadow-[0_0_22px_rgba(99,102,241,0.55),inset_0_1px_1.5px_rgba(255,255,255,0.4)] border border-white/25 shrink-0 relative group', roleAccent)}>
            <Sparkles className="w-5 h-5 animate-pulse text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.85)]" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-black text-white font-display tracking-tight truncate flex items-center gap-1.5">
              <span>AI ATS Platform</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </h2>
            <span className={cn('text-[9px] uppercase font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 mt-0.5 shadow-xs', roleBadgeColor)}>
              <span className="w-1 h-1 rounded-full bg-cyan-400" />
              {role} Portal
            </span>
          </div>
        </div>

        {/* Prominent Action Button for Recruiter */}
        {role === 'recruiter' && (
          <div className="px-3 pt-4 pb-1 relative z-10">
            <NavLink
              to="/recruiter/jobs/new"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-purple-500/20 active:scale-[0.98] border border-purple-400/30"
            >
              <PlusCircle className="w-4 h-4 text-purple-200" />
              <span>+ Post a Job</span>
            </NavLink>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 relative z-10">
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1 text-[9px] uppercase font-mono font-bold tracking-widest text-slate-400">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]"></span>
              </span>
              <span className="text-slate-300 font-semibold tracking-wider">WORKSPACE NAVIGATION</span>
            </div>
            <span className="text-[8px] font-mono text-cyan-400/80 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded">v2.4</span>
          </div>

          {currentNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 relative overflow-hidden',
                    isActive
                      ? 'sidebar-nav-active-shine text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-gradient-to-r hover:from-white/[0.06] hover:to-white/[0.02] hover:border hover:border-white/[0.08]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Left Precision Luminous Indicator Bar */}
                    {isActive && (
                      <span
                        className={cn(
                          'absolute left-0 top-1.5 bottom-1.5 w-[3.5px] rounded-r-full shadow-xs',
                          role === 'recruiter'
                            ? 'bg-gradient-to-b from-purple-400 to-indigo-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                            : role === 'admin'
                            ? 'bg-gradient-to-b from-emerald-400 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                            : 'bg-gradient-to-b from-cyan-400 via-violet-400 to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                        )}
                      />
                    )}

                    {/* Refined Jewel Icon Container */}
                    {isActive ? (
                      <div
                        className={cn(
                          'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]',
                          role === 'recruiter'
                            ? 'bg-purple-500/20 border-purple-400/40 text-purple-200 shadow-[0_0_14px_rgba(168,85,247,0.4)]'
                            : role === 'admin'
                            ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200 shadow-[0_0_14px_rgba(52,211,153,0.4)]'
                            : 'bg-gradient-to-br from-violet-600/30 via-indigo-600/25 to-purple-900/35 border-violet-400/40 text-violet-200 shadow-[0_0_14px_rgba(139,92,246,0.4)]'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-slate-400 bg-white/[0.02] border border-white/[0.06] group-hover:text-cyan-300 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 group-hover:shadow-[0_0_10px_rgba(6,182,212,0.25)] group-hover:scale-105 transition-all duration-200">
                        <Icon
                          className={cn(
                            'w-4 h-4 transition-transform',
                            item.highlight ? highlightIconColor : ''
                          )}
                        />
                      </div>
                    )}

                    <span
                      className={cn(
                        'flex-1 truncate tracking-tight transition-all text-[12.5px]',
                        isActive ? 'font-semibold text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.25)]' : 'font-medium'
                      )}
                    >
                      {item.label}
                    </span>

                    {/* Badge */}
                    {item.badge && !isActive && (
                      <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-bold uppercase font-mono tracking-wider border', badgeBg)}>
                        {item.badge}
                      </span>
                    )}

                    {/* Active Subtle Chevron Indicator */}
                    {isActive && (
                      <ChevronRight
                        className={cn(
                          'w-4 h-4 shrink-0 opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all',
                          role === 'recruiter'
                            ? 'text-purple-300'
                            : role === 'admin'
                            ? 'text-emerald-300'
                            : 'text-violet-300'
                        )}
                      />
                    )}

                    {/* Pulsing dot for highlight items */}
                    {item.highlight && !isActive && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', highlightIconColor.replace('text-', 'bg-'))} />
                        <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', highlightIconColor.replace('text-', 'bg-'))} />
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom System Status HUD Card */}
        <div className="px-3 pb-3 relative z-10">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-[#0b1329]/95 via-[#0e1736]/90 to-[#080d1e]/95 border border-cyan-500/35 shadow-[0_0_20px_rgba(6,182,212,0.18),inset_0_1px_1px_rgba(255,255,255,0.12)] group hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.28)] transition-all">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)] shrink-0">
              <Bot className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white leading-tight">AI ATS Recruitment</p>
              <p className="text-[9px] text-emerald-400 font-mono font-medium truncate flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,1)]" />
                System Operational
              </p>
            </div>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]"></span>
            </span>
          </div>
        </div>

        {/* Bottom User Card - Editable Profile Picture */}
        <div className="p-3 border-t border-white/[0.08] relative z-10">
          <div
            onClick={() => setIsAvatarModalOpen(true)}
            className="flex items-center gap-3 p-2.5 rounded-2xl bg-gradient-to-b from-[#11182e]/90 to-[#090d1c]/95 border border-white/[0.12] hover:border-purple-400/50 hover:shadow-[0_0_24px_rgba(168,85,247,0.25),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-300 cursor-pointer group"
            title="Click to edit profile & photo"
          >
            {user?.avatar ? (
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 ring-2 ring-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-4 h-4 text-cyan-300" />
                </div>
                {/* Small online green dot on avatar */}
                <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900 shadow-[0_0_6px_rgba(52,211,153,1)]" />
              </div>
            ) : (
              <div className={cn('relative w-10 h-10 rounded-xl bg-gradient-to-tr flex items-center justify-center font-bold text-xs text-white shrink-0 group-hover:scale-105 transition-transform ring-2 ring-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.35)]', roleAccent)}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
                <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900 shadow-[0_0_6px_rgba(52,211,153,1)]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-cyan-200 transition-colors">
                {user?.name || 'Authorized User'}
              </p>
              <p className="text-[10.5px] text-slate-400 truncate mt-0.5">{user?.title || user?.email}</p>
            </div>
            <Camera className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition-colors opacity-0 group-hover:opacity-100 shrink-0" />
          </div>
        </div>
      </aside>

      {/* Recruiter / User Profile Photo Editor Modal */}
      <UserAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </>
  );
};
