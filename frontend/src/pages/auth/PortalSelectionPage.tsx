import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  User,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  ArrowLeft
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

interface PortalCardProps {
  id: string;
  role: 'candidate' | 'recruiter' | 'admin';
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  highlights: string[];
  buttonText: string;
  buttonVariant?: 'glow' | 'glow-purple' | 'glow-emerald' | 'primary';
  loginPath: string;
  borderHover: string;
  glowShadow: string;
}

const PORTALS: PortalCardProps[] = [
  {
    id: 'candidate',
    role: 'candidate',
    badge: 'CANDIDATE PORTAL',
    badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    icon: <User className="w-6 h-6 text-cyan-300" />,
    iconBg: 'from-cyan-600/30 via-indigo-600/20 to-blue-700/20 text-cyan-300 border-cyan-500/40',
    title: 'Candidate',
    description:
      'Discover opportunities, manage your resume, check ATS scores, and track job applications.',
    highlights: [
      'AI-Powered Resume Analysis & ATS Score',
      'Intelligent Candidate-to-Job Matching',
      'Live Multi-Stage Application Tracking',
    ],
    buttonText: 'Continue as Candidate',
    buttonVariant: 'glow',
    loginPath: '/login/candidate',
    borderHover: 'hover:border-cyan-400/60',
    glowShadow: 'hover:shadow-[0_0_35px_rgba(76,201,240,0.18)]',
  },
  {
    id: 'recruiter',
    role: 'recruiter',
    badge: 'RECRUITER PORTAL',
    badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    icon: <Briefcase className="w-6 h-6 text-purple-300" />,
    iconBg: 'from-purple-600/30 via-fuchsia-600/20 to-indigo-700/20 text-purple-300 border-purple-500/40',
    title: 'Recruiter',
    description:
      'Manage job postings, review applicants, evaluate candidate matches, and manage recruitment pipelines.',
    highlights: [
      'Multi-Stage Hiring Pipeline Workflow',
      'Algorithmic Skill Matching & Ranking',
      'Collaborative Candidate Evaluations',
    ],
    buttonText: 'Continue as Recruiter',
    buttonVariant: 'glow-purple',
    loginPath: '/login/recruiter',
    borderHover: 'hover:border-purple-400/60',
    glowShadow: 'hover:shadow-[0_0_35px_rgba(168,85,247,0.18)]',
  },
  {
    id: 'admin',
    role: 'admin',
    badge: 'ADMINISTRATOR ACCESS',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    icon: <ShieldCheck className="w-6 h-6 text-emerald-300" />,
    iconBg: 'from-emerald-600/30 via-teal-600/20 to-cyan-700/20 text-emerald-300 border-emerald-500/40',
    title: 'Administrator',
    description:
      'Authorized platform administration.',
    highlights: [
      'Single-Administrator Governance Policy',
      'Cryptographic Session & Audit Logging',
      'User Moderation & System Security',
    ],
    buttonText: 'Administrator Sign In',
    buttonVariant: 'glow-emerald',
    loginPath: '/admin/login',
    borderHover: 'hover:border-emerald-400/60',
    glowShadow: 'hover:shadow-[0_0_35px_rgba(61,184,140,0.18)]',
  },
];

export const PortalSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col justify-center relative py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      {/* Restrained 3D Background */}
      <BackgroundEffects mode="auth" />

      <div className="max-w-6xl w-full mx-auto relative z-10 space-y-10">
        {/* Top Brand & Back to Home */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-1.5 rounded-full border border-white/[0.08]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Homepage
            </Link>
          </div>

          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="font-display font-black text-2xl tracking-tight text-white flex items-center gap-2">
                AI ATS <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono tracking-wider">UNIFIED AUTHENTICATION GATEWAY</p>
            </div>
          </Link>

          <div className="max-w-2xl mx-auto pt-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
              Select Your Access Portal
            </h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Choose your dedicated workspace to sign in with your role-specific credentials.
            </p>
          </div>
        </div>

        {/* 3 Visually Distinct Role-Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {PORTALS.map((portal, idx) => (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col h-full"
            >
              <Card
                glass
                className={`flex-1 flex flex-col justify-between p-7 rounded-2xl border border-white/10 transition-all duration-300 cursor-pointer ${portal.borderHover} ${portal.glowShadow} group hover:-translate-y-1`}
                onClick={() => navigate(portal.loginPath)}
              >
                <div className="space-y-5">
                  {/* Badge & Icon Row */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full border ${portal.badgeColor}`}
                    >
                      {portal.badge}
                    </span>
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${portal.iconBg}`}
                    >
                      {portal.icon}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="text-2xl font-black text-white font-display tracking-tight group-hover:text-white transition-colors">
                      {portal.title}
                    </h2>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed min-h-[48px]">
                      {portal.description}
                    </p>
                  </div>

                  {/* Feature Highlights */}
                  <div className="pt-2 border-t border-white/[0.08] space-y-2">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Portal Capabilities
                    </p>
                    <ul className="space-y-1.5">
                      {portal.highlights.map((item, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-6 mt-4">
                  <Button
                    variant={portal.buttonVariant}
                    size="md"
                    className="w-full font-bold shadow-lg"
                    rightIcon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(portal.loginPath);
                    }}
                  >
                    {portal.buttonText}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom Registration & Security Notice */}
        <div className="max-w-2xl mx-auto text-center pt-2 pb-6 space-y-3">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span>Don't have an account yet?</span>
            <Link
              to="/register?role=candidate"
              className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
            >
              Create Candidate Account
            </Link>
            <span className="text-slate-600">•</span>
            <Link
              to="/register?role=recruiter"
              className="font-bold text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1"
            >
              Create Recruiter Account
            </Link>
          </div>

          <p className="text-[11px] text-slate-500 font-mono">
            Platform governance: Administrator accounts are securely provisioned under single-admin policy.
          </p>
        </div>
      </div>
    </div>
  );
};
