import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  FileText,
  Target,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  Eye,
  Check,
  Award,
  ChevronRight,
  ShieldCheck,
  Filter,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

/* ============================================================
   DEMONSTRATION CANDIDATE DOSSIERS (Consistent Sample Data)
   ============================================================ */
interface DemoCandidate {
  id: string;
  name: string;
  role: string;
  experience: string;
  matchScore: number;
  status: 'Under Review' | 'Shortlisted' | 'Interview Scheduled';
  avatarInitials: string;
  skills: string[];
  missingSkills: string[];
  education: string;
  summary: string;
}

const DEMO_CANDIDATES: DemoCandidate[] = [
  {
    id: 'cand-1',
    name: 'Alex Rivera',
    role: 'Senior Java Backend Engineer',
    experience: '6+ Years Experience',
    matchScore: 94.8,
    status: 'Shortlisted',
    avatarInitials: 'AR',
    skills: ['Java 21', 'Spring Boot', 'REST APIs', 'PostgreSQL', 'Docker'],
    missingSkills: ['Apache Kafka'],
    education: 'B.Tech in Computer Science & Engineering',
    summary:
      'Architected high-throughput Spring Boot microservices, cutting p99 latency by 38% for 10M+ daily events. Clean single-column ATS resume structure.',
  },
  {
    id: 'cand-2',
    name: 'Maya Chen',
    role: 'Backend Systems Lead',
    experience: '5 Years Experience',
    matchScore: 91.2,
    status: 'Under Review',
    avatarInitials: 'MC',
    skills: ['Java 17', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Kubernetes'],
    missingSkills: ['REST APIs (Documented)'],
    education: 'M.S. in Software Systems',
    summary:
      'Engineered cloud-native backend platforms, distributed caching layers, and high-availability database replication schemas.',
  },
  {
    id: 'cand-3',
    name: 'Jordan Patel',
    role: 'Cloud Platform Engineer',
    experience: '4.5 Years Experience',
    matchScore: 87.5,
    status: 'Under Review',
    avatarInitials: 'JP',
    skills: ['Java', 'REST APIs', 'Docker', 'AWS', 'SQL'],
    missingSkills: ['Spring Boot 3', 'Redis'],
    education: 'B.E. in Information Technology',
    summary:
      'Designed containerized microservice pipelines on AWS ECS with zero-downtime blue/green deployment automations.',
  },
];

/* ============================================================
   FIVE-STAGE RECRUITMENT JOURNEY STAGES
   ============================================================ */
interface RecruiterStage {
  id: number;
  stageNumber: string;
  title: string;
  shortTitle: string;
  headline: string;
  explanation: string;
  badge: string;
  icon: React.ElementType;
  imageSrc: string;
  imageAlt: string;
  imageCaption: string;
}

const RECRUITER_STAGES: RecruiterStage[] = [
  {
    id: 0,
    stageNumber: '01',
    title: 'Applications Arrive',
    shortTitle: 'Incoming Applicants',
    headline: 'Bring Candidate Applications Together in One Streamlined Queue',
    explanation:
      'Bring candidate applications together so recruiters can review incoming applicants in one place with automatic status tagging, timestamping, and verified identity records.',
    badge: 'Stage 01 · Triage & Intake',
    icon: Users,
    imageSrc: '/assets/recruiter-office-hero.jpg',
    imageAlt: 'Recruiter at modern office desk reviewing incoming candidate applications on laptop',
    imageCaption: 'Real-world recruitment intake: Triage applicants across requisitions in a unified workspace',
  },
  {
    id: 1,
    stageNumber: '02',
    title: 'Review the Resume',
    shortTitle: 'Resume Inspection',
    headline: 'Deep Document Review with Section Extraction & ATS Verification',
    explanation:
      'Review resume details, including technical skills, education, employment chronology, and verified credentials parsed directly from single-column ATS layouts.',
    badge: 'Stage 02 · Document Review',
    icon: FileText,
    imageSrc: '/assets/recruiter-resume-review.jpg',
    imageAlt: 'Recruiter inspecting printed resume documents and job description specifications beside laptop',
    imageCaption: 'Multi-vector document parsing: Evaluating structural integrity, skill taxonomy, and career chronology',
  },
  {
    id: 2,
    stageNumber: '03',
    title: 'Compare Job Requirements',
    shortTitle: 'Requisition Matching',
    headline: 'Multi-Dimensional Skill & Experience Compatibility Diagnostics',
    explanation:
      'Compare candidate information with the selected job’s requirements to help identify relevant skills, experience depth, and potential gaps without manual spreadsheet mapping.',
    badge: 'Stage 03 · Skill Verification',
    icon: Target,
    imageSrc: '/assets/recruiter-resume-review.jpg',
    imageAlt: 'Job description requirements compared against candidate skill matrix on screen',
    imageCaption: 'Requisition alignment: Comparing verified competencies against Java Backend Developer requirements',
  },
  {
    id: 3,
    stageNumber: '04',
    title: 'Review Promising Candidates',
    shortTitle: 'Shortlist Evaluation',
    headline: 'Organize High-Affinity Profiles for Collaborative Hiring Decisions',
    explanation:
      'Organize promising candidates for closer review based on job-related metrics, candidate dossiers, and team hiring recommendations before advancing to interview rounds.',
    badge: 'Stage 04 · Shortlist Queue',
    icon: Sparkles,
    imageSrc: '/assets/recruiter-candidate-shortlist.jpg',
    imageAlt: 'Recruiter reviewing candidate shortlist on laptop with job-fit indicators and notes',
    imageCaption: 'Shortlist review: Transitioning high-affinity candidates into active interview pipelines',
  },
  {
    id: 4,
    stageNumber: '05',
    title: 'Recruiter Decision',
    shortTitle: 'Interview Dispatch',
    headline: 'Fast-Track Eligible Candidates Directly to Hiring Team Queues',
    explanation:
      'Continue with your hiring workflow by updating application stages, scheduling interview rounds, and dispatching notifications to candidates in real time.',
    badge: 'Stage 05 · Decision & Action',
    icon: UserCheck,
    imageSrc: '/assets/recruiter-candidate-shortlist.jpg',
    imageAlt: 'Recruiter finalizing candidate interview schedule and updating hiring status',
    imageCaption: 'Decision execution: Dispatching interview invitations and synchronizing talent pools',
  },
];

export const RecruiterFeaturesSection: React.FC = () => {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('cand-1');
  const [selectedRequirement, setSelectedRequirement] = useState<string>('Java 21');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const { isAuthenticated, role } = useAuth();
  const activeStage = RECRUITER_STAGES[activeStageIndex];
  const selectedCandidate =
    DEMO_CANDIDATES.find((c) => c.id === selectedCandidateId) || DEMO_CANDIDATES[0];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auth-aware recruiter navigation helper
  const getRecruiterDestination = (path: string) => {
    if (isAuthenticated && (role === 'recruiter' || role === 'admin')) {
      return path;
    }
    return `/login/recruiter?redirect=${encodeURIComponent(path)}`;
  };

  // Optional auto-play progression
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalTime = 100;
    const duration = 7000; // 7s per stage
    const increment = (intervalTime / duration) * 100;

    timerRef.current = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          setActiveStageIndex((curr) => (curr + 1) % RECRUITER_STAGES.length);
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, activeStageIndex]);

  const handleSelectStage = (idx: number) => {
    setActiveStageIndex(idx);
    setProgressPercent(0);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleRestart = () => {
    setActiveStageIndex(0);
    setProgressPercent(0);
    setIsPlaying(false);
  };

  const handlePrevStage = () => {
    setActiveStageIndex((prev) => (prev > 0 ? prev - 1 : RECRUITER_STAGES.length - 1));
    setProgressPercent(0);
  };

  const handleNextStage = () => {
    setActiveStageIndex((prev) => (prev < RECRUITER_STAGES.length - 1 ? prev + 1 : 0));
    setProgressPercent(0);
  };

  return (
    <section
      id="recruiters"
      className="scroll-mt-24 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-950/70"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -right-40 w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-[32rem] h-[32rem] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold backdrop-blur-md shadow-glow">
            <Briefcase className="w-3.5 h-3.5 text-purple-400" />
            <span>For Recruiters & Talent Acquisition Teams</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
            From hundreds of applications to the right{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-300 to-cyan-300">
              candidates.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Review applications, compare job-related skills, and organize promising candidates in one recruitment workflow.
          </p>

          {/* Interactive Playback Toolbar */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-xl backdrop-blur-md">
              <button
                onClick={handleTogglePlay}
                className="flex items-center gap-1.5 font-semibold text-white hover:text-purple-400 transition-colors pr-2 border-r border-slate-700 focus:outline-none"
                aria-label={isPlaying ? 'Pause interactive demo' : 'Play interactive demo'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
                    <span>Pause Demo</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                    <span>Auto Play</span>
                  </>
                )}
              </button>

              <button
                onClick={handleRestart}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors pr-2 border-r border-slate-700 focus:outline-none"
                aria-label="Restart recruitment flow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 pl-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span>
                  Stage {activeStage.stageNumber} of 05:{' '}
                  <strong className="text-white font-sans">{activeStage.title}</strong>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Five-Stage Journey Progress Rail */}
        <div className="relative">
          {/* Progress track line */}
          <div className="hidden md:block absolute top-1/2 left-6 right-6 h-[2px] -translate-y-1/2 bg-slate-800 -z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 transition-all duration-300"
              style={{
                width: `${(activeStageIndex / (RECRUITER_STAGES.length - 1)) * 100}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 relative z-10">
            {RECRUITER_STAGES.map((stage, idx) => {
              const isActive = idx === activeStageIndex;
              const isPast = idx < activeStageIndex;
              const Icon = stage.icon;

              return (
                <button
                  key={stage.id}
                  onClick={() => handleSelectStage(idx)}
                  className={`group relative p-3 rounded-2xl border text-left transition-all duration-300 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500/50 overflow-hidden ${
                    isActive
                      ? 'bg-slate-900/95 border-purple-500/70 shadow-lg shadow-purple-500/15 ring-1 ring-purple-500/40'
                      : isPast
                      ? 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                  aria-selected={isActive}
                  role="tab"
                >
                  {/* Active stage timer progress bar */}
                  {isActive && isPlaying && (
                    <div
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-100 ease-linear"
                      style={{ width: `${progressPercent}%` }}
                    />
                  )}

                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : isPast
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {stage.stageNumber}
                    </span>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-glow'
                          : isPast
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <div className="text-xs font-bold text-white tracking-tight line-clamp-1">
                    {stage.shortTitle}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {isActive ? (
                      <span className="text-purple-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> Active Stage
                      </span>
                    ) : isPast ? (
                      <span className="text-emerald-400/90 font-medium">Completed</span>
                    ) : (
                      'Upcoming'
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coordinated Two-Column Stage Workspace */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage.id}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
          >
            {/* Left Column (7 cols): Cinematic Recruiter Photo + Real Interactive UI Component */}
            <div className="lg:col-span-7 space-y-4">
              {/* Supporting Photographic Banner */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl group">
                <img
                  src={activeStage.imageSrc}
                  alt={activeStage.imageAlt}
                  className="w-full h-56 sm:h-72 md:h-80 object-cover object-center group-hover:scale-[1.01] transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md text-slate-200 border border-slate-700/80 flex items-center gap-1.5 shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    {activeStage.badge}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                  <p className="text-[11px] text-slate-200 font-medium bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 max-w-lg shadow-sm">
                    {activeStage.imageCaption}
                  </p>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950/90 px-2 py-1 rounded border border-slate-800 hidden sm:inline-block">
                    Stage {activeStage.stageNumber} / 05
                  </span>
                </div>
              </div>

              {/* Realistic Interactive Software Interface Overlays */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/95 p-5 space-y-4 shadow-xl backdrop-blur-md">
                {/* STAGE 01 OVERLAY: Incoming Applications Queue */}
                {activeStage.id === 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-purple-400" /> Incoming Requisition Queue
                        </span>
                        <span className="text-[10px] text-slate-400">Requisition #REQ-204 · Java Backend Developer</span>
                      </div>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/25">
                        3 New Applicants
                      </span>
                    </div>

                    <div className="space-y-2">
                      {DEMO_CANDIDATES.map((cand) => (
                        <div
                          key={cand.id}
                          onClick={() => setSelectedCandidateId(cand.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            selectedCandidateId === cand.id
                              ? 'bg-slate-900 border-purple-500/60 shadow-sm'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-xs">
                              {cand.avatarInitials}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">{cand.name}</div>
                              <div className="text-[10px] text-slate-400">
                                {cand.role} · {cand.experience}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-emerald-400">
                                {cand.matchScore}%
                              </span>
                              <span className="text-[9px] text-slate-400 block">Match</span>
                            </div>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                cand.status === 'Shortlisted'
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                              }`}
                            >
                              {cand.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STAGE 02 OVERLAY: Detailed Resume Section Inspection */}
                {activeStage.id === 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-purple-400" /> Resume Section Extraction
                        </span>
                        <span className="text-[10px] text-slate-400">Candidate: {selectedCandidate.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Validated Single-Column Layout
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          Professional Summary
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed pt-0.5">
                          "{selectedCandidate.summary}"
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <div className="text-[10px] font-mono text-slate-400 uppercase">Education</div>
                          <div className="text-[11px] text-white font-medium">{selectedCandidate.education}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-slate-400 uppercase">Experience Depth</div>
                          <div className="text-[11px] text-white font-medium">{selectedCandidate.experience}</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80">
                        <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">
                          Extracted Skill Entities
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedCandidate.skills.map((s) => (
                            <span
                              key={s}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/25"
                            >
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 03 OVERLAY: Job Requirement Comparison Matrix */}
                {activeStage.id === 2 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-cyan-400" /> Requisition Skill Comparison
                        </span>
                        <span className="text-[10px] text-slate-400">Requisition: Java Backend Developer</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                        {selectedCandidate.matchScore}% Match Index
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {[
                        { req: 'Java 21', status: 'Matched', evidence: '6+ yrs core development' },
                        { req: 'Spring Boot', status: 'Matched', evidence: 'High-throughput microservices' },
                        { req: 'REST APIs', status: 'Matched', evidence: 'Designed & maintained endpoints' },
                        { req: 'PostgreSQL', status: 'Matched', evidence: 'Complex query optimization' },
                        { req: 'Docker / Containers', status: 'Matched', evidence: 'Containerized deployments' },
                        { req: 'Apache Kafka', status: 'Gap', evidence: 'Unconfirmed in candidate resume' },
                      ].map((item) => (
                        <div
                          key={item.req}
                          onClick={() => setSelectedRequirement(item.req)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            selectedRequirement === item.req
                              ? 'bg-slate-900 border-indigo-500/60 shadow-sm'
                              : 'bg-slate-900/60 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {item.status === 'Matched' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                            <div>
                              <span className="font-bold text-white text-[11px]">{item.req}</span>
                              <span className="text-[10px] text-slate-400 ml-2 hidden sm:inline">
                                ({item.evidence})
                              </span>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                              item.status === 'Matched'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STAGE 04 OVERLAY: Review Promising Candidates & Shortlist */}
                {activeStage.id === 3 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Collaborative Shortlist Workspace
                        </span>
                        <span className="text-[10px] text-slate-400">Target Role: Java Backend Developer</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                        Shortlisted Tier
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                            AR
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Alex Rivera</div>
                            <div className="text-[10px] text-slate-400">Senior Java Backend Engineer · 94.8% Fit</div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                          SHORTLISTED
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-800 pt-2">
                        "Candidate demonstrates deep experience in high-concurrency Spring Boot microservices and clean API contracts. Selected for Round 1 Architecture panel."
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
                        <span>Reviewer: Sarah Thompson (Lead Tech Recruiter)</span>
                        <span className="text-emerald-400 font-bold">Ready for Interview</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 05 OVERLAY: Recruiter Decision & Interview Dispatch */}
                {activeStage.id === 4 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Pipeline Decision & Next Steps
                        </span>
                        <span className="text-[10px] text-slate-400">Stage: Interview Dispatch</span>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">
                        Hiring Queue Synced
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400">Action</div>
                        <div className="font-bold text-white text-[11px] mt-0.5">Interview Round 1</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400">Date</div>
                        <div className="font-bold text-white text-[11px] mt-0.5">Oct 24, 2026</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400">Panel</div>
                        <div className="font-bold text-white text-[11px] mt-0.5">Staff Architect</div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center justify-between">
                      <span>✓ Candidate notified of shortlisting via automated notification</span>
                      <span className="font-mono text-[10px]">Status: Active</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (5 cols): Narrative Card, Checklists & Action Buttons */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-card-elevated rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-900 text-purple-300 border border-purple-500/30">
                      {activeStage.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Stage {activeStage.stageNumber} / 05</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                    {activeStage.headline}
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {activeStage.explanation}
                  </p>
                </div>

                {/* Stage Highlights Checklist */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
                  {activeStage.id === 0 && (
                    <>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>Unified candidate intake across all active corporate job postings</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>Automated applicant deduplication and timestamped receipt tracking</span>
                      </div>
                    </>
                  )}

                  {activeStage.id === 1 && (
                    <>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>Zero OCR parsing errors with verified single-column text extraction</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>Structured presentation of skills, employment history, and education</span>
                      </div>
                    </>
                  )}

                  {activeStage.id === 2 && (
                    <>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>Precision match calculation against exact requisition skill criteria</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>Instant identification of missing or unconfirmed technical competencies</span>
                      </div>
                    </>
                  )}

                  {activeStage.id === 3 && (
                    <>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>High-affinity candidate curation for fast hiring-manager review</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>Candidate dossiers with quantified STAR accomplishments and notes</span>
                      </div>
                    </>
                  )}

                  {activeStage.id === 4 && (
                    <>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>One-click candidate promotion directly into active interview rounds</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Automated applicant notifications and recruiter dashboard synchronization</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Primary Route Action Button */}
                <div className="pt-2 space-y-2">
                  <Link to={getRecruiterDestination('/recruiter/applicants')} className="block">
                    <Button
                      variant={activeStage.id === 4 ? 'glow' : 'secondary'}
                      size="md"
                      className="w-full font-bold shadow-glow flex items-center justify-center gap-2 hover:border-purple-500/60"
                    >
                      <span>Explore Recruiter Screening</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>

                  <p className="text-[10px] font-mono text-slate-400 text-center">
                    Simulated Recruiter Demonstration · Fictional Demonstration Data
                  </p>
                </div>

                {/* Stepper Controls: Previous / Next Stage */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <button
                    onClick={handlePrevStage}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-900"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous Stage</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {RECRUITER_STAGES.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => handleSelectStage(dotIdx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          dotIdx === activeStageIndex ? 'w-6 bg-purple-500' : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        aria-label={`Jump to stage ${dotIdx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNextStage}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors px-2 py-1 rounded hover:bg-slate-900"
                  >
                    <span>Next Stage</span>
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
