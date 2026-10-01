import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Cpu,
  Layers,
  BarChart3,
  Target,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface Stage {
  id: number;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  badge: string;
  description: string;
  inputExample: string;
  outputExample: string;
  metrics: { label: string; value: string }[];
}

export const IntelligenceFlow: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  const stages: Stage[] = [
    {
      id: 0,
      title: '1. Resume Parsing & Layout Ingestion',
      shortTitle: 'Resume Parsing',
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      glowColor: 'rgba(59, 130, 246, 0.4)',
      badge: 'PDF / DOCX / OCR',
      description:
        'Sanitizes and extracts multi-column PDF & DOCX layouts into structured document trees without loss of chronology, projects, or credentials.',
      inputExample: 'Alex_Rivera_Resume_2026.pdf (Multi-column technical format)',
      outputExample: 'Raw structural hierarchy + sanitized document tree parsed in 180ms',
      metrics: [
        { label: 'Parse Speed', value: '< 200ms' },
        { label: 'Layout Fidelity', value: '99.4%' },
      ],
    },
    {
      id: 1,
      title: '2. Deep ATS Scoring & Diagnostic Evaluation',
      shortTitle: 'ATS Scoring',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-600',
      glowColor: 'rgba(99, 102, 241, 0.4)',
      badge: '5-Vector Analysis',
      description:
        'Evaluates keyword density, formatting hygiene, experience duration, and JD relevance into an objective 0–100 ATS compatibility benchmark.',
      inputExample: 'Evaluating candidate resume against Senior Backend Engineer JD',
      outputExample: 'Overall Score: 94/100 | Keywords: 95% | Technical: 92% | Format: 98%',
      metrics: [
        { label: 'ATS Score', value: '94 / 100' },
        { label: 'Keyword Match', value: '95%' },
      ],
    },
    {
      id: 2,
      title: '3. Semantic Skill & Taxonomy Extraction',
      shortTitle: 'Skill Extraction',
      icon: Layers,
      color: 'from-purple-500 to-pink-600',
      glowColor: 'rgba(168, 85, 247, 0.4)',
      badge: '4,000+ Skills Ontology',
      description:
        'Normalizes declared tools into standardized tech stacks, separating primary engineering competencies from incidental mentions with confidence weights.',
      inputExample: 'Technologies: Java 21, Spring Boot, React 19, Kafka, AWS ECS, PostgreSQL, Docker',
      outputExample: 'Core: [Java, Spring Boot, React] | Cloud: [AWS ECS, Docker] | Data: [PostgreSQL, Kafka]',
      metrics: [
        { label: 'Skills Detected', value: '24 Entities' },
        { label: 'Proficiency Match', value: '94 / 100' },
      ],
    },
    {
      id: 3,
      title: '4. Intelligent Vector Job Matching',
      shortTitle: 'Job Matching',
      icon: Target,
      color: 'from-pink-500 to-rose-600',
      glowColor: 'rgba(236, 72, 153, 0.4)',
      badge: 'Vector Match Engine',
      description:
        'Bidirectional matching ranks candidate fitness against active company job requisitions while recommending target positions to candidates.',
      inputExample: 'Candidate vector vs 32 active engineering openings in pipeline',
      outputExample: 'Top Match #1: Staff Backend Architect (94.8%) | Top Match #2: Full Stack Lead (91.0%)',
      metrics: [
        { label: 'Candidate Fit', value: 'Top 3%' },
        { label: 'Matched Openings', value: '8 Roles' },
      ],
    },
    {
      id: 4,
      title: '5. Automated Candidate Ranking',
      shortTitle: 'Candidate Ranking',
      icon: UserCheck,
      color: 'from-cyan-500 to-blue-600',
      glowColor: 'rgba(6, 182, 212, 0.4)',
      badge: 'Rank Score: #1 of 48',
      description:
        'Automatically sorts applicant cohorts by objective alignment, skill breadth, and verified experience depth to eliminate manual resume screening.',
      inputExample: '48 total applicants sorted for Requisition #REQ-409',
      outputExample: 'Top Ranked: Karishma Shaik (Score 98) → Auto-flagged for recruiter fast-track',
      metrics: [
        { label: 'Cohort Rank', value: '#1 / 48' },
        { label: 'Time Saved', value: '85%' },
      ],
    },
    {
      id: 5,
      title: '6. AI Recommendations & Bullet Optimization',
      shortTitle: 'AI Recommendations',
      icon: Cpu,
      color: 'from-emerald-500 to-teal-600',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      badge: 'Quantitative Impact Engine',
      description:
        'Identifies missing ATS keywords and suggests high-impact STAR-format bullet point rewrites to increase recruiter interview conversion.',
      inputExample: '"Managed React code and fixed bugs" → AI Enhancement',
      outputExample: '"Architected high-throughput micro-frontends with React 19, reducing LCP by 42%"',
      metrics: [
        { label: 'Score Boost', value: '+14 Pts' },
        { label: 'Impact Verbs', value: '100% Active' },
      ],
    },
  ];

  // Auto-advance stages every 4.5 seconds if autoplay is active
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, stages.length]);

  const current = stages[activeStage];
  const CurrentIcon = current.icon;

  return (
    <section id="intelligence-flow" className="py-16 relative">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <Badge variant="primary" className="shadow-glow">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
            ATS Intelligence Architecture
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Turn resumes into actionable intelligence.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Our multi-layer neural ATS engine decodes unstructured resume documents, standardizes skill taxonomies, and generates quantifiable match vectors in real time.
          </p>
        </div>

        {/* Step Indicator Rail */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = activeStage === idx;
              return (
                <button
                  key={stage.id}
                  onClick={() => {
                    setActiveStage(idx);
                    setIsAutoPlaying(false);
                  }}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl transition-all relative group ${
                    isActive
                      ? 'glass-card-elevated border-indigo-500/60 shadow-glow'
                      : 'glass-card border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Step Number Tag */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? `bg-gradient-to-tr ${stage.color} text-white shadow-lg scale-110`
                        : 'bg-slate-900 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span
                    className={`text-xs font-bold mt-2.5 line-clamp-1 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {stage.shortTitle}
                  </span>

                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Step 0{idx + 1}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1.5 w-8 h-1 bg-indigo-500 rounded-full shadow-glow"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Active Stage Transformation Card */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="glass-card-elevated rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${current.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
                    <CurrentIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        {current.title}
                      </h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {current.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                      {current.description}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-4 shrink-0">
                  {current.metrics.map((metric, i) => (
                    <div key={i} className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[90px]">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">{metric.label}</span>
                      <p className="text-sm font-black text-emerald-400 font-mono mt-0.5">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input -> Output Transformation preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Input Stream
                  </div>
                  <p className="text-xs font-mono text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                    {current.inputExample}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    AI Intelligence Output
                  </div>
                  <p className="text-xs font-mono text-indigo-200 bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-500/30 leading-relaxed">
                    {current.outputExample}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
