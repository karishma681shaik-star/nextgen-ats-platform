import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, MailCheck, CheckCircle2, RotateCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

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
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-glow">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight">AI ATS Platform</span>
        </Link>

        <Card glass className="p-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Verify your email address</h2>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            We sent a 6-digit verification code to your registered email. Enter it below to activate your account.
          </p>

          <div className="flex items-center justify-center gap-2 mb-6">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`code-input-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                className="w-11 h-13 text-center text-lg font-bold bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            ))}
          </div>

          <Button
            variant="glow"
            className="w-full mb-4"
            isLoading={isLoading}
            onClick={handleVerify}
          >
            Verify & Continue
          </Button>

          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-xs text-slate-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            <span>Didn't receive code? Resend</span>
          </button>
        </Card>
      </div>
    </div>
  );
};
