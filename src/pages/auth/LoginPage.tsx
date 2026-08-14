import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, UserCheck, Building2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('alex.rivera@example.com');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('DemoPass123!');
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
      const user = await login({ email, password });
      showToast({
        type: 'success',
        title: `Welcome back, ${user.name}!`,
        message: `Logged in as ${user.role}`
      });

      if (user.role === 'candidate') navigate('/candidate');
      else if (user.role === 'recruiter') navigate('/recruiter');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Authentication Failed',
        message: err.message || 'Unable to sign in'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">AI ATS Platform</span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-slate-400">Enter your credentials or select a quick demo account</p>
        </div>

        {/* Quick Demo Selector */}
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-3.5 space-y-2 shadow-inner">
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block text-center">
            ⚡ Quick-Fill Demo Personas (1-Click Test)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoAccount('alex.rivera@example.com')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/80 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all text-center"
            >
              <UserCheck className="w-4 h-4 text-indigo-400 mb-1" />
              <span className="text-[11px] font-bold">Candidate</span>
              <span className="text-[9px] text-slate-400 truncate w-full">Alex Rivera</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoAccount('sarah.jenkins@cloudscale.io')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/80 hover:bg-purple-950/50 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white transition-all text-center"
            >
              <Building2 className="w-4 h-4 text-purple-400 mb-1" />
              <span className="text-[11px] font-bold">Recruiter</span>
              <span className="text-[9px] text-slate-400 truncate w-full">Sarah Jenkins</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoAccount('admin@ai-ats.internal')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white transition-all text-center"
            >
              <ShieldAlert className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-[11px] font-bold">Admin</span>
              <span className="text-[9px] text-slate-400 truncate w-full">Marcus Vance</span>
            </button>
          </div>
        </div>

        <Card glass className="p-6">
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
                required
              />
            </div>

            <Button
              type="submit"
              variant="glow"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
                Create an account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
