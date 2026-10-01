import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

/* ============================================================
   BIG TYPOGRAPHY SECTION
   Oversized semi-transparent "AI ATS RECRUITMENT" text
   Premium SaaS brand statement
   ============================================================ */

export const BigTypographySection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  // Parallax — text moves up slightly as user scrolls
  const textY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.4]);

  return (
    <section
      ref={ref}
      className="relative py-20 sm:py-28 overflow-hidden"
      aria-label="Brand typography section"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(99,102,241,0.07) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Giant outlined text — parallax */}
      <motion.div
        style={{ y: textY, opacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <div
          className="text-outline-giant whitespace-nowrap font-black"
          style={{
            fontSize: 'clamp(4.5rem, 14vw, 13rem)',
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '-0.02em',
            WebkitTextStroke: '1.5px rgba(139,92,246,0.25)',
            color: 'transparent',
            lineHeight: 0.9,
          }}
        >
          AI ATS RECRUITMENT
        </div>
      </motion.div>

      {/* Foreground content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            The Future of Recruitment
          </div>

          {/* Headline */}
          <h2
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Intelligent recruitment.
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #67e8f9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Smarter careers.
            </span>
          </h2>

          {/* Sub-copy */}
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            The AI ATS Recruitment Platform combines cutting-edge machine learning with intuitive
            design — empowering candidates to shine and recruiters to hire with precision.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/register">
              <Button
                variant="glow"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-glow font-bold"
              >
                Get Started Free
              </Button>
            </Link>
            <Link to="/candidate/resume-analysis">
              <Button
                variant="secondary"
                size="lg"
                className="font-bold border-slate-700 hover:border-purple-500/50"
              >
                Analyze Your Resume
              </Button>
            </Link>
          </div>

          {/* Stats strip */}
          <div className="pt-8 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: '98.4%', label: 'Parse accuracy' },
              { value: '4.8x', label: 'Match velocity' },
              { value: '15k+', label: 'Resumes analyzed' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <p
                  className="text-2xl font-black text-white"
                  style={{
                    background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
