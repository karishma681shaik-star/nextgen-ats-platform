import React from 'react';

export const ResumeBannerGraphic: React.FC = () => {
  return (
    <div className="relative shrink-0 flex items-center justify-center select-none" style={{ width: '232px', height: '166px' }}>
      {/* ── Left Resume Sheet (Behind, slightly tilted) ── */}
      <div
        className="absolute left-1 top-2 w-[128px] h-[154px] bg-white rounded-[2px] border border-slate-300/90 shadow-[0_4px_18px_rgba(0,0,0,0.45)] p-2.5 flex flex-col justify-between overflow-hidden"
        style={{ transform: 'rotate(-2deg)', transformOrigin: 'bottom left' }}
      >
        <div>
          {/* Header */}
          <div className="text-center pb-1 border-b border-slate-300">
            <div className="text-[8px] font-black tracking-wider text-slate-900 leading-none">
              JAMES CLARKE
            </div>
            <div className="text-[4.2px] text-slate-500 tracking-tight mt-0.5 leading-none">
              Austin, TX • james.clarke@email.com • (512) 555-0198
            </div>
          </div>

          {/* Experience Section */}
          <div className="mt-1.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[5.2px] font-bold text-slate-800 uppercase tracking-tight">EXPERIENCE</span>
              <span className="text-[4.2px] text-slate-400">2021 - Present</span>
            </div>
            <div className="text-[4.8px] font-semibold text-slate-700 leading-none">
              Staff Engineer — CloudScale Inc
            </div>
            <div className="space-y-0.5 pl-1">
              <div className="flex items-start gap-1">
                <span className="text-[4px] text-slate-400 leading-none">•</span>
                <span className="text-[4.2px] text-slate-600 leading-tight">Engineered microservices handling 40M+ req/day</span>
              </div>
              <div className="flex items-start gap-1">
                <span className="text-[4px] text-slate-400 leading-none">•</span>
                <span className="text-[4.2px] text-slate-600 leading-tight">Optimized PostgreSQL latency by 42%</span>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="mt-1.5 space-y-0.5">
            <div className="text-[5.2px] font-bold text-slate-800 uppercase tracking-tight">EDUCATION</div>
            <div className="text-[4.2px] text-slate-600 leading-none">B.S. in Computer Science — UT Austin</div>
          </div>
        </div>

        {/* Floating Mini Badge on Left Resume Sheet */}
        <div className="inline-flex items-center gap-1 self-start px-1.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border border-pink-500/40 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[5px] font-black text-purple-900 tracking-tight">ATS Match 98%</span>
        </div>
      </div>

      {/* ── Right Resume Sheet (Foreground / Overlapping) ── */}
      <div
        className="absolute right-1 top-1 w-[136px] h-[158px] bg-white rounded-[2px] border border-slate-300 shadow-[-7px_0_18px_rgba(0,0,0,0.22),0_10px_28px_rgba(0,0,0,0.5)] p-2.5 flex flex-col justify-between overflow-hidden z-10"
      >
        <div>
          {/* Header */}
          <div className="pb-1 border-b border-slate-300">
            <div className="text-[8.5px] font-black text-slate-900 tracking-tight leading-none">
              FIRSTNAME LASTNAME
            </div>
            <div className="text-[4.8px] font-medium text-slate-600 tracking-tight mt-0.5 leading-none truncate">
              Full Stack Developer | Frontend Developer | Backend...
            </div>
            <div className="text-[4px] text-slate-400 tracking-tight mt-0.5 leading-none">
              developer@domain.com • (555) 019-2834 • github.com/profile
            </div>
          </div>

          {/* Experience Section */}
          <div className="mt-1.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[5.2px] font-bold text-slate-900 uppercase tracking-tight">WORK EXPERIENCE</span>
              <span className="text-[4.2px] text-slate-400">2022 — Present</span>
            </div>
            <div className="text-[4.8px] font-semibold text-slate-800 leading-none">
              Lead Software Engineer — Horizon Tech
            </div>
            <div className="space-y-0.5 pl-1">
              <div className="flex items-start gap-0.5">
                <span className="text-[4px] text-slate-400 leading-none">•</span>
                <span className="text-[4.2px] text-slate-600 leading-tight">Architected distributed cloud microservices</span>
              </div>
              <div className="flex items-start gap-0.5">
                <span className="text-[4px] text-slate-400 leading-none">•</span>
                <span className="text-[4.2px] text-slate-600 leading-tight">Led frontend migration to React 18 & TypeScript</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[4.8px] font-semibold text-slate-800 leading-none">Software Engineer — Apex Labs</span>
              <span className="text-[4.2px] text-slate-400">2019 — 2022</span>
            </div>
            <div className="space-y-0.5 pl-1">
              <div className="flex items-start gap-0.5">
                <span className="text-[4px] text-slate-400 leading-none">•</span>
                <span className="text-[4.2px] text-slate-600 leading-tight">Implemented end-to-end ATS workflow pipelines</span>
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div className="mt-1.5 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[5.2px] font-bold text-slate-900 uppercase tracking-tight">EDUCATION</span>
              <span className="text-[4.2px] text-slate-400">2015 — 2019</span>
            </div>
            <div className="text-[4.2px] text-slate-600 leading-tight">
              B.S. in Computer Science — Honors
            </div>
          </div>
        </div>

        {/* Bottom footer tag */}
        <div className="w-full pt-1 border-t border-slate-100 flex items-center justify-between text-[4px] text-slate-400">
          <span>ATS Verified Format</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};
