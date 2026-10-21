import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const RecruiterDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 select-none" aria-busy="true" aria-live="polite">
      {/* ── Header Telemetry ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* ── 4 KPI Stats Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="card-upper-edge-luminous rounded-2xl p-5 bg-slate-900/70 border border-white/[0.06] space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="w-12 h-4 rounded-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-7 w-20 rounded" />
              <Skeleton className="h-3.5 w-28 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* ── 2-Column Section Layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Requisitions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center px-1">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          {[1, 2, 3].map((k) => (
            <div
              key={k}
              className="card-upper-edge-luminous rounded-2xl p-5 bg-slate-900/70 border border-white/[0.06] space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-48 rounded" />
                  <div className="flex gap-2">
                    <Skeleton className="h-3.5 w-24 rounded" />
                    <Skeleton className="h-3.5 w-28 rounded" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Candidate Pipeline Overview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center px-1">
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="card-upper-edge-luminous rounded-2xl p-5 bg-slate-900/70 border border-white/[0.06] space-y-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="h-3 w-8 rounded" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
