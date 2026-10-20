import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Star } from 'lucide-react';
import { CardReflectiveShine } from '../common/CardReflectiveShine';

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
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0c132c]/85 via-[#080d20]/90 to-[#060918]/95 border border-white/[0.08] hover:border-white/[0.14] backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] transition-all duration-300 overflow-hidden group"
    >
      {/* Specular hairline, corner reflection & natural light sheen */}
      <CardReflectiveShine variant="indigo" rounded="rounded-3xl" />

      {/* Ambient depth lighting */}
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="space-y-6 relative z-10">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-indigo-500/20">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-400/35 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] shrink-0">
              <Star className="w-6 h-6 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-xl font-black text-white tracking-tight">
                  Profile Strength & ATS Readiness
                </h3>
                <span className={`text-xs px-3 py-1 rounded-full font-bold border shadow-sm ${strengthInfo.badgeColor}`}>
                  {strengthInfo.label} ({profileCompletionRate}%)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {strengthInfo.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-indigo-200 bg-indigo-500/20 px-3.5 py-1.5 rounded-xl border border-indigo-400/35 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
              ⚡ 4x Higher Recruiter Visibility
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-2.5">
          <div className="w-full bg-slate-950/90 rounded-full h-3.5 overflow-hidden p-0.5 border border-indigo-500/30 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profileCompletionRate}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_12px_rgba(129,140,248,0.5)]"
            />
          </div>

          <div className="flex justify-between text-[11px] font-bold text-slate-400 px-1">
            <span className={profileCompletionRate >= 20 ? 'text-amber-300' : ''}>Beginner (20%)</span>
            <span className={profileCompletionRate >= 45 ? 'text-indigo-300' : ''}>Intermediate (45%)</span>
            <span className={profileCompletionRate >= 75 ? 'text-purple-300' : ''}>Advanced (75%)</span>
            <span className={profileCompletionRate >= 90 ? 'text-emerald-300' : ''}>All-Star (100%)</span>
          </div>
        </div>

        {/* Actionable Recommendations Checklist */}
        <div className="pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            Complete profile milestones to achieve 100% All-Star ATS ranking:
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={`group/item relative p-4 rounded-2xl flex items-center justify-between gap-3.5 transition-all duration-200 overflow-hidden shadow-sm ${
                  item.completed
                    ? 'bg-emerald-500/[0.04] border border-emerald-500/20 hover:border-emerald-500/35'
                    : 'bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14]'
                }`}
              >

                <div className="flex items-center gap-3 min-w-0 relative z-10">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                      item.completed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                        : 'bg-indigo-500/15 text-slate-400 border-indigo-500/30'
                    }`}
                  >
                    {item.completed ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold text-indigo-300">•</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white tracking-tight leading-snug">
                      {item.title}
                    </p>
                    <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
                      +{item.points}% ATS Weight
                    </span>
                  </div>
                </div>

                <div className="relative z-10 shrink-0">
                  {item.completed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/35 shadow-sm">
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Done
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={item.action}
                      className="text-xs font-bold text-indigo-200 hover:text-white px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-400/40 hover:border-indigo-300/80 transition-all cursor-pointer whitespace-nowrap shadow-sm hover:shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                    >
                      {item.actionLabel}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};
