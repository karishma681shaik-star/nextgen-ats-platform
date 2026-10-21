import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Role } from '../../types';
import { UserCheck, Building2, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

interface RoleSwitcherProps {
  className?: string;
  defaultNeutral?: boolean;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ className, defaultNeutral = true }) => {
  const { user, role, switchRole, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Neutral initial state when unauthenticated or requested
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
    <div className={cn("role-switcher-pod flex items-center p-1 rounded-xl shrink-0 transition-all", className)}>
      <span className="text-[9px] uppercase font-mono font-black text-cyan-400 px-2.5 tracking-widest whitespace-nowrap hidden xl:flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)] animate-ping" />
        ROLE VIEW
      </span>
      <div className="flex items-center gap-1">
        {/* Candidate Option */}
        <button
          onClick={() => handleRoleChange('candidate')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap relative',
            selectedRole === 'candidate'
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white shadow-[0_0_18px_rgba(99,102,241,0.65),inset_0_1px_1.5px_rgba(255,255,255,0.4)] border border-indigo-300/40 role-active-capsule'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          )}
          title="Candidate View"
        >
          <div className={cn('flex items-center justify-center', selectedRole === 'candidate' && 'drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]')}>
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <span className="hidden sm:inline tracking-tight">Candidate</span>
        </button>

        {/* Recruiter Option */}
        <button
          onClick={() => handleRoleChange('recruiter')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap relative',
            selectedRole === 'recruiter'
              ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white shadow-[0_0_18px_rgba(168,85,247,0.65),inset_0_1px_1.5px_rgba(255,255,255,0.4)] border border-purple-300/40 role-active-capsule'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          )}
          title="Recruiter View"
        >
          <div className={cn('flex items-center justify-center', selectedRole === 'recruiter' && 'drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]')}>
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <span className="hidden sm:inline tracking-tight">Recruiter</span>
        </button>

        {/* Admin Option */}
        <button
          onClick={() => handleRoleChange('admin')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap relative',
            selectedRole === 'admin'
              ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 text-white shadow-[0_0_18px_rgba(16,185,129,0.65),inset_0_1px_1.5px_rgba(255,255,255,0.4)] border border-emerald-300/40 role-active-capsule'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          )}
          title="Admin View"
        >
          <div className={cn('flex items-center justify-center', selectedRole === 'admin' && 'drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]')}>
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <span className="hidden sm:inline tracking-tight">Admin</span>
        </button>
      </div>
    </div>
  );
};
