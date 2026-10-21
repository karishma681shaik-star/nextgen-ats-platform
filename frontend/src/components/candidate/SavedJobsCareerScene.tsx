import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Bookmark, Sparkles, FileText, CheckCircle2, ShieldCheck, Compass } from 'lucide-react';

interface SavedJobsCareerSceneProps {
  compact?: boolean;
}

export const SavedJobsCareerScene: React.FC<SavedJobsCareerSceneProps> = ({ compact = false }) => {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Coordinated scroll animation with RAF and cleanup
  useEffect(() => {
    if (prefersReduced) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReduced]);

  // Subtle interactive 3D perspective tilt on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setMouseOffset({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y))
    });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  // Restrained physical movement: max 5px float, 1.5deg rotation, 15px scroll depth shift
  const tiltX = prefersReduced ? 0 : -mouseOffset.y * 3.5;
  const tiltY = prefersReduced ? 0 : mouseOffset.x * 4;
  const scrollDepth = prefersReduced ? 0 : Math.min(18, scrollY * 0.04);
  const scrollRotate = prefersReduced ? 0 : Math.min(2.5, scrollY * 0.008);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none w-full ${compact ? 'max-w-[340px]' : 'max-w-md lg:max-w-lg'} mx-auto`}
      style={{ perspective: '1200px' }}
    >
      {/* Ambient background aura (restrained, behind the object) */}
      <div
        className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-600/10 via-sky-500/08 to-purple-600/10 blur-2xl -z-10 pointer-events-none transition-opacity duration-700"
        aria-hidden="true"
      />

      <motion.div
        animate={{
          rotateX: tiltX,
          rotateY: tiltY + scrollRotate,
          translateZ: -scrollDepth,
          y: prefersReduced ? 0 : [0, -4, 0]
        }}
        transition={{
          rotateX: { type: 'spring', damping: 28, stiffness: 180 },
          rotateY: { type: 'spring', damping: 28, stiffness: 180 },
          translateZ: { type: 'spring', damping: 30, stiffness: 160 },
          y: prefersReduced
            ? { duration: 0 }
            : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
        }}
        className="relative rounded-2xl overflow-hidden border border-white/[0.12] bg-[#070b19]/90 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85),0_0_24px_-4px_rgba(99,102,241,0.20),inset_0_1px_1.5px_0_rgba(255,255,255,0.18)]"
      >
        {/* Top Rim Specular Highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent pointer-events-none z-20"
          aria-hidden="true"
        />

        {/* Photorealistic 3D Studio Career Scene Display */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
          <img
            src="/assets/candidate/saved_jobs_career_scene.jpg"
            alt="Executive Career Portfolio & Metallic Bookmark Studio Scene"
            className={`w-full h-full object-cover transition-all duration-700 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              // Graceful fallback to CSS-based dimensional graphic if asset is missing
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />

          {/* Graceful Fallback if image is loading or unavailable */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#0c132c] to-[#060a18] text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 shadow-[0_0_24px_rgba(99,102,241,0.25)]">
                <Bookmark className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-white">Career Opportunities Vault</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                Preserve executive positions for targeted applications.
              </p>
            </div>
          )}

          {/* Subtle Studio Lighting Vignette Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#070b19] via-transparent to-transparent pointer-events-none z-10 opacity-70"
            aria-hidden="true"
          />

          {/* Realism Floating Badges (Anchored securely to the scene) */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070b19]/85 backdrop-blur-md border border-white/10 text-[11px] font-medium text-slate-200 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Bookmark Vault</span>
            </div>

            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-950/80 backdrop-blur-md border border-indigo-500/30 text-[10px] font-semibold text-indigo-300 shadow-lg">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              <span>Ready for Review</span>
            </div>
          </div>
        </div>

        {/* Restrained physical platform base */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-b from-[#0a1128] to-[#060a19] border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-white text-[12px] font-semibold leading-tight">Saved Position Tracker</p>
              <p className="text-[10px] text-slate-400">Organized candidate workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-cyan-400/90 font-medium">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Zero Expiration</span>
          </div>
        </div>
      </motion.div>

      {/* Realistic contact shadow beneath the card */}
      <div
        className="w-4/5 h-4 mx-auto mt-2 rounded-full bg-black/60 blur-md pointer-events-none transform-gpu"
        style={{
          transform: `scale(${1 - scrollDepth * 0.01})`,
          opacity: 0.7
        }}
        aria-hidden="true"
      />
    </div>
  );
};
