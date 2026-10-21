import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const JobDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 select-none" aria-busy="true" aria-live="polite">
      {/* ── Back Navigation Placeholder ────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-4 h-4 rounded" />
        <Skeleton className="w-44 h-4 rounded-md" />
      </div>

      {/* ── Hero Header Card Skeleton ──────────────────────────────────────── */}
      <div className="card-upper-edge-luminous rounded-3xl p-6 sm:p-8 bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.7)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Company Logo Specimen */}
            <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <Skeleton className="h-7 w-56 sm:w-72 rounded-xl" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-4 w-32 rounded-lg" />
                <Skeleton className="h-4 w-28 rounded-lg" />
                <Skeleton className="h-4 w-24 rounded-lg" />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Skeleton className="h-5 w-28 rounded-lg" />
                <Skeleton className="h-5 w-36 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-3 shrink-0 pt-3 lg:pt-0 border-t border-white/[0.08] lg:border-t-0">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-11 w-36 rounded-xl" />
          </div>
        </div>
      </div>

      {/* ── 2-Column Content Layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Specifications) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Overview Card */}
          <div className="card-upper-edge-luminous rounded-2xl p-6 bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="w-36 h-5 rounded-lg" />
            </div>
            <div className="space-y-2.5">
              <Skeleton className="w-full h-3.5 rounded-md" />
              <Skeleton className="w-[96%] h-3.5 rounded-md" />
              <Skeleton className="w-[92%] h-3.5 rounded-md" />
              <Skeleton className="w-[75%] h-3.5 rounded-md" />
            </div>
          </div>

          {/* Key Responsibilities Card */}
          <div className="card-upper-edge-luminous rounded-2xl p-6 bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="w-48 h-5 rounded-lg" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-4 h-4 rounded-full shrink-0 mt-0.5" />
                  <Skeleton className={`h-3.5 rounded-md ${i % 2 === 0 ? 'w-[90%]' : 'w-[80%]'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Requirements & Qualifications Card */}
          <div className="card-upper-edge-luminous rounded-2xl p-6 bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="w-48 h-5 rounded-lg" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-4 h-4 rounded-full shrink-0 mt-0.5" />
                  <Skeleton className={`h-3.5 rounded-md ${i % 2 === 0 ? 'w-[85%]' : 'w-[95%]'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Telemetry) */}
        <div className="space-y-6">
          {/* Requisition Telemetry & Match Gauge */}
          <div className="card-upper-edge-luminous rounded-2xl p-6 bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <Skeleton className="w-32 h-4 rounded-md" />
              <Skeleton className="w-16 h-4 rounded-full" />
            </div>

            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <Skeleton className="w-24 h-24 rounded-full" />
              <Skeleton className="w-36 h-4 rounded-md" />
            </div>

            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <div className="flex justify-between">
                <Skeleton className="w-24 h-3 rounded" />
                <Skeleton className="w-10 h-3 rounded" />
              </div>
              <Skeleton className="w-full h-2 rounded-full" />
            </div>
          </div>

          {/* Hiring Team Card */}
          <div className="card-upper-edge-luminous rounded-2xl p-6 bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] space-y-4">
            <Skeleton className="w-28 h-4 rounded-md" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="w-32 h-4 rounded-md" />
                <Skeleton className="w-24 h-3 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
