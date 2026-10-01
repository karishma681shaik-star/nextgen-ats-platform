import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  FileText,
  TrendingUp,
  Target,
  Send,
  PlusCircle,
  BarChart2,
  CheckCircle,
  Sliders,
  Database,
  Lock,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface RoleData {
  id: 'candidate' | 'recruiter' | 'admin';
  name: string;
  title: string;
  badge: string;
  icon: React.ElementType;
  color: string;
  accentBorder: string;
  description: string;
  workflow: { step: string; label: string; icon: React.ElementType }[];
  features: string[];
  ctaLink: string;
  ctaText: string;
}

const roles: RoleData[] = [
  {
    id: 'candidate',
    name: 'Candidate Experience',
    title: 'Own your career trajectory with transparent ATS insights',
    badge: 'Job Seeker Portal',
    icon: Users,
    color: 'from-indigo-600 to-cyan-600',
    accentBorder: 'hover:border-indigo-500/50',
    description:
      'Upload resumes, instantly view parsed entity breakdowns, understand your exact ATS score against job requirements, implement AI improvement tips, and track multi-company applications in real time.',
    workflow: [
      { step: '01', label: 'Resume Upload', icon: FileText },
      { step: '02', label: 'AI Analysis', icon: Sparkles },
      { step: '03', label: 'ATS Score 94%', icon: TrendingUp },
      { step: '04', label: 'Improvements', icon: CheckCircle },
      { step: '05', label: 'Job Matching', icon: Target },
      { step: '06', label: 'App Tracking', icon: Send },
    ],
    features: [
      'Multi-format resume parser with entity extraction (PDF, DOCX)',
      '5-Vector ATS compatibility score with keyword gap diagnostics',
      'AI bullet point rewrites & quantitative impact optimizer',
      'Intelligent job recommendations with match percentage chips',
      'Real-time multi-stage application timeline tracking',
    ],
    ctaLink: '/candidate',
    ctaText: 'Explore Candidate Experience',
  },
  {
    id: 'recruiter',
    name: 'Recruiter Platform',
    title: 'Screen thousands of applicants with AI-ranked pipelines',
    badge: 'Hiring Manager Suite',
    icon: Briefcase,
    color: 'from-purple-600 to-fuchsia-600',
    accentBorder: 'hover:border-purple-500/50',
    description:
      'Publish high-conversion job postings with technical skill tagging, automatically rank applicants by ATS score, evaluate candidates with scorecards, and advance talent through an intuitive Kanban pipeline.',
    workflow: [
      { step: '01', label: 'Create Job', icon: PlusCircle },
      { step: '02', label: 'Review Candidates', icon: Users },
      { step: '03', label: 'AI Ranking', icon: BarChart2 },
      { step: '04', label: 'Match Scores', icon: TrendingUp },
      { step: '05', label: 'Shortlist', icon: CheckCircle },
      { step: '06', label: 'Interview Pipeline', icon: Target },
    ],
    features: [
      'Multi-step job builder with required technical skill tags',
      'Instant candidate ranking by verified compatibility score',
      'Side-by-side candidate comparison & AI recommendation verdicts',
      '6-Stage Kanban pipeline with drag-and-drop orchestration',
      'Integrated interview scheduling with Google Meet & Zoom links',
    ],
    ctaLink: '/recruiter',
    ctaText: 'Explore Recruiter Platform',
  },
  {
    id: 'admin',
    name: 'Admin Governance',
    title: 'Enterprise oversight, verification, and platform analytics',
    badge: 'Governance & Security',
    icon: ShieldCheck,
    color: 'from-emerald-600 to-teal-600',
    accentBorder: 'hover:border-emerald-500/50',
    description:
      'Audit platform activity, moderate job requisitions, verify corporate recruiter credentials, manage user roles, and monitor aggregate talent intelligence benchmarks.',
    workflow: [
      { step: '01', label: 'User Governance', icon: Sliders },
      { step: '02', label: 'Recruiter Verify', icon: Lock },
      { step: '03', label: 'Job Moderation', icon: CheckCircle },
      { step: '04', label: 'Global Analytics', icon: Database },
    ],
    features: [
      'User status management (Activate, Suspend, Verify)',
      'Enterprise recruiter vetting & compliance checks',
      'Job requisition approval queue & audit logs',
      'Aggregate platform health & placement metrics',
    ],
    ctaLink: '/admin',
    ctaText: 'Enter Admin Governance',
  },
];

export const RoleExperience: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'recruiter' | 'admin'>('candidate');

  const activeRoleData = roles.find((r) => r.id === selectedRole) || roles[0];
  const ActiveIcon = activeRoleData.icon;

  return (
    <section className="py-16 space-y-12 relative">
      <div className="text-center space-y-3 max-w-3xl mx-auto px-4">
        <Badge variant="primary" className="shadow-glow">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
          Dedicated Role Personas
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Tailored Experiences for Every Recruitment Stakeholder
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Switch between personas to explore how candidates, recruiters, and platform administrators interact with AI ATS.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Role Selector Tabs */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
                  isSelected
                    ? 'glass-card-elevated text-white border-indigo-500/60 shadow-glow scale-105'
                    : 'glass-card text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{r.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Persona Showcase Display */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRoleData.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="glass-card-elevated rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden space-y-8"
            >
              {/* Background gradient hint */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${activeRoleData.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
                    <ActiveIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                      {activeRoleData.badge}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                      {activeRoleData.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      {activeRoleData.description}
                    </p>
                  </div>
                </div>

                <Link to={activeRoleData.ctaLink} className="shrink-0 w-full sm:w-auto">
                  <Button variant="glow" size="md" rightIcon={<ChevronRight className="w-4 h-4" />} className="w-full sm:w-auto shadow-glow">
                    {activeRoleData.ctaText}
                  </Button>
                </Link>
              </div>

              {/* Interactive Visual Workflow Pipeline */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Interactive Role Workflow
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {activeRoleData.workflow.map((item, idx) => {
                    const StepIcon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-indigo-500/40 transition-colors flex flex-col justify-between space-y-3 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                            {item.step}
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                            <StepIcon className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feature Bullet Grid */}
              <div className="pt-4 border-t border-slate-800/60">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  {activeRoleData.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
