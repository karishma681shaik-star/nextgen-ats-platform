import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Building,
  ArrowRight,
  UserCheck,
  Building2,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Zap,
  Activity,
  Cpu,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { voiceAssistantService } from '../../services/audio/voiceAssistantService';
import { cn } from '../../utils/cn';

export const RegisterPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRoleParam = searchParams.get('role');
  const initialRole: 'candidate' | 'recruiter' =
    initialRoleParam === 'recruiter' ? 'recruiter' : 'candidate';

  const [role, setRole] = useState<'candidate' | 'recruiter'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Sync state if URL query param changes
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'recruiter') setRole('recruiter');
    else if (roleParam === 'candidate') setRole('candidate');
  }, [searchParams]);

  const handleRoleChange = (newRole: 'candidate' | 'recruiter') => {
    setRole(newRole);
    setSearchParams({ role: newRole });
  };

  const isCandidate = role === 'candidate';

  // Password strength calculation for realistic telemetry feedback
  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const strengthLabel = useMemo(() => {
    switch (passwordStrength) {
      case 0:
        return { label: 'Empty', color: 'bg-slate-700', text: 'text-slate-500' };
      case 1:
        return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400' };
      case 2:
        return { label: 'Moderate', color: 'bg-amber-500', text: 'text-amber-400' };
      case 3:
        return { label: 'Strong', color: 'bg-cyan-500', text: 'text-cyan-400' };
      case 4:
        return { label: 'Enterprise-Grade', color: 'bg-emerald-500', text: 'text-emerald-400' };
      default:
        return { label: '', color: '', text: '' };
    }
  }, [passwordStrength]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email || !email.includes('@')) newErrors.email = 'Valid email is required';
    if (role === 'recruiter' && !companyName.trim()) newErrors.companyName = 'Company name is required';
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!agreeTerms) newErrors.terms = 'You must accept the terms of service';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});

      // Pre-authorize audio context on user gesture
      voiceAssistantService.unlockAudio();

      const newUser = await register({
        name,
        email,
        password,
        role,
        companyName: role === 'recruiter' ? companyName : undefined,
      });

      showToast({
        type: 'success',
        title: 'Account Created Successfully!',
        message: `Welcome to AI ATS Platform, ${newUser.name}.`,
      });

      // Trigger cinematic dashboard entrance animation for new registration
      sessionStorage.setItem(`ai_ats_play_intro_${role}`, 'true');
      sessionStorage.removeItem(`ai_ats_intro_seen_${role}`);

      // Signal pending automatic voice welcome for this session
      sessionStorage.setItem('ai_ats_pending_voice_welcome', 'true');
      if (newUser?.id) {
        sessionStorage.removeItem(`ai_ats_voice_welcome_done_${newUser.id}`);
      }

      const searchParams = new URLSearchParams(location.search);
      const redirectParam = searchParams.get('redirect');
      if (redirectParam) {
        navigate(redirectParam, { replace: true });
      } else if (role === 'candidate') {
        navigate('/candidate', { replace: true });
      } else if (role === 'recruiter') {
        navigate('/recruiter', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Registration Failed',
        message: err.message || 'Unable to complete registration',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col justify-center relative py-12 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      {/* Dynamic Background Atmosphere */}
      <BackgroundEffects mode="auth" role={role} />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 space-y-6">
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
                className={`relative w-12 h-12 rounded-2xl bg-gradient-to-tr border p-[1.5px] flex items-center justify-center transition-all duration-300 group-hover:scale-105 shrink-0 ${
                  isCandidate
                    ? 'from-cyan-500/25 via-blue-600/20 to-indigo-700/20 border-cyan-400/40 shadow-[0_0_24px_rgba(56,189,248,0.35)]'
                    : 'from-purple-500/25 via-fuchsia-600/20 to-indigo-700/20 border-purple-400/40 shadow-[0_0_24px_rgba(168,85,247,0.35)]'
                }`}
              >
                <div className="w-full h-full rounded-[14px] bg-[#070c1e] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-white/[0.02]" />
                  <Sparkles className={`w-6 h-6 animate-pulse ${isCandidate ? 'text-cyan-300' : 'text-purple-300'}`} />
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
                  Credential Provisioning Gateway
                </p>
              </div>
            </Link>
          </div>

          {/* Role Badge & Headline */}
          <div className="space-y-1.5 pt-1">
            <span
              className={cn(
                'inline-block text-[10px] uppercase font-mono font-bold px-3 py-1 rounded-full border shadow-[0_0_12px_rgba(0,0,0,0.5)]',
                isCandidate
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                  : 'bg-purple-500/15 text-purple-300 border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
              )}
            >
              {isCandidate ? 'CANDIDATE REGISTRATION' : 'RECRUITER REGISTRATION'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              {isCandidate ? 'Create Candidate Account' : 'Create Recruiter Account'}
            </h1>
            <p className="text-xs text-slate-300/80 max-w-md mx-auto leading-relaxed">
              {isCandidate
                ? 'Access AI resume telemetry, benchmark ATS scores, and unlock matching career pipelines.'
                : 'Orchestrate candidate pipelines, publish jobs, and leverage algorithmic talent scoring.'}
            </p>
          </div>
        </div>

        {/* Ultra-Premium Form Card */}
        <div
          className={`${
            isCandidate ? 'auth-form-card-cyan' : 'auth-form-card-purple'
          } p-7 sm:p-9 space-y-6 shadow-2xl relative`}
        >
          {/* Realistic 3D Cryptographic Identity Clearance Pod */}
          <div className="realistic-identity-badge p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600/30 via-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldCheck
                  className={`w-5 h-5 ${
                    isCandidate ? 'text-cyan-400' : 'text-purple-400'
                  } drop-shadow-[0_0_8px_currentColor]`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-mono uppercase font-bold text-slate-200 tracking-wider">
                    {isCandidate ? 'Candidate Credential Vault' : 'Enterprise Hiring Node'}
                  </p>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    TLS 1.3
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                  {isCandidate
                    ? 'Neural Resume Analyzer • Live Application Telemetry'
                    : 'Candidate Pipeline • Algorithmic Talent Ranking'}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400 px-2.5 py-1 rounded-lg bg-black/40 border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>256-BIT PROVISIONING</span>
            </div>
          </div>

          {/* Interactive Dual Role Architecture Selector Pods */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Select Your Account Type
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                Active: <span className={isCandidate ? 'text-cyan-400 font-bold' : 'text-purple-400 font-bold'}>{isCandidate ? 'Candidate' : 'Recruiter'}</span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Candidate Pod */}
              <button
                type="button"
                onClick={() => handleRoleChange('candidate')}
                className={cn(
                  'role-select-pod flex items-center gap-3.5 p-3.5 text-left cursor-pointer transition-all',
                  role === 'candidate' ? 'role-select-pod-active-cyan' : 'role-select-pod-inactive'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200',
                    role === 'candidate'
                      ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white border-cyan-400/60 shadow-[0_0_16px_rgba(56,189,248,0.5)] scale-105'
                      : 'bg-white/5 text-cyan-400 border-white/10'
                  )}
                >
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white tracking-wide">Candidate</p>
                    {role === 'candidate' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8] animate-pulse" />
                    )}
                  </div>
                  <p className="text-[10.5px] text-slate-400 truncate">Careers & ATS resume matching</p>
                </div>
              </button>

              {/* Recruiter Pod */}
              <button
                type="button"
                onClick={() => handleRoleChange('recruiter')}
                className={cn(
                  'role-select-pod flex items-center gap-3.5 p-3.5 text-left cursor-pointer transition-all',
                  role === 'recruiter' ? 'role-select-pod-active-purple' : 'role-select-pod-inactive'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200',
                    role === 'recruiter'
                      ? 'bg-gradient-to-tr from-purple-500 to-fuchsia-600 text-white border-purple-400/60 shadow-[0_0_16px_rgba(168,85,247,0.5)] scale-105'
                      : 'bg-white/5 text-purple-400 border-white/10'
                  )}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white tracking-wide">Recruiter</p>
                    {role === 'recruiter' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc] animate-pulse" />
                    )}
                  </div>
                  <p className="text-[10.5px] text-slate-400 truncate">Post jobs & screen candidates</p>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <Input
              label="Full Name"
              type="text"
              placeholder={role === 'candidate' ? 'Jane Doe' : 'Jane Smith (Talent Partner)'}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={errors.name}
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              required
            />

            <Input
              label="Work / Personal Email"
              type="email"
              placeholder={role === 'recruiter' ? 'jane@company.com' : 'jane.doe@example.com'}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              required
            />

            {/* Recruiter-only company name */}
            {role === 'recruiter' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <Input
                  label="Company / Organization Name"
                  type="text"
                  placeholder="Acme Technologies Inc."
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: undefined }));
                  }}
                  error={errors.companyName}
                  leftIcon={<Building className="w-4 h-4 text-slate-400" />}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 chars"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
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
                  required
                />

                {/* Password strength visual meter */}
                {password.length > 0 && (
                  <div className="pt-1 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Security Grade:</span>
                      <span className={`font-bold ${strengthLabel.text}`}>{strengthLabel.label}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1 rounded-full overflow-hidden bg-slate-800">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={cn(
                            'h-full rounded-full transition-all duration-300',
                            passwordStrength >= level ? strengthLabel.color : 'bg-slate-700/40'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-type password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  error={errors.confirmPassword}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                />

                {/* Password Match Indicator */}
                {confirmPassword.length > 0 && (
                  <div className="pt-1 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Verification:</span>
                    {password === confirmPassword ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" /> Match Confirmed
                      </span>
                    ) : (
                      <span className="text-rose-400 font-semibold">Passwords mismatch</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="space-y-1 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 bg-slate-900 text-indigo-500 focus:ring-indigo-500/20"
                />
                <span>
                  I agree to the{' '}
                  <Link to="/" className="text-cyan-400 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/" className="text-cyan-400 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.terms && <p className="text-xs text-rose-400 font-medium">{errors.terms}</p>}
            </div>

            {/* Ultra-Luminous Specular Register Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  isCandidate ? 'btn-luminous-cyan' : 'btn-luminous-purple',
                  'w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg disabled:opacity-60 disabled:cursor-not-allowed group/btn'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Provisioning Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>{isCandidate ? 'Register as Candidate' : 'Register as Recruiter'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Account Login Switcher in Card */}
          <div className="pt-4 border-t border-white/[0.08] text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link
                to={isCandidate ? '/login/candidate' : '/login/recruiter'}
                className={cn(
                  'font-bold hover:underline transition-colors px-2 py-0.5 rounded-md',
                  isCandidate ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-400 hover:text-purple-300'
                )}
              >
                Sign In as {isCandidate ? 'Candidate' : 'Recruiter'} →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
