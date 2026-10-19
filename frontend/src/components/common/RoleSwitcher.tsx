import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Role } from '../../types';
import { UserCheck, Building2, ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/cn';

interface RoleSwitcherProps {
  className?: string;
  defaultNeutral?: boolean;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ className, defaultNeutral = true }) => {
  const { user, role, switchRole, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Neutral initial state when unauthenticated or requested:
  // Neither Candidate, Recruiter, nor Admin is highlighted until explicitly chosen by visitor.
  const [selectedRole, setSelectedRole] = useState<Role | null>(
    isAuthenticated && user ? role : defaultNeutral ? null : role
  );

  const handleRoleChange = async (newRole: Role) => {
    setSelectedRole(newRole);

    if (isAuthenticated && newRole === role) return;

    try {
      const switchedUser = await switchRole(newRole);
      showToast({
        type: 'info',
        title: `Switched to ${newRole.toUpperCase()} View`,
        message: `Active persona: ${switchedUser.name}`
      });

      if (newRole === 'candidate') {
        navigate('/candidate');
      } else if (newRole === 'recruiter') {
        sessionStorage.setItem('ai_ats_play_intro_recruiter', 'true');
        navigate('/recruiter');
      } else if (newRole === 'admin') {
        sessionStorage.setItem('ai_ats_play_intro_admin', 'true');
        navigate('/admin');
      }
    } catch (err: any) {
      showToast({
        type: 'warning',
        title: 'Authentication Required',
        message: err.message || 'Please log in with credentials authorized for this portal.'
      });
      if (newRole === 'candidate') {
        navigate('/login/candidate');
      } else if (newRole === 'recruiter') {
        navigate('/login/recruiter');
      } else if (newRole === 'admin') {
        navigate('/admin/login');
      }
    }
  };

  return (
    <div className={cn("flex items-center bg-[#070c1a] p-1 rounded-xl border border-white/10 shadow-inner shrink-0", className)}>
      <span className="text-[9px] uppercase font-mono font-bold text-slate-400 px-2 tracking-wider whitespace-nowrap hidden xl:inline">
        ROLE VIEW
      </span>
      <div className="flex items-center gap-0.5 sm:gap-1">
        <button
          onClick={() => handleRoleChange('candidate')}
          className={cn(
            'flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap',
            selectedRole === 'candidate'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-glow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          )}
          title="Candidate View"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Candidate</span>
        </button>

        <button
          onClick={() => handleRoleChange('recruiter')}
          className={cn(
            'flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap',
            selectedRole === 'recruiter'
              ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-glow-purple'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          )}
          title="Recruiter View"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Recruiter</span>
        </button>

        <button
          onClick={() => handleRoleChange('admin')}
          className={cn(
            'flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap',
            selectedRole === 'admin'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-glow-emerald'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          )}
          title="Admin View"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Admin</span>
        </button>
      </div>
    </div>
  );
};
