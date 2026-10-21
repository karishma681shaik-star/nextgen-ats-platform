import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const ApplicationTrackerSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 select-none" aria-busy="true" aria-live="polite">
      {/* ── Filter Tabs Skeleton ───────────────────────────────────────────── */}
      <div className="filter-panel-luminous rounded-2xl p-1.5 bg-slate-900/60 backdrop-blur-xl border border-white/[0.06]">
        <div className="flex items-center gap-2 overflow-x-auto p-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03]">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-6 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Contextual Stage Intelligence Banner Skeleton ──────────────────── */}
      <div className="card-upper-edge-luminous rounded-2xl p-5 bg-slate-900/60 backdrop-blur-xl border border-white/[0.06]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <Skeleton className="h-6 w-64 rounded-lg" />
            <Skeleton className="h-4 w-96 max-w-full rounded" />
          </div>
          <div className="hidden md:block w-44 shrink-0">
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* ── Application Cards List Skeletons ───────────────────────────────── */}
      <div className="space-y-4">
        {[1, 2].map((idx) => (
          <div
            key={idx}
            className="card-upper-edge-luminous rounded-2xl p-5 sm:p-6 bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Identity & Role Information */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Skeleton className={`h-6 rounded-lg ${idx === 1 ? 'w-52' : 'w-64'}`} />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-32 rounded font-mono" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Skeleton className="h-4 w-40 rounded" />
                    <Skeleton className="h-4 w-32 rounded" />
                  </div>
                </div>
              </div>

              {/* Right Mini Progress Stepper & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-5 shrink-0 pt-3 lg:pt-0 border-t border-white/[0.08] lg:border-t-0">
                {/* 4-Stage Mini Stepper Skeleton */}
                <div className="w-full sm:w-56 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="w-20 h-3 rounded" />
                    <Skeleton className="w-16 h-3 rounded" />
                  </div>
                  <div className="flex justify-between items-center py-1">
                    {[1, 2, 3, 4].map((s) => (
                      <Skeleton key={s} className="w-4 h-4 rounded-full" />
                    ))}
                  </div>
                </div>

                {/* Match Score Badge & Action Button */}
                <div className="flex items-center gap-3">
                  <Skeleton className="w-16 h-10 rounded-xl" />
                  <Skeleton className="w-28 h-10 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
