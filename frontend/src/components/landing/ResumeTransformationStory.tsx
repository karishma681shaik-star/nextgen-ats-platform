import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  FileSearch,
  Briefcase,
  UserCheck,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Target,
  Award,
  GraduationCap,
  Code2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Building2,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

/* ============================================================
   CINEMATIC SCENE DEFINITIONS & DEMONSTRATION DATA
   4 Connected scenes telling the complete recruitment story
   ============================================================ */
interface CinematicScene {
  id: number;
  sceneNumber: string;
  name: string;
  heading: string;
  description: string;
  badge: string;
  icon: React.ElementType;
  imageSrc: string;
  imageAlt: string;
  imageCaption: string;
  primaryActionText: string;
  primaryActionRoute: string;
  disclaimer: string;
}

const CINEMATIC_SCENES: CinematicScene[] = [
  {
    id: 0,
    sceneNumber: '01',
    name: 'The Candidate',
    heading: 'It Starts with Your Resume',
    description:
      'Create a professional profile that brings your education, skills, projects, and experience together with single-column ATS layouts and verified zero-error parsing structures.',
    badge: 'Scene 01 · Candidate Preparation',
    icon: FileText,
    imageSrc: '/assets/pipeline-scene-candidate.jpg',
    imageAlt: 'Final-year Indian computer science student preparing a professional resume on laptop',
    imageCaption: 'Real-world preparation: Engineering candidate structuring credentials for automated parsers',
    primaryActionText: 'Prepare Your Resume',
    primaryActionRoute: '/candidate/resumes',
    disclaimer: 'Demonstration Profile: Rohit Sharma (Final-Year B.Tech CSE, Tier-1 Institute)',
  },
  {
    id: 1,
    sceneNumber: '02',
    name: 'Intelligent Analysis',
    heading: 'Your Resume Gets Analyzed',
    description:
      'The platform extracts relevant information and evaluates your resume against job requirements using 5-vector semantic scoring, keyword gap diagnostics, and quantified STAR rewrite suggestions.',
    badge: 'Scene 02 · ATS Intelligence',
    icon: FileSearch,
    imageSrc: '/assets/pipeline-scene-analysis.jpg',
    imageAlt: 'Laptop displaying sophisticated ATS resume analysis dashboard with score and keyword extraction',
    imageCaption: '5-vector deep diagnostic: OCR extraction, semantic ontology match, and keyword gap analysis',
    primaryActionText: 'Run ATS Analysis',
    primaryActionRoute: '/candidate/resume-analysis',
    disclaimer: 'Illustrative ATS Readiness: 92/100 · Fictional benchmark demonstration',
  },
  {
    id: 2,
    sceneNumber: '03',
    name: 'Job Matching',
    heading: 'Find the Right Opportunity',
    description:
      'Compare your skills with job requirements and manage your applications in one place. Discover roles that precisely match your verified tech stack with transparent affinity metrics.',
    badge: 'Scene 03 · Opportunity Alignment',
    icon: Briefcase,
    imageSrc: '/assets/pipeline-scene-matching.jpg',
    imageAlt: 'Young Indian software engineer reviewing curated job matches and application tracker on laptop',
    imageCaption: 'Vector match engine: Calculating skill compatibility and tracking live application progression',
    primaryActionText: 'Explore Matched Roles',
    primaryActionRoute: '/jobs',
    disclaimer: 'Simulated Opportunity Matching · Verified skill alignment demonstration',
  },
  {
    id: 3,
    sceneNumber: '04',
    name: 'Recruiter Review',
    heading: 'Your Application Reaches the Recruiter',
    description:
      'Recruiters can review candidate profiles, compare relevant skills, and update application stages. Candidate dossiers are synchronized directly into active talent pools and interview queues.',
    badge: 'Scene 04 · Recruiter Decision',
    icon: UserCheck,
    imageSrc: '/assets/pipeline-scene-recruiter.jpg',
    imageAlt: 'Corporate talent recruiter reviewing candidate profile on large monitor and approving shortlist',
    imageCaption: 'Recruiter workstation: Candidate evaluation, skill verification, and direct shortlist pipeline',
    primaryActionText: 'Track Application Journey',
    primaryActionRoute: '/candidate/applications',
    disclaimer: 'Simulated Recruiter Review Dossier · Fast-Track Shortlist Status',
  },
];

export const ResumeTransformationStory: React.FC = () => {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0);

  // Active scene interactive state toggles
  const [scene2Tab, setScene2Tab] = useState<'diagnostic' | 'star'>('diagnostic');
  const [scene2StarMode, setScene2StarMode] = useState<'original' | 'rewrite'>('rewrite');
  const [scene3SelectedRole, setScene3SelectedRole] = useState<1 | 2>(1);

  const { isAuthenticated } = useAuth();
  const activeScene = CINEMATIC_SCENES[activeSceneIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper for auth-aware navigation routes
  const getDestinationUrl = (baseRoute: string) => {
    if (isAuthenticated) {
      return baseRoute;
    }
    if (baseRoute === '/jobs') {
      return '/jobs';
    }
    return `/login/candidate?redirect=${encodeURIComponent(baseRoute)}`;
  };

  // Auto-play timer for cinematic presentation (8 seconds per scene)
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalTime = 80; // updates every 80ms
    const totalDuration = 8000; // 8 seconds per scene
    const increment = (intervalTime / totalDuration) * 100;

    timerRef.current = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          setActiveSceneIndex((current) => (current + 1) % CINEMATIC_SCENES.length);
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, activeSceneIndex]);

  const handleSelectScene = (index: number) => {
    setActiveSceneIndex(index);
    setProgressPercent(0);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleRestart = () => {
    setActiveSceneIndex(0);
    setProgressPercent(0);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setActiveSceneIndex((prev) => (prev > 0 ? prev - 1 : CINEMATIC_SCENES.length - 1));
    setProgressPercent(0);
  };

  const handleNext = () => {
    setActiveSceneIndex((prev) => (prev < CINEMATIC_SCENES.length - 1 ? prev + 1 : 0));
    setProgressPercent(0);
  };

  return (
    <section
      id="pipeline-story"
      className="scroll-mt-24 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-950/80"
    >
      {/* Cinematic Ambient Atmosphere Glows */}
      <div className="absolute top-1/4 -left-48 w-[32rem] h-[32rem] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -right-48 w-[36rem] h-[36rem] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-96 bg-cyan-600/5 rounded-full blur-[180px] pointer-events-none" />

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
            <span>Interactive AI Transformation Pipeline</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
            From Resume to Opportunity
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            See how a candidate's profile moves from resume preparation and intelligent analysis to job matching and recruiter review.
          </p>

          {/* Film Director Toolbar: Play / Pause, Restart, Progress Meter */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-xl backdrop-blur-md">
              <button
                onClick={handleTogglePlay}
                className="flex items-center gap-1.5 font-semibold text-white hover:text-indigo-400 transition-colors pr-2 border-r border-slate-700 focus:outline-none"
                aria-label={isPlaying ? 'Pause film demo' : 'Play film demo'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                    <span>Pause Film</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                    <span>Play Film</span>
                  </>
                )}
              </button>

              <button
                onClick={handleRestart}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors pr-2 border-r border-slate-700 focus:outline-none"
                aria-label="Restart film"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Restart</span>
              </button>

              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 pl-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span>
                  Scene {activeScene.sceneNumber} of 04:{' '}
                  <strong className="text-white font-sans">{activeScene.name}</strong>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4 Connected Story Timeline Rail */}
        <div className="relative">
          {/* Subtle connecting progression track */}
          <div className="hidden md:block absolute top-1/2 left-6 right-6 h-[2px] -translate-y-1/2 bg-slate-800/90 -z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-300"
              style={{
                width: `${(activeSceneIndex / (CINEMATIC_SCENES.length - 1)) * 100}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
            {CINEMATIC_SCENES.map((scene, idx) => {
              const isActive = idx === activeSceneIndex;
              const isPast = idx < activeSceneIndex;
              const Icon = scene.icon;

              return (
                <button
                  key={scene.id}
                  onClick={() => handleSelectScene(idx)}
                  className={`group relative p-3 sm:p-4 rounded-2xl border text-left transition-all duration-300 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 overflow-hidden ${
                    isActive
                      ? 'bg-slate-900/95 border-indigo-500/70 shadow-xl shadow-indigo-500/15 ring-1 ring-indigo-500/40'
                      : isPast
                      ? 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                  aria-selected={isActive}
                  role="tab"
                >
                  {/* Subtle active progress bar indicator inside active tab */}
                  {isActive && isPlaying && (
                    <div
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-100 ease-linear"
                      style={{ width: `${progressPercent}%` }}
                    />
                  )}

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
                      {scene.sceneNumber}
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
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-1">
                    {scene.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {isActive ? (
                      <span className="text-indigo-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> Active Scene
                      </span>
                    ) : isPast ? (
                      <span className="text-emerald-400/90 font-medium">Completed</span>
                    ) : (
                      'Next in Story'
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cinematic Mainstage: Visual Canvas + Real Software Overlays */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScene.id}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
          >
            {/* Left Main View (7 cols): Cinematic Film Shot with Rich Software Overlays */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl group">
                {/* 16:9 Cinematic Photograph */}
                <motion.img
                  key={activeScene.imageSrc}
                  initial={{ scale: 1.03 }}
                  animate={{ scale: 1.0 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  src={activeScene.imageSrc}
                  alt={activeScene.imageAlt}
                  className="w-full h-64 sm:h-80 md:h-96 object-cover object-center"
                  loading="lazy"
                />

                {/* Dark Vignette and Gradient Overlay for Cinematic Depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/20 to-slate-950/60 pointer-events-none" />

                {/* Scanning laser beam animation for Scene 02 (Analysis) */}
                {activeScene.id === 1 && (
                  <motion.div
                    initial={{ top: '10%' }}
                    animate={{ top: ['15%', '85%', '15%'] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] pointer-events-none z-20"
                  />
                )}

                {/* Top Badge Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md text-slate-200 border border-slate-700/80 flex items-center gap-2 shadow-lg">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      {activeScene.badge}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-300 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700/80 shadow-lg">
                    Scene {activeScene.sceneNumber} / 04
                  </span>
                </div>

                {/* Bottom Context Caption Overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <div className="flex items-end justify-between gap-3">
                    <p className="text-xs text-slate-200 font-medium bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 shadow-xl max-w-lg leading-relaxed">
                      {activeScene.imageCaption}
                    </p>
                  </div>
                </div>
              </div>

              {/* Realistic Interactive Software Overlay Interface */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/95 p-5 space-y-4 shadow-xl relative overflow-hidden backdrop-blur-md">
                {/* SCENE 01 OVERLAY: Candidate Sections & Single-Column Structure */}
                {activeScene.id === 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-400" /> Candidate Resume Structure
                        </span>
                        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">
                          Single-Column Hierarchy
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 0 OCR Parsing Errors
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-white flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Education Section
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">2021 – 2025</span>
                        </div>
                        <p className="text-[11px] text-slate-300">B.Tech in Computer Science & Engineering</p>
                        <p className="text-[10px] text-slate-400">Indian Institute of Technology · CGPA: 8.8 / 10.0</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-white flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-indigo-400" /> Certifications & Projects
                          </span>
                          <span className="text-[10px] font-mono text-indigo-300">AWS Certified</span>
                        </div>
                        <p className="text-[11px] text-slate-300">AWS Certified Developer Associate (DVA-C02)</p>
                        <p className="text-[10px] text-slate-400">Distributed Cloud Storage Microservice</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center justify-between mb-1 text-[11px]">
                        <span className="font-bold text-white flex items-center gap-1">
                          <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Verified Technical Skills Matrix
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">6 Verified Entities</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {['Java 21', 'Spring Boot', 'React 19', 'PostgreSQL', 'Docker', 'RESTful APIs'].map(
                          (skill) => (
                            <span
                              key={skill}
                              className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
                            >
                              ✓ {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SCENE 02 OVERLAY: ATS Analysis, Keyword Gaps, STAR Optimization */}
                {activeScene.id === 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setScene2Tab('diagnostic')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            scene2Tab === 'diagnostic'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-slate-400 bg-slate-900 hover:text-slate-200'
                          }`}
                        >
                          5-Vector Diagnostic
                        </button>
                        <button
                          onClick={() => setScene2Tab('star')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            scene2Tab === 'star'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-slate-400 bg-slate-900 hover:text-slate-200'
                          }`}
                        >
                          STAR Rewrite Suggestions
                        </button>
                      </div>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/25">
                        Target: Junior Cloud Backend
                      </span>
                    </div>

                    {scene2Tab === 'diagnostic' ? (
                      <div className="space-y-2.5 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 flex flex-col items-center justify-center font-black">
                              <span className="text-base leading-none">92</span>
                              <span className="text-[8px] font-mono text-purple-400">/100</span>
                            </div>
                            <div>
                              <div className="font-bold text-white">ATS Compatibility Match</div>
                              <div className="text-[11px] text-slate-400">Deep keyword density & ontology match</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Optimal Readiness
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Keyword Density Match (5 of 6)</span>
                            <span className="text-purple-400 font-mono font-bold">88%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 w-[88%]" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-0.5 flex-wrap">
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
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setScene2StarMode('original')}
                              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
                                scene2StarMode === 'original'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'text-slate-400 bg-slate-900'
                              }`}
                            >
                              Original Statement
                            </button>
                            <button
                              onClick={() => setScene2StarMode('rewrite')}
                              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
                                scene2StarMode === 'rewrite'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'text-slate-400 bg-slate-900'
                              }`}
                            >
                              AI Rewrite (+22 Pts)
                            </button>
                          </div>
                          <span className="text-[10px] text-purple-300 font-mono">STAR Pattern</span>
                        </div>

                        {scene2StarMode === 'original' ? (
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

                {/* SCENE 03 OVERLAY: Curated Job Matches & Application Progression */}
                {activeScene.id === 2 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-cyan-400" /> Curated Job Opportunities
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300">Vector Match Engine</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div
                        onClick={() => setScene3SelectedRole(1)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          scene3SelectedRole === 1
                            ? 'bg-slate-900 border-cyan-500/60 shadow-md'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold text-cyan-400">#1 MATCHING ROLE</span>
                          <span className="text-sm font-black text-cyan-400 font-mono">94%</span>
                        </div>
                        <div className="text-xs font-bold text-white">Junior Cloud Backend Engineer</div>
                        <div className="text-[10px] text-slate-400">Acme Cloud Labs · Bengaluru</div>
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {['Java 21', 'Spring Boot', 'PostgreSQL'].map((tag) => (
                            <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                              ✓ {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div
                        onClick={() => setScene3SelectedRole(2)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          scene3SelectedRole === 2
                            ? 'bg-slate-900 border-cyan-500/60 shadow-md'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400">#2 MATCHING ROLE</span>
                          <span className="text-sm font-black text-slate-300 font-mono">88%</span>
                        </div>
                        <div className="text-xs font-bold text-white">Associate Full Stack Engineer</div>
                        <div className="text-[10px] text-slate-400">NexGen Tech · Remote</div>
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {['React 19', 'TypeScript', 'Docker'].map((tag) => (
                            <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                              ✓ {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recognizable Application Progression Tracker */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-medium">Application Progression:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">1. Submitted</span>
                        <span className="text-slate-600">→</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                          2. Under Review
                        </span>
                        <span className="text-slate-600">→</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                          3. Shortlisted
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SCENE 04 OVERLAY: Recruiter Shortlist Dossier & Decision */}
                {activeScene.id === 3 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Recruiter Evaluation Workbench
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        SHORTLISTED
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">Rohit Sharma · Candidate Evaluation Dossier</div>
                          <div className="text-[10px] text-slate-400">Position: Junior Cloud Backend Engineer · Acme Cloud Labs</div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-emerald-400">94% Match Fit</span>
                          <span className="text-[9px] text-slate-400 block font-mono">High Priority Queue</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-800 pt-2">
                        "Candidate demonstrates verified competency in Spring Boot microservices and clean single-column ATS formatting. Profile shortlisted for Round 1 Technical Architecture interview."
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
                        <span>Recruiter: Sarah Thompson</span>
                        <span className="text-emerald-400 font-bold">Interview Scheduled</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Stage Narrative (5 cols): Story Scene Details, Checklist & Actions */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-card-elevated rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-900 text-indigo-300 border border-indigo-500/30">
                      {activeScene.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Scene {activeScene.sceneNumber} / 04</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                    {activeScene.heading}
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {activeScene.description}
                  </p>
                </div>

                {/* Scene Feature Highlights */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
                  {activeScene.id === 0 && (
                    <>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>Structured builder ensuring clean typography and optimal column hierarchy</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>Direct export to machine-readable PDF, DOCX, and ATS-safe plain text</span>
                      </div>
                    </>
                  )}

                  {activeScene.id === 1 && (
                    <>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>Semantic entity extraction detecting core frameworks and tools</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>Actionable missing keyword recommendations for targeted job alignment</span>
                      </div>
                    </>
                  )}

                  {activeScene.id === 2 && (
                    <>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>Vector match algorithm comparing candidate tech skills against job descriptions</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>Transparent tracking from initial submission to recruiter review</span>
                      </div>
                    </>
                  )}

                  {activeScene.id === 3 && (
                    <>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Enterprise recruiter dashboard surfacing high-affinity candidate profiles</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Direct synchronization with interview scheduling and talent pipeline stages</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Primary Route Action Button */}
                <div className="pt-2 space-y-2">
                  <Link to={getDestinationUrl(activeScene.primaryActionRoute)} className="block">
                    <Button
                      variant={activeScene.id === 0 || activeScene.id === 3 ? 'glow' : 'secondary'}
                      size="md"
                      className="w-full font-bold shadow-glow flex items-center justify-center gap-2"
                    >
                      <span>{activeScene.primaryActionText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>

                  <p className="text-[10px] font-mono text-slate-400 text-center">
                    {activeScene.disclaimer}
                  </p>
                </div>

                {/* Stepper Controls: Previous / Next Scene */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <button
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-900"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous Scene</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {CINEMATIC_SCENES.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => handleSelectScene(dotIdx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          dotIdx === activeSceneIndex ? 'w-6 bg-indigo-500' : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        aria-label={`Jump to scene ${dotIdx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded hover:bg-slate-900"
                  >
                    <span>Next Scene</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Story Climax & Takeaway Message */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/20 to-slate-950 p-6 sm:p-8 text-center space-y-4 shadow-xl max-w-4xl mx-auto"
        >
          <h3 className="text-xl sm:text-2xl font-black text-white font-display">
            Better Preparation. Clearer Insights. A More Organized Job Search.
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Use AI ATS to prepare your resume, understand job compatibility, and track your recruitment journey.
          </p>

          <div className="pt-2">
            <Link to="/jobs">
              <Button variant="glow" size="md" className="font-bold shadow-glow inline-flex items-center gap-2">
                <span>Explore the Platform</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
