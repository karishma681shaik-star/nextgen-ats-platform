import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const JobDiscoverySkeleton: React.FC = () => {
  return (
    <div className="space-y-6 select-none" aria-busy="true" aria-live="polite">
      {/* ── Search & Filter Panel Skeleton ─────────────────────────────────── */}
      <div className="card-upper-edge-luminous rounded-2xl p-4 sm:p-5 bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] space-y-4">
        {/* Search Input Bar Placeholder */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-32 hidden sm:block rounded-xl" />
        </div>

        {/* Filter Pills Placeholder */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className={`h-8 rounded-xl ${i === 1 ? 'w-20' : 'w-24'}`} />
            ))}
          </div>
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
      </div>

      {/* ── 3 Rich Job Card Skeletons ───────────────────────────────────────── */}
      <div className="space-y-4">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="card-upper-edge-luminous rounded-2xl p-5 sm:p-6 bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Identity Details */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Company Logo Monogram */}
                <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Skeleton className={`h-6 rounded-xl ${idx === 1 ? 'w-56' : idx === 2 ? 'w-64' : 'w-48'}`} />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-4 w-32 rounded-md" />
                  </div>

                  {/* Skill Tag Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4].map((s) => (
                      <Skeleton key={s} className="h-6 w-16 sm:w-20 rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Action Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-3 lg:pt-0 border-t border-white/[0.08] lg:border-t-0">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-10 w-28 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
