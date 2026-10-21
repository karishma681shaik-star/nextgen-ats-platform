import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const ResumeWorkspaceSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 select-none" aria-busy="true" aria-live="polite">
      {/* ── Action & Upload Bar ────────────────────────────────────────────── */}
      <div className="card-upper-edge-luminous rounded-2xl p-5 bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* ── 2-Column Resume Workspace Layout ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Resume Documents List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>

          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card-upper-edge-luminous rounded-2xl p-4 bg-slate-900/70 border border-white/[0.06] space-y-3"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-44 rounded" />
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
                <Skeleton className="h-5 w-20 rounded-md" />
                <div className="flex gap-2">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Document Preview & ATS Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-upper-edge-luminous rounded-2xl p-6 bg-slate-900/80 border border-white/[0.08] space-y-5">
            {/* Header info */}
            <div className="flex justify-between items-center pb-3 border-b border-white/[0.06]">
              <div className="space-y-1">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>

            {/* Document Preview Sheet Outline */}
            <div className="rounded-xl bg-[#090e1f] p-5 border border-white/[0.08] space-y-4">
              <div className="space-y-1.5 border-b border-white/[0.06] pb-3">
                <Skeleton className="h-5 w-48 rounded" />
                <Skeleton className="h-3 w-64 rounded" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-[92%] rounded" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-[88%] rounded" />
                <Skeleton className="h-3 w-[75%] rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
