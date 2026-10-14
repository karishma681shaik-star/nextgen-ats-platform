import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Bot,
  User,
  Briefcase,
  ArrowLeft,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

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

  const isCandidate = portal === 'candidate';

  const portalConfig = useMemo(() => {
    if (isCandidate) {
      return {
        badge: 'CANDIDATE PORTAL',
        badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
        heading: 'Candidate Sign In',
        subtitle: 'Access your resume, ATS insights, job matches, and applications.',
        icon: <User className="w-6 h-6 text-cyan-300" />,
        iconBg: 'from-cyan-600 via-indigo-600 to-blue-700 shadow-glow',
        buttonVariant: 'glow' as const,
        buttonText: 'Sign In as Candidate',
        createAccountText: 'Create Candidate Account',
        createAccountPath: '/register?role=candidate',
        forgotPasswordPath: '/forgot-password?portal=candidate',
        dashboardPath: '/candidate',
        accentBorder: 'border-cyan-500/30',
      };
    } else {
      return {
        badge: 'RECRUITER PORTAL',
        badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
        heading: 'Recruiter Sign In',
        subtitle: 'Access your hiring workspace and manage your recruitment pipeline.',
        icon: <Briefcase className="w-6 h-6 text-purple-300" />,
        iconBg: 'from-purple-600 via-fuchsia-600 to-indigo-700 shadow-glow-purple',
        buttonVariant: 'glow-purple' as const,
        buttonText: 'Sign In as Recruiter',
        createAccountText: 'Create Recruiter Account',
        createAccountPath: '/register?role=recruiter',
        forgotPasswordPath: '/forgot-password?portal=recruiter',
        dashboardPath: '/recruiter',
        accentBorder: 'border-purple-500/30',
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

      // 1. Authenticate with backend API using existing credentials contract
      const loggedUser = await login({ email, password });

      // 2. Strict Role Verification against selected portal
      if (portal === 'candidate' && loggedUser.role !== 'candidate') {
        // Mismatch! Immediately terminate active session
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
        // Mismatch! Immediately terminate active session
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

      const destination = (location.state as any)?.from?.pathname;
      if (destination && destination.startsWith(portalConfig.dashboardPath)) {
        navigate(destination, { replace: true });
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
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col justify-center relative py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      {/* Route-Aware 3D Background */}
      <BackgroundEffects mode="auth" role={portal} />

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

        {/* Brand Logo & Role Headline */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${portalConfig.iconBg} flex items-center justify-center text-white group-hover:scale-105 transition-transform`}
            >
              {portalConfig.icon}
            </div>
            <div className="text-left">
              <span className="font-display font-black text-2xl tracking-tight text-white flex items-center gap-2">
                AI ATS <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono tracking-wider">INTELLIGENT RECRUITMENT SUITE</p>
            </div>
          </Link>

          {/* Role-Specific Badge */}
          <div className="pt-2">
            <span
              className={`inline-block text-[10px] uppercase font-mono font-bold px-3 py-1 rounded-full border ${portalConfig.badgeColor}`}
            >
              {portalConfig.badge}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            {portalConfig.heading}
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {portalConfig.subtitle}
          </p>
        </div>

        {/* Role Mismatch / Auth Error Alert */}
        {authError && (
          <div className="rounded-xl bg-rose-950/70 border border-rose-500/40 p-4 flex items-start gap-3 text-rose-200 text-xs shadow-lg animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
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

        {/* Login Form Card */}
        <Card glass className={`p-6 sm:p-8 border border-white/10 shadow-2xl relative`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                if (authError) setAuthError(null);
              }}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              autoComplete="email"
              required
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link
                  to={portalConfig.forgotPasswordPath}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
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
                autoComplete="current-password"
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant={portalConfig.buttonVariant}
                size="lg"
                className="w-full font-bold shadow-lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {portalConfig.buttonText}
              </Button>
            </div>
          </form>

          {/* Account Creation Link */}
          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              Verified Portal
            </span>
            <Link
              to={portalConfig.createAccountPath}
              className={`font-bold transition-colors ${
                isCandidate ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              {portalConfig.createAccountText} →
            </Link>
          </div>
        </Card>

        {/* Portal Switching Hint */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Wrong portal?{' '}
            <Link
              to={isCandidate ? '/login/recruiter' : '/login/candidate'}
              className="text-slate-400 hover:text-white underline transition-colors"
            >
              Switch to {isCandidate ? 'Recruiter' : 'Candidate'} Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
