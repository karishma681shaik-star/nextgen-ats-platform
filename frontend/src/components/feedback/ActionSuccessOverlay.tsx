import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Sparkles,
  X,
  Briefcase,
  MapPin,
  IndianRupee,
  Calendar,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  actionFeedbackService,
  ActionFeedbackPayload,
} from '../../services/feedback/actionFeedbackService';

export const ActionSuccessOverlay: React.FC = () => {
  const [feedback, setFeedback] = useState<ActionFeedbackPayload | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = actionFeedbackService.subscribe((payload) => {
      setFeedback(payload);
    });
    return unsubscribe;
  }, []);

  // Auto-dismiss timer
  useEffect(() => {
    if (!feedback) return;
    const duration = feedback.autoDismissMs || 7000;
    const timer = setTimeout(() => {
      setFeedback(null);
    }, duration);
    return () => clearTimeout(timer);
  }, [feedback]);

  if (!feedback) return null;

  const isSuccess = feedback.severity === 'success';
  const isWarning = feedback.severity === 'warning';

  return (
    <aside
      aria-live="polite"
      role="status"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 max-w-lg w-[calc(100vw-2rem)] sm:w-[460px] pointer-events-auto"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={feedback.eventType + (feedback.entityData?.id || '')}
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -20, scale: 0.95 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -16, scale: 0.96 }
          }
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-[#0a1226]/95 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl shadow-black/70 backdrop-blur-xl overflow-hidden"
        >
          {/* Subtle Accent Glow */}
          <div
            className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${
              isWarning
                ? 'from-amber-500 via-rose-500 to-amber-500'
                : isSuccess
                ? 'from-emerald-400 via-cyan-400 to-indigo-500'
                : 'from-blue-500 via-indigo-500 to-violet-500'
            }`}
          />

          {/* Dismiss button */}
          <button
            onClick={() => setFeedback(null)}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Badge */}
          {feedback.headline && (
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                  isWarning
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : isSuccess
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                }`}
              >
                {isSuccess && <Sparkles className="w-3 h-3 text-cyan-300" />}
                {feedback.headline}
              </span>
            </div>
          )}

          {/* Main Title & Description */}
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                isWarning
                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                  : isSuccess
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
              }`}
            >
              {isWarning ? (
                <AlertCircle className="w-5 h-5" />
              ) : feedback.eventType === 'RECRUITER_VERIFIED' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-sm font-bold text-white font-display tracking-tight">
                {feedback.title}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {feedback.description}
              </p>
            </div>
          </div>

          {/* Entity Details Card (when provided) */}
          {feedback.entityData && (
            <div className="mt-3.5 pt-3 border-t border-slate-800/80 bg-slate-900/40 -mx-5 -mb-5 p-4 rounded-b-2xl">
              <div className="space-y-1.5 text-xs">
                {feedback.entityData.title && (
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{feedback.entityData.title}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                  {feedback.entityData.companyName && (
                    <span>{feedback.entityData.companyName}</span>
                  )}
                  {feedback.entityData.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {feedback.entityData.location}
                    </span>
                  )}
                  {feedback.entityData.salary && (
                    <span className="flex items-center gap-1 text-emerald-400 font-mono">
                      <IndianRupee className="w-3 h-3" />
                      {feedback.entityData.salary}
                    </span>
                  )}
                  {feedback.entityData.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      Deadline: {feedback.entityData.deadline}
                    </span>
                  )}
                  {feedback.entityData.status && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">
                      Status: {feedback.entityData.status}
                    </span>
                  )}
                  {feedback.entityData.id && (
                    <span className="font-mono text-[10px] text-slate-500">
                      Ref #{feedback.entityData.id}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {feedback.actions && feedback.actions.length > 0 && (
                <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-slate-800">
                  {feedback.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setFeedback(null);
                        if (action.onClick) {
                          action.onClick();
                        } else if (action.href) {
                          navigate(action.href);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                        action.primary
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-sm shadow-indigo-500/20'
                          : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/10'
                      }`}
                    >
                      {action.label}
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </aside>
  );
};
