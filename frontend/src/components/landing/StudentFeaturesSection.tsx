import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  FileSearch,
  Briefcase,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Cpu,
  Layers,
  ExternalLink,
  ShieldCheck,
  Building2,
  MapPin,
  Calendar,
  ChevronRight,
  AlertCircle,
  GraduationCap,
  Award,
  Code2,
  Eye,
  Check,
  Scan,
  Radio,
  Activity,
  Zap,
  Compass
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface JourneyStage {
  id: string;
  number: string;
  shortTitle: string;
  headline: string;
  description: string;
  badge: string;
  icon: React.ElementType;
  accentColor: 'indigo' | 'purple' | 'cyan' | 'emerald';
  imageSrc: string;
  imageAlt: string;
  imageCaption: string;
  telemetryChip: string;
  hudTopRight: {
    label: string;
    value: string;
  };
  hudBottomLeft: {
    label: string;
    value: string;
  };
  actionText: string;
  actionRoute: string;
  actionDescription: string;
}

const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'build',
    number: '01',
    shortTitle: 'Build Resume',
    headline: 'Turn Your Experience into a Professional Resume',
    description:
      'Create a structured, ATS-friendly resume using your education, technical skills, projects, experience, and certifications with optimal typography and zero parsing errors.',
    badge: 'Stage 01 · ATS Foundation',
    icon: FileText,
    accentColor: 'indigo',
    imageSrc: '/assets/student-journey-builder-v2.jpg?v=20261021',
    imageAlt: 'Photorealistic 3D holographic resume builder workstation with floating glowing resume and skills matrix badges',
    imageCaption: 'Quantum 3D Holodeck: Real-time ATS structure validation with machine-readable single-column hierarchy',
    telemetryChip: 'ATS Engine RFC-8259',
    hudTopRight: {
      label: 'PARSER COMPLIANCE',
      value: '99.8% OPTIMAL',
    },
    hudBottomLeft: {
      label: 'SKILLS MATRIX',
      value: '6 VERIFIED BADGES',
    },
    actionText: 'Build My Resume',
    actionRoute: '/candidate/resumes',
    actionDescription: 'Launch the AI-assisted resume builder to generate an ATS-standard format.',
  },
  {
    id: 'analyze',
    number: '02',
    shortTitle: 'Analyze & Improve',
    headline: 'Understand How Your Resume Matches a Job',
    description:
      'Analyze your resume against targeted tech job descriptions, identify missing keywords, diagnose ATS compatibility, and review actionable STAR-method rewrite suggestions.',
    badge: 'Stage 02 · ATS Diagnostic',
    icon: FileSearch,
    accentColor: 'purple',
    imageSrc: '/assets/student-journey-analyzer-v2.jpg?v=20261021',
    imageAlt: 'Photorealistic 3D AI neural core sphere projecting a 94/100 ATS score ring and keyword density glass cards',
    imageCaption: 'Neural Diagnostic Chamber: Deep semantic resonance & STAR-method rewrite telemetry',
    telemetryChip: 'Neural Diagnostic Core',
    hudTopRight: {
      label: 'ATS MATCH READINESS',
      value: '94 / 100 PTS',
    },
    hudBottomLeft: {
      label: 'IMPACT REWRITE',
      value: '+22 PTS QUANTIFIED',
    },
    actionText: 'Analyze My Resume',
    actionRoute: '/candidate/resume-analysis',
    actionDescription: 'Run your resume through real-time ATS scoring to spot gaps before applying.',
  },
  {
    id: 'discover',
    number: '03',
    shortTitle: 'Discover & Apply',
    headline: 'Find Opportunities That Fit Your Skills',
    description:
      'Explore curated job openings matched to your verified tech stack, compare requirements against your skills, and submit applications with full confidence.',
    badge: 'Stage 03 · Skill Matching',
    icon: Briefcase,
    accentColor: 'cyan',
    imageSrc: '/assets/student-journey-tracker-v2.jpg?v=20261021',
    imageAlt: 'Photorealistic 3D holographic globe radar pedestal projecting high-affinity opportunity cards',
    imageCaption: 'Quantum Synergy Radar: Real-time opportunity filtering scored against verified tech stack',
    telemetryChip: 'Quantum Career Radar',
    hudTopRight: {
      label: 'ACTIVE OPPORTUNITIES',
      value: '24 MATCHES',
    },
    hudBottomLeft: {
      label: 'PEAK SYNERGY ROLE',
      value: '96% CLOUD ENG',
    },
    actionText: 'Explore Matching Jobs',
    actionRoute: '/jobs',
    actionDescription: 'Browse open roles and instantly view your skill compatibility percentages.',
  },
  {
    id: 'shortlist',
    number: '04',
    shortTitle: 'Move to Shortlist',
    headline: 'Follow Your Application Journey',
    description:
      'Understand each application stage in real time, see when recruiters review your dossier, and track your progression directly into active interview shortlists.',
    badge: 'Stage 04 · Recruiter Sync',
    icon: UserCheck,
    accentColor: 'emerald',
    imageSrc: '/assets/student-journey-shortlist-v2.jpg?v=20261021',
    imageAlt: 'Photorealistic 3D executive talent command center with glowing golden SHORTLISTED verification seal',
    imageCaption: 'Executive Command Deck: Direct recruiter workbench synchronization & fast-track queue',
    telemetryChip: 'Executive Search Vault',
    hudTopRight: {
      label: 'SHORTLIST STATUS',
      value: 'VERIFIED CANDIDATE',
    },
    hudBottomLeft: {
      label: 'PIPELINE SPEED',
      value: 'FAST-TRACK QUEUE',
    },
    actionText: 'Track Applications',
    actionRoute: '/candidate/applications',
    actionDescription: 'Monitor active status updates as recruiters review your profile.',
  },
];

export const StudentFeaturesSection: React.FC = () => {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'holo' | 'scan'>('holo');
  const [isLaserActive, setIsLaserActive] = useState<boolean>(true);

  const [stage1Tab, setStage1Tab] = useState<'sections' | 'safety'>('sections');
  const [stage2Tab, setStage2Tab] = useState<'diagnostic' | 'star'>('diagnostic');
  const [stage2StarVersion, setStage2StarVersion] = useState<'before' | 'after'>('after');
  const [stage3SelectedJob, setStage3SelectedJob] = useState<1 | 2>(1);

  const { isAuthenticated } = useAuth();
  const currentStage = JOURNEY_STAGES[activeStageIndex];

  // Helper for auth-aware navigation routes
  const getDestinationUrl = (baseRoute: string) => {
    if (isAuthenticated) {
      return baseRoute;
    }
    // If public jobs route, keep public
    if (baseRoute === '/jobs') {
      return '/jobs';
    }
    return `/login/candidate?redirect=${encodeURIComponent(baseRoute)}`;
  };

  const handleNextStage = () => {
    setActiveStageIndex((prev) => (prev < JOURNEY_STAGES.length - 1 ? prev + 1 : 0));
  };

  const handlePrevStage = () => {
    setActiveStageIndex((prev) => (prev > 0 ? prev - 1 : JOURNEY_STAGES.length - 1));
  };

  return (
    <section id="students" className="scroll-mt-24 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-950/70">
      {/* Ambient background glow accents */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-[30rem] h-[30rem] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
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
            <span>For Students & Job Seekers</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
            Built to get you noticed, shortlisted, and hired.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Clear, actionable tools designed specifically for students and job seekers to master applicant tracking systems, build high-impact resumes, and navigate a transparent application journey.
          </p>
        </motion.div>

        {/* Experience Subtitle & Interactive Journey Framing */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-block text-xs uppercase tracking-widest text-indigo-400 font-mono font-bold">
            Interactive Career Progression
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
            Your Journey from Student to Shortlisted Candidate
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Build your resume, discover opportunities, improve your job match, and move forward with confidence.
          </p>
        </div>

        {/* Horizontal Career-Journey Progression Rail */}
        <div className="relative">
          {/* Connecting line behind step buttons */}
          <div className="hidden md:block absolute top-1/2 left-8 right-8 h-[2px] -translate-y-1/2 bg-slate-800 -z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500"
              style={{
                width: `${(activeStageIndex / (JOURNEY_STAGES.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* 4 Interactive Stage Steps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
            {JOURNEY_STAGES.map((stage, idx) => {
              const isActive = idx === activeStageIndex;
              const isPast = idx < activeStageIndex;
              const Icon = stage.icon;

              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStageIndex(idx)}
                  className={`group relative p-3 sm:p-4 rounded-2xl border text-left transition-all duration-300 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 stage-cyber-pod ${
                    isActive
                      ? 'stage-cyber-pod-active'
                      : isPast
                      ? 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                  aria-selected={isActive}
                  role="tab"
                  id={`stage-tab-${idx}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : isPast
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700'
                      }`}
                    >
                      {stage.number}
                    </span>

                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-glow'
                          : isPast
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-1">
                    {stage.shortTitle}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {isActive ? (
                      <span className="text-indigo-400 font-semibold flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Active Telemetry
                      </span>
                    ) : isPast ? (
                      <span className="text-emerald-400/90 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed
                      </span>
                    ) : (
                      'Upcoming Stage'
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coordinated Two-Column Interactive Stage Showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
          >
            {/* Left Column (7 cols): Ultra-Realistic 3D Holographic Stage Viewport & Cyber Mini Console */}
            <div className="lg:col-span-7 space-y-4">
              {/* 3D Holodeck Stage Viewport with Specular Border & Interactive Telemetry */}
              <div className="holodeck-viewport-specular group relative">
                {/* Cyber Corner Brackets */}
                <div className="cyber-corner-bracket cyber-bracket-tl" />
                <div className="cyber-corner-bracket cyber-bracket-tr" />
                <div className="cyber-corner-bracket cyber-bracket-bl" />
                <div className="cyber-corner-bracket cyber-bracket-br" />

                {/* Traveling Active Laser Scanning Beam */}
                {isLaserActive && <div className="ats-laser-scanbeam" />}

                {/* Top Interactive Telemetry Control Bar */}
                <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md text-slate-100 border border-slate-700/80 flex items-center gap-1.5 shadow-md">
                      <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                      {currentStage.badge}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-lg bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
                      <Activity className="w-3 h-3 text-indigo-400" />
                      {currentStage.telemetryChip}
                    </span>
                  </div>

                  {/* View Mode & Scanner Interactive Toggles */}
                  <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setViewMode('holo')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all ${
                        viewMode === 'holo'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Photorealistic 3D Holodeck View"
                    >
                      Holo
                    </button>
                    <button
                      onClick={() => setViewMode('scan')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all ${
                        viewMode === 'scan'
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Neural Spectrum Diagnostic View"
                    >
                      Neural
                    </button>
                    <button
                      onClick={() => setIsLaserActive(!isLaserActive)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all ${
                        isLaserActive
                          ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40'
                          : 'text-slate-500 bg-slate-900'
                      }`}
                      title="Toggle Real-Time ATS Laser Scanner"
                    >
                      <Scan className="w-2.5 h-2.5" />
                      <span>{isLaserActive ? 'Laser ON' : 'Laser OFF'}</span>
                    </button>
                  </div>
                </div>

                {/* Main 3D Photorealistic Image with dynamic perspective and filter */}
                <div className="relative overflow-hidden w-full h-64 sm:h-80 transition-all duration-700">
                  <img
                    src={currentStage.imageSrc}
                    alt={currentStage.imageAlt}
                    className={`w-full h-full object-cover object-center group-hover:scale-[1.03] transition-all duration-700 ${
                      viewMode === 'scan'
                        ? 'filter contrast-125 saturate-150 hue-rotate-15'
                        : ''
                    }`}
                    loading="eager"
                  />

                  {/* Vignette & Holographic Depth Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(2,6,23,0.75)_100%)] pointer-events-none" />

                  {/* Floating Holographic Objects: Interactive Telemetry HUD Chips on the 3D Render */}
                  <div className="absolute top-14 right-4 z-20 pointer-events-auto">
                    <div className="hologram-hud-chip px-3 py-1.5 rounded-xl flex items-center gap-2 border">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <div>
                        <div className="text-[9px] font-mono text-slate-400 leading-tight">
                          {currentStage.hudTopRight.label}
                        </div>
                        <div className="text-xs font-mono font-black text-cyan-300">
                          {currentStage.hudTopRight.value}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-12 left-4 z-20 pointer-events-auto">
                    <div className="hologram-hud-chip px-3 py-1.5 rounded-xl flex items-center gap-2 border">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      <div>
                        <div className="text-[9px] font-mono text-slate-400 leading-tight">
                          {currentStage.hudBottomLeft.label}
                        </div>
                        <div className="text-xs font-mono font-bold text-white">
                          {currentStage.hudBottomLeft.value}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Telemetry Status Ribbon */}
                <div className="relative z-20 bg-slate-950/90 border-t border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-slate-300 font-medium truncate">
                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">{currentStage.imageCaption}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline-block">
                      STAGE 0{activeStageIndex + 1} // 04
                    </span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      ULTRA-HD 8K
                    </span>
                  </div>
                </div>
              </div>

              {/* Functional Mini Interactive Software UI */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/95 p-5 space-y-4 shadow-2xl backdrop-blur-xl">
                {/* Stage 01 Mini UI: Structured Resume Sections vs ATS Safety Check */}
                {currentStage.id === 'build' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setStage1Tab('sections')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            stage1Tab === 'sections'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 bg-slate-900 hover:text-slate-200'
                          }`}
                        >
                          Candidate Sections
                        </button>
                        <button
                          onClick={() => setStage1Tab('safety')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            stage1Tab === 'safety'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 bg-slate-900 hover:text-slate-200'
                          }`}
                        >
                          ATS Safety Diagnostics
                        </button>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        100% Parser Safe
                      </span>
                    </div>

                    {stage1Tab === 'sections' ? (
                      <div className="space-y-2.5 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Education
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">2021 – 2025</span>
                          </div>
                          <p className="text-slate-300 font-medium">B.Tech in Computer Science & Engineering</p>
                          <p className="text-[11px] text-slate-400">Indian Institute of Technology · GPA: 8.8 / 10.0</p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Technical Skills Matrix
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400">6 Verified Tags</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {['Java 21', 'Spring Boot', 'React 19', 'PostgreSQL', 'Docker', 'RESTful APIs'].map(
                              (skill) => (
                                <span
                                  key={skill}
                                  className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
                                >
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-indigo-400" /> Featured Projects & Certifications
                            </span>
                            <span className="text-[10px] font-mono text-indigo-300">AWS DVA-C02</span>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            <strong>Distributed Cloud Storage:</strong> High-availability fault-tolerant file microservice with Spring Boot & S3.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-300">Single-Column Hierarchy (ATS Standard)</span>
                          <span className="text-emerald-400 font-mono font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Optimal
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-300">Machine-Readable Font & Margins</span>
                          <span className="text-emerald-400 font-mono font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Validated
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-300">Export Compatibility Formats</span>
                          <span className="text-indigo-300 font-mono font-bold text-[11px]">Clean PDF · DOCX · TXT</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stage 02 Mini UI: ATS Diagnostic vs STAR Rewrite */}
                {currentStage.id === 'analyze' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setStage2Tab('diagnostic')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            stage2Tab === 'diagnostic'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-slate-400 bg-slate-900 hover:text-slate-200'
                          }`}
                        >
                          Match Diagnostics
                        </button>
                        <button
                          onClick={() => setStage2Tab('star')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            stage2Tab === 'star'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-slate-400 bg-slate-900 hover:text-slate-200'
                          }`}
                        >
                          STAR Optimization
                        </button>
                      </div>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/25">
                        Target: Backend Engineer
                      </span>
                    </div>

                    {stage2Tab === 'diagnostic' ? (
                      <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 flex flex-col items-center justify-center font-black">
                              <span className="text-base leading-none">92</span>
                              <span className="text-[8px] font-mono text-purple-400">/100</span>
                            </div>
                            <div>
                              <div className="font-bold text-white">ATS Readiness Match</div>
                              <div className="text-[11px] text-slate-400">Illustrative score against Junior Cloud Engineer</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            High Readiness
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Matched Keywords (5 of 6)</span>
                            <span className="text-purple-400 font-mono font-bold">88%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 w-[88%]" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-mono">Missing Recommended:</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                            + Apache Kafka
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                            + Redis Caching
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setStage2StarVersion('before')}
                              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
                                stage2StarVersion === 'before'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'text-slate-400 bg-slate-900'
                              }`}
                            >
                              Original Statement
                            </button>
                            <button
                              onClick={() => setStage2StarVersion('after')}
                              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
                                stage2StarVersion === 'after'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'text-slate-400 bg-slate-900'
                              }`}
                            >
                              AI Rewrite (+22 Pts)
                            </button>
                          </div>
                          <span className="text-[10px] text-purple-300 font-mono">STAR Pattern</span>
                        </div>

                        {stage2StarVersion === 'before' ? (
                          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-slate-400 italic leading-relaxed text-[11px]">
                            "Worked on creating backend APIs for a student project using Java and database queries."
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 leading-relaxed text-[11px]">
                            "Architected 8+ RESTful microservice endpoints with Spring Boot & PostgreSQL, cutting response latency by 34% across 10,000+ benchmarked queries."
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Stage 03 Mini UI: Curated Matching Jobs */}
                {currentStage.id === 'discover' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-cyan-400" /> High-Affinity Opportunity Matches
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300">Live Compatibility Filter</span>
                    </div>

                    <div className="space-y-2">
                      <div
                        onClick={() => setStage3SelectedJob(1)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          stage3SelectedJob === 1
                            ? 'bg-slate-900 border-cyan-500/50 shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-cyan-400">#1 MATCHING ROLE</span>
                            <div className="text-xs font-bold text-white">Junior Cloud Backend Engineer</div>
                            <div className="text-[10px] text-slate-400">Acme Cloud Labs · Bengaluru (Hybrid)</div>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-black text-cyan-400 font-mono">94%</span>
                            <span className="text-[9px] text-cyan-300 block font-bold">MATCH</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {['Java 21', 'Spring Boot', 'PostgreSQL', 'Docker'].map((tag) => (
                            <span key={tag} className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                              ✓ {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div
                        onClick={() => setStage3SelectedJob(2)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          stage3SelectedJob === 2
                            ? 'bg-slate-900 border-cyan-500/50 shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400">#2 MATCHING ROLE</span>
                            <div className="text-xs font-bold text-white">Associate Full Stack Developer</div>
                            <div className="text-[10px] text-slate-400">NexGen Tech · Hyderabad (Remote)</div>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-black text-slate-300 font-mono">88%</span>
                            <span className="text-[9px] text-slate-400 block font-bold">MATCH</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {['React 19', 'TypeScript', 'Node.js', 'REST APIs'].map((tag) => (
                            <span key={tag} className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                              ✓ {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 04 Mini UI: 6-Stage Application Pipeline & Shortlist Dossier */}
                {currentStage.id === 'shortlist' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Active Application Lifecycle
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                        Shortlist Synced
                      </span>
                    </div>

                    {/* 6 Lifecycle Steps */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
                      {[
                        { label: 'Resume Prepared', status: 'completed' },
                        { label: 'Application Sent', status: 'completed' },
                        { label: 'Under Review', status: 'completed' },
                        { label: 'Shortlisted', status: 'active' },
                        { label: 'Interview Set', status: 'upcoming' },
                        { label: 'Decision', status: 'upcoming' },
                      ].map((step, sIdx) => (
                        <div
                          key={sIdx}
                          className={`p-2 rounded-lg border text-[10px] ${
                            step.status === 'completed'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : step.status === 'active'
                              ? 'bg-indigo-600/20 border-indigo-500/60 text-white font-bold ring-1 ring-indigo-500/50'
                              : 'bg-slate-900/60 border-slate-800 text-slate-500'
                          }`}
                        >
                          <div className="font-mono text-[9px] mb-0.5">0{sIdx + 1}</div>
                          <div className="truncate font-medium">{step.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Recruiter Review Dossier</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">Fast-Track Status</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        "Candidate's verified backend skills match 94% of requirement criteria. Profile shortlisted for Round 1 Technical Architecture interview."
                      </p>
                      <div className="text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                        <span>Simulated Demonstration Evaluation</span>
                        <span>Acme Cloud Labs</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (5 cols): Stage Narrative, Core Highlights & Clear Action Button */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-card-elevated rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
                {/* Subtle top corner gradient accent */}
                <div
                  className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-30 ${
                    currentStage.accentColor === 'indigo'
                      ? 'bg-indigo-500'
                      : currentStage.accentColor === 'purple'
                      ? 'bg-purple-500'
                      : currentStage.accentColor === 'cyan'
                      ? 'bg-cyan-500'
                      : 'bg-emerald-500'
                  }`}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-900 text-indigo-300 border border-indigo-500/30">
                      {currentStage.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Step {currentStage.number} / 04</span>
                  </div>

                  <h4 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                    {currentStage.headline}
                  </h4>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {currentStage.description}
                  </p>
                </div>

                {/* Stage Highlights Checklist */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
                  {currentStage.id === 'build' && (
                    <>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>ATS-compliant single column layouts that never get scrambled by OCR parsers</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Organized sections for Education, Technical Skills, Projects & Certifications</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Instant one-click exports to standard PDF, DOCX, and text formats</span>
                      </div>
                    </>
                  )}

                  {currentStage.id === 'analyze' && (
                    <>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>5-vector semantic parsing to calculate real-time job compatibility scores</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>Clear missing keyword identification to target exact recruiter filters</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>Actionable STAR-method bullet rewriting suggestions to quantify impact</span>
                      </div>
                    </>
                  )}

                  {currentStage.id === 'discover' && (
                    <>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>Curated tech openings scored automatically against your verified skills</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>Transparent requirements inspection with matched vs. missing skill tags</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>Direct application flows with complete tracking from a single candidate hub</span>
                      </div>
                    </>
                  )}

                  {currentStage.id === 'shortlist' && (
                    <>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Real-time visibility into application review status across 6 pipeline stages</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Direct sync with recruiter evaluation workbenches and interview queues</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Automated notification alerts when your profile advances to shortlists</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Primary Action Button */}
                <div className="pt-2 space-y-2">
                  <Link to={getDestinationUrl(currentStage.actionRoute)} className="block">
                    <Button
                      variant={currentStage.accentColor === 'indigo' || currentStage.accentColor === 'emerald' ? 'glow' : 'secondary'}
                      size="md"
                      className="w-full font-bold shadow-glow flex items-center justify-center gap-2"
                    >
                      <span>{currentStage.actionText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <p className="text-[11px] text-slate-400 text-center">
                    {currentStage.actionDescription}
                  </p>
                </div>

                {/* Stepper Controls: Previous / Next Stage */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <button
                    onClick={handlePrevStage}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-900"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous Step</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {JOURNEY_STAGES.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setActiveStageIndex(dotIdx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          dotIdx === activeStageIndex ? 'w-6 bg-indigo-500' : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        aria-label={`Jump to stage ${dotIdx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNextStage}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded hover:bg-slate-900"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
