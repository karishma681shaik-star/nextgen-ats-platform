import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Bookmark,
  Send,
  ShieldCheck,
  Clock,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '../ui/Button';

interface SavedJobsInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavedJobsInfoModal: React.FC<SavedJobsInfoModalProps> = ({ isOpen, onClose }) => {
  const prefersReduced = useReducedMotion();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="info-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative w-full max-w-lg rounded-2xl bg-[#0a1024] border border-indigo-500/30 p-6 sm:p-7 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.9),0_0_30px_rgba(99,102,241,0.25)] text-slate-100 z-10"
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              aria-label="Close information dialog"
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h2 id="info-modal-title" className="text-lg font-bold text-white tracking-tight">
                  How Saved Jobs Work
                </h2>
                <p className="text-xs text-slate-400">
                  Understanding bookmarks, applications, and role availability
                </p>
              </div>
            </div>

            {/* Key Information Points */}
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bookmark className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-0.5">Private Bookmarking</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Saving a position keeps it in your personal vault so you can review job descriptions, compare compensation packages, and tailor your resume before applying.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-0.5">Not an Application</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Bookmarking a job <strong className="text-slate-200">does not</strong> submit an application or notify the hiring team. To be considered, you must click <span className="text-indigo-300 font-semibold">Apply Now</span> or <span className="text-indigo-300 font-semibold">Easy Apply</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3 h-3.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-0.5">Real-Time Status Synchronization</h3>
                  <p className="text-slate-400 leading-relaxed">
                    If a bookmarked opportunity is filled or closed by the recruiter, its status instantly updates to <span className="text-rose-300 font-medium">Position Closed</span>, preventing outdated submissions.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-end">
              <Button variant="primary" size="sm" onClick={onClose}>
                Got it
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
