import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  ArrowRight,
  Volume2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { AIAssistantEmblem, AIAudioWaveform } from '../common/AIAssistantEmblem';
import { voiceAssistantService } from '../../services/audio/voiceAssistantService';
import type { CandidateDashboardData } from '../../services';
import { HeroWorkspace3DStage } from './HeroWorkspace3DStage';
import { CardReflectiveShine } from '../common/CardReflectiveShine';

interface CandidateHeroSectionProps {
  user: any;
  dashboardData: CandidateDashboardData;
  cleanName: string;
  profileCompletion: number;
  isAiSpeaking: boolean;
  onListenGreeting: () => void;
  onOpenUpload?: () => void;
  onExploreJobs: () => void;
}

export const CandidateHeroSection: React.FC<CandidateHeroSectionProps> = ({
  user,
  dashboardData,
  cleanName,
  profileCompletion,
  isAiSpeaking,
  onListenGreeting,
  onOpenUpload,
  onExploreJobs
}) => {
  const clampedPercentage = Math.max(0, Math.min(100, Math.round(profileCompletion ?? 0)));
  const readiness = dashboardData.profileReadiness;
  const nextRoute = readiness?.nextActionRoute || '/candidate/profile';
  const nextLabel = readiness?.nextActionLabel || (clampedPercentage === 100 ? 'View profile' : 'Complete profile');
  const readinessGuidance = readiness?.guidance || (clampedPercentage === 100
    ? 'Outstanding! Your profile is 100% complete and fully optimized for recruiter searches.'
    : 'Complete your profile credentials and skills to boost recruiter search visibility.');
  const missingChips = (readiness?.missingItems || []).slice(0, 3);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/[0.08] hover:border-indigo-500/25 bg-gradient-to-br from-[#0c1329] via-[#090e21] to-[#060917] p-6 sm:p-8 lg:p-10 card-top-illumination-hero backdrop-blur-xl card-shine-all-sides group"
    >
      {/* ── Soft Ambient Top-Edge Illumination Rim ────────────────────────────── */}
      <CardReflectiveShine variant="indigo" intensity="hero" rounded="rounded-3xl" topIllumination={true} hasHoverSweep={false} />

      {/* Subtle, restrained ambient background glow (calm & non-distracting) */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/[0.06] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 w-80 h-80 rounded-full bg-cyan-500/[0.04] blur-2xl" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* ── LEFT COLUMN: Greeting, Progress, Voice, & Primary Actions ──────── */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
              Candidate Career Workspace
            </span>
          </div>

          {/* Heading and Narrative */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Welcome back{cleanName ? `, ${cleanName}` : ''}! 👋
            </h1>
            <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-xl">
              Your career workspace is ready. Strengthen your resume, discover relevant
              opportunities, and track your progress toward your next role.
            </p>
          </div>

          {/* Profile Completion Bar Card */}
          <div className="relative overflow-hidden max-w-md p-4 rounded-2xl bg-[#090e23]/80 border border-white/[0.08] hover:border-indigo-500/30 backdrop-blur-md card-top-illumination-compact transition-all duration-300 group/readiness">
            <CardReflectiveShine variant="indigo" intensity="compact" rounded="rounded-2xl" topIllumination={true} />
            <div className="relative z-10">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  Profile readiness
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white bg-indigo-500/15 px-2.5 py-0.5 rounded-lg border border-indigo-500/25">
                    {clampedPercentage}%
                  </span>
                  <Link
                    to={nextRoute}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center gap-1 text-[11px]"
                  >
                    {nextLabel} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${clampedPercentage}%` }}
                  transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"
                />
              </div>
              <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                {readinessGuidance}
              </p>
              {missingChips.length > 0 && clampedPercentage < 100 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[10px] text-slate-400 font-medium">To reach 100%:</span>
                  {missingChips.map((item, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-indigo-300 border border-indigo-500/20">
                      + {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ambient Voice Assistant & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Interactive Nexus AI Voice Capsule */}
            <button
              type="button"
              onClick={onListenGreeting}
              title={
                isAiSpeaking
                  ? 'Stop Nexus AI voice assistant'
                  : 'Listen to personalized Nexus AI welcome'
              }
              aria-label={isAiSpeaking ? 'Stop voice assistant' : 'Listen to personalized greeting'}
              className="group relative overflow-hidden flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 hover:border-indigo-400/40 hover:bg-indigo-900/40 card-top-illumination-compact backdrop-blur-md transition-all duration-200 active:scale-[0.98] cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            >
              <CardReflectiveShine variant="cyan" intensity="compact" rounded="rounded-2xl" topIllumination={true} />
              <AIAssistantEmblem size="sm" isSpeaking={isAiSpeaking} />
              <div className="flex flex-col text-left select-none relative z-10">
                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-300 group-hover:text-indigo-200 transition-colors">
                  Nexus AI
                </span>
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isAiSpeaking
                        ? 'bg-cyan-400 animate-ping'
                        : 'bg-emerald-400 animate-pulse'
                    }`}
                  />
                  {isAiSpeaking ? 'Speaking...' : 'Voice Assistant'}
                </span>
              </div>
              <div className="relative z-10 flex items-center gap-1">
                <AIAudioWaveform isSpeaking={isAiSpeaking} />
                <div className="ml-1 p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-200 group-hover:bg-white/10 transition-colors">
                  <Volume2 className={`w-3.5 h-3.5 ${isAiSpeaking ? 'text-cyan-400 animate-pulse' : ''}`} />
                </div>
              </div>
            </button>

            {/* Primary Action Button: Explore Jobs */}
            <Button
              variant="glow"
              size="md"
              leftIcon={<Briefcase className="w-4 h-4" />}
              onClick={onExploreJobs}
              className="shadow-lg shadow-indigo-500/20 font-semibold"
            >
              Explore Jobs
            </Button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Dedicated 3D Career Workspace Visual Stage ──────── */}
        <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center">
          <HeroWorkspace3DStage
            dashboardData={dashboardData}
            cleanName={cleanName}
          />
        </div>
      </div>
    </motion.section>
  );
};
