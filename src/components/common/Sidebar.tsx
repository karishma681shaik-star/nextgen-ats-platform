import React from 'react';
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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, user } = useAuth();

  const candidateNavItems = [
    { label: 'Dashboard', path: '/candidate', icon: LayoutDashboard, exact: true },
    { label: 'My Profile', path: '/candidate/profile', icon: UserCheck },
    { label: 'Resume Management', path: '/candidate/resumes', icon: FileText },
    { label: 'AI Resume Parser', path: '/candidate/resume-parser', icon: ScanLine, highlight: true },
    { label: 'ATS Score Analysis', path: '/candidate/resume-analysis', icon: Gauge, highlight: true },
    { label: 'Explore & Recommended Jobs', path: '/candidate/jobs', icon: Briefcase },
    { label: 'My Applications', path: '/candidate/applications', icon: Layers },
    { label: 'Saved Jobs', path: '/candidate/saved-jobs', icon: Bookmark },
  ];

  const recruiterNavItems = [
    { label: 'Dashboard', path: '/recruiter', icon: LayoutDashboard, exact: true },
    { label: 'Company Profile', path: '/recruiter/company', icon: Building2 },
    { label: 'Job Postings', path: '/recruiter/jobs', icon: Briefcase },
    { label: 'Post New Job', path: '/recruiter/jobs/new', icon: PlusCircle, highlight: true },
    { label: 'Applicant Pipeline', path: '/recruiter/applicants', icon: Users, highlight: true },
  ];

  const adminNavItems = [
    { label: 'System Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Recruiter Verification', path: '/admin/recruiters', icon: ShieldCheck },
    { label: 'Job Moderation', path: '/admin/jobs', icon: CheckCircle },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3, highlight: true },
  ];

  const currentNavItems =
    role === 'candidate'
      ? candidateNavItems
      : role === 'recruiter'
      ? recruiterNavItems
      : adminNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 z-50 h-screen w-72 bg-slate-900 border-r border-slate-800/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}
      >
        {/* Top Branding Section in Mobile or Collapsed */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">AI ATS Platform</h2>
              <span className="text-[11px] text-indigo-400 uppercase font-bold tracking-wider capitalize">
                {role} Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Navigation Menu
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
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-indigo-400'
                          : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                    {item.highlight && !isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom User Card */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.title || user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
