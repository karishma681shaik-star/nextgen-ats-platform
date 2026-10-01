import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

/* ============================================================
   NEXT STORY SECTION
   Large centered typographic reveal — scroll-triggered
   ============================================================ */

export const NextStorySection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  // Parallax on background orbs
  const orbY1 = useTransform(scrollYProgress, [0, 1], ['0%', '-25%']);
  const orbY2 = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.18, delayChildren: 0.1 },
    },
  };

  const lineVariants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.85, ease: 'easeOut' as const },
    },
  };

  return (
    <section
      ref={ref}
      className="relative py-32 sm:py-44 px-4 overflow-hidden flex items-center justify-center"
      aria-label="Story section"
    >
      {/* Parallax orbs */}
      <motion.div
        style={{ y: orbY1 }}
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/12 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        style={{ y: orbY2 }}
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/12 rounded-full blur-[100px] pointer-events-none"
      />
      <div className="absolute inset-0 bg-tech-grid opacity-15 pointer-events-none" />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="relative z-10 text-center max-w-5xl mx-auto"
      >
        {/* Top label */}
        <motion.div variants={lineVariants} className="mb-8">
          <span className="text-xs font-mono font-semibold tracking-[0.3em] uppercase text-slate-500">
            Your story starts here
          </span>
        </motion.div>

        {/* Large line 1 */}
        <motion.p
          variants={lineVariants}
          className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tight leading-tight"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Turn your resume into
        </motion.p>

        {/* Large highlighted line 2 */}
        <motion.div variants={lineVariants}>
          <p
            className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-tight mt-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <span className="relative inline-block">
              <span
                className="relative z-10"
                style={{
                  background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #c084fc 70%, #e879f9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                your next opportunity.
              </span>
              {/* Underline glow */}
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-1 left-0 right-0 h-1 sm:h-1.5 rounded-full origin-left"
                style={{ background: 'linear-gradient(90deg, #6366f1, #a78bfa, #e879f9)' }}
              />
            </span>
          </p>
        </motion.div>

        {/* Supporting text */}
        <motion.p
          variants={lineVariants}
          className="mt-10 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Every great career starts with a resume that speaks to both humans{' '}
          <span className="text-slate-300">and</span> AI systems.{' '}
          <span className="text-slate-200 font-medium">We make yours unforgettable.</span>
        </motion.p>

        {/* Divider dots */}
        <motion.div
          variants={lineVariants}
          className="flex items-center justify-center gap-3 mt-12"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, delay: i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-2 h-2 rounded-full"
              style={{ background: i === 1 ? '#818cf8' : 'rgba(129,140,248,0.4)' }}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};
