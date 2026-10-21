import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Application, ApplicationStatus } from '../../types';
import { Button } from '../ui/Button';
import { getStatusBadgeStyle, formatFullDate } from '../../utils/formatters';

export interface ApplicationTimelineModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

// Company monogram logo fallback
export const CompanyBrandLogo: React.FC<{ logo?: string; company: string }> = ({ logo, company }) => {
  const [hasError, setHasError] = React.useState(false);

  const getInitials = (name: string) => {
    if (!name) return 'CO';
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  if (!logo || hasError) {
    return (
      <div
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950/80 border border-indigo-400/30 flex items-center justify-center shrink-0 shadow-md select-none"
        title={company}
        aria-label={`${company} monogram`}
      >
        <span className="text-sm font-extrabold text-indigo-200 tracking-wider font-mono">
          {getInitials(company)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={logo}
      alt={`${company} logo`}
      onError={() => setHasError(true)}
      className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-indigo-400/30 shadow-md shrink-0"
      loading="lazy"
    />
  );
};

// Returns clear next-step guidance based on authentic application status
export function getNextStepDescription(status: string): string {
  const s = (status || '').toUpperCase().replace(/[\s-]/g, '_');
  switch (s) {
    case 'APPLIED':
      return 'Application submitted. Awaiting initial recruiter screening and profile review.';
    case 'UNDER_REVIEW':
    case 'REVIEW':
      return 'Your credentials are under review by the hiring manager. Shortlist decisions are typically shared within 3-5 business days.';
    case 'SHORTLISTED':
      return 'Your application has been shortlisted. The recruitment team is preparing interview schedules.';
    case 'INTERVIEW':
    case 'INTERVIEW_SCHEDULED':
      return 'Interview stage active. Review your meeting invitation and technical preparation notes.';
    case 'OFFERED':
    case 'SELECTED':
      return 'Offer extended. Check your communications for offer letter details and next steps.';
    case 'REJECTED':
      return 'This requisition has concluded. We encourage you to explore other relevant positions on the platform.';
    case 'WITHDRAWN':
      return 'This application was withdrawn at your request.';
    default:
      return 'Your application is progressing through standard recruitment review.';
  }
}

export const ApplicationTimelineModal: React.FC<ApplicationTimelineModalProps> = ({
  application,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !application) return null;

  const badge = getStatusBadgeStyle(application.status);
  const nextStepText = getNextStepDescription(application.status);

  // Timeline events recorded on the backend
  const recordedEvents = application.timeline || [];

  // Determine standard lifecycle stages for context
  const normStatus = (application.status || '').toUpperCase().replace(/[\s-]/g, '_');
  const isTerminal = normStatus === 'REJECTED' || normStatus === 'WITHDRAWN';

  // Standard roadmap stages to display as upcoming if not yet reached
  const futureRoadmap = [
    { key: 'UNDER_REVIEW', title: 'Recruiter Review', note: 'Profile assessment & qualification screening' },
    { key: 'SHORTLISTED', title: 'Hiring Manager Shortlist', note: 'Technical candidacy shortlisted for round' },
    { key: 'INTERVIEW', title: 'Interview Evaluation', note: 'Formal technical or behavioral interview sessions' },
    { key: 'SELECTED', title: 'Offer & Final Decision', note: 'Formal requisition decision and offer extension' },
  ];

  // Filter future roadmap stages that haven't occurred yet
  const recordedKeys = new Set(
    recordedEvents.map((e) => (e.status || '').toUpperCase().replace(/[\s-]/g, '_'))
  );
  recordedKeys.add(normStatus);

  const pendingStages = isTerminal
    ? []
    : futureRoadmap.filter((stage) => !recordedKeys.has(stage.key));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          aria-hidden="true"
        />

        {/* Modal Dialog Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#0c142c] via-[#080d22] to-[#060918] border border-indigo-400/40 rounded-3xl shadow-[0_24px_70px_-15px_rgba(0,0,0,0.9),0_0_36px_-8px_rgba(99,102,241,0.32)] flex flex-col max-h-[90vh] overflow-hidden z-10 select-text"
          role="dialog"
          aria-modal="true"
          aria-labelledby="timeline-heading"
        >
          {/* Luminous Top-Edge Highlight Line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent pointer-events-none z-20" />

          {/* ── HEADER ──────────────────────────────────────────────────────── */}
          <div className="px-6 sm:px-7 pt-6 pb-4 border-b border-white/[0.08] relative z-10 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <CompanyBrandLogo logo={application.companyLogo} company={application.company} />

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
                      APP-{(application.id || '2026').slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.badgeClass}`}>
                      {application.status}
                    </span>
                  </div>

                  <h2
                    id="timeline-heading"
                    className="text-base sm:text-lg font-bold text-white tracking-tight truncate"
                    title={application.jobTitle}
                  >
                    {application.jobTitle}
                  </h2>

                  <p className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                    <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{application.company}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">Applied {formatFullDate(application.appliedDate)}</span>
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── BODY (Scrollable Timeline Content) ─────────────────────────── */}
          <div className="px-6 sm:px-7 py-5 overflow-y-auto space-y-5 flex-1 relative z-10 custom-scrollbar">
            {/* Section Heading */}
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Your Application Journey</h3>
              <p className="text-xs text-slate-400 leading-snug">
                Follow the recorded progress of your application, from submission through the latest update.
              </p>
            </div>

            {/* Application Status Summary Card (Phase 5) */}
            <div className="card-upper-edge-luminous rounded-2xl p-4 sm:p-5 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3 border-b border-white/[0.06]">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Application Status
                  </span>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${badge.dotClass}`} />
                    {application.status}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Last Updated
                  </span>
                  <p className="font-bold text-slate-200">
                    {recordedEvents.length > 0
                      ? formatFullDate(recordedEvents[recordedEvents.length - 1].date)
                      : formatFullDate(application.appliedDate)}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Attached Credentials
                  </span>
                  <p className="font-bold text-slate-200 truncate flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{application.resumeFileName || 'Candidate Profile'}</span>
                  </p>
                </div>
              </div>

              {/* Next Step Information */}
              <div className="flex items-start gap-2.5 pt-0.5 text-xs">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    Next Step Guidance
                  </span>
                  <p className="text-slate-300 leading-relaxed">{nextStepText}</p>
                </div>
              </div>
            </div>

            {/* Vertical Progress Timeline */}
            <div className="space-y-4 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Application Progression Log
              </h4>

              <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-cyan-500/50 before:to-slate-800">
                {/* 1. Confirmed Recorded Events */}
                {recordedEvents.map((event, idx) => {
                  const eventBadge = getStatusBadgeStyle(event.status);
                  const isLatest = idx === recordedEvents.length - 1;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.05 }}
                      className="relative"
                    >
                      {/* Timeline Node Dot */}
                      <div
                        className={`absolute -left-7 top-1 w-6 h-6 rounded-full border-2 border-[#0c142c] flex items-center justify-center transition-all ${
                          isLatest
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/25 shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                            : 'bg-emerald-600 text-white ring-2 ring-emerald-500/20'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>

                      {/* Content Card */}
                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-indigo-400/30 transition-all space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{event.status}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${eventBadge.badgeClass}`}>
                              Confirmed
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {formatFullDate(event.date)}
                          </span>
                        </div>

                        {event.note ? (
                          <p className="text-xs text-slate-300 leading-relaxed pt-0.5">{event.note}</p>
                        ) : (
                          <p className="text-xs text-slate-400 leading-relaxed pt-0.5">
                            Status progression recorded in recruitment platform.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* 2. Future Roadmap Checkpoints (Clearly Distinguished) */}
                {pendingStages.map((stage, sIdx) => (
                  <div key={stage.key} className="relative opacity-65">
                    {/* Neutral Upcoming Marker */}
                    <div className="absolute -left-7 top-1 w-6 h-6 rounded-full bg-slate-800 border-2 border-[#0c142c] flex items-center justify-center text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.015] border border-dashed border-white/[0.08] space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-300">{stage.title}</span>
                        <span className="text-[10px] font-medium text-slate-400 font-mono">
                          Upcoming Stage
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{stage.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── FOOTER ──────────────────────────────────────────────────────── */}
          <div className="px-6 sm:px-7 py-4 bg-slate-900/60 border-t border-white/[0.08] flex items-center justify-between gap-3 relative z-10 shrink-0">
            <Link
              to={`/candidate/jobs/${application.jobId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              <span>View Requisition Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Button variant="secondary" size="sm" onClick={onClose}>
              Close Progress
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
