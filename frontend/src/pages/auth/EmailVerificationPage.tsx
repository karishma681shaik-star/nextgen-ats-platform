import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, MailCheck, RotateCw, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

export const EmailVerificationPage: React.FC = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      showToast({ type: 'warning', title: 'Invalid code', message: 'Please enter all 6 digits.' });
      return;
    }

    try {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 600));
      showToast({
        type: 'success',
        title: 'Email Verified',
        message: 'Your email address has been confirmed.'
      });
      navigate('/candidate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsResending(false);
    showToast({
      type: 'info',
      title: 'Code Resent',
      message: 'A fresh 6-digit code was sent to your email.'
    });
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
              <p className="text-[11px] text-slate-400 font-mono">ACCOUNT VERIFICATION</p>
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight mt-4">
            Verify your email
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Enter the 6-digit verification code sent to your email address.
          </p>
        </div>

        <Card glass className="mt-6 p-6 sm:p-8 border border-white/10 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-5 shadow-glow">
            <MailCheck className="w-8 h-8" />
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-6">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`code-input-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                className="w-11 sm:w-12 h-14 text-center text-xl font-bold font-mono bg-[#080d1a] border border-white/15 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
              />
            ))}
          </div>

          <Button
            variant="glow"
            size="lg"
            className="w-full mb-4 font-bold shadow-lg"
            isLoading={isLoading}
            onClick={handleVerify}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Verify & Continue
          </Button>

          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-xs text-slate-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            <span>Didn't receive code? Resend Code</span>
          </button>
        </Card>
      </div>
    </div>
  );
};
