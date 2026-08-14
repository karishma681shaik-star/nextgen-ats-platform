import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, Building, ArrowRight, UserCheck, Building2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Role } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { cn } from '../../utils/cn';

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

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
      const newUser = await register({
        name,
        email,
        password,
        role,
        companyName: role === 'recruiter' ? companyName : undefined
      });

      showToast({
        type: 'success',
        title: 'Account created successfully!',
        message: `Welcome to AI ATS Platform, ${newUser.name}.`
      });

      if (role === 'candidate') navigate('/candidate');
      else navigate('/recruiter');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Registration failed',
        message: err.message || 'Unable to register account'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">AI ATS Platform</span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create your account</h2>
          <p className="text-xs text-slate-400">Join the next-generation recruitment ecosystem</p>
        </div>

        <Card glass className="p-6 sm:p-8">
          {/* Role Picker */}
          <div className="space-y-2 mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all',
                  role === 'candidate'
                    ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                )}
              >
                <div className={cn('p-2 rounded-lg', role === 'candidate' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400')}>
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Candidate</p>
                  <p className="text-[10px] text-slate-400">Looking for positions</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all',
                  role === 'recruiter'
                    ? 'bg-purple-600/15 border-purple-500 text-white shadow-sm shadow-purple-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                )}
              >
                <div className={cn('p-2 rounded-lg', role === 'recruiter' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400')}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Recruiter / Employer</p>
                  <p className="text-[10px] text-slate-400">Hiring top talent</p>
                </div>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              * Note: Administrator accounts are provisioned via system invitation and not publicly registerable.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Work / Personal Email"
              type="email"
              placeholder="alex@example.com"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="Min 8 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            {/* Terms checkbox */}
            <div className="space-y-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/20"
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
              variant="glow"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
