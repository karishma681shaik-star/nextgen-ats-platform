import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 pb-16 select-none" aria-busy="true" aria-live="polite">
      {/* ── Status Telemetry Banner ────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs w-fit">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
        <span>Synchronizing candidate workspace analytics and ATS telemetry...</span>
      </div>

      {/* ── 3D Career Workspace Hero Skeleton ───────────────────────────────── */}
      <div className="card-upper-edge-luminous rounded-3xl p-6 sm:p-8 bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Readiness & Welcome */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64 sm:w-80 rounded-xl" />
              <Skeleton className="h-4 w-96 max-w-full rounded-md" />
            </div>

            {/* Profile Readiness Bar & Stats */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="w-32 h-4 rounded" />
                <Skeleton className="w-12 h-4 rounded" />
              </div>
              <Skeleton className="w-full h-2.5 rounded-full" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="w-48 h-3 rounded" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Skeleton className="h-10 w-36 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>

          {/* Right Column: Realistic Resume Document Outline */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[340px] aspect-[8.5/11] rounded-2xl bg-[#090e1f] border border-white/[0.10] p-5 shadow-2xl relative overflow-hidden space-y-4">
              {/* Document Header */}
              <div className="space-y-2 border-b border-white/[0.06] pb-3">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-3 w-48 rounded" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-2.5 w-16 rounded" />
                  <Skeleton className="h-2.5 w-20 rounded" />
                  <Skeleton className="h-2.5 w-16 rounded" />
                </div>
              </div>

              {/* Section 1: Summary */}
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-2.5 w-full rounded" />
                <Skeleton className="h-2.5 w-[90%] rounded" />
              </div>

              {/* Section 2: Experience */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-28 rounded" />
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-2.5 w-24 rounded" />
                    <Skeleton className="h-2.5 w-12 rounded" />
                  </div>
                  <Skeleton className="h-2 w-full rounded" />
                  <Skeleton className="h-2 w-[85%] rounded" />
                </div>
              </div>

              {/* Section 3: Technical Skills */}
              <div className="space-y-1.5 pt-1">
                <Skeleton className="h-3 w-24 rounded" />
                <div className="flex flex-wrap gap-1">
                  {[1, 2, 3, 4, 5, 6].map((k) => (
                    <Skeleton key={k} className="h-4 w-12 rounded" />
                  ))}
                </div>
              </div>

              {/* Shimmer Specular Beam */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 Metric Cards Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="card-upper-edge-luminous rounded-2xl p-5 bg-slate-900/70 backdrop-blur-xl border border-white/[0.06] space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-12 h-4 rounded-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-3.5 w-28 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Lower Section Skeleton ─────────────────────────────────────────── */}
      <div className="card-upper-edge-luminous rounded-2xl p-6 bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <Skeleton className="h-5 w-44 rounded" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
