import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Terminal,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { voiceAssistantService } from '../../services/audio/voiceAssistantService';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { adminLogin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const newErrors: { email?: string; password?: string } = {};

    if (!email || !email.includes('@')) {
      newErrors.email = 'Please enter a valid administrator email address';
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

      // Unlock speech audio on user gesture
      voiceAssistantService.unlockAudio();

      // 1. Authenticate through administrator endpoint
      const user = await adminLogin({ email, password });

      // 2. Strict Role Verification
      if (user.role !== 'admin') {
        await logout();
        throw new Error('Access Denied: Account lacks administrative authority.');
      }

      showToast({
        type: 'success',
        title: 'Administrator Session Established',
        message: `Authenticated as Chief Administrator (${user.name})`,
      });

      // Trigger cinematic dashboard entrance animation
      sessionStorage.setItem('ai_ats_play_intro_admin', 'true');
      sessionStorage.removeItem('ai_ats_intro_seen_admin');

      // Signal pending automatic voice welcome for this session
      sessionStorage.setItem('ai_ats_pending_voice_welcome', 'true');
      if (user?.id) {
        sessionStorage.removeItem(`ai_ats_voice_welcome_done_${user.id}`);
      }

      const destination = (location.state as any)?.from?.pathname;
      if (destination && destination.startsWith('/admin')) {
        navigate(destination, { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
    } catch (err: any) {
      // Clean generic error preventing account enumeration
      const message =
        err.message?.includes('administrative authority')
          ? 'Access Denied: Account lacks administrative authority.'
          : err.message || 'Access Denied: Invalid administrator credentials.';
      setAuthError(message);
      showToast({
        type: 'error',
        title: 'Authentication Denied',
        message: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col justify-center relative py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      <BackgroundEffects mode="auth" role="admin" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
        {/* Navigation link back to portal selection */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-1.5 rounded-full border border-white/[0.08]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to portal selection
          </Link>
        </div>

        {/* Admin Brand Logo & Headline */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-glow-emerald group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 animate-pulse text-emerald-200" />
            </div>
            <div className="text-left">
              <span className="font-display font-black text-2xl tracking-tight text-white flex items-center gap-2">
                ADMIN <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">COMMAND</span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono tracking-wider">SINGLE-ADMINISTRATOR PORTAL</p>
            </div>
          </Link>

          {/* Role Badge */}
          <div className="pt-2">
            <span className="inline-block text-[10px] uppercase font-mono font-bold px-3 py-1 rounded-full border bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
              ADMINISTRATOR ACCESS
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Administrator Sign In
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Secure access for the authorized platform administrator.
          </p>
        </div>

        {/* Security Policy Badge */}
        <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-3 flex items-start gap-3 shadow-lg">
          <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-xs font-bold text-emerald-300">Single-Administrator Policy Enforced</p>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              Only the single designated platform administrator is authorized to access the Admin Dashboard. All authentication attempts are cryptographically audited.
            </p>
          </div>
        </div>

        {/* Error Alert if authentication rejected */}
        {authError && (
          <div className="rounded-xl bg-rose-950/70 border border-rose-500/40 p-3.5 flex items-center gap-3 text-rose-200 text-xs shadow-lg animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Login Form Card */}
        <Card glass className="p-6 sm:p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <Input
              label="Administrator Email"
              name="admin_login_email"
              id="admin-email"
              type="email"
              placeholder="e.g. admin@organization.internal"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                if (authError) setAuthError(null);
              }}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4 text-emerald-400" />}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              data-lpignore="true"
              required
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="admin-password" className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
              </div>
              <Input
                name="admin_login_password"
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter administrator password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  if (authError) setAuthError(null);
                }}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4 text-emerald-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-lpignore="true"
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="glow-emerald"
                size="lg"
                className="w-full font-bold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                isLoading={isLoading}
                disabled={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Security Footer Links */}
          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Role Authority Verified
            </span>
            <Link to="/login" className="font-semibold text-slate-400 hover:text-emerald-400 transition-colors">
              ← Portal Selection
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
