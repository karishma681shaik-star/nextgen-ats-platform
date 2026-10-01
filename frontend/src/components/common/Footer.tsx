import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Github, Linkedin, Mail, ArrowUpRight } from 'lucide-react';

const FOOTER_COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', to: '/#features' },
      { label: 'Resume Builder', to: '/candidate/resumes' },
      { label: 'ATS Analyzer', to: '/candidate/resume-analysis' },
      { label: 'Job Matching', to: '/candidate/jobs' },
      { label: 'ATS Intelligence', to: '/#intelligence-flow' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', to: '/' },
      { label: 'Contact', to: 'mailto:karishma681shaik@gmail.com' },
      { label: 'Privacy Policy', to: '/' },
      { label: 'Terms of Service', to: '/' },
      { label: 'Security', to: '/' },
    ],
  },
  {
    heading: 'Platform',
    links: [
      { label: 'Candidate Portal', to: '/candidate' },
      { label: 'Recruiter Dashboard', to: '/recruiter' },
      { label: 'Admin Governance', to: '/admin' },
      { label: 'Explore Jobs', to: '/candidate/jobs' },
      { label: 'API Docs', to: '/' },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: Github, href: 'https://github.com/karishma681shaik-star', label: 'GitHub' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/karishmashaik681/', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:karishma681shaik@gmail.com', label: 'Email' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden" aria-label="Footer">
      {/* Gradient top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.6) 30%, rgba(168,85,247,0.6) 70%, transparent 100%)',
        }}
      />

      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(10,15,29,0) 0%, rgba(4,7,17,1) 100%)',
        }}
      />
      <div className="absolute inset-0 bg-[#040711] pointer-events-none -z-10" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span
                  className="font-black text-xl text-white tracking-tight"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  AI ATS
                </span>
                <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-mono font-semibold -mt-0.5">
                  Recruitment Platform
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Intelligent recruitment. Smarter careers.
              <br />
              <span className="text-slate-500 text-xs mt-1 block">
                Enterprise-grade ATS powered by AI — for candidates who mean business.
              </span>
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All systems operational
            </div>
          </div>

          {/* Nav columns */}
          {FOOTER_COLUMNS.map((col, i) => (
            <motion.div
              key={col.heading}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              className="space-y-4"
            >
              <h4
                className="text-[11px] font-black text-white uppercase tracking-[0.2em]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map(({ label, to }) => (
                  <li key={label}>
                    {to.startsWith('mailto:') || to.startsWith('http') ? (
                      <a
                        href={to}
                        className="text-slate-400 text-sm hover:text-white transition-colors group flex items-center gap-1"
                      >
                        {label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </a>
                    ) : (
                      <Link
                        to={to}
                        className="text-slate-400 text-sm hover:text-white transition-colors group flex items-center gap-1"
                      >
                        {label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">
            © 2026 AI ATS Recruitment Platform. All Rights Reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <Link to="/" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link to="/" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link to="/" className="hover:text-slate-300 transition-colors">Security</Link>
            <span className="font-mono text-indigo-500/60">v2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
