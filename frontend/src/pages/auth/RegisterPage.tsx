import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Role } from '../../types';
import { cn } from '../../utils/cn';

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<Role>('candidate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [adminRegistrationCode, setAdminRegistrationCode] = useState('ADMIN2026');
  const [showAdminCode, setShowAdminCode] = useState(false);
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

  const isKnownAdminCode = (code: string) => {
    const c = (code || '').trim().toLowerCase();
    return [
      'admin2026',
      'admin123',
      'admin',
      '123456',
      'superadmin',
      'change-this-admin-code',
      'aiats2026',
      'edutrack'
    ].includes(c);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email || !email.includes('@')) newErrors.email = 'Valid email is required';
    if (role === 'recruiter' && !companyName.trim()) newErrors.companyName = 'Company name is required';
    const effectiveAdminCode = role === 'admin' ? (adminRegistrationCode.trim() || 'ADMIN2026') : undefined;
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
      const newUser = await register({
        name,
        email,
        password,
        role,
        companyName: (role === 'recruiter' || role === 'admin') ? companyName : undefined,
        adminRegistrationCode: effectiveAdminCode,
      });

      showToast({
        type: 'success',
        title: 'Account Created Successfully!',
        message: `Welcome to AI ATS Platform, ${newUser.name}.`
      });

      if (role === 'candidate') navigate('/candidate');
      else if (role === 'recruiter') navigate('/recruiter');
      else if (role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Registration Failed',
        message: err.message || 'Unable to register account'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col justify-center relative py-12 px-4 sm:px-6 lg:px-8">
      <BackgroundEffects role={role} />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
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
            Create your account
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Join the next-generation AI recruitment ecosystem with instant parser matching.
          </p>
        </div>

        <Card glass className="mt-6 p-6 sm:p-8 border border-white/10 shadow-2xl">
          {/* Role Picker (3 Options) */}
          <div className="space-y-2 mb-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Select Your Role Persona
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Candidate Card */}
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={cn(
                  'flex sm:flex-col items-center sm:items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  role === 'candidate'
                    ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-glow'
                    : 'bg-[#080d1a]/80 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                )}
              >
                <div className={cn('p-2.5 rounded-xl shrink-0', role === 'candidate' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/5 text-indigo-400')}>
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Candidate</p>
                  <p className="text-[10px] text-slate-400">Looking for careers</p>
                </div>
              </button>

              {/* Recruiter Card */}
              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={cn(
                  'flex sm:flex-col items-center sm:items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  role === 'recruiter'
                    ? 'bg-purple-950/80 border-purple-500 text-white shadow-glow-purple'
                    : 'bg-[#080d1a]/80 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                )}
              >
                <div className={cn('p-2.5 rounded-xl shrink-0', role === 'recruiter' ? 'bg-purple-600 text-white shadow-md' : 'bg-white/5 text-purple-400')}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Recruiter</p>
                  <p className="text-[10px] text-slate-400">Hiring engineering talent</p>
                </div>
              </button>

              {/* Admin Card */}
              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  if (!adminRegistrationCode.trim()) {
                    setAdminRegistrationCode('ADMIN2026');
                  }
                }}
                className={cn(
                  'flex sm:flex-col items-center sm:items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  role === 'admin'
                    ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-glow-emerald'
                    : 'bg-[#080d1a]/80 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                )}
              >
                <div className={cn('p-2.5 rounded-xl shrink-0', role === 'admin' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white/5 text-emerald-400')}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Administrator</p>
                  <p className="text-[10px] text-slate-400">Platform governance</p>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Marcus Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Work / Personal Email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            {role === 'recruiter' && (
              <Input
                label="Company / Organization Name"
                placeholder="e.g. CloudScale AI Technologies"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                error={errors.companyName}
                leftIcon={<Building className="w-4 h-4" />}
                required
              />
            )}

            {role === 'admin' && (
              <div className="space-y-4">
                <Input
                  label="Administrative Domain / Org (Optional)"
                  placeholder="e.g. AI ATS Global Security Division"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  leftIcon={<Building className="w-4 h-4" />}
                />

                <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-4 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                        Administrator Access Passkey
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminRegistrationCode('ADMIN2026')}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Auto-fill: <span className="font-bold">ADMIN2026</span>
                    </button>
                  </div>

                  <Input
                    label="Administrator Security Code"
                    type={showAdminCode ? 'text' : 'password'}
                    placeholder="Enter security passkey (e.g. ADMIN2026)"
                    value={adminRegistrationCode}
                    onChange={(e) => setAdminRegistrationCode(e.target.value)}
                    error={errors.adminRegistrationCode}
                    leftIcon={<KeyRound className="w-4 h-4 text-emerald-400" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowAdminCode(!showAdminCode)}
                        className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                        title={showAdminCode ? 'Hide security code' : 'Show security code'}
                      >
                        {showAdminCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    required
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      {isKnownAdminCode(adminRegistrationCode) ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Authorized Passkey Verified
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          Authorized keys: <code className="text-emerald-300 font-mono">ADMIN2026</code>, <code className="text-emerald-300 font-mono">admin123</code>, or custom key.
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminRegistrationCode('ADMIN2026')}
                      className="text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                    >
                      Click to use ADMIN2026
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />

              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
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
              variant={
                role === 'recruiter'
                  ? 'glow-purple'
                  : role === 'admin'
                  ? 'glow-emerald'
                  : 'glow'
              }
              size="lg"
              className="w-full font-bold shadow-lg mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Register as {role === 'candidate' ? 'Candidate' : role === 'recruiter' ? 'Recruiter' : 'Administrator'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.08] text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300">
                Sign in →
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
