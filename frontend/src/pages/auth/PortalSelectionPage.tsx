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
  ArrowLeft,
  Zap,
  Activity,
  KeyRound,
  Shield
} from 'lucide-react';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

interface PortalCardProps {
  id: string;
  role: 'candidate' | 'recruiter' | 'admin';
  badge: string;
  badgeColor: string;
  chipText: string;
  chipIcon: React.ReactNode;
  icon: React.ReactNode;
  iconBg: string;
  cardClass: string;
  buttonClass: string;
  title: string;
  description: string;
  highlights: string[];
  buttonText: string;
  loginPath: string;
  checkColor: string;
}

const PORTALS: PortalCardProps[] = [
  {
    id: 'candidate',
    role: 'candidate',
    badge: 'CANDIDATE PORTAL',
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]',
    chipText: '98.4% Match Accuracy',
    chipIcon: <Zap className="w-3 h-3 text-cyan-400" />,
    icon: <User className="w-6 h-6 text-cyan-300" />,
    iconBg: 'from-cyan-500/25 via-blue-600/20 to-indigo-700/20 border-cyan-400/40 text-cyan-300 shadow-[0_0_24px_rgba(56,189,248,0.35)]',
    cardClass: 'portal-card-cyan',
    buttonClass: 'btn-luminous-cyan',
    title: 'Candidate',
    description:
      'Discover opportunities, benchmark your resume against job specs, track live hiring pipeline stages, and test ATS scores.',
    highlights: [
      'AI-Powered Resume Analysis & ATS Score',
      'Intelligent Candidate-to-Job Matching',
      'Live Multi-Stage Application Tracking',
    ],
    buttonText: 'Continue as Candidate',
    loginPath: '/login/candidate',
    checkColor: 'text-cyan-400',
  },
  {
    id: 'recruiter',
    role: 'recruiter',
    badge: 'RECRUITER PORTAL',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
    chipText: 'Pipeline Telemetry',
    chipIcon: <Activity className="w-3 h-3 text-purple-400" />,
    icon: <Briefcase className="w-6 h-6 text-purple-300" />,
    iconBg: 'from-purple-500/25 via-fuchsia-600/20 to-indigo-700/20 border-purple-400/40 text-purple-300 shadow-[0_0_24px_rgba(168,85,247,0.35)]',
    cardClass: 'portal-card-purple',
    buttonClass: 'btn-luminous-purple',
    title: 'Recruiter',
    description:
      'Manage job postings, review applicant rankings, evaluate AI candidate scoring, and orchestrate talent pipelines.',
    highlights: [
      'Multi-Stage Hiring Pipeline Workflow',
      'Algorithmic Skill Matching & Ranking',
      'Collaborative Candidate Evaluations',
    ],
    buttonText: 'Continue as Recruiter',
    loginPath: '/login/recruiter',
    checkColor: 'text-purple-400',
  },
  {
    id: 'admin',
    role: 'admin',
    badge: 'ADMINISTRATOR ACCESS',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.25)]',
    chipText: 'Zero-Trust Vault',
    chipIcon: <Shield className="w-3 h-3 text-emerald-400" />,
    icon: <ShieldCheck className="w-6 h-6 text-emerald-300" />,
    iconBg: 'from-emerald-500/25 via-teal-600/20 to-cyan-700/20 border-emerald-400/40 text-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.35)]',
    cardClass: 'portal-card-emerald',
    buttonClass: 'btn-luminous-emerald',
    title: 'Administrator',
    description:
      'Authorized platform governance, cryptographic session monitoring, system logs, and security enforcement.',
    highlights: [
      'Single-Administrator Governance Policy',
      'Cryptographic Session & Audit Logging',
      'User Moderation & System Security',
    ],
    buttonText: 'Administrator Sign In',
    loginPath: '/admin/login',
    checkColor: 'text-emerald-400',
  },
];

export const PortalSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col justify-center relative py-12 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      {/* Background Neural Grid & Atmospheric Glow */}
      <BackgroundEffects mode="auth" />

      <div className="max-w-6xl w-full mx-auto relative z-10 space-y-9">
        {/* Top Navigation & Brand Header */}
        <div className="text-center space-y-5">
          {/* Back to Homepage pill */}
          <div className="flex items-center justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-mono font-medium text-slate-300 hover:text-white transition-all bg-[#080e22]/80 hover:bg-[#0e1738] px-4 py-1.5 rounded-full border border-cyan-500/25 hover:border-cyan-400/60 shadow-[0_0_16px_rgba(56,189,248,0.18)] group"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Return to Homepage</span>
            </Link>
          </div>

          {/* Holographic 3D Brand Emblem */}
          <div className="flex justify-center">
            <Link to="/" className="inline-flex items-center gap-3.5 group select-none">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 p-[1.5px] shadow-[0_0_28px_rgba(99,102,241,0.5)] group-hover:shadow-[0_0_36px_rgba(56,189,248,0.7)] group-hover:scale-105 transition-all duration-300 shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#070c1e] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/25 via-transparent to-cyan-400/25" />
                  <Sparkles className="w-6 h-6 text-cyan-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.9)] group-hover:rotate-12 transition-transform duration-300" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
                </div>
              </div>
              <div className="text-left font-space tracking-tight">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    AI • ATS
                  </span>
                  <span className="text-[10px] uppercase font-mono font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-cyan-300/80 font-mono tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8] inline-block animate-pulse" />
                  Unified Authentication Gateway
                </p>
              </div>
            </Link>
          </div>

          {/* Heading & Subtitle */}
          <div className="max-w-2xl mx-auto pt-1 space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-[11px] font-mono tracking-wider uppercase">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Multi-Tenant Architecture • Role-Segregated Workspaces</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              Select Your Access Portal
            </h1>
            <p className="text-sm sm:text-base text-slate-300/80 leading-relaxed max-w-xl mx-auto font-normal">
              Choose your dedicated workspace to sign in with role-specific credentials and synchronized permissions.
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
              <div
                tabIndex={0}
                role="button"
                aria-label={`Enter ${portal.title} portal`}
                className={`portal-card-base ${portal.cardClass} flex-1 flex flex-col justify-between p-7 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-cyan-400/60`}
                onClick={() => navigate(portal.loginPath)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(portal.loginPath);
                  }
                }}
              >
                <div className="space-y-5">
                  {/* Badge & Holographic Icon Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full border ${portal.badgeColor}`}
                    >
                      {portal.badge}
                    </span>
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br border flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${portal.iconBg}`}
                    >
                      {portal.icon}
                    </div>
                  </div>

                  {/* Title & Telemetry Chip */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white tracking-tight group-hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                        {portal.title}
                      </h2>
                      <div className="inline-flex items-center gap-1.5 text-[10.5px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-slate-300">
                        {portal.chipIcon}
                        <span>{portal.chipText}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed min-h-[44px]">
                      {portal.description}
                    </p>
                  </div>

                  {/* Feature Highlights */}
                  <div className="pt-3 border-t border-white/[0.08] space-y-2">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                      Portal Capabilities
                    </p>
                    <ul className="space-y-2">
                      {portal.highlights.map((item, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2 text-xs text-slate-300 group-hover:text-white transition-colors">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${portal.checkColor} drop-shadow-[0_0_4px_currentColor]`} />
                          <span className="leading-tight">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Ultra-Luminous Action Button */}
                <div className="pt-6 mt-4">
                  <button
                    type="button"
                    className={`${portal.buttonClass} w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg group/btn`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(portal.loginPath);
                    }}
                  >
                    <span>{portal.buttonText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enterprise Security & Registration Pod */}
        <div className="max-w-2xl mx-auto pt-2 pb-6 space-y-3.5">
          <div className="p-4 rounded-2xl bg-[#070c1e]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-slate-400">
              <KeyRound className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Need an account?</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/register?role=candidate"
                className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 font-semibold transition-all shadow-[0_0_10px_rgba(56,189,248,0.15)]"
              >
                Candidate Sign Up
              </Link>
              <Link
                to="/register?role=recruiter"
                className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 border border-purple-500/30 font-semibold transition-all shadow-[0_0_10px_rgba(168,85,247,0.15)]"
              >
                Recruiter Sign Up
              </Link>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-mono text-center flex items-center justify-center gap-2">
            <Lock className="w-3 h-3 text-emerald-400 inline" />
            <span>Single-Administrator Governance Policy • End-to-End TLS 1.3 Session Security</span>
          </p>
        </div>
      </div>
    </div>
  );
};
