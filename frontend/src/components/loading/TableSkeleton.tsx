import React from 'react';
import { Skeleton } from '../ui/Skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  hasAvatar?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 5,
  hasAvatar = true
}) => {
  return (
    <div
      className="card-upper-edge-luminous rounded-2xl overflow-hidden bg-slate-900/80 border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.6)] select-none"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Table Header Row */}
      <div className="flex items-center justify-between p-4 bg-slate-950/60 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>

      {/* Table Content Skeleton Rows */}
      <div className="divide-y divide-white/[0.05]">
        {[...Array(rows)].map((_, rIdx) => (
          <div key={rIdx} className="flex items-center justify-between p-4 gap-4">
            {/* Primary Cell (Avatar + Title) */}
            <div className="flex items-center gap-3 min-w-[200px]">
              {hasAvatar && <Skeleton className="w-9 h-9 rounded-xl shrink-0" />}
              <div className="space-y-1.5">
                <Skeleton className={`h-4 rounded ${rIdx % 2 === 0 ? 'w-36' : 'w-28'}`} />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>

            {/* Middle Data Columns */}
            <div className="hidden sm:flex items-center gap-6 flex-1 justify-around">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            {/* Actions Column */}
            <div className="flex items-center gap-2 shrink-0">
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
