import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const ResetPasswordPage: React.FC = () => {
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim()) {
      setError('Reset token is required');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      // Simulate reset delay
      await new Promise((r) => setTimeout(r, 600));
      setIsSuccess(true);
      showToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your password has been changed successfully'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">AI ATS Platform</span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Set new password</h2>
          <p className="text-xs text-slate-400">Choose a secure password for your account</p>
        </div>

        <Card glass className="p-6">
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Password successfully reset!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You can now log in using your new credentials.
              </p>
              <Button
                variant="primary"
                className="w-full mt-2"
                onClick={() => navigate('/login')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Go to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Reset Code / Token"
                placeholder="e.g. 849201"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                leftIcon={<KeyRound className="w-4 h-4" />}
                required
              />

              <Input
                label="New Password"
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

              <Button
                type="submit"
                variant="glow"
                className="w-full"
                isLoading={isLoading}
              >
                Update Password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
