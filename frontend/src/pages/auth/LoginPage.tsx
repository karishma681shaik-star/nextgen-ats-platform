import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Briefcase,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Shield,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { voiceAssistantService } from '../../services/audio/voiceAssistantService';

export interface LoginPageProps {
  portal?: 'candidate' | 'recruiter';
}

export const LoginPage: React.FC<LoginPageProps> = ({ portal: initialPortal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const { showToast } = useToast();

  // Resolve portal type from props or pathname
  const portal: 'candidate' | 'recruiter' = useMemo(() => {
    if (initialPortal) return initialPortal;
    if (location.pathname.includes('/recruiter')) return 'recruiter';
    return 'candidate';
  }, [initialPortal, location.pathname]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Ensure fields are strictly empty and reset whenever portal changes
  React.useEffect(() => {
    setEmail('');
    setPassword('');
    setAuthError(null);
    setErrors({});
  }, [portal]);

  const isCandidate = portal === 'candidate';

  const portalConfig = useMemo(() => {
    if (isCandidate) {
      return {
        badge: 'CANDIDATE PORTAL',
        badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]',
        heading: 'Candidate Sign In',
        subtitle: 'Access your resume analysis, live ATS insights, and recruitment tracking.',
        channelTag: '🔒 256-Bit Encrypted Talent Channel',
        icon: <User className="w-6 h-6 text-cyan-300" />,
        iconGradient: 'from-cyan-500/25 via-blue-600/20 to-indigo-700/20 border-cyan-400/40 shadow-[0_0_24px_rgba(56,189,248,0.35)]',
        cardClass: 'auth-form-card-cyan',
        buttonClass: 'btn-luminous-cyan',
        buttonText: 'Sign In as Candidate',
        createAccountText: 'Create Candidate Account',
        createAccountPath: '/register?role=candidate',
        forgotPasswordPath: '/forgot-password?portal=candidate',
        dashboardPath: '/candidate',
        accentColor: 'text-cyan-400 hover:text-cyan-300',
        activeFocusBorder: 'focus:border-cyan-400',
      };
    } else {
      return {
        badge: 'RECRUITER PORTAL',
        badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
        heading: 'Recruiter Sign In',
        subtitle: 'Access your hiring workspace, evaluate applicants, and manage candidate pipelines.',
        channelTag: '🔒 256-Bit Encrypted Hiring Channel',
        icon: <Briefcase className="w-6 h-6 text-purple-300" />,
        iconGradient: 'from-purple-500/25 via-fuchsia-600/20 to-indigo-700/20 border-purple-400/40 shadow-[0_0_24px_rgba(168,85,247,0.35)]',
        cardClass: 'auth-form-card-purple',
        buttonClass: 'btn-luminous-purple',
        buttonText: 'Sign In as Recruiter',
        createAccountText: 'Create Recruiter Account',
        createAccountPath: '/register?role=recruiter',
        forgotPasswordPath: '/forgot-password?portal=recruiter',
        dashboardPath: '/recruiter',
        accentColor: 'text-purple-400 hover:text-purple-300',
        activeFocusBorder: 'focus:border-purple-400',
      };
    }
  }, [isCandidate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
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

      // Unlock speech audio on user gesture for seamless automatic welcome playback
      voiceAssistantService.unlockAudio();

      // 1. Authenticate with backend API using existing credentials contract
      const loggedUser = await login({ email, password });

      // 2. Strict Role Verification against selected portal
      if (portal === 'candidate' && loggedUser.role !== 'candidate') {
        await logout();
        const mismatchMessage =
          loggedUser.role === 'recruiter'
            ? 'Your account is registered as a Recruiter. Please select Recruiter Sign In.'
            : 'Your account is registered as an Administrator. Please select Administrator Sign In.';
        setAuthError(mismatchMessage);
        showToast({
          type: 'error',
          title: 'Portal Mismatch',
          message: mismatchMessage,
        });
        return;
      }

      if (portal === 'recruiter' && loggedUser.role !== 'recruiter') {
        await logout();
        const mismatchMessage =
          loggedUser.role === 'candidate'
            ? 'Your account is registered as a Candidate. Please select Candidate Sign In.'
            : 'Your account is registered as an Administrator. Please select Administrator Sign In.';
        setAuthError(mismatchMessage);
        showToast({
          type: 'error',
          title: 'Portal Mismatch',
          message: mismatchMessage,
        });
        return;
      }

      // 3. Roles Match: Allow access and redirect to role-specific dashboard
      showToast({
        type: 'success',
        title: `Welcome back, ${loggedUser.name}!`,
        message: `Authenticated as ${loggedUser.role.charAt(0).toUpperCase() + loggedUser.role.slice(1)}`,
      });

      // Trigger cinematic dashboard entrance animation for authenticated session
      sessionStorage.setItem(`ai_ats_play_intro_${loggedUser.role}`, 'true');
      sessionStorage.removeItem(`ai_ats_intro_seen_${loggedUser.role}`);

      // Signal pending automatic voice welcome for this session
      sessionStorage.setItem('ai_ats_pending_voice_welcome', 'true');
      if (loggedUser?.id) {
        sessionStorage.removeItem(`ai_ats_voice_welcome_done_${loggedUser.id}`);
      }

      const searchParams = new URLSearchParams(location.search);
      const redirectParam = searchParams.get('redirect');
      const stateDestination = (location.state as any)?.from?.pathname;
      const targetDestination = redirectParam || stateDestination;

      if (targetDestination) {
        navigate(targetDestination, { replace: true });
      } else {
        navigate(portalConfig.dashboardPath, { replace: true });
      }
    } catch (err: any) {
      const message = err.message || 'Unable to sign in with provided credentials';
      setAuthError(message);
      showToast({
        type: 'error',
        title: 'Authentication Failed',
        message: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col justify-center relative py-12 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      {/* Route-Aware 3D Background */}
      <BackgroundEffects mode="auth" role={portal} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
        {/* Navigation link back to portal selection */}
        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-slate-300 hover:text-white transition-all bg-[#080e22]/80 hover:bg-[#0e1738] px-4 py-1.5 rounded-full border border-cyan-500/25 hover:border-cyan-400/60 shadow-[0_0_16px_rgba(56,189,248,0.18)] group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Back to portal selection</span>
          </Link>
        </div>

        {/* Brand Logo & Role Headline */}
        <div className="text-center space-y-3.5">
          <div className="flex justify-center">
            <Link to="/" className="inline-flex items-center gap-3.5 group select-none">
              <div
                className={`relative w-12 h-12 rounded-2xl bg-gradient-to-tr border p-[1.5px] flex items-center justify-center transition-all duration-300 group-hover:scale-105 shrink-0 ${portalConfig.iconGradient}`}
              >
                <div className="w-full h-full rounded-[14px] bg-[#070c1e] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-white/[0.02]" />
                  {portalConfig.icon}
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
                </div>
              </div>
              <div className="text-left font-space tracking-tight">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    AI • ATS
                  </span>
                  <span className="text-[10px] uppercase font-mono font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                    PRO
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8] inline-block" />
                  Intelligent Recruitment Suite
                </p>
              </div>
            </Link>
          </div>

          {/* Role-Specific Badge & Headline */}
          <div className="space-y-1.5 pt-1">
            <span
              className={`inline-block text-[10px] uppercase font-mono font-bold px-3 py-1 rounded-full border ${portalConfig.badgeColor}`}
            >
              {portalConfig.badge}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              {portalConfig.heading}
            </h1>
            <p className="text-xs text-slate-300/80 max-w-sm mx-auto leading-relaxed">
              {portalConfig.subtitle}
            </p>
          </div>
        </div>

        {/* Role Mismatch / Auth Error Alert */}
        {authError && (
          <div className="rounded-xl bg-rose-950/80 border border-rose-500/50 p-4 flex items-start gap-3 text-rose-200 text-xs shadow-xl animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="font-semibold text-rose-300">{authError}</p>
              {authError.includes('Candidate Sign In') && (
                <Link
                  to="/login/candidate"
                  className="font-bold underline text-cyan-300 hover:text-white block mt-1"
                >
                  Go to Candidate Sign In →
                </Link>
              )}
              {authError.includes('Recruiter Sign In') && (
                <Link
                  to="/login/recruiter"
                  className="font-bold underline text-purple-300 hover:text-white block mt-1"
                >
                  Go to Recruiter Sign In →
                </Link>
              )}
              {authError.includes('Administrator Sign In') && (
                <Link
                  to="/admin/login"
                  className="font-bold underline text-emerald-300 hover:text-white block mt-1"
                >
                  Go to Administrator Sign In →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Ultra-Premium Form Card */}
        <div className={`${portalConfig.cardClass} p-7 sm:p-8 space-y-5 shadow-2xl relative`}>
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <Input
              label="Email Address"
              name={`${portal}_login_email`}
              id={`${portal}-email`}
              type="email"
              placeholder={isCandidate ? "candidate@example.com" : "recruiter@company.com"}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                if (authError) setAuthError(null);
              }}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              data-lpignore="true"
              required
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor={`${portal}-password`} className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link
                  to={portalConfig.forgotPasswordPath}
                  className={`text-xs font-semibold ${portalConfig.accentColor} transition-colors`}
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                name={`${portal}_login_password`}
                id={`${portal}-password`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  if (authError) setAuthError(null);
                }}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
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
                className={`${portalConfig.buttonClass} w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg disabled:opacity-60 disabled:cursor-not-allowed group/btn`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>{portalConfig.buttonText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Account Creation & Verified Status Link */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
              <ShieldCheck className={`w-3.5 h-3.5 ${isCandidate ? 'text-cyan-400' : 'text-purple-400'}`} />
              Verified Gateway
            </span>
            <Link
              to={portalConfig.createAccountPath}
              className={`font-bold transition-all px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 ${portalConfig.accentColor}`}
            >
              {portalConfig.createAccountText} →
            </Link>
          </div>
        </div>

        {/* Portal Switching Capsule */}
        <div className="text-center pt-1 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#070c1e]/85 backdrop-blur-md border border-white/[0.08] text-xs text-slate-400 shadow-lg">
            <span>Wrong portal?</span>
            <Link
              to={isCandidate ? '/login/recruiter' : '/login/candidate'}
              className={`font-bold underline transition-colors ${
                isCandidate ? 'text-purple-300 hover:text-purple-200' : 'text-cyan-300 hover:text-cyan-200'
              }`}
            >
              Switch to {isCandidate ? 'Recruiter' : 'Candidate'} Sign In →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
