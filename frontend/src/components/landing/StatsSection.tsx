import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  FileCheck2,
  Zap,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  decimals?: number;
  prefix?: string;
  label: string;
  sublabel: string;
  color: string;
}

const stats: StatItem[] = [
  {
    icon: FileCheck2,
    value: 98.4,
    suffix: '%',
    decimals: 1,
    label: 'ATS Extraction Accuracy',
    sublabel: 'Precision semantic parsing across multi-column PDF & DOCX resumes',
    color: 'text-indigo-400',
  },
  {
    icon: Zap,
    value: 4.8,
    suffix: 'x',
    decimals: 1,
    label: 'Candidate Match Velocity',
    sublabel: 'Faster screening and algorithmic compatibility ranking',
    color: 'text-cyan-400',
  },
  {
    icon: Users,
    value: 15000,
    suffix: '+',
    decimals: 0,
    label: 'Resumes Analyzed',
    sublabel: 'Standardized talent profiles processed through neural ATS engine',
    color: 'text-purple-400',
  },
  {
    icon: Award,
    value: 94.2,
    suffix: '%',
    decimals: 1,
    label: 'Recruiter Efficiency',
    sublabel: 'Reduction in manual screening time and interview-to-offer alignment',
    color: 'text-emerald-400',
  },
];

const AnimatedCounter: React.FC<{
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}> = ({ target, decimals = 0, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out cubic
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * easeOutProgress;

      if (frame >= totalFrames) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="font-mono font-black tracking-tight">
      {prefix}
      {count.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

export const StatsSection: React.FC = () => {
  return (
    <section className="py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card-elevated rounded-3xl p-8 sm:p-10 border border-slate-800/90 shadow-2xl relative overflow-hidden">
          
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-cyan-500/5 -z-10" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex flex-col space-y-2 relative sm:border-r last:border-r-0 border-slate-800/80 pr-4 sm:last:pr-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center text-slate-300 mb-2">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>

                  <div className={`text-3xl sm:text-4xl text-white flex items-baseline ${stat.color}`}>
                    <AnimatedCounter
                      target={stat.value}
                      decimals={stat.decimals}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  </div>

                  <h4 className="text-sm font-bold text-slate-200 tracking-tight">
                    {stat.label}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {stat.sublabel}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
            <span>* Demonstration benchmark analytics across simulated AI recruitment pipelines</span>
            <span className="font-mono text-indigo-400">BENCHMARK PHASE 1</span>
          </div>

        </div>
      </div>
    </section>
  );
};
