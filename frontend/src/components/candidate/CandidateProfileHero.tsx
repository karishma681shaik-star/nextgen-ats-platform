import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Github,
  Linkedin,
  Globe,
  ArrowUpRight,
  Camera,
  Edit2,
  Sparkles,
  FileText,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2
} from 'lucide-react';
import type { CandidateProfile } from '../../types';

interface CandidateProfileHeroProps {
  profile: CandidateProfile;
  strengthLabel: string;
  totalSkillsCount: number;
  mousePos: { x: number; y: number };
  onAvatarClick: () => void;
  onContactClick: () => void;
  onEditAbout: () => void;
  onAIEnhance: () => void;
}

export const CandidateProfileHero: React.FC<CandidateProfileHeroProps> = ({
  profile,
  strengthLabel,
  totalSkillsCount,
  mousePos,
  onAvatarClick,
  onContactClick,
  onEditAbout,
  onAIEnhance
}) => {
  const prefersReduced = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);

  const hasBio = Boolean(profile.bio && profile.bio.trim().length > 10);

  // Restrained 3D tilt
  const tiltX = prefersReduced ? 0 : mousePos.y * -1.2;
  const tiltY = prefersReduced ? 0 : mousePos.x * 1.5;

  return (
    <motion.section
      ref={heroRef}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 rounded-3xl overflow-hidden border border-white/[0.08] hover:border-white/[0.14] bg-gradient-to-br from-[#0c132c]/95 via-[#080d22]/95 to-[#050817]/98 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-300"
      style={{
        boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* ── Studio Ambient Lighting ───────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-30" />
      <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* ── Content Grid: Left Identity & Story, Right 3D Visual Experience ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 p-6 sm:p-8 lg:p-10 items-center relative z-10">

        {/* ═════════════════════════════════════════════════════════════════════
            LEVEL 1 & LEVEL 2: CANDIDATE IDENTITY & PROFESSIONAL STORY
            ═════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 space-y-6">

          {/* Level 1: Identity Row (Avatar + Primary Info) */}
          <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">

            {/* Candidate Photograph with Camera Edit Button */}
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={onAvatarClick}
              role="button"
              tabIndex={0}
              aria-label="Change candidate profile photo"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onAvatarClick();
              }}
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-white/15 bg-slate-950 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                <img
                  src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                  alt={profile.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] text-white font-bold gap-1">
                  <Camera className="w-4 h-4 text-indigo-300" />
                  <span>Update</span>
                </div>
              </div>

              {/* Refined camera button badge */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAvatarClick();
                }}
                className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white border-2 border-[#090e21] shadow-lg transition-transform duration-200 hover:scale-110 flex items-center justify-center z-10"
                title="Change Profile Photo"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            {/* Name, Headline & Verification Badges */}
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight truncate">
                  {profile.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Verified Candidate
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Open to Work
                </span>
              </div>

              {/* Professional Headline */}
              <p className="text-base sm:text-lg font-semibold text-indigo-200/90 leading-snug">
                {profile.title || 'Senior Software Engineer'}
              </p>

              {/* Location, Contact info, and Availability */}
              <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-300 pt-0.5">
                <span className="inline-flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  {profile.location || 'Remote / Hybrid'}
                </span>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={onContactClick}
                  className="text-indigo-300 hover:text-white font-medium underline underline-offset-2 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Contact Info
                </button>
                <span className="text-slate-600">•</span>
                <span className="inline-flex items-center gap-1 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  Immediate Start
                </span>
              </div>

              {/* Social Web Presence Links */}
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    GitHub
                    <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-white border border-blue-500/25 flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    LinkedIn
                    <ArrowUpRight className="w-3 h-3 text-blue-400" />
                  </a>
                )}
                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/25 flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Portfolio
                    <ArrowUpRight className="w-3 h-3 text-indigo-400" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Level 2: Professional Story / Executive Summary */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.10] transition-colors relative group/story">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Executive Summary
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onEditAbout}
                  className="text-xs text-indigo-300 hover:text-white font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={onAIEnhance}
                  className="text-xs text-purple-300 hover:text-white font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  AI Enhance
                </button>
              </div>
            </div>

            {hasBio ? (
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal">
                {profile.bio}
              </p>
            ) : (
              <div className="flex items-center justify-between text-xs text-slate-400 py-1">
                <span>Add an executive summary to highlight your technical background for recruiters.</span>
                <button
                  type="button"
                  onClick={onEditAbout}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors shrink-0 ml-2"
                >
                  + Add Summary
                </button>
              </div>
            )}
          </div>

          {/* KPI Statistics Badges (Genuine Data Only) */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {profile.experience && profile.experience.length > 0 && (
              <div className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center min-w-[85px]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Experience</span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  {profile.experience.length} {profile.experience.length === 1 ? 'Role' : 'Roles'}
                </span>
              </div>
            )}

            {totalSkillsCount > 0 && (
              <div className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center min-w-[85px]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Skills</span>
                <span className="text-sm font-bold text-cyan-300 mt-0.5 block">
                  {totalSkillsCount} Validated
                </span>
              </div>
            )}

            {profile.education && profile.education.length > 0 && (
              <div className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center min-w-[85px]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Education</span>
                <span className="text-sm font-bold text-amber-300 mt-0.5 block">
                  {profile.education.length} {profile.education.length === 1 ? 'Degree' : 'Degrees'}
                </span>
              </div>
            )}

            {profile.projects && profile.projects.length > 0 && (
              <div className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center min-w-[85px]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Projects</span>
                <span className="text-sm font-bold text-indigo-300 mt-0.5 block">
                  {profile.projects.length} Verified
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            LEVEL 3: 3D VISUAL EXPERIENCE (WORKSPACE + FLOATING RESUME)
            ═════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 relative hidden sm:block">
          <motion.div
            animate={{
              rotateY: tiltY,
              rotateX: tiltX
            }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 160,
              mass: 0.8
            }}
            className="relative aspect-[16/11] rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] bg-[#070b18] group/scene select-none transform-gpu"
            style={{ perspective: '1000px' }}
          >
            {/* Top specular hairline */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-20" />

            {/* Base Photorealistic 3D Workspace Scene */}
            <img
              src="/assets/candidate/workspace_3d_hero.jpg"
              alt="Candidate Professional Workspace"
              className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.04]"
              loading="eager"
            />

            {/* Natural Atmospheric Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/85 via-[#050814]/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050814]/50 via-transparent to-[#050814]/40 pointer-events-none" />

            {/* ── 3D Floating Realistic Resume Document ────────────────────────── */}
            <motion.div
              animate={{
                y: prefersReduced ? 0 : [0, -6, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute -top-3 right-3 w-[140px] sm:w-[160px] pointer-events-none z-20 transform -rotate-6 filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.65)]"
            >
              <img
                src="/assets/candidate/floating_resume_3d.png"
                alt="Floating 3D Resume Document"
                className="w-full h-auto object-contain"
                loading="eager"
              />
            </motion.div>

            {/* Telemetry In-Scene Pill HUD */}
            <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-[11px] text-slate-200 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-mono text-cyan-300 text-[10px]">VERIFIED ATS DOSSIER</span>
              </div>

              <div className="px-2.5 py-1.5 rounded-xl bg-indigo-950/80 backdrop-blur-md border border-indigo-500/25 text-[10px] font-bold text-indigo-300 shadow-md">
                <span>{strengthLabel}</span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </motion.section>
  );
};
