import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const AtsResumeIntelligenceSection: React.FC = () => {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 pt-20 pb-16 sm:pt-28 sm:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#050814] border-b border-white/[0.04]"
      aria-label="AI ATS Resume Intelligence Section"
    >
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[850px] h-[350px] rounded-full blur-[130px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(139,92,246,0.2) 50%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-6 right-10 w-[300px] h-[300px] rounded-full blur-[100px] opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight font-display"
          >
            Intelligent Resume Analysis & Real-Time ATS Optimization
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal"
          >
            Deep 5-vector semantic parsing, skill ontology matching, and keyword gap diagnostics in an enterprise-grade candidate workbench.
          </motion.p>

          {/* Core Capability Feature Badges */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mt-6"
          >
            {[
              'Resume Parsing',
              'Skill Extraction',
              'Job Description Matching',
              'Explainable Recommendations',
            ].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-indigo-500/20 text-xs font-medium text-slate-200 shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                {badge}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AtsResumeIntelligenceSection;
