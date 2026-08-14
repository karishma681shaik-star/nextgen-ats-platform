import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Users,
  Briefcase,
  ChevronRight,
  TrendingUp,
  FileSearch,
  Bot,
  Layers,
  Search,
  Check,
  Plus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does the AI ATS scoring engine calculate candidate match percentages?',
      a: 'The ATS engine evaluates resumes across five core vectors: semantic technical skills matching, chronological experience depth, accredited education alignment, keyword density against specific Job Descriptions (JDs), and formatting readability.'
    },
    {
      q: 'Can recruiters manage multiple job requisitions and candidate pipelines simultaneously?',
      a: 'Yes. Recruiters get a dedicated Kanban and list-based pipeline with 1-click status transitions (Applied, Under Review, Shortlisted, Interview, Selected, Rejected) and automated ATS ranking.'
    },
    {
      q: 'How is data persisted in this Phase 1 frontend version?',
      a: 'All candidate profiles, resume parses, ATS scores, job postings, and recruiter pipeline transitions are maintained via a modular mock service layer with localStorage persistence, preparing the exact interfaces for Spring Boot REST endpoints in Phase 2.'
    },
    {
      q: 'Is there a public demo of all three personas (Candidate, Recruiter, Admin)?',
      a: 'Yes! Use the Role Switcher pill in the top navigation bar to seamlessly toggle between all three roles without having to log in and out repeatedly.'
    }
  ];

  return (
    <div className="space-y-24 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center pt-8 sm:pt-16 pb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Next-Gen AI Applicant Tracking & Recruitment Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-5xl mx-auto leading-[1.15]">
          Hire the top 1% faster with{' '}
          <span className="gradient-text">Intelligent ATS Scoring</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mt-6 leading-relaxed">
          Bridge the gap between ambitious talent and high-growth engineering teams. High-precision resume parsing, real-time ATS optimization, and intuitive recruiter hiring pipelines.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link to="/candidate">
            <Button variant="glow" size="lg" rightIcon={<ChevronRight className="w-4 h-4" />}>
              Open Candidate Portal
            </Button>
          </Link>
          <Link to="/recruiter">
            <Button variant="secondary" size="lg" leftIcon={<Briefcase className="w-4 h-4" />}>
              Recruiter Dashboard
            </Button>
          </Link>
          <Link to="/admin">
            <Button variant="outline" size="lg" leftIcon={<ShieldCheck className="w-4 h-4" />}>
              Admin Governance
            </Button>
          </Link>
        </div>

        {/* Live Interactive Score Preview Widget */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-6 sm:p-8 text-left border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-xl shadow-glow">
                  86
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Alex_Rivera_Senior_FullStack_2026.pdf</h3>
                    <Badge variant="success" dot size="sm">ATS Verified</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Matched against: <span className="text-slate-200 font-semibold">Senior Full Stack Software Engineer</span></p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/candidate/resume-analysis">
                  <Button variant="primary" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                    View Full ATS Breakdown
                  </Button>
                </Link>
              </div>
            </div>

            {/* Score Grid Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Technical Score</span>
                <p className="text-xl font-extrabold text-emerald-400 mt-1">91 / 100</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[91%]" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Keywords Matched</span>
                <p className="text-xl font-extrabold text-indigo-400 mt-1">88%</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[88%]" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Experience Depth</span>
                <p className="text-xl font-extrabold text-purple-400 mt-1">85%</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-purple-500 h-full w-[85%]" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Formatting Score</span>
                <p className="text-xl font-extrabold text-amber-400 mt-1">95 / 100</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-500 h-full w-[95%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-slate-800/80">
        <div className="text-center space-y-1">
          <p className="text-3xl sm:text-4xl font-extrabold text-white">98.4%</p>
          <p className="text-xs text-slate-400 font-medium">Resume Entity Extraction Accuracy</p>
        </div>
        <div className="text-center space-y-1">
          <p className="text-3xl sm:text-4xl font-extrabold text-indigo-400">4.8x</p>
          <p className="text-xs text-slate-400 font-medium">Faster Recruiter Screening Pipeline</p>
        </div>
        <div className="text-center space-y-1">
          <p className="text-3xl sm:text-4xl font-extrabold text-purple-400">12,000+</p>
          <p className="text-xs text-slate-400 font-medium">Verified Engineering Candidates</p>
        </div>
        <div className="text-center space-y-1">
          <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400">76.2%</p>
          <p className="text-xs text-slate-400 font-medium">Interview-to-Offer Placement Rate</p>
        </div>
      </section>

      {/* Core Platform Capabilities */}
      <section id="features" className="space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="primary">Architectural Highlights</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for High-Performance Hiring
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Everything you need to automate screening, match talent by skills, and maintain compliance across teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card glass hoverEffect className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Resume Parsing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extract technical skills, educational degrees, work history, projects, and certifications automatically from PDF and DOCX files.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Multi-format PDF & DOCX support</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Automatic profile synchronizer</li>
            </ul>
          </Card>

          <Card glass hoverEffect className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">ATS Analysis & Feedback</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detailed breakdown of keyword density, technical competency scores, missing skills, and actionable recommendations.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Missing keyword tags cloud</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Strengths & weaknesses analysis</li>
            </ul>
          </Card>

          <Card glass hoverEffect className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Recruiter Kanban Pipeline</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Streamlined applicant pipeline with automated ATS sorting, candidate evaluation cards, and 1-click status transitions.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Multi-stage hiring workflow</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant status timeline audit log</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Role Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <Card glass className="p-6 flex flex-col justify-between border-indigo-500/30 bg-indigo-950/10">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Candidate Experience</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Manage multi-section profile, parse resumes, inspect ATS score analysis, discover matched jobs, and track applications.
            </p>
          </div>
          <Link to="/candidate" className="mt-6">
            <Button variant="primary" size="sm" className="w-full">
              Enter Candidate Portal
            </Button>
          </Link>
        </Card>

        <Card glass className="p-6 flex flex-col justify-between border-purple-500/30 bg-purple-950/10">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Recruiter Experience</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Company branding, job requisition manager, multi-step job creation, and applicant pipeline with ATS ranking.
            </p>
          </div>
          <Link to="/recruiter" className="mt-6">
            <Button variant="glow" size="sm" className="w-full">
              Enter Recruiter Portal
            </Button>
          </Link>
        </Card>

        <Card glass className="p-6 flex flex-col justify-between border-slate-700/80 bg-slate-900/60">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Admin Governance</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              User moderation (activate/suspend), recruiter verification, job approval moderation, and platform metrics.
            </p>
          </div>
          <Link to="/admin" className="mt-6">
            <Button variant="secondary" size="sm" className="w-full">
              Enter Admin Portal
            </Button>
          </Link>
        </Card>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Everything you need to know about the AI ATS platform.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-card rounded-xl border border-slate-800 p-4 transition-colors cursor-pointer"
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-sm font-bold text-white">{faq.q}</h4>
                <span className="text-slate-400">{activeFaq === idx ? '-' : '+'}</span>
              </div>
              {activeFaq === idx && (
                <p className="text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800 leading-relaxed animate-in fade-in">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden border border-indigo-500/30 shadow-glow">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-transparent -z-10" />
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Ready to experience the future of recruitment?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-3 leading-relaxed">
          Test candidate resume parsing, explore recruiter pipelines, and evaluate platform governance right now.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <Link to="/register">
            <Button variant="glow" size="md">
              Create Free Account
            </Button>
          </Link>
          <Link to="/candidate/jobs">
            <Button variant="secondary" size="md">
              Browse Open Positions
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
