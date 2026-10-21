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
import { CardReflectiveShine } from '../common/CardReflectiveShine';
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

  // Subtle interactive parallax tilt (restrained, max 1.2 degrees)
  const tiltX = prefersReduced ? 0 : mousePos.y * -1.0;
  const tiltY = prefersReduced ? 0 : mousePos.x * 1.2;

  return (
    <motion.section
      ref={heroRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 rounded-3xl overflow-hidden group select-none"
    >
      {/* ── LAYER 1 & 2: Main Surface Bezel (Layered Midnight Navy) ────────── */}
      <div
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0d1426]/98 via-[#090f22]/98 to-[#060a18]/99 border border-indigo-500/15 hover:border-indigo-400/25 backdrop-blur-2xl transition-all duration-300"
        style={{
          boxShadow:
            '0 25px 60px -15px rgba(0, 0, 0, 0.75), inset 0 1px 0 0 rgba(255, 255, 255, 0.10)'
        }}
      >
        {/* Studio-Grade Top-Edge Illumination with Corner Curvature & Fading Sides */}
        <CardReflectiveShine variant="indigo" rounded="rounded-3xl" topIllumination={true} />

        {/* Ambient Studio Lighting (Soft violet and cyan depths) */}
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-violet-600/[0.08] blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-80 h-80 rounded-full bg-cyan-500/[0.06] blur-[100px] pointer-events-none" />

        {/* ── MAIN TWO-COLUMN COMPOSITION: IDENTITY & DOSSIER ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 p-6 sm:p-8 lg:p-10 relative z-10 items-stretch">

          {/* ═════════════════════════════════════════════════════════════════
              LEFT COLUMN: CANDIDATE IDENTITY & EXECUTIVE SUMMARY (7 COLS)
              ═════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">

            {/* Candidate Identity Primary Row */}
            <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">

              {/* Profile Photograph with Camera Edit Button */}
              <div
                className="relative group/avatar cursor-pointer shrink-0"
                onClick={onAvatarClick}
                role="button"
                tabIndex={0}
                aria-label="Change candidate profile photo"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onAvatarClick();
                }}
              >
                {/* Subtle illuminated photo border */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-white/15 bg-slate-950 shadow-[0_12px_30px_rgba(0,0,0,0.65)] transition-transform duration-300 group-hover/avatar:scale-[1.02]">
                  <img
                    src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] text-white font-bold gap-1">
                    <Camera className="w-4 h-4 text-indigo-300" />
                    <span>Change Photo</span>
                  </div>
                </div>

                {/* Permanent refined camera badge */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAvatarClick();
                  }}
                  className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white border-2 border-[#090e21] shadow-lg transition-transform duration-200 hover:scale-110 flex items-center justify-center z-10"
                  title="Change Profile Photo"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              {/* Full Name, Headline, Badges & Presence */}
              <div className="space-y-2 min-w-0 flex-1">
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

                {/* Location, Contact info, and Availability Row */}
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

            {/* Executive Summary Refined Glass Card */}
            <div className="group/story relative p-4 sm:p-5 rounded-2xl bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-indigo-500/20 relative z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Executive Summary & Positioning
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onEditAbout}
                    className="text-xs text-indigo-300 hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={onAIEnhance}
                    className="text-xs text-purple-300 hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    AI Enhance
                  </button>
                </div>
              </div>

              {hasBio ? (
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal relative z-10">
                  {profile.bio}
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 py-1 relative z-10">
                  <span>Add a professional summary to help enterprise recruiters understand your architecture background, core strengths, and engineering goals.</span>
                  <button
                    type="button"
                    onClick={onEditAbout}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-semibold border border-indigo-400/40 transition-all shrink-0 self-start sm:self-auto shadow-sm"
                  >
                    + Add Summary
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* ═════════════════════════════════════════════════════════════════
              RIGHT COLUMN: VERIFIED TALENT DOSSIER & ANIMATED IDENTITY RADAR
              (NATURAL REFINED SHINE CARD SYSTEM • NO 3D IMAGES)
              ═════════════════════════════════════════════════════════════════ */}
          <div className="relative lg:col-span-5 flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#0d142b]/85 via-[#080d20]/90 to-[#060918]/95 border border-cyan-500/15 hover:border-cyan-400/25 overflow-hidden group shadow-xl transition-all duration-300">
            <CardReflectiveShine variant="cyan" rounded="rounded-2xl" topIllumination={true} />

            {/* Ambient background glows */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

            {/* Header: Verified Dossier Status Pill */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-indigo-500/20 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
                <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider">
                  VERIFIED TALENT DOSSIER
                </span>
              </div>
              <span className="text-[11px] font-bold text-indigo-200 bg-indigo-500/20 px-3 py-1 rounded-xl border border-indigo-400/40 shadow-sm">
                {strengthLabel}
              </span>
            </div>

            {/* Center: Animated Cryptographic Identity Radar & Shield Seal */}
            <div className="my-auto py-5 flex flex-col items-center justify-center relative z-10 select-none">
              <motion.div
                animate={{
                  y: prefersReduced ? 0 : [0, -5, 0],
                  rotateY: tiltY,
                  rotateX: tiltX
                }}
                transition={{
                  y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
                  rotateY: { type: 'spring', damping: 28, stiffness: 160 },
                  rotateX: { type: 'spring', damping: 28, stiffness: 160 }
                }}
                className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center"
              >
                {/* Outer Rotating Radar Ring */}
                <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/30 animate-[spin_25s_linear_infinite]" />
                
                {/* Secondary Glowing Ring */}
                <div className="absolute inset-2.5 rounded-full border border-indigo-500/35 shadow-[0_0_20px_rgba(99,102,241,0.2)]" />
                
                {/* Radial Glow Backdrop */}
                <div className="absolute inset-5 rounded-full bg-gradient-to-tr from-indigo-600/25 via-cyan-500/20 to-purple-600/25 blur-md" />

                {/* Central Verified Shield Emblem */}
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-900/90 via-slate-900/95 to-slate-950 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.35)]">
                  <ShieldCheck className="w-9 h-9 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                  
                  {/* Subtle pulsing beacon */}
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-300" />
                  </span>
                </div>
              </motion.div>

              <p className="text-xs font-mono font-bold text-slate-300 mt-3 text-center tracking-wider">
                AUTHENTICATED TECHNICAL IDENTITY
              </p>
              <p className="text-[10px] font-semibold text-cyan-400/90 mt-0.5 tracking-wide">
                • 100% REAL-TIME ATS COMPLIANT •
              </p>
            </div>

            {/* Bottom: Genuine Profile KPI Metrics Grid (Only Real Data) */}
            <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-indigo-500/20 relative z-10">
              {/* Metric 1: Skills */}
              <div className="relative p-3 rounded-xl bg-white/[0.025] hover:bg-white/[0.045] border border-white/[0.07] hover:border-white/[0.12] flex items-center gap-2.5 transition-all duration-200 overflow-hidden shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)] shrink-0">
                  <Code2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {totalSkillsCount} Skills
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 block truncate">Validated Stack</span>
                </div>
              </div>

              {/* Metric 2: Experience */}
              <div className="relative p-3 rounded-xl bg-white/[0.025] hover:bg-white/[0.045] border border-white/[0.07] hover:border-white/[0.12] flex items-center gap-2.5 transition-all duration-200 overflow-hidden shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)] shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {profile.experience?.length || 0} Roles
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 block truncate">Work History</span>
                </div>
              </div>

              {/* Metric 3: Education */}
              <div className="relative p-3 rounded-xl bg-white/[0.025] hover:bg-white/[0.045] border border-white/[0.07] hover:border-white/[0.12] flex items-center gap-2.5 transition-all duration-200 overflow-hidden shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)] shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {profile.education?.length || 0} Degree
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 block truncate">Academic Record</span>
                </div>
              </div>

              {/* Metric 4: Projects */}
              <div className="relative p-3 rounded-xl bg-white/[0.025] hover:bg-white/[0.045] border border-white/[0.07] hover:border-white/[0.12] flex items-center gap-2.5 transition-all duration-200 overflow-hidden shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)] shrink-0">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {profile.projects?.length || 0} Projects
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 block truncate">Verified Code</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </motion.section>
  );
};
