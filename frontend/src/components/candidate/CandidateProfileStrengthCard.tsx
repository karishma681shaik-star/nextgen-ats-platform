import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, Check, Star, ArrowUpRight } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  points: number;
  completed: boolean;
  action: () => void;
  actionLabel: string;
}

interface StrengthInfo {
  label: string;
  badgeColor: string;
  textColor: string;
  message: string;
}

interface CandidateProfileStrengthCardProps {
  profileCompletionRate: number;
  strengthInfo: StrengthInfo;
  checklist: ChecklistItem[];
}

export const CandidateProfileStrengthCard: React.FC<CandidateProfileStrengthCardProps> = ({
  profileCompletionRate,
  strengthInfo,
  checklist
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0c142e]/95 via-[#080e24]/95 to-[#050818]/98 border border-white/[0.08] hover:border-white/[0.12] backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.65)] transition-all duration-300 overflow-hidden"
    >
      {/* Top specular hairline & ambient glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Metrics, Progress Bar, & Recommendation Checklist */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-amber-300 shadow-sm shrink-0">
                <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold text-white tracking-tight">Profile Strength & Readiness</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${strengthInfo.badgeColor}`}>
                    {strengthInfo.label} ({profileCompletionRate}%)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{strengthInfo.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                ⚡ 4x More Recruiter Inquiries
              </span>
            </div>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-slate-950/80 rounded-full h-3 overflow-hidden p-0.5 border border-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletionRate}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"
              />
            </div>

            <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-1">
              <span className={profileCompletionRate >= 20 ? 'text-amber-300' : ''}>Beginner (20%)</span>
              <span className={profileCompletionRate >= 45 ? 'text-indigo-300' : ''}>Intermediate (45%)</span>
              <span className={profileCompletionRate >= 75 ? 'text-purple-300' : ''}>Advanced (75%)</span>
              <span className={profileCompletionRate >= 90 ? 'text-emerald-300' : ''}>All-Star (100%)</span>
            </div>
          </div>

          {/* Actionable Recommendations Checklist */}
          <div className="pt-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Complete remaining items to achieve 100% All-Star ranking:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    item.completed
                      ? 'bg-emerald-950/20 border-emerald-500/20'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-indigo-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        item.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      {item.completed ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px]">•</span>}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                      <span className="text-[10px] text-slate-400">+{item.points}% value</span>
                    </div>
                  </div>

                  {item.completed ? (
                    <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                      Done
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={item.action}
                      className="text-[11px] font-semibold text-indigo-300 hover:text-white px-2.5 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-600/80 border border-indigo-500/25 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {item.actionLabel}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: 3D Career Growth Helix Object */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center relative hidden sm:flex">
          <motion.div
            animate={{
              y: prefersReduced ? 0 : [0, -5, 0],
              rotateY: prefersReduced ? 0 : [0, 4, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="relative w-44 h-44 sm:w-52 sm:h-52 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)]"
          >
            <img
              src="/assets/candidate/career_growth_3d.png"
              alt="3D Career Growth Progression"
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </motion.div>
          <p className="text-[11px] font-mono text-slate-400 mt-2 text-center">
            CAREER TRAJECTORY & ATS READINESS
          </p>
        </div>

      </div>
    </motion.section>
  );
};
