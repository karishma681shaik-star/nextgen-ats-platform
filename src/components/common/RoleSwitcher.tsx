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
    <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-indigo-500/20 shadow-inner">
      <span className="text-[10px] uppercase font-bold text-indigo-400 px-2 tracking-wider hidden lg:inline">
        Persona
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleRoleChange('candidate')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200',
            role === 'candidate'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          )}
          title="Switch to Candidate perspective"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Candidate</span>
        </button>

        <button
          onClick={() => handleRoleChange('recruiter')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200',
            role === 'recruiter'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          )}
          title="Switch to Recruiter perspective"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Recruiter</span>
        </button>

        <button
          onClick={() => handleRoleChange('admin')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200',
            role === 'admin'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          )}
          title="Switch to Admin perspective"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Admin</span>
        </button>
      </div>
    </div>
  );
};
