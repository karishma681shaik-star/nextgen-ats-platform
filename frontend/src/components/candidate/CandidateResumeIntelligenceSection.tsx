import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Search,
  Briefcase,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { CandidateDashboardData } from '../../services';
import { CardReflectiveShine } from '../common/CardReflectiveShine';

interface CandidateResumeIntelligenceSectionProps {
  dashboardData: CandidateDashboardData;
  onOpenUpload?: () => void;
}

export const CandidateResumeIntelligenceSection: React.FC<CandidateResumeIntelligenceSectionProps> = ({
  dashboardData,
  onOpenUpload
}) => {
  const atsScore = dashboardData.atsScore;
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-linked continuous parallax animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  // Parallax translation curves
  const resumeY = useTransform(scrollYProgress, [0, 1], [28, -28]);
  const medalY = useTransform(scrollYProgress, [0, 1], [40, -32]);
  const medalRotate = useTransform(scrollYProgress, [0, 1], [-8, 6]);
  const penY = useTransform(scrollYProgress, [0, 1], [-20, 24]);
  const penRotate = useTransform(scrollYProgress, [0, 1], [-40, -34]);
  const featuresY = useTransform(scrollYProgress, [0, 1], [14, -14]);
  const ambientGlowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.88, 1.12, 0.92]);

  return (
    <motion.section
      ref={sectionRef}
      id="candidate-resume-intelligence-section"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl card-single-border-luminous bg-gradient-to-br from-[#0c142b]/95 via-[#070b19]/95 to-[#050814]/98 p-6 sm:p-8 lg:p-10 transition-all duration-300 group"
    >
      {/* ── Radiant Single-Border Specular Sweep & Corner Illumination ───────── */}
      <CardReflectiveShine variant="cyan" intensity="hero" rounded="rounded-3xl" topIllumination={true} hasHoverSweep={true} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Side: Professional ATS Resume Showcase + Realistic Physical Objects (Pen & Medallion) */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          <div className="relative w-full max-w-[560px] flex items-center justify-center group/img py-2">
            {/* Ambient Radial Backlight linking to scroll */}
            <motion.div
              style={{ scale: ambientGlowScale }}
              className="absolute w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none -z-10"
            />

            {/* Scroll-Parallax Main Resume Document Container */}
            <motion.div
              style={{ y: resumeY }}
              className="relative w-full flex items-center justify-center"
            >
              <picture className="w-full flex items-center justify-center">
                <source
                  srcSet="/assets/candidate/resume_editorial_workspace_isolated.webp?v=2"
                  type="image/webp"
                />
                <img
                  src="/assets/candidate/resume_editorial_workspace_isolated.png?v=2"
                  alt="Professional ATS-optimized candidate resume showcase with verified credentials and telemetry"
                  className="w-full h-auto max-h-[370px] sm:max-h-[420px] lg:max-h-[440px] object-contain object-center transition-transform duration-500 ease-out group-hover/img:scale-[1.015] filter drop-shadow-[0_18px_38px_rgba(0,0,0,0.65)]"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('resume_editorial_workspace_isolated.png')) {
                      target.src = '/assets/candidate/resume_editorial_workspace_isolated.png?v=2';
                    }
                  }}
                />
              </picture>

              {/* Realistic Physical Matte Titanium Executive Pen with Scroll Parallax */}
              <motion.div
                style={{ y: penY, rotate: penRotate }}
                whileHover={{ scale: 1.06, rotate: -32 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="absolute -top-3 right-0 sm:-top-5 sm:right-4 w-36 sm:w-48 lg:w-52 z-30 cursor-pointer select-none filter drop-shadow-[0_14px_28px_rgba(0,0,0,0.7)] group/pen pointer-events-auto"
                title="Minimalist Matte Titanium Precision Executive Pen"
              >
                <picture>
                  <source srcSet="/assets/candidate/ats_executive_pen_3d.webp" type="image/webp" />
                  <img
                    src="/assets/candidate/ats_executive_pen_3d.png"
                    alt="Physical Matte Titanium Executive Precision Pen"
                    className="w-full h-auto object-contain pointer-events-none transition-transform duration-300 group-hover/pen:brightness-110"
                    loading="lazy"
                  />
                </picture>
              </motion.div>

              {/* Realistic Physical Titanium & Sapphire Glass Verification Medallion with Scroll Parallax */}
              <motion.div
                style={{ y: medalY, rotate: medalRotate }}
                whileHover={{ scale: 1.08, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="absolute -bottom-3 -right-1 sm:bottom-1 sm:right-3 w-24 h-24 sm:w-28 sm:h-28 z-20 cursor-pointer select-none filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.75)] group/seal"
                title="CNC Machined Titanium & Sapphire Glass Verification Medallion"
              >
                <picture>
                  <source srcSet="/assets/candidate/ats_verification_seal_3d.webp" type="image/webp" />
                  <img
                    src="/assets/candidate/ats_verification_seal_3d.png"
                    alt="Physical Titanium & Sapphire Glass ATS Verification Medallion"
                    className="w-full h-full object-contain pointer-events-none transition-transform duration-300 group-hover/seal:brightness-110"
                    loading="lazy"
                  />
                </picture>
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none opacity-0 group-hover/seal:opacity-100 transition-opacity duration-300" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Narrative, Status, & Direct Actions with Scroll Parallax */}
        <motion.div style={{ y: featuresY }} className="lg:col-span-6 space-y-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/40 shadow-[0_0_14px_rgba(6,182,212,0.25)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                Resume Intelligence & ATS Optimization
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Build a stronger, ATS-ready resume
            </h2>
            <p className="text-sm text-slate-300/85 leading-relaxed">
              Every job opening uses applicant tracking algorithms. Nexus AI analyzes your document structure,
              quantifiable metrics, and keyword density to ensure your qualifications reach hiring managers.
            </p>
          </div>

          {/* Three Feature Highlights with Shining Single Borders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative overflow-hidden p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] card-single-border-subtle hover:border-cyan-400/80 transition-all duration-300 group/feature shadow-sm hover:shadow-[0_0_22px_rgba(56,189,248,0.35)]">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />
              <div className="absolute inset-0 -translate-x-full group-hover/feature:translate-x-full duration-700 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transform -skew-x-12 transition-transform ease-out pointer-events-none" />
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Search className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-white">Keyword Matching</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Aligns competencies with verified recruiter requirements.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] card-single-border-subtle hover:border-indigo-400/80 transition-all duration-300 group/feature shadow-sm hover:shadow-[0_0_22px_rgba(99,102,241,0.35)]">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent pointer-events-none" />
              <div className="absolute inset-0 -translate-x-full group-hover/feature:translate-x-full duration-700 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transform -skew-x-12 transition-transform ease-out pointer-events-none" />
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-white">ATS Scoring</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Real-time feedback on formatting, parseability, and clarity.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] card-single-border-subtle hover:border-emerald-400/80 transition-all duration-300 group/feature shadow-sm hover:shadow-[0_0_22px_rgba(16,185,129,0.35)]">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent pointer-events-none" />
              <div className="absolute inset-0 -translate-x-full group-hover/feature:translate-x-full duration-700 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transform -skew-x-12 transition-transform ease-out pointer-events-none" />
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-white">Direct Export</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Ready to submit instantly across all active job postings.
                </p>
              </div>
            </div>
          </div>

          {/* AI ATS Diagnostic & Career Optimization Engine Feature Strip */}
          <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-[#0a1026]/70 to-cyan-950/50 card-single-border-subtle hover:border-cyan-400/90 transition-all duration-300 group/featureBar shadow-sm hover:shadow-[0_0_26px_rgba(56,189,248,0.35)] space-y-3">
            <CardReflectiveShine variant="cyan" rounded="rounded-2xl" hasHoverSweep={true} />

            {/* Header: AI Telemetry & Status Badges */}
            <div className="flex items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 shadow-inner">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white tracking-wide truncate">
                    AI Heuristic Diagnostic & Skill Telemetry
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    Real-time keyword indexing & ATS compliance
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[10px] font-bold text-cyan-300 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Live Engine
              </span>
            </div>

            {/* Telemetry Pills + Action Buttons in balanced row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/[0.06] relative z-10">
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  98% Parseability
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  Keyword Density
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link to="/candidate/profile">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Sparkles className="w-3 h-3 text-cyan-400" />}
                    className="text-xs py-1.5 px-3 bg-white/[0.04] border-white/10 hover:border-cyan-400/40 hover:bg-cyan-500/10 font-semibold"
                  >
                    Skill Audit
                  </Button>
                </Link>
                <Link to="/candidate/jobs">
                  <Button
                    variant="glow"
                    size="sm"
                    leftIcon={<Briefcase className="w-3 h-3" />}
                    className="text-xs py-1.5 px-3 shadow-md shadow-indigo-500/20 font-semibold"
                  >
                    Match Roles <ArrowRight className="w-3 h-3 ml-0.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
