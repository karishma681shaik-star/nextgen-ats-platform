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
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
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
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col justify-center relative py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      <BackgroundEffects mode="auth" role="admin" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
        {/* Navigation link back to portal selection */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-slate-300 hover:text-white transition-all bg-[#080e22]/80 hover:bg-[#0e1738] px-4 py-1.5 rounded-full border border-emerald-500/25 hover:border-emerald-400/60 shadow-[0_0_16px_rgba(52,211,153,0.18)] group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Back to portal selection</span>
          </Link>
        </div>

        {/* Admin Brand Logo & Headline */}
        <div className="text-center space-y-3.5">
          <div className="flex justify-center">
            <Link to="/" className="inline-flex items-center gap-3.5 group select-none">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/25 via-teal-600/20 to-cyan-700/20 border border-emerald-400/40 shadow-[0_0_24px_rgba(52,211,153,0.35)] p-[1.5px] flex items-center justify-center transition-all duration-300 group-hover:scale-105 shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#070c1e] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-white/[0.02]" />
                  <ShieldAlert className="w-6 h-6 text-emerald-300 animate-pulse" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </div>
              </div>
              <div className="text-left font-space tracking-tight">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    AI • ATS
                  </span>
                  <span className="text-[10px] uppercase font-mono font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                    COMMAND
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] inline-block" />
                  Single-Administrator Portal
                </p>
              </div>
            </Link>
          </div>

          {/* Role Badge & Headline */}
          <div className="space-y-1.5 pt-1">
            <span className="inline-block text-[10px] uppercase font-mono font-bold px-3 py-1 rounded-full border bg-emerald-500/15 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
              ADMINISTRATOR ACCESS
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              Administrator Sign In
            </h1>
            <p className="text-xs text-slate-300/80 max-w-sm mx-auto leading-relaxed">
              Cryptographically audited access for the designated platform administrator.
            </p>
          </div>
        </div>

        {/* Security Policy Badge */}
        <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-3.5 flex items-start gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
          <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-xs font-bold text-emerald-300 font-mono uppercase tracking-wide">Single-Administrator Policy Enforced</p>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              Only the single designated platform administrator is authorized to access the Admin Dashboard. All authentication attempts are logged.
            </p>
          </div>
        </div>

        {/* Error Alert if authentication rejected */}
        {authError && (
          <div className="rounded-xl bg-rose-950/80 border border-rose-500/50 p-4 flex items-center gap-3 text-rose-200 text-xs shadow-xl animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Ultra-Premium Form Card */}
        <div className="auth-form-card-emerald p-7 sm:p-8 space-y-5 shadow-2xl relative">
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

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
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
              <button
                type="submit"
                disabled={isLoading}
                className="btn-luminous-emerald w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg disabled:opacity-60 disabled:cursor-not-allowed group/btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Authority...</span>
                  </>
                ) : (
                  <>
                    <span>Administrator Sign In</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Footer Links */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Authority Verified
            </span>
            <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
              ← Portal Selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
