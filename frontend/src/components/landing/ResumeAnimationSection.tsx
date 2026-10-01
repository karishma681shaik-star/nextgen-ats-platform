import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { CheckCircle2, Zap } from 'lucide-react';

/* ============================================================
   MOCK RESUME CONTENT
   ============================================================ */

const ResumeDocument: React.FC<{ scanActive: boolean }> = ({ scanActive }) => (
  <div
    className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
    style={{
      width: '100%',
      maxWidth: 380,
      minHeight: 520,
      fontFamily: 'Georgia, serif',
      color: '#1a1a2e',
    }}
  >
    {/* ATS scan beam overlay */}
    {scanActive && (
      <div
        className="absolute inset-x-0 z-20 pointer-events-none"
        style={{
          height: 3,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.6) 20%, rgba(56,189,248,1) 50%, rgba(99,102,241,0.6) 80%, transparent 100%)',
          boxShadow: '0 0 20px rgba(56,189,248,0.9), 0 0 8px rgba(99,102,241,1)',
          animation: 'scanBeam 1.8s ease-in-out 3',
        }}
      />
    )}
    {/* Scan glow overlay */}
    {scanActive && (
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(99,102,241,0.04) 0%, rgba(56,189,248,0.06) 50%, rgba(99,102,241,0.04) 100%)',
          animation: 'scanBeam 1.8s ease-in-out 3',
        }}
      />
    )}

    <div className="p-5 space-y-3">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-3">
        <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Arial, sans-serif' }}>
          ALEX JOHNSON
        </h2>
        <p className="text-xs text-gray-600 mt-0.5">Software Engineer</p>
        <div className="flex justify-center gap-3 mt-1.5 text-[10px] text-gray-500 flex-wrap">
          <span>alex@email.com</span>
          <span>·</span>
          <span>linkedin.com/in/alexj</span>
          <span>·</span>
          <span>github.com/alexj</span>
        </div>
      </div>

      {/* Experience */}
      <div>
        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-200 pb-1 mb-1.5" style={{ fontFamily: 'Arial, sans-serif' }}>
          Experience
        </h3>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[10px]">
              <span className="font-bold text-gray-800">Senior Software Engineer · TechCorp</span>
              <span className="text-gray-500">2022 – Present</span>
            </div>
            <ul className="text-[9px] text-gray-600 mt-1 space-y-0.5 list-disc list-inside">
              <li>Built microservices handling 2M+ daily requests</li>
              <li>Led migration to cloud-native architecture (AWS)</li>
              <li>Reduced latency by 40% via Redis caching layer</li>
            </ul>
          </div>
          <div>
            <div className="flex justify-between text-[10px]">
              <span className="font-bold text-gray-800">Software Engineer · StartupXYZ</span>
              <span className="text-gray-500">2020 – 2022</span>
            </div>
            <ul className="text-[9px] text-gray-600 mt-1 space-y-0.5 list-disc list-inside">
              <li>Developed React dashboard used by 50k+ users</li>
              <li>Implemented CI/CD pipeline with GitHub Actions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Education */}
      <div>
        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-200 pb-1 mb-1.5" style={{ fontFamily: 'Arial, sans-serif' }}>
          Education
        </h3>
        <div className="flex justify-between text-[10px]">
          <span className="font-bold text-gray-800">B.E. Computer Science · MIT University</span>
          <span className="text-gray-500">2016 – 2020</span>
        </div>
        <p className="text-[9px] text-gray-600">CGPA: 8.9/10 · Dean's List 2019, 2020</p>
      </div>

      {/* Skills */}
      <div>
        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-200 pb-1 mb-1.5" style={{ fontFamily: 'Arial, sans-serif' }}>
          Skills
        </h3>
        <div className="flex flex-wrap gap-1">
          {['React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'TypeScript', 'Redis', 'GraphQL'].map((sk) => (
            <span key={sk} className="text-[8px] px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-700 font-medium">
              {sk}
            </span>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div>
        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-200 pb-1 mb-1.5" style={{ fontFamily: 'Arial, sans-serif' }}>
          Projects
        </h3>
        <div className="space-y-1">
          <div>
            <span className="text-[10px] font-bold text-gray-800">AI Resume Analyzer</span>
            <p className="text-[9px] text-gray-600">NLP-powered tool for ATS score optimization — 3k+ GitHub stars</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-800">CloudDeploy CLI</span>
            <p className="text-[9px] text-gray-600">One-command AWS deployment tool with rollback support</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-200 pb-1 mb-1.5" style={{ fontFamily: 'Arial, sans-serif' }}>
          Achievements
        </h3>
        <ul className="text-[9px] text-gray-600 list-disc list-inside space-y-0.5">
          <li>Google Code Jam 2023 — Top 500 globally</li>
          <li>Hackathon Winner — HackMIT 2022</li>
          <li>AWS Certified Solutions Architect</li>
        </ul>
      </div>
    </div>
  </div>
);

/* ============================================================
   ATS SCAN PANEL
   ============================================================ */

interface ScanItem {
  label: string;
  status: 'pass' | 'pending';
}

const SCAN_ITEMS: ScanItem[] = [
  { label: 'Skills detected', status: 'pass' },
  { label: 'Experience matched', status: 'pass' },
  { label: 'Keywords optimized', status: 'pass' },
  { label: 'Formatting check', status: 'pass' },
];

const ATSScanPanel: React.FC<{ visible: boolean; score: number }> = ({ visible, score }) => {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!visible) {
      setCheckedItems([]);
      setDisplayScore(0);
      return;
    }
    SCAN_ITEMS.forEach((_, i) => {
      setTimeout(() => {
        setCheckedItems((prev) => [...prev, i]);
      }, 400 + i * 500);
    });
    // Animate score
    let frame = 0;
    const total = 50;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / total;
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * ease));
      if (frame >= total) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [visible, score]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card-elevated rounded-2xl p-5 border border-indigo-500/25 w-64 flex-shrink-0 shadow-glow"
        >
          {/* Panel header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-indigo-300 tracking-widest">AI ATS SCAN</p>
              <p className="text-[9px] text-slate-500">Live analysis</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="border-t border-slate-700/50 pt-3 space-y-2.5">
            {SCAN_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{item.label}</span>
                {checkedItems.includes(i) ? (
                  <motion.span
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                    className="text-emerald-400"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </motion.span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-600" />
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-700/50 mt-3 pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400">Job match score</span>
              <span className="text-lg font-black text-indigo-400 font-mono">{displayScore}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-2 rounded-full"
                style={{ background: 'linear-gradient(90deg, #6366f1, #a78bfa)' }}
                initial={{ width: 0 }}
                animate={{ width: visible ? `${score}%` : 0 }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ============================================================
   SHORTLISTED STAMP
   ============================================================ */

const ShortlistedStamp: React.FC<{ visible: boolean }> = ({ visible }) => {
  const CONFETTI_COLORS = ['#6366f1', '#a78bfa', '#67e8f9', '#34d399', '#f59e0b', '#f472b6'];
  const confettiPieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    x: (Math.random() - 0.5) * 240,
    y: -(Math.random() * 120 + 40),
    rotate: Math.random() * 720,
    size: 5 + Math.random() * 7,
    delay: Math.random() * 0.4,
    dur: 0.9 + Math.random() * 0.6,
  }));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Confetti */}
          {confettiPieces.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
              animate={{ x: p.x, y: p.y, rotate: p.rotate, opacity: 0, scale: 0.2 }}
              transition={{ duration: p.dur, delay: p.delay, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size,
                borderRadius: 2,
                background: p.color,
              }}
            />
          ))}

          {/* Stamp */}
          <motion.div
            initial={{ scale: 2.5, rotate: -15, opacity: 0 }}
            animate={{ scale: 1, rotate: -8, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
            className="stamp-glow-anim"
          >
            <div
              className="px-7 py-4 border-4 border-emerald-400 rounded-lg text-center"
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <p
                className="text-3xl sm:text-4xl font-black tracking-widest text-emerald-400"
                style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '0.18em' }}
              >
                SHORTLISTED
              </p>
              <div className="flex justify-center gap-1.5 mt-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-emerald-400 text-sm">★</span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ============================================================
   LAPTOP VISUAL (CSS-drawn)
   ============================================================ */

const LaptopVisual: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col items-center w-full">
    {/* Screen */}
    <div
      className="relative w-full rounded-t-xl overflow-hidden border border-slate-700/70"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        boxShadow: '0 -4px 40px rgba(99,102,241,0.15)',
        padding: '16px 12px 8px',
        minHeight: 420,
      }}
    >
      {/* Screen top bar */}
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        <div className="flex-1 ml-2 h-4 bg-slate-800/80 rounded-md flex items-center px-2 gap-1">
          <span className="text-[8px] text-slate-500 truncate">app.aiats.com/resume-builder</span>
        </div>
      </div>
      {/* Resume content area */}
      <div className="flex justify-center">{children}</div>
    </div>
    {/* Keyboard hinge */}
    <div
      className="w-full h-4 rounded-b-sm"
      style={{ background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', borderTop: '1px solid #334155' }}
    />
    {/* Keyboard base */}
    <div
      className="w-full h-20 rounded-b-xl"
      style={{
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
      }}
    >
      {/* Keyboard rows */}
      <div className="pt-2 px-4 space-y-1.5">
        {[...Array(3)].map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-1 justify-center">
            {[...Array(rowIdx === 2 ? 7 : 12)].map((__, colIdx) => (
              <div
                key={colIdx}
                className="rounded-sm"
                style={{
                  width: rowIdx === 2 ? (colIdx === 3 ? 64 : 16) : 16,
                  height: 10,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Trackpad */}
      <div className="mt-1.5 mx-auto w-24 h-7 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }} />
    </div>
  </div>
);

/* ============================================================
   HANDS (SVG-based)
   ============================================================ */

const HandsHolding: React.FC<{ visible: boolean }> = ({ visible }) => (
  <AnimatePresence>
    {visible && (
      <>
        {/* Left hand */}
        <motion.div
          initial={{ y: 80, opacity: 0, x: -20 }}
          animate={{ y: 0, opacity: 1, x: 0 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 left-0 pointer-events-none"
          style={{ zIndex: 20 }}
        >
          <svg width="120" height="180" viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Sleeve */}
            <path d="M0 180 Q20 120 40 100 L80 90 Q100 120 120 180Z" fill="#1e293b" />
            <path d="M0 180 Q20 120 40 100 L80 90 Q100 120 120 180Z" fill="url(#leftSleeve)" />
            <defs>
              <linearGradient id="leftSleeve" x1="0" y1="90" x2="120" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#312e81" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            {/* Palm */}
            <ellipse cx="60" cy="95" rx="38" ry="28" fill="#c8a882" />
            {/* Fingers */}
            {[30, 45, 58, 71, 84].map((cx, i) => (
              <ellipse key={i} cx={cx} cy={72 - i * 2} rx={7 - i * 0.3} ry={20 - i * 1} fill="#c8a882" transform={`rotate(${(i - 2) * 8} ${cx} 95)`} />
            ))}
            {/* Thumb */}
            <ellipse cx="18" cy="108" rx="9" ry="18" fill="#c8a882" transform="rotate(-35 18 108)" />
          </svg>
        </motion.div>

        {/* Right hand */}
        <motion.div
          initial={{ y: 80, opacity: 0, x: 20 }}
          animate={{ y: 0, opacity: 1, x: 0 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="absolute bottom-0 right-0 pointer-events-none"
          style={{ zIndex: 20 }}
        >
          <svg width="120" height="180" viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Sleeve */}
            <path d="M0 180 Q20 120 40 90 L80 100 Q100 120 120 180Z" fill="url(#rightSleeve)" />
            <defs>
              <linearGradient id="rightSleeve" x1="120" y1="90" x2="0" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#312e81" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            {/* Palm */}
            <ellipse cx="60" cy="95" rx="38" ry="28" fill="#c8a882" />
            {/* Fingers (mirrored) */}
            {[90, 75, 62, 49, 36].map((cx, i) => (
              <ellipse key={i} cx={cx} cy={72 - i * 2} rx={7 - i * 0.3} ry={20 - i * 1} fill="#c8a882" transform={`rotate(${-(i - 2) * 8} ${cx} 95)`} />
            ))}
            {/* Thumb */}
            <ellipse cx="102" cy="108" rx="9" ry="18" fill="#c8a882" transform="rotate(35 102 108)" />
          </svg>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

/* ============================================================
   MAIN ANIMATION SECTION
   ============================================================ */

type AnimStep = 'idle' | 'laptop' | 'resume' | 'hands' | 'scan' | 'panel' | 'stamp' | 'done';

export const ResumeAnimationSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [step, setStep] = useState<AnimStep>('idle');

  useEffect(() => {
    if (!isInView || step !== 'idle') return;

    const timings: [AnimStep, number][] = [
      ['laptop', 200],
      ['resume', 900],
      ['hands', 1900],
      ['scan', 3000],
      ['panel', 3400],
      ['stamp', 6800],
      ['done', 9000],
    ];

    const timers = timings.map(([s, delay]) =>
      setTimeout(() => setStep(s), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [isInView, step]);

  const laptopVisible = ['laptop', 'resume', 'hands', 'scan', 'panel', 'stamp', 'done'].includes(step);
  const resumeVisible = ['resume', 'hands', 'scan', 'panel', 'stamp', 'done'].includes(step);
  const handsVisible = ['hands', 'scan', 'panel', 'stamp', 'done'].includes(step);
  const scanActive = ['scan', 'panel', 'stamp', 'done'].includes(step);
  const panelVisible = ['panel', 'stamp', 'done'].includes(step);
  const stampVisible = ['stamp', 'done'].includes(step);

  return (
    <section
      ref={ref}
      className="relative py-24 px-4 overflow-hidden"
      aria-label="Resume animation section"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="radial-glow-orb w-[600px] h-[600px] bg-indigo-600/10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="radial-glow-orb w-[400px] h-[400px] bg-purple-600/8 left-0 top-0" style={{ animationDelay: '2s' }} />
        <div className="radial-glow-orb w-[300px] h-[300px] bg-cyan-600/8 right-0 bottom-0" style={{ animationDelay: '4s' }} />
      </div>
      <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-5">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            Watch AI Work in Real Time
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Your resume, transformed by AI
          </h2>
          <p className="mt-4 text-slate-400 text-base max-w-xl mx-auto">
            Upload once. Our AI scans, optimizes and gets you shortlisted — in seconds.
          </p>
        </motion.div>

        {/* Animation stage */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
          {/* Left: Laptop + Resume + Hands */}
          <div className="relative w-full max-w-md lg:max-w-lg">
            {/* Laptop wrapper */}
            <AnimatePresence>
              {laptopVisible && (
                <motion.div
                  initial={{ opacity: 0, y: -60, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <LaptopVisual>
                    {/* Resume slides out of laptop */}
                    <AnimatePresence>
                      {resumeVisible && (
                        <motion.div
                          initial={{ y: -20, scale: 0.9, opacity: 0 }}
                          animate={{ y: 0, scale: 1, opacity: 1 }}
                          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                          className="relative"
                        >
                          <ResumeDocument scanActive={scanActive} />
                          <ShortlistedStamp visible={stampVisible} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </LaptopVisual>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hands */}
            <HandsHolding visible={handsVisible} />
          </div>

          {/* Right: ATS panel */}
          <div className="flex flex-col items-center gap-6 w-full max-w-xs">
            <ATSScanPanel visible={panelVisible} score={92} />

            {/* Step indicators */}
            <div className="space-y-2 w-full">
              {[
                { label: 'Resume uploaded', done: resumeVisible },
                { label: 'AI scanning resume', done: scanActive },
                { label: 'ATS analysis complete', done: panelVisible },
                { label: 'Candidate shortlisted', done: stampVisible },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="flex items-center gap-2.5 text-xs"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                      item.done
                        ? 'border-emerald-400 bg-emerald-400/20'
                        : 'border-slate-600 bg-transparent'
                    }`}
                  >
                    {item.done && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <span className={item.done ? 'text-slate-200' : 'text-slate-500'}>
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #040711)' }}
      />
    </section>
  );
};
