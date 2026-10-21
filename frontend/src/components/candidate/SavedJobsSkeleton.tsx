import React from 'react';

export const SavedJobsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((idx) => (
        <div
          key={idx}
          className="rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#0a1024]/90 to-[#060a18]/95 border border-white/[0.08] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.7)]"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              {/* Company Logo skeleton */}
              <div className="w-12 h-12 rounded-2xl skeleton-bone shrink-0" />

              {/* Job Info skeleton */}
              <div className="space-y-2.5 flex-1 min-w-[200px]">
                {/* Title & Match badge */}
                <div className="flex items-center gap-3">
                  <div className="h-5 w-48 sm:w-64 rounded-lg skeleton-bone" />
                  <div className="h-4 w-20 rounded-full skeleton-bone" />
                </div>

                {/* Company & Location line */}
                <div className="flex items-center gap-3">
                  <div className="h-3.5 w-24 rounded skeleton-bone" />
                  <div className="h-3.5 w-32 rounded skeleton-bone" />
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="h-6 w-18 rounded-lg skeleton-bone" />
                  <div className="h-6 w-20 rounded-lg skeleton-bone" />
                  <div className="h-6 w-28 rounded-lg skeleton-bone" />
                </div>
              </div>
            </div>

            {/* Right Action Buttons skeleton */}
            <div className="flex items-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
              <div className="w-9 h-9 rounded-xl skeleton-bone" />
              <div className="h-9 w-24 rounded-xl skeleton-bone" />
              <div className="h-9 w-28 rounded-xl skeleton-bone" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
