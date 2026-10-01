import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-1">
      {totalItems !== undefined && pageSize !== undefined && (
        <p className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-200">{(currentPage - 1) * pageSize + 1}</span> to{' '}
          <span className="font-semibold text-slate-200">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
          <span className="font-semibold text-slate-200">{totalItems}</span> results
        </p>
      )}
      <div className="flex items-center gap-1.5 ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Previous
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((page, index, array) => {
            const isGap = index > 0 && page - array[index - 1] > 1;
            return (
              <React.Fragment key={page}>
                {isGap && <span className="px-2 text-xs text-slate-500">...</span>}
                <button
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          })}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
