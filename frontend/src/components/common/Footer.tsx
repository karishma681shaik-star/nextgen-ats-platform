import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Sparkles, Github, Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import { AIATSFooterShowcase } from '../landing/AIATSFooterShowcase';

interface FooterLink {
  label: string;
  to: string;
  isExternal?: boolean;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

const PRODUCT_COLUMN: FooterColumn = {
  heading: 'PRODUCT',
  links: [
    { label: 'AI Resume Builder', to: '/candidate/resumes' },
    { label: 'ATS Resume Analysis', to: '/candidate/resume-analysis' },
    { label: 'Intelligent Job Matching', to: '/candidate/jobs' },
    { label: 'Resume Optimization', to: '/candidate/resumes' },
    { label: 'Explore Jobs', to: '/candidate/jobs' },
    { label: 'Candidate Portal', to: '/candidate' },
    { label: 'Recruiter Dashboard', to: '/recruiter' },
  ],
};

const INFORMATION_COLUMN: FooterColumn = {
  heading: 'INFORMATION',
  links: [
    { label: 'About the Platform', to: '/#features' },
    { label: 'Contact', to: 'mailto:karishma681shaik@gmail.com', isExternal: true },
    { label: 'Privacy Policy', to: '/' },
    { label: 'Terms of Service', to: '/' },
    { label: 'Security', to: '/' },
  ],
};

const PLATFORM_COLUMN: FooterColumn = {
  heading: 'PLATFORM',
  links: [
    { label: 'Candidate Portal', to: '/candidate' },
    { label: 'Recruiter Dashboard', to: '/recruiter' },
    { label: 'Admin Governance', to: '/admin' },
    { label: 'Explore Jobs', to: '/candidate/jobs' },
    { label: 'API Documentation', to: '/' },
  ],
};

const SOCIAL_LINKS = [
  {
    icon: Github,
    href: 'https://github.com/karishma681shaik-star',
    label: 'GitHub Profile',
  },
  {
    icon: Linkedin,
    href: 'https://www.linkedin.com/in/karishmashaik681/',
    label: 'LinkedIn Profile',
  },
  {
    icon: Mail,
    href: 'mailto:karishma681shaik@gmail.com',
    label: 'Email Support',
  },
];

export const Footer: React.FC = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <footer className="relative [overflow-x:clip]" aria-label="Footer">
      {/* ── Preserved Scroll-Triggered Laptop-to-Emerging-Resume Showcase (Landing Page) ── */}
      {isLandingPage && <AIATSFooterShowcase />}

      {/* ── Main Dark Enterprise Footer Container ── */}
      <div className="relative bg-[#050814] text-slate-300 border-t border-slate-800/80 overflow-hidden">
        {/* Subtle Ambient Radial Lighting */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[360px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.03) 45%, transparent 70%)',
          }}
        />

        {/* ── Main Columns Section ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            {/* COLUMN 1: BRAND AND SOCIAL LINKS (2 cols on desktop) */}
            <div className="lg:col-span-2 space-y-5">
              <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group w-fit select-none">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] group-hover:scale-105 transition-transform shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse text-white" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 font-space tracking-tight">
                    <span className="font-extrabold text-2xl text-white tracking-tight drop-shadow-sm">
                      AI
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400/80 inline-block" />
                    <span className="font-extrabold text-2xl bg-gradient-to-r from-violet-300 via-indigo-200 to-fuchsia-300 bg-clip-text text-transparent tracking-wide">
                      ATS
                    </span>
                  </div>
                  <span className="text-[9.5px] uppercase tracking-widest text-indigo-400 font-mono font-semibold mt-0.5">
                    Next-Generation Recruitment Platform
                  </span>
                </div>
              </Link>

              <div className="space-y-1.5 max-w-sm">
                <p className="text-white text-sm font-semibold tracking-tight">
                  Intelligent recruitment. Smarter careers.
                </p>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  An AI-powered recruitment platform connecting candidates and recruiters through resume intelligence, job matching, and streamlined hiring workflows.
                </p>
              </div>

              {/* Social Connections */}
              <div className="pt-1 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Connect with us
                </span>
                <div className="flex items-center gap-2.5">
                  {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith('mailto:') ? '_self' : '_blank'}
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-9 h-9 rounded-lg border border-slate-800 bg-slate-900/80 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/15 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All systems operational
              </div>
            </div>

            {/* COLUMN 2: PRODUCT */}
            <FooterNavColumn column={PRODUCT_COLUMN} delayIndex={0} />

            {/* COLUMN 3: INFORMATION */}
            <FooterNavColumn column={INFORMATION_COLUMN} delayIndex={1} />

            {/* COLUMN 4: PLATFORM */}
            <FooterNavColumn column={PLATFORM_COLUMN} delayIndex={2} />
          </div>

          {/* ── Subtle Divider & Centered Copyright ── */}
          <div className="mt-14 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-slate-500 text-xs sm:text-sm font-normal tracking-wide">
              © 2026 AI ATS Recruitment Platform. All rights reserved.
            </p>
          </div>
        </div>

        {/* ── OVERSIZED OUTLINED BRAND WORD WITH SCROLL-TRIGGERED SHINE ── */}
        <OversizedOutlinedBrandWord />
      </div>
    </footer>
  );
};

// ── NAVIGATION COLUMN SUB-COMPONENT ──
const FooterNavColumn: React.FC<{ column: FooterColumn; delayIndex: number }> = ({
  column,
  delayIndex,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: 0.08 + delayIndex * 0.08 }}
      className="space-y-4"
    >
      <h4
        className="text-[11.5px] font-black text-white uppercase tracking-[0.2em]"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {column.heading}
      </h4>
      <ul className="space-y-2.5">
        {column.links.map(({ label, to, isExternal }) => (
          <li key={label}>
            {isExternal || to.startsWith('mailto:') ? (
              <a
                href={to}
                className="text-slate-400 text-xs sm:text-sm hover:text-white transition-colors group flex items-center gap-1 w-fit"
              >
                <span>{label}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-400" />
              </a>
            ) : (
              <Link
                to={to}
                className="text-slate-400 text-xs sm:text-sm hover:text-white transition-colors group flex items-center gap-1 w-fit"
              >
                <span>{label}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-400" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

// ── OVERSIZED BRAND SIGNATURE (ULTRA-PREMIUM ENTERPRISE TREATMENT) ──
const OversizedOutlinedBrandWord: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-7xl mx-auto px-4 pt-6 pb-12 sm:pb-16 flex flex-col items-center justify-center select-none pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Subtle Ambient Radial Lighting directly behind the brand signature */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-4xl h-44 rounded-full pointer-events-none transition-opacity duration-1000 ${
          isInView ? 'opacity-35' : 'opacity-0'
        }`}
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(147, 51, 234, 0.45) 0%, rgba(99, 102, 241, 0.22) 40%, rgba(139, 92, 246, 0.08) 65%, transparent 75%)',
          filter: 'blur(60px)',
        }}
      />

      <motion.div
        initial={shouldReduceMotion ? { opacity: 0.85 } : { opacity: 0, y: 28 }}
        animate={
          isInView
            ? { opacity: 1, y: 0 }
            : shouldReduceMotion
            ? { opacity: 0.85 }
            : { opacity: 0, y: 28 }
        }
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="w-full text-center relative flex justify-center items-center"
      >
        <div
          className="relative inline-flex items-center justify-center whitespace-nowrap font-black uppercase text-center tracking-wider"
          style={{
            fontFamily: '"Space Grotesk", Outfit, -apple-system, sans-serif',
            fontSize: 'clamp(4.75rem, 16vw, 15rem)',
            lineHeight: 0.9,
            letterSpacing: '0.04em',
          }}
          aria-label="AI ATS"
        >
          {/* Base Layer: Rich, multi-stop dark violet/indigo obsidian fill with precision edge */}
          <span className="inline-flex items-center select-none transition-all duration-700 brand-signature-base">
            <span>AI</span>
            <span className="inline-block select-none" style={{ letterSpacing: 'inherit' }}>
              &nbsp;
            </span>
            <span>ATS</span>
          </span>

          {/* Shimmer Highlight: Ultra-refined diagonal light beam continuously traveling across all letters */}
          {!shouldReduceMotion && (
            <span
              className="absolute inset-0 pointer-events-none select-none inline-flex items-center justify-center brand-signature-shimmer"
              aria-hidden="true"
            >
              <span>AI</span>
              <span className="inline-block select-none" style={{ letterSpacing: 'inherit' }}>
                &nbsp;
              </span>
              <span>ATS</span>
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};

