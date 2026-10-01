import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  UserCheck,
  Building2,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Cpu,
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Role } from '../../types';

export const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role>('candidate');
  const [email, setEmail] = useState('karishma681shaik@gmail.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelectRolePersona = (role: Role, demoEmail: string) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword('Password123!');
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email || !email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      const user = await login({ email, password, role: selectedRole });
      showToast({
        type: 'success',
        title: `Welcome back, ${user.name}!`,
        message: `Authenticated as ${user.role}`
      });

      const destination = (location.state as any)?.from?.pathname;
      if (destination) {
        navigate(destination);
      } else if (user.role === 'candidate') {
        navigate('/candidate');
      } else if (user.role === 'recruiter') {
        navigate('/recruiter');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Authentication Failed',
        message: err.message || 'Unable to sign in with provided credentials'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col justify-center relative py-12 px-4 sm:px-6 lg:px-8">
      <BackgroundEffects role={selectedRole} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Logo & Headline */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="font-display font-black text-2xl tracking-tight text-white flex items-center gap-2">
                AI ATS <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono">INTELLIGENT RECRUITMENT SUITE</p>
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight mt-4">
            Sign in to AI ATS
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Choose your role persona below or enter your registered account credentials.
          </p>
        </div>

        {/* Quick Demo Persona Selector Cards */}
        <div className="mt-6 glass-card rounded-2xl p-4 border border-white/10 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" /> 1-Click Demo Personas
            </span>
            <span className="text-[9px] font-mono text-slate-400">DEFAULT PASS: Password123!</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Candidate Persona */}
            <button
              type="button"
              onClick={() => handleSelectRolePersona('candidate', 'karishma681shaik@gmail.com')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                selectedRole === 'candidate'
                  ? 'bg-indigo-950/70 border-indigo-500 shadow-glow text-white'
                  : 'bg-[#080d1a]/80 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/20'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                selectedRole === 'candidate' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-indigo-400'
              }`}>
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight">Candidate</span>
              <span className="text-[10px] text-slate-400 truncate w-full mt-0.5">
                Karishma Shaik
              </span>
            </button>

            {/* Recruiter Persona */}
            <button
              type="button"
              onClick={() => handleSelectRolePersona('recruiter', 'sarah.jenkins@cloudscale.io')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                selectedRole === 'recruiter'
                  ? 'bg-purple-950/70 border-purple-500 shadow-glow-purple text-white'
                  : 'bg-[#080d1a]/80 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/20'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                selectedRole === 'recruiter' ? 'bg-purple-500 text-white' : 'bg-white/5 text-purple-400'
              }`}>
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight">Recruiter</span>
              <span className="text-[10px] text-slate-400 truncate w-full mt-0.5">Sarah Jenkins</span>
            </button>

            {/* Admin Persona */}
            <button
              type="button"
              onClick={() => handleSelectRolePersona('admin', 'admin@ai-ats.internal')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-emerald-950/70 border-emerald-500 shadow-glow-emerald text-white'
                  : 'bg-[#080d1a]/80 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/20'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                selectedRole === 'admin' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-emerald-400'
              }`}>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight">Admin</span>
              <span className="text-[10px] text-slate-400 truncate w-full mt-0.5">Marcus Vance</span>
            </button>
          </div>

          {selectedRole === 'candidate' && (
            <div className="flex items-center justify-between pt-1 px-1 border-t border-white/5 text-[11px] text-slate-400">
              <span>Candidate Account:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { setEmail('karishma681shaik@gmail.com'); setPassword('Password123!'); }}
                  className="px-2.5 py-0.5 rounded cursor-pointer transition-colors bg-indigo-600 text-white font-semibold shadow-sm"
                >
                  Karishma Shaik (Java Developer)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Login Form Card */}
        <Card glass className="mt-4 p-6 sm:p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                autoComplete="current-password"
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant={
                  selectedRole === 'recruiter'
                    ? 'glow-purple'
                    : selectedRole === 'admin'
                    ? 'glow-emerald'
                    : 'glow'
                }
                size="lg"
                className="w-full font-bold shadow-lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to {selectedRole === 'candidate' ? 'Candidate Portal' : selectedRole === 'recruiter' ? 'Recruiter Suite' : 'Admin Command'}
              </Button>
            </div>
          </form>

          {/* AI Security Tag */}
          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              Encrypted AI Session
            </span>
            <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Create Account →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
