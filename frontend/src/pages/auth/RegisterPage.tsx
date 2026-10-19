import React, { useState, useEffect } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { voiceAssistantService } from '../../services/audio/voiceAssistantService';
import { Role } from '../../types';
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

  const isCandidate = role === 'candidate';

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col justify-center relative py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <BackgroundEffects mode="auth" role={role} />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 space-y-6">
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="font-display font-black text-2xl tracking-tight text-white flex items-center gap-2">
                AI ATS <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono tracking-wider">INTELLIGENT RECRUITMENT SUITE</p>
            </div>
          </Link>

          {/* Role Badge */}
          <div className="pt-2">
            <span
              className={cn(
                'inline-block text-[10px] uppercase font-mono font-bold px-3 py-1 rounded-full border',
                isCandidate
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
              )}
            >
              {isCandidate ? 'CANDIDATE REGISTRATION' : 'RECRUITER REGISTRATION'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            {isCandidate ? 'Create Candidate Account' : 'Create Recruiter Account'}
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {isCandidate
              ? 'Access AI resume insights, check ATS scores, and discover matching opportunities.'
              : 'Set up your hiring workspace, post jobs, and recruit top talent.'}
          </p>
        </div>

        <Card glass className="p-6 sm:p-8 border border-white/10 shadow-2xl">
          {/* Role Picker (Candidate or Recruiter Only - No Admin Option) */}
          <div className="space-y-2 mb-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Select Your Account Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Candidate Card */}
              <button
                type="button"
                onClick={() => handleRoleChange('candidate')}
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  role === 'candidate'
                    ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-[0_0_20px_rgba(76,201,240,0.2)]'
                    : 'bg-[#080d1a]/80 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                )}
              >
                <div
                  className={cn(
                    'p-2.5 rounded-xl shrink-0',
                    role === 'candidate' ? 'bg-cyan-500 text-white shadow-md' : 'bg-white/5 text-cyan-400'
                  )}
                >
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Candidate</p>
                  <p className="text-[10px] text-slate-400">Careers & ATS resume matching</p>
                </div>
              </button>

              {/* Recruiter Card */}
              <button
                type="button"
                onClick={() => handleRoleChange('recruiter')}
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  role === 'recruiter'
                    ? 'bg-purple-950/70 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                    : 'bg-[#080d1a]/80 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                )}
              >
                <div
                  className={cn(
                    'p-2.5 rounded-xl shrink-0',
                    role === 'recruiter' ? 'bg-purple-500 text-white shadow-md' : 'bg-white/5 text-purple-400'
                  )}
                >
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Recruiter</p>
                  <p className="text-[10px] text-slate-400">Post jobs & screen candidates</p>
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
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                required
              />

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
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                required
              />
            </div>

            {/* Terms checkbox */}
            <div className="space-y-1 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 bg-slate-900 text-indigo-600 focus:ring-indigo-500/20"
                />
                <span>
                  I agree to the <Link to="/" className="text-indigo-400 hover:underline">Terms of Service</Link> and{' '}
                  <Link to="/" className="text-indigo-400 hover:underline">Privacy Policy</Link>.
                </span>
              </label>
              {errors.terms && <p className="text-xs text-rose-400 font-medium">{errors.terms}</p>}
            </div>

            <Button
              type="submit"
              variant={role === 'recruiter' ? 'glow-purple' : 'glow'}
              size="lg"
              className="w-full font-bold shadow-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              isLoading={isLoading}
              disabled={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isCandidate ? 'Register as Candidate' : 'Register as Recruiter'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.08] text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link
                to={isCandidate ? '/login/candidate' : '/login/recruiter'}
                className={cn('font-bold hover:underline transition-colors', isCandidate ? 'text-cyan-400' : 'text-purple-400')}
              >
                Sign In as {isCandidate ? 'Candidate' : 'Recruiter'} →
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
