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
  BarChart3,
  Sparkles,
  ChevronRight,
  Zap,
  Bot,
  Camera
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
    { label: 'Job Postings', path: '/recruiter/jobs', icon: Briefcase, group: 'jobs' },
    { label: 'Post New Job', path: '/recruiter/jobs/new', icon: PlusCircle, highlight: true, badge: 'NEW', group: 'jobs' },
    { label: 'Applicant Pipeline', path: '/recruiter/applicants', icon: Users, highlight: true, badge: 'PRO', group: 'pipeline' },
  ];

  const adminNavItems: NavItem[] = [
    { label: 'System Overview', path: '/admin', icon: LayoutDashboard, exact: true, group: 'overview' },
    { label: 'User Management', path: '/admin/users', icon: Users, group: 'users' },
    { label: 'Recruiter Verification', path: '/admin/recruiters', icon: ShieldCheck, group: 'users' },
    { label: 'Job Moderation', path: '/admin/jobs', icon: CheckCircle, group: 'content' },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3, highlight: true, badge: 'LIVE', group: 'content' },
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
      : 'from-indigo-600 to-cyan-600';

  const roleBadgeColor =
    role === 'recruiter'
      ? 'text-purple-300 bg-purple-500/15 border-purple-500/30'
      : role === 'admin'
      ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
      : 'text-indigo-300 bg-indigo-500/15 border-indigo-500/30';

  const activeNavBg =
    role === 'recruiter'
      ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 shadow-glow-purple text-white font-bold'
      : role === 'admin'
      ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 shadow-glow-emerald text-white font-bold'
      : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 shadow-glow text-white font-bold';

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
        <div className="p-5 border-b border-white/[0.08] flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-tr flex items-center justify-center text-white shadow-glow shrink-0', roleAccent)}>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-extrabold text-white font-display tracking-tight truncate">AI ATS Platform</h2>
            <span className={cn('text-[9px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 rounded border inline-block mt-0.5', roleBadgeColor)}>
              {role} Portal
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[9px] uppercase font-mono font-bold tracking-widest text-slate-500">
            WORKSPACE NAVIGATION
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
                      ? activeNavBg
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-transform duration-200',
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? highlightIconColor
                          : 'text-slate-400 group-hover:text-slate-200',
                        !isActive && 'group-hover:scale-110'
                      )}
                    />
                    <span className="flex-1 truncate">{item.label}</span>

                    {/* Badge */}
                    {item.badge && !isActive && (
                      <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-bold uppercase font-mono tracking-wider border', badgeBg)}>
                        {item.badge}
                      </span>
                    )}

                    {/* Active Arrow Indicator */}
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" />
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
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10">
            <Bot className={cn('w-4 h-4 shrink-0', highlightIconColor)} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white">AI ATS Recruitment</p>
              <p className="text-[9px] text-emerald-400 font-medium truncate">System Operational</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* Bottom User Card - Editable Profile Picture */}
        <div className="p-3 border-t border-white/[0.08]">
          <div
            onClick={() => setIsAvatarModalOpen(true)}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-purple-500/30 transition-all cursor-pointer group"
            title="Click to edit profile photo"
          >
            {user?.avatar ? (
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-3 h-3 text-purple-300" />
                </div>
              </div>
            ) : (
              <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-tr flex items-center justify-center font-bold text-xs text-white shrink-0 group-hover:scale-105 transition-transform', roleAccent)}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                {user?.name || 'Authorized User'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.title || user?.email}</p>
            </div>
            <Camera className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0" />
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
