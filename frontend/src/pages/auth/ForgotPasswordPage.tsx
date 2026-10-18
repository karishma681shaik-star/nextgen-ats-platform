import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Mail, ArrowLeft, Send, CheckCircle2, KeyRound } from 'lucide-react';
import { authService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

export const ForgotPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const portalParam = searchParams.get('portal');
  const portal = portalParam === 'recruiter' ? 'recruiter' : portalParam === 'candidate' ? 'candidate' : null;

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [emailError, setEmailError] = useState('');

  const backLoginPath = portal === 'recruiter' ? '/login/recruiter' : portal === 'candidate' ? '/login/candidate' : '/login';

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
        message: `A 6-digit recovery code has been sent to ${trimmedEmail}`,
      });
    } catch (err: any) {
      const errorMsg = err?.message || 'Could not send verification code';
      showToast({
        type: 'error',
        title: 'Request Failed',
        message: errorMsg,
      });
      setEmailError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col justify-center relative py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <BackgroundEffects mode="auth" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
        {/* Navigation link back to login */}
        <div className="text-center">
          <Link
            to={backLoginPath}
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-1.5 rounded-full border border-white/[0.08]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to {portal === 'recruiter' ? 'Recruiter' : portal === 'candidate' ? 'Candidate' : 'Portal'} Sign In
          </Link>
        </div>

        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="font-display font-black text-2xl tracking-tight text-white flex items-center gap-2">
                AI ATS <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono tracking-wider">RECOVERY CONSOLE</p>
            </div>
          </Link>

          {/* Contextual Portal Badge */}
          {portal && (
            <div className="pt-2">
              <span
                className={`inline-block text-[10px] uppercase font-mono font-bold px-3 py-1 rounded-full border ${
                  portal === 'candidate'
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                    : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                }`}
              >
                {portal === 'candidate' ? 'CANDIDATE RECOVERY' : 'RECRUITER RECOVERY'}
              </span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Reset your password
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Enter your registered {portal ? `${portal} ` : ''}email to receive a secure 6-digit verification code.
          </p>
        </div>

        <Card glass className="p-6 sm:p-8 border border-white/10 shadow-2xl">
          {isSubmitted ? (
            <div className="text-center space-y-5 animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-glow-emerald">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Verification Code Sent</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  We've dispatched a 6-digit one-time code to <span className="font-mono text-indigo-300">{email}</span>.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  variant="glow"
                  size="md"
                  className="w-full font-bold shadow-lg"
                  onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                  rightIcon={<KeyRound className="w-4 h-4" />}
                >
                  Enter Verification Code
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-slate-400 hover:text-white"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try another email
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder={portal === 'recruiter' ? 'jane@company.com' : 'jane.doe@example.com'}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                error={emailError}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="glow"
                  size="lg"
                  className="w-full font-bold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  isLoading={isLoading}
                  disabled={isLoading}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Send Verification Code
                </Button>
              </div>

              <div className="pt-4 border-t border-white/[0.08] text-center">
                <Link
                  to={backLoginPath}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Return to sign in
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
