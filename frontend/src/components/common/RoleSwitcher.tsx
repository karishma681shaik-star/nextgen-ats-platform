import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Role } from '../../types';
import { UserCheck, Building2, ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/cn';

export const RoleSwitcher: React.FC = () => {
  const { role, switchRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRoleChange = async (newRole: Role) => {
    if (newRole === role) return;
    const switchedUser = await switchRole(newRole);
    showToast({
      type: 'info',
      title: `Switched to ${newRole.toUpperCase()} View`,
      message: `Active persona: ${switchedUser.name}`
    });

    if (newRole === 'candidate') {
      navigate('/candidate');
    } else if (newRole === 'recruiter') {
      navigate('/recruiter');
    } else if (newRole === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <div className="flex items-center bg-[#070c1a] p-1 rounded-xl border border-white/10 shadow-inner">
      <span className="text-[9px] uppercase font-mono font-bold text-slate-400 px-2 tracking-wider hidden lg:inline">
        ROLE VIEW
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleRoleChange('candidate')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer',
            role === 'candidate'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-glow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          )}
          title="Switch to Candidate portal"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Candidate</span>
        </button>

        <button
          onClick={() => handleRoleChange('recruiter')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer',
            role === 'recruiter'
              ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-glow-purple'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          )}
          title="Switch to Recruiter portal"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Recruiter</span>
        </button>

        <button
          onClick={() => handleRoleChange('admin')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer',
            role === 'admin'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-glow-emerald'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
          )}
          title="Switch to Admin command"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Admin</span>
        </button>
      </div>
    </div>
  );
};
