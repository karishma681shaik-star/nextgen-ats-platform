import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ElementType;
  badge: string;
  badgeColor?: 'indigo' | 'purple' | 'emerald' | 'cyan';
  title: string;
  description: string;
  children: React.ReactNode;
  highlights: string[];
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  badge,
  badgeColor = 'indigo',
  title,
  description,
  children,
  highlights,
}) => {
  const badgeStyles = {
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  };

  const iconStyles = {
    indigo: 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white',
    purple: 'bg-purple-600/20 text-purple-400 border-purple-500/30 group-hover:bg-purple-600 group-hover:text-white',
    emerald: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white',
    cyan: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30 group-hover:bg-cyan-600 group-hover:text-white',
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 32, filter: 'blur(10px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.65, ease: 'easeOut' as const } },
      }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group glass-card rounded-3xl p-6 sm:p-7 border border-slate-800/90 hover:border-indigo-500/40 hover:shadow-card-hover transition-all flex flex-col justify-between relative overflow-hidden"
    >

      {/* Ambient hover top corner glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/15 transition-all pointer-events-none" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 shadow-inner ${iconStyles[badgeColor]}`}
          >
            <Icon className="w-6 h-6" />
          </div>

          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badgeStyles[badgeColor]}`}
          >
            {badge}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-200 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Interactive Custom Visualization Slot */}
        <div className="pt-2">
          {children}
        </div>
      </div>

      {/* Highlights List */}
      <div className="pt-5 mt-5 border-t border-slate-800/80 space-y-1.5">
        {highlights.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
