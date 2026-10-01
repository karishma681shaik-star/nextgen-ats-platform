import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Lock, KeyRound, CheckCircle2, ArrowRight, Eye, EyeOff, Mail } from 'lucide-react';
import { authService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  const codeFromUrl = searchParams.get('code') || searchParams.get('token') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState(codeFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
    if (codeFromUrl) setCode(codeFromUrl);
  }, [emailFromUrl, codeFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();

    if (!trimmedEmail) {
      setError('Registered email is required.');
      return;
    }
    if (!trimmedCode) {
      setError('6-digit verification code is required.');
      return;
    }
    if (!/^\d{6}$/.test(trimmedCode)) {
      setError('Verification code must be a 6-digit number (e.g. 583214).');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await authService.resetPassword(trimmedCode, password, trimmedEmail);
      setIsSuccess(true);
      showToast({
        type: 'success',
        title: 'Password Reset Successful',
        message: 'Your password has been updated. You can now sign in.'
      });
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to reset password. The code may be invalid or expired.';
      setError(errorMsg);
      showToast({
        type: 'error',
        title: 'Reset Failed',
        message: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col justify-center relative py-12 px-4 sm:px-6 lg:px-8">
      <BackgroundEffects />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="font-display font-black text-2xl tracking-tight text-white flex items-center gap-2">
                AI ATS <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono">CREDENTIALS CONSOLE</p>
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight mt-4">
            Enter Verification Code
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Enter the 6-digit code received in your email and set your new password.
          </p>
        </div>

        <Card glass className="mt-6 p-6 sm:p-8 border border-white/10 shadow-2xl">
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">Password successfully reset!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You can now securely sign in to your portal using your new credentials.
              </p>
              <Button
                variant="glow"
                size="lg"
                className="w-full mt-2 font-bold"
                onClick={() => navigate('/login')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="6-Digit Verification Code"
                placeholder="e.g. 583214"
                value={code}
                maxLength={6}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(val);
                  if (error) setError('');
                }}
                leftIcon={<KeyRound className="w-4 h-4" />}
                helperText="Check your email inbox for the 6-digit code (valid for 10 minutes)"
                required
              />

              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
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
                autoComplete="new-password"
                required
              />

              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                autoComplete="new-password"
                required
              />

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <p className="text-xs text-rose-400 font-semibold">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="glow"
                size="lg"
                className="w-full font-bold shadow-lg mt-2"
                isLoading={isLoading}
              >
                Update Password
              </Button>

              <div className="mt-4 pt-4 border-t border-white/[0.08] text-center">
                <Link
                  to="/login"
                  className="text-xs text-slate-400 hover:text-white transition-colors font-bold"
                >
                  Remember your password? Sign in
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
