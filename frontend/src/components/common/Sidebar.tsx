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
          'bg-[#060b18]/95 backdrop-blur-2xl border-r border-white/[0.08]',
          isOpen ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full'
        )}
      >
        {/* Top Accent Line */}
        <div className={cn('h-1 w-full bg-gradient-to-r opacity-90', roleAccent)} />

        {/* Top Branding Section */}
        <div className="p-5 border-b border-white/[0.08] flex items-center gap-3 relative overflow-hidden">
          {/* Subtle ambient light */}
          <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />

          <div className={cn('w-11 h-11 rounded-2xl bg-gradient-to-tr flex items-center justify-center text-white shadow-[0_0_22px_rgba(99,102,241,0.5),inset_0_1px_1.5px_rgba(255,255,255,0.4)] border border-white/25 shrink-0 relative group', roleAccent)}>
            <Sparkles className="w-5 h-5 animate-pulse text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.85)]" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-black text-white font-display tracking-tight truncate flex items-center gap-1.5">
              <span>AI ATS Platform</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </h2>
            <span className={cn('text-[9px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded-md border inline-block mt-0.5 shadow-xs', roleBadgeColor)}>
              {role} Portal
            </span>
          </div>
        </div>

        {/* Prominent Action Button for Recruiter */}
        {role === 'recruiter' && (
          <div className="px-3 pt-4 pb-1">
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
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          <div className="flex items-center gap-2 px-3 pb-2 text-[9px] uppercase font-mono font-bold tracking-widest text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
            <span>WORKSPACE NAVIGATION</span>
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
                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 relative',
                    isActive
                      ? 'sidebar-nav-active-shine text-white font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Animated 3D Holographic Icon Object when Selected */}
                    {isActive ? (
                      <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-white/35 via-white/15 to-transparent border border-white/50 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(255,255,255,0.45),inset_0_1px_1.5px_rgba(255,255,255,0.7)] sidebar-icon-glow">
                        <Icon className="w-4 h-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.95)]" />
                        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-80" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,1)]" />
                        </span>
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-slate-400 group-hover:text-slate-200 group-hover:bg-white/[0.04] transition-all">
                        <Icon
                          className={cn(
                            'w-4 h-4 transition-transform group-hover:scale-115',
                            item.highlight ? highlightIconColor : ''
                          )}
                        />
                      </div>
                    )}

                    <span
                      className={cn(
                        'flex-1 truncate tracking-tight transition-all',
                        isActive
                          ? 'font-extrabold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]'
                          : 'font-medium'
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

                    {/* Active Animated Arrow / Beacon Indicator */}
                    {isActive && (
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,1)] animate-pulse" />
                        <ChevronRight className="w-4 h-4 text-cyan-200 drop-shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
                      </div>
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

        {/* Bottom System Status Pill */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-slate-900/90 to-[#0c142b]/95 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15),inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xs">
              <Bot className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white leading-tight">AI ATS Recruitment</p>
              <p className="text-[9px] text-emerald-400 font-mono font-medium truncate flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                System Operational
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
          </div>
        </div>

        {/* Bottom User Card - Editable Profile Picture */}
        <div className="p-3 border-t border-white/[0.08]">
          <div
            onClick={() => setIsAvatarModalOpen(true)}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-white/[0.10] hover:border-cyan-400/40 hover:bg-slate-900/95 shadow-sm hover:shadow-[0_0_16px_rgba(6,182,212,0.2)] transition-all cursor-pointer group"
            title="Click to edit profile & photo"
          >
            {user?.avatar ? (
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 ring-1 ring-cyan-500/40 shadow-xs">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-3.5 h-3.5 text-cyan-300" />
                </div>
              </div>
            ) : (
              <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-tr flex items-center justify-center font-bold text-xs text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs', roleAccent)}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                {user?.name || 'Authorized User'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.title || user?.email}</p>
            </div>
            <Camera className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0" />
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
