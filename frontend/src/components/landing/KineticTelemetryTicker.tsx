import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldCheck, Activity } from 'lucide-react';

interface TelemetryStream {
  id: string;
  tag: string;
  tagColor: string;
  text: string;
  metric: string;
}

const TELEMETRY_STREAMS: TelemetryStream[] = [
  {
    id: 'stream-1',
    tag: '5-VECTOR PARSER',
    tagColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    text: 'Deconstructing resume tree against 4,000+ industry ontologies...',
    metric: '180ms parse latency',
  },
  {
    id: 'stream-2',
    tag: 'STAR REWRITER',
    tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    text: 'Transforming passive responsibilities into quantified business impact...',
    metric: '+38% recruiter callback',
  },
  {
    id: 'stream-3',
    tag: 'KEYWORD GAP SCAN',
    tagColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    text: 'Surfacing high-velocity required competencies missing from experience...',
    metric: '94.8% match confidence',
  },
  {
    id: 'stream-4',
    tag: 'RECRUITER SYNC',
    tagColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    text: 'Pre-indexing candidate credentials directly into hiring requisition queues...',
    metric: 'Top 1% cohort rank',
  },
];

const GLYPHS = '01#@%&<>*!=+-_~';

export const KineticTelemetryTicker: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [streamIndex, setStreamIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isScrambling, setIsScrambling] = useState(false);

  const currentStream = TELEMETRY_STREAMS[streamIndex];

  useEffect(() => {
    let frame = 0;
    const target = currentStream.text;
    const length = target.length;
    setIsScrambling(true);

    const scrambleInterval = setInterval(() => {
      frame++;
      const revealedCount = Math.floor((frame / 20) * length);

      let result = '';
      for (let i = 0; i < length; i++) {
        if (i < revealedCount) {
          result += target[i];
        } else if (i < revealedCount + 4) {
          result += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        } else {
          result += ' ';
        }
      }

      setDisplayText(result);

      if (revealedCount >= length) {
        clearInterval(scrambleInterval);
        setDisplayText(target);
        setIsScrambling(false);
      }
    }, 28);

    const cycleTimeout = setTimeout(() => {
      setStreamIndex((prev) => (prev + 1) % TELEMETRY_STREAMS.length);
    }, 5500);

    return () => {
      clearInterval(scrambleInterval);
      clearTimeout(cycleTimeout);
    };
  }, [streamIndex]);

  return (
    <div
      className={`w-full rounded-xl bg-slate-950/80 border border-indigo-500/25 p-3 sm:px-4 sm:py-3 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] ${className}`}
      aria-label="Live AI ATS Engine Telemetry"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Engine Tag & Live animated stream text */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Status Indicator */}
          <div className="relative flex items-center justify-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute opacity-75" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 relative" />
          </div>

          {/* Tag Badge */}
          <AnimatePresence mode="wait">
            <motion.span
              key={currentStream.id + '-tag'}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              className={`shrink-0 text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border tracking-wider ${currentStream.tagColor}`}
            >
              {currentStream.tag}
            </motion.span>
          </AnimatePresence>

          {/* Animated Decoded Text */}
          <div className="flex items-center min-w-0 font-mono text-xs text-slate-200 truncate">
            <span className="truncate">{displayText}</span>
            <span
              className={`inline-block w-1.5 h-3.5 bg-indigo-400 ml-1 shrink-0 ${
                isScrambling ? 'opacity-100' : 'animate-pulse opacity-75'
              }`}
            />
          </div>
        </div>

        {/* Right: Telemetry Metric Badge */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-indigo-300/90 bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1 rounded-md">
            <Activity className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span>{currentStream.metric}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
