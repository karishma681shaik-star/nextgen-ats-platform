import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, ArrowLeft, Send, CheckCircle2, KeyRound } from 'lucide-react';
import { authService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [emailError, setEmailError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      await authService.forgotPassword(trimmedEmail);
      setIsSubmitted(true);
      showToast({
        type: 'success',
        title: 'Verification Code Dispatched',
        message: `A 6-digit code has been sent to ${trimmedEmail}`
      });
    } catch (err: any) {
      const errorMsg = err?.message || 'Could not send verification code';
      showToast({
        type: 'error',
        title: 'Request Failed',
        message: errorMsg
      });
      setEmailError(errorMsg);
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
              <p className="text-[11px] text-slate-400 font-mono">RECOVERY CONSOLE</p>
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight mt-4">
            Reset your password
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Enter your registered email to receive a secure 6-digit verification code.
          </p>
        </div>

        <Card glass className="mt-6 p-6 sm:p-8 border border-white/10 shadow-2xl">
          {isSubmitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">Check your email</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We have dispatched a 6-digit verification code to <span className="font-bold text-indigo-300">{email}</span>.
              </p>
              <p className="text-[11px] text-slate-400">
                This verification code expires in <span className="text-indigo-300 font-semibold">10 minutes</span>.
              </p>
              <div className="pt-2">
                <Button
                  variant="glow"
                  size="md"
                  className="w-full font-bold"
                  onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`)}
                  rightIcon={<KeyRound className="w-4 h-4" />}
                >
                  Enter Verification Code →
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                error={emailError}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="glow"
                size="lg"
                className="w-full font-bold shadow-lg mt-2"
                isLoading={isLoading}
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send Verification Code
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-white/[0.08] text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
