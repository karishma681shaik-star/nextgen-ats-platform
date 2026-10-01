import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Zap, FileSearch } from 'lucide-react';
import { Button } from '../ui/Button';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-cyan-500/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-8 sm:p-16 text-center overflow-hidden border border-indigo-500/40 glass-card-elevated shadow-glow-lg"
        >
          {/* Internal gradients */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Next-Gen Career Intelligence</span>
            </div>

            {/* Exact Headline: "Your next opportunity starts with a better resume." */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-display">
              Your next opportunity starts with a better resume.
            </h2>

            {/* Exact Subtext: "Build. Analyze. Improve. Match." */}
            <p className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 font-display uppercase">
              Build. Analyze. Improve. Match.
            </p>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Create an ATS-proof resume, understand your compatibility score, and connect directly with hiring managers actively looking for your exact skillset.
            </p>

            {/* Exact Buttons: "Create My Resume" and "Analyze My Resume" */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/candidate/resumes" data-cursor-label="Build" className="w-full sm:w-auto">
                <Button
                  variant="glow"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto shadow-glow font-bold text-base px-8 py-4"
                >
                  Create My Resume
                </Button>
              </Link>
              <Link to="/candidate/resume-analysis" data-cursor-label="Analyze" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<FileSearch className="w-4 h-4 text-indigo-400" />}
                  className="w-full sm:w-auto font-bold text-base border-slate-700 hover:border-indigo-500/60 hover:bg-indigo-950/40 px-8 py-4"
                >
                  Analyze My Resume
                </Button>
              </Link>
            </div>

            {/* Bottom trust badges */}
            <div className="pt-8 border-t border-slate-800/80 flex items-center justify-center gap-8 text-xs text-slate-400 flex-wrap">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Privacy & Data Security</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>Instant Score Evaluation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Multi-Persona Ready</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

