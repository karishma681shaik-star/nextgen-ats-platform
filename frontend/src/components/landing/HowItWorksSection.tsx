import React from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  Cpu,
  BarChart3,
  Sparkles,
  Target,
  Award,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

const STEPS = [
  {
    number: '01',
    title: 'Upload Resume',
    description: 'Upload your existing PDF or DOCX resume. Our parser ingests and normalizes your document structure in under 200ms.',
    icon: UploadCloud,
    color: 'from-blue-500 to-indigo-600',
    badge: 'Multi-Format',
  },
  {
    number: '02',
    title: 'AI Understands Your Profile',
    description: 'NLP algorithms extract hard skills, seniority levels, education, and accomplishments mapped against 4,000+ tech ontologies.',
    icon: Cpu,
    color: 'from-indigo-500 to-purple-600',
    badge: 'Entity Extraction',
  },
  {
    number: '03',
    title: 'Analyze ATS Compatibility',
    description: 'Get an objective 0–100 ATS score with a clear breakdown across keyword coverage, formatting hygiene, and experience relevance.',
    icon: BarChart3,
    color: 'from-purple-500 to-pink-600',
    badge: '5-Vector Score',
  },
  {
    number: '04',
    title: 'Improve With AI',
    description: 'Convert weak statements into high-impact STAR bullet points and insert missing keywords tailored to target job descriptions.',
    icon: Sparkles,
    color: 'from-pink-500 to-rose-600',
    badge: 'STAR Optimizer',
  },
  {
    number: '05',
    title: 'Match With Opportunities',
    description: 'Our vector match engine pairs your enriched profile with active company requisitions where you rank in the top percentile.',
    icon: Target,
    color: 'from-rose-500 to-amber-600',
    badge: 'Vector Match',
  },
  {
    number: '06',
    title: 'Get Recruiter-Ready',
    description: 'Appear at the top of recruiter search leaderboards with verified credentials and fast-track to direct interviews.',
    icon: Award,
    color: 'from-emerald-500 to-teal-600',
    badge: 'SHORTLISTED',
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-14 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold backdrop-blur-md shadow-glow">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>How It Works</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
            A seamless journey from upload to interview.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Six intelligent steps that demystify applicant tracking systems and optimize your profile for recruitment success.
          </p>
        </motion.div>

        {/* 6 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-card-elevated rounded-3xl p-6 sm:p-7 border border-slate-800 hover:border-indigo-500/50 transition-all shadow-lg flex flex-col justify-between space-y-5 group relative overflow-hidden"
              >
                {/* Top Step Number & Icon */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${step.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-700 group-hover:text-indigo-400/60 transition-colors font-mono">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight font-display">
                      {step.title}
                    </h3>
                  </div>
                  <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                    {step.badge}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Step Indicator */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">Step {step.number} of 06</span>
                  <span className="text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Learn more →
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mid-journey CTA strip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-6 sm:p-8 rounded-3xl glass-card-elevated border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-glow"
        >
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-white">Ready to test your resume against ATS algorithms?</h4>
            <p className="text-xs sm:text-sm text-slate-300">
              Get an instant score, keyword diagnostics, and actionable bullet improvements now.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/candidate/resume-analysis">
              <Button variant="glow" size="md" className="font-bold shadow-glow" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Analyze Resume Now
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
