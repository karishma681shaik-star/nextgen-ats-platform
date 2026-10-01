import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Sparkles,
  FileText,
  Search,
  AlertCircle,
  TrendingUp,
  Cpu,
  Award,
  Check,
  Zap,
  ArrowRight
} from 'lucide-react';
import { FloatingResume } from '../ui/FloatingResume';
import { ScrollReveal } from '../ui/ScrollReveal';

interface PipelineStep {
  id: number;
  stageName: string;
  badgeText: string;
  headline: string;
  subtext: string;
  icon: React.ElementType;
  color: string;
  details: {
    label: string;
    value: string;
    sub: string;
  }[];
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 0,
    stageName: '01. Ingestion',
    badgeText: 'Multi-Format Ingestion',
    headline: 'Upload & Parse Clean Document Tree',
    subtext: 'Your PDF/DOCX is parsed into an entity graph, preserving dates, positions, and career chronology with zero loss.',
    icon: FileText,
    color: 'from-blue-500 to-indigo-600',
    details: [
      { label: 'Parse Time', value: '180ms', sub: 'Instant parsing' },
      { label: 'OCR Hygiene', value: '100%', sub: 'Zero formatting traps' },
      { label: 'Type', value: 'PDF / DOCX', sub: 'Fully safe' },
    ],
  },
  {
    id: 1,
    stageName: '02. Section Scan',
    badgeText: 'NLP Entity Extraction',
    headline: 'Deep Parsing & Skill Taxonomy Mapping',
    subtext: 'AI scans the profile and maps tech stacks against a verified industry-standard technical taxonomy of over 4,000 entities.',
    icon: Search,
    color: 'from-indigo-500 to-purple-600',
    details: [
      { label: 'Entities Map', value: '24 tags', sub: 'Hard & Soft skills' },
      { label: 'XP Depth', value: '6.5 Years', sub: 'Validated duration' },
      { label: 'Ontology', value: 'Passed', sub: 'Standardized stack' },
    ],
  },
  {
    id: 2,
    stageName: '03. Gap Analysis',
    badgeText: 'Semantic ATS Matcher',
    headline: 'Pinpoint Keywords & Required Gaps',
    subtext: 'Compares your profile to target job scopes to highlight missing high-value competencies and required search keywords.',
    icon: AlertCircle,
    color: 'from-purple-500 to-pink-600',
    details: [
      { label: 'JD Matcher', value: '19 of 20', sub: 'Core keywords hit' },
      { label: 'Detected Gap', value: 'Redis', sub: 'Recommended add' },
      { label: 'Density Filter', value: 'Optimal', sub: 'No keyword stuffing' },
    ],
  },
  {
    id: 3,
    stageName: '04. Diagnostic Score',
    badgeText: '5-Vector Diagnostic Engine',
    headline: 'Instant 94 / 100 Compatibility Index',
    subtext: 'Calculates structural, formatting, technical, and duration compatibility across 5 distinct dimensions.',
    icon: TrendingUp,
    color: 'from-pink-500 to-rose-600',
    details: [
      { label: 'ATS Score', value: '94 / 100', sub: 'High compatibility' },
      { label: 'Format Vector', value: '98%', sub: 'Clean OCR parse' },
      { label: 'Fit Vector', value: '96%', sub: 'Senior role match' },
    ],
  },
  {
    id: 4,
    stageName: '05. STAR Rewrite',
    badgeText: 'Quantitative Impact Engine',
    headline: 'Transform Statements with Active Metrics',
    subtext: 'Rephrase weak experience bullets using the STAR framework, adding active verbs and quantified business impact.',
    icon: Cpu,
    color: 'from-amber-500 to-orange-600',
    details: [
      { label: 'Score Boost', value: '+14 Pts', sub: 'Post optimization' },
      { label: 'Verb Style', value: '100% Active', sub: 'Action statements' },
      { label: 'Metrics Added', value: '38% latency', sub: 'Quantified results' },
    ],
  },
  {
    id: 5,
    stageName: '06. Shortlist Sync',
    badgeText: 'Recruiter Direct Pipeline',
    headline: 'Fast-Track directly to Recruiter Shortlists',
    subtext: 'Your final polished profile is submitted directly into active recruiter dashboard views with high priority match signals.',
    icon: Award,
    color: 'from-emerald-500 to-teal-650',
    details: [
      { label: 'Match Index', value: '94.8%', sub: 'Staff level fit' },
      { label: 'Cohort Rank', value: 'Top 3%', sub: '#1 of 48 candidates' },
      { label: 'ATS Status', value: 'SHORTLISTED', sub: 'Fast-track trigger' },
    ],
  },
];

export const ResumeTransformationStory: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto-advance timeline steps
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const current = PIPELINE_STEPS[activeStep];
  const StepIcon = current.icon;

  // Custom 3D coordinates for each step to tilt the resume representation uniquely
  const getResumeTransforms = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Ingestion
        return { rotateY: 2, rotateX: 6, scale: 0.98, z: 0 };
      case 1: // NLP Scan
        return { rotateY: -6, rotateX: 10, scale: 1, z: 15 };
      case 2: // Gaps
        return { rotateY: 10, rotateX: 4, scale: 0.97, z: -10 };
      case 3: // Score
        return { rotateY: -4, rotateX: -6, scale: 1.02, z: 30 };
      case 4: // Rewrite
        return { rotateY: 8, rotateX: -4, scale: 1.01, z: 20 };
      case 5: // Shortlist
        return { rotateY: -2, rotateX: 2, scale: 1.03, z: 40 };
      default:
        return { rotateY: 0, rotateX: 0, scale: 1, z: 0 };
    }
  };

  const resumeTransform = getResumeTransforms(activeStep);

  return (
    <section
      id="pipeline-story"
      ref={containerRef}
      className="relative scroll-mt-24 py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#040711] border-b border-white/[0.04]"
      aria-label="Interactive AI Pipeline Story"
    >
      {/* Background lights */}
      <div className="absolute top-1/4 -left-36 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-36 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        
        {/* Section Header */}
        <ScrollReveal duration={0.7} className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive AI Transformation Pipeline</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display leading-tight">
            Watch your resume travel through the AI pipeline.
          </h2>

          <p className="text-sm sm:text-base text-slate-350 leading-relaxed max-w-2xl mx-auto">
            From raw document ingestion to technical entity extraction, formatting diagnostics, STAR suggestions, and direct recruiter shortlisted pipeline sync.
          </p>
        </ScrollReveal>

        {/* Timeline Progress Tracker */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PIPELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            const isCompleted = activeStep > idx;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  setActiveStep(idx);
                  setIsAutoPlay(false);
                }}
                className={`relative flex flex-col items-center text-center p-4 rounded-2xl transition-all cursor-pointer group ${
                  isActive
                    ? 'glass-card-elevated border-indigo-500/60 shadow-[0_8px_32px_rgba(99,102,241,0.15)] scale-102 z-10'
                    : 'glass-card border-white/[0.04] hover:border-white/[0.08] hover:bg-slate-900/40'
                }`}
              >
                {/* Step Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? `bg-gradient-to-tr ${step.color} text-white shadow-md scale-110`
                      : isCompleted
                      ? 'bg-emerald-500/15 text-emerald-450 border border-emerald-500/30'
                      : 'bg-slate-900/60 text-slate-400 group-hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>

                {/* Step Title */}
                <span
                  className={`text-xs font-bold mt-3 transition-colors ${
                    isActive ? 'text-white font-extrabold' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                >
                  {step.stageName}
                </span>

                {/* Status Dot */}
                <div className="flex items-center gap-1 mt-1">
                  {isCompleted ? (
                    <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Done
                    </span>
                  ) : isActive ? (
                    <span className="text-[9px] text-indigo-400 font-bold animate-pulse">
                      Active
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-500 font-mono">Step {idx + 1}</span>
                  )}
                </div>

                {/* Active Indicator Underline */}
                {isActive && (
                  <motion.div
                    layoutId="activePipelineUnderline"
                    className="absolute -bottom-1 w-12 h-0.5 bg-indigo-550 rounded-full shadow-glow"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Side-by-Side Content Display (Apple/Linear style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto pt-6">
          
          {/* Left Side: Stage Text and Metrics (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="glass-card-elevated rounded-3xl p-6 sm:p-8 border border-white/[0.06] shadow-2xl relative overflow-hidden"
              >
                {/* Glow Orb in Corner */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

                {/* Eyebrow & Badging */}
                <div className="flex items-center justify-between flex-wrap gap-2.5 pb-4 border-b border-white/[0.06]">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-350 border border-indigo-550/30">
                    {current.badgeText}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-450 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live System Sync
                  </span>
                </div>

                {/* Title & Description */}
                <div className="mt-5 space-y-3">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
                    {current.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {current.subtext}
                  </p>
                </div>

                {/* Diagnostic Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  {current.details.map((detail, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.04] text-center"
                    >
                      <span className="text-[9px] text-slate-450 font-bold block truncate uppercase tracking-wider">
                        {detail.label}
                      </span>
                      <span className="text-sm font-black text-white font-mono mt-1 block">
                        {detail.value}
                      </span>
                      <span className="text-[9px] text-indigo-400 block mt-0.5 truncate">
                        {detail.sub}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Side: Sticky Interactive Floating 3D Resume (5 Cols) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <motion.div
              animate={{
                rotateY: resumeTransform.rotateY,
                rotateX: resumeTransform.rotateX,
                scale: resumeTransform.scale,
                z: resumeTransform.z,
              }}
              transition={{
                type: 'spring',
                damping: 24,
                stiffness: 200,
                mass: 0.8
              }}
              style={{
                transformStyle: 'preserve-3d',
              }}
              className="w-full"
            >
              {/* Force non-interactive in pipeline viewer to let parent coordinate animations */}
              <FloatingResume activeStep={activeStep} interactive={false} />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
export default ResumeTransformationStory;
