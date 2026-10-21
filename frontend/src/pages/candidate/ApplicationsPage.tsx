import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  ChevronRight,
  ExternalLink,
  Briefcase,
  Compass,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Check,
  Calendar,
  Award,
  SearchCheck,
  RotateCcw
} from 'lucide-react';
import { candidateService } from '../../services';
import { Application } from '../../types';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { getStatusBadgeStyle, formatFullDate } from '../../utils/formatters';
import {
  ApplicationTimelineModal,
  CompanyBrandLogo,
  getNextStepDescription
} from '../../components/candidate/ApplicationTimelineModal';
import { StageInteractiveObject } from '../../components/candidate/StageInteractiveObject';
import { ApplicationTrackerSkeleton } from '../../components/loading';

// 4-Stage recruitment pipeline definition
const PIPELINE_STAGES = [
  { id: 'submitted', label: 'Submitted' },
  { id: 'review', label: 'Under Review' },
  { id: 'interview', label: 'Interview' },
  { id: 'decision', label: 'Decision' }
];

// Helper to determine active step in the 4-stage pipeline
function getPipelineStageIndex(status: string): number {
  const s = (status || '').toUpperCase().replace(/[\s-]/g, '_');
  if (s === 'APPLIED') return 0;
  if (s === 'UNDER_REVIEW' || s === 'REVIEW' || s === 'SHORTLISTED') return 1;
  if (s === 'INTERVIEW' || s === 'INTERVIEW_SCHEDULED') return 2;
  if (s === 'OFFERED' || s === 'SELECTED' || s === 'REJECTED' || s === 'WITHDRAWN') return 3;
  return 0;
}

function isTerminalNegative(status: string): boolean {
  const s = (status || '').toUpperCase().replace(/[\s-]/g, '_');
  return s === 'REJECTED' || s === 'WITHDRAWN';
}

// ── 5 DISTINCT APPLICATION STAGE IDENTITIES ─────────────────────────────────
interface StageVisualIdentity {
  id: string;
  label: string;
  title: string;
  tagline: string;
  badgeLabel: string;
  tabActiveClass: string;
  badgeClass: string;
  glowClass: string;
  emptyHeading: string;
  emptyDescription: string;
}

const STAGE_IDENTITIES: Record<string, StageVisualIdentity> = {
  All: {
    id: 'All',
    label: 'All Applications',
    title: 'Comprehensive Application Portfolio',
    tagline: 'All your submitted job applications, credentials, and progression logs monitored in one place.',
    badgeLabel: 'ACTIVE PORTFOLIO',
    tabActiveClass: 'bg-indigo-600/90 shadow-indigo-600/30 border-indigo-400/40 text-white',
    badgeClass: 'text-indigo-300 bg-indigo-500/15 border-indigo-400/35',
    glowClass: 'from-indigo-600/20 via-cyan-500/10 to-transparent',
    emptyHeading: 'Your next opportunity starts here',
    emptyDescription: 'Explore available positions and submit your profile. Real-time recruiter reviews and timeline updates will appear here.'
  },
  'Under Review': {
    id: 'Under Review',
    label: 'Under Review',
    title: 'Recruiter Review & Qualification Screening',
    tagline: 'Applications under active qualification evaluation and architectural review by hiring teams.',
    badgeLabel: 'QUALIFICATION SCREENING',
    tabActiveClass: 'bg-cyan-600/90 shadow-cyan-600/30 border-cyan-400/40 text-white',
    badgeClass: 'text-cyan-300 bg-cyan-500/15 border-cyan-400/35',
    glowClass: 'from-cyan-600/20 via-indigo-500/10 to-transparent',
    emptyHeading: 'No applications currently under review',
    emptyDescription: 'Applications undergoing active qualification screening by employer hiring teams will be highlighted in this queue.'
  },
  Shortlisted: {
    id: 'Shortlisted',
    label: 'Shortlisted',
    title: 'Candidate Selection & Shortlist',
    tagline: 'Applications approved through preliminary evaluation and advanced to interview queues.',
    badgeLabel: 'SHORTLISTED CANDIDATES',
    tabActiveClass: 'bg-emerald-600/90 shadow-emerald-600/30 border-emerald-400/40 text-white',
    badgeClass: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/35',
    glowClass: 'from-emerald-600/20 via-cyan-500/10 to-transparent',
    emptyHeading: 'No shortlisted applications yet',
    emptyDescription: 'When an employer approves your qualifications and moves your profile to their candidate shortlist, it will be showcased here.'
  },
  Interview: {
    id: 'Interview',
    label: 'Interview Scheduled',
    title: 'Interview Pathways & Scheduling',
    tagline: 'Confirmed technical assessments, panel discussions, and synchronized calendar appointments.',
    badgeLabel: 'INTERVIEW CALENDAR',
    tabActiveClass: 'bg-purple-600/90 shadow-purple-600/30 border-purple-400/40 text-white',
    badgeClass: 'text-purple-300 bg-purple-500/15 border-purple-400/35',
    glowClass: 'from-purple-600/20 via-indigo-500/10 to-transparent',
    emptyHeading: 'No interviews scheduled yet',
    emptyDescription: 'Confirmed technical interviews, panel discussions, and calendar invites will appear here alongside meeting briefs.'
  },
  Selected: {
    id: 'Selected',
    label: 'Offers / Selected',
    title: 'Offer Decisions & Final Appointments',
    tagline: 'Official employment offers, verified compensation packages, and appointment documentation.',
    badgeLabel: 'OFFER & DECISION',
    tabActiveClass: 'bg-amber-600/90 shadow-amber-600/30 border-amber-400/40 text-white',
    badgeClass: 'text-amber-300 bg-amber-500/15 border-amber-400/35',
    glowClass: 'from-amber-600/20 via-emerald-500/10 to-transparent',
    emptyHeading: 'No offers recorded yet',
    emptyDescription: 'Formal offer letters, compensation packages, and appointment documentation will appear here once finalized by employers.'
  }
};

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const data = await candidateService.getApplications();
      setApplications(data || []);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Status tabs with accurate dynamic counts matching real backend statuses
  const tabs = [
    { id: 'All', label: 'All Applications', count: applications.length },
    {
      id: 'Under Review',
      label: 'Under Review',
      count: applications.filter((a) => {
        const s = (a.status || '').toUpperCase().replace(/[\s-]/g, '_');
        return s === 'UNDER_REVIEW' || s === 'REVIEW';
      }).length
    },
    {
      id: 'Shortlisted',
      label: 'Shortlisted',
      count: applications.filter((a) => {
        const s = (a.status || '').toUpperCase().replace(/[\s-]/g, '_');
        return s === 'SHORTLISTED';
      }).length
    },
    {
      id: 'Interview',
      label: 'Interview Scheduled',
      count: applications.filter((a) => {
        const s = (a.status || '').toUpperCase().replace(/[\s-]/g, '_');
        return s === 'INTERVIEW' || s === 'INTERVIEW_SCHEDULED';
      }).length
    },
    {
      id: 'Selected',
      label: 'Offers / Selected',
      count: applications.filter((a) => {
        const s = (a.status || '').toUpperCase().replace(/[\s-]/g, '_');
        return s === 'SELECTED' || s === 'OFFERED';
      }).length
    }
  ];

  // Filtering based on tab criteria
  const filteredApps = applications.filter((app) => {
    if (activeTab === 'All') return true;
    const s = (app.status || '').toUpperCase().replace(/[\s-]/g, '_');
    if (activeTab === 'Under Review') return s === 'UNDER_REVIEW' || s === 'REVIEW';
    if (activeTab === 'Shortlisted') return s === 'SHORTLISTED';
    if (activeTab === 'Interview') return s === 'INTERVIEW' || s === 'INTERVIEW_SCHEDULED';
    if (activeTab === 'Selected') return s === 'SELECTED' || s === 'OFFERED';
    return false;
  });

  const currentStageIdentity = STAGE_IDENTITIES[activeTab] || STAGE_IDENTITIES['All'];

  // Motion variants for smooth staggered card entrance
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ── PAGE HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Real-Time Applicant Tracker</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Job Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Track recruitment stages, status progressions, recruiter notes, and interview notifications in real time.
          </p>
        </div>

        {applications.length > 0 && (
          <div className="shrink-0 flex items-center gap-3">
            <Link to="/candidate/jobs">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Compass className="w-3.5 h-3.5 text-indigo-400" />}
                className="text-xs"
              >
                Explore More Jobs
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* ── FILTER TABS WITH DISTINCT ACTIVE ILLUMINATION ────────────────────── */}
      <div className="filter-panel-luminous rounded-2xl p-1.5 bg-slate-900/60 backdrop-blur-xl">
        <div
          role="tablist"
          aria-label="Application Status Tabs"
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth p-0.5"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const tabStage = STAGE_IDENTITIES[tab.id] || STAGE_IDENTITIES['All'];

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                tabIndex={0}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  isActive
                    ? `${tabStage.tabActiveClass} shadow-lg border`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT AREA ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <ApplicationTrackerSkeleton />
      ) : filteredApps.length === 0 ? (
        /* ── DEDICATED STAGE-SPECIFIC EMPTY STATE (Section 10) ─────────────── */
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="card-upper-edge-luminous rounded-3xl p-8 sm:p-12 text-center bg-slate-900/70 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="max-w-lg mx-auto space-y-6 relative z-10">
            {/* Bespoke Interactive 3D Digital Stage Object */}
            <div className="relative mx-auto w-full max-w-sm flex items-center justify-center">
              <StageInteractiveObject stageId={activeTab} compact={false} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentStageIdentity.emptyHeading}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                {currentStageIdentity.emptyDescription}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {activeTab !== 'All' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('All')}
                  className="text-xs border-white/15 hover:border-indigo-400/40"
                >
                  View All Applications ({applications.length})
                </Button>
              ) : null}
              <Link to="/candidate/jobs">
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="text-xs shadow-lg shadow-indigo-600/30"
                >
                  Explore Available Positions
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ── APPLICATION CARDS LIST WITH CONTEXTUAL STAGE BANNER ────────────── */
        <div className="space-y-5">
          {/* Contextual Stage Intelligence Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card-upper-edge-luminous rounded-2xl p-4 sm:p-5 bg-slate-900/60 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[10px] font-bold ${currentStageIdentity.badgeClass}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {currentStageIdentity.badgeLabel}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    • {filteredApps.length} {filteredApps.length === 1 ? 'record' : 'records'} active
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {currentStageIdentity.title}
                </h2>
                <p className="text-xs text-slate-400 max-w-xl">
                  {currentStageIdentity.tagline}
                </p>
              </div>

              {/* Compact Bespoke Interactive 3D Digital Stage Object */}
              <div className="hidden md:flex shrink-0 items-center justify-end">
                <StageInteractiveObject stageId={activeTab} compact={true} />
              </div>
            </div>
          </motion.div>

          {/* Staggered Card List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence>
              {filteredApps.map((app) => {
                const badge = getStatusBadgeStyle(app.status);
                const stageIdx = getPipelineStageIndex(app.status);
                const isNeg = isTerminalNegative(app.status);
                const nextStepTip = getNextStepDescription(app.status);

                return (
                  <motion.div
                    key={app.id}
                    variants={itemVariants}
                    layout
                    className="card-upper-edge-luminous rounded-2xl bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* LEFT SECTION: COMPANY / ROLE IDENTITY & METADATA */}
                      <div className="flex items-start gap-4 min-w-0">
                        <CompanyBrandLogo logo={app.companyLogo} company={app.company} />

                        <div className="space-y-1.5 min-w-0 flex-1">
                          {/* Title & Status Badge */}
                          <div className="flex flex-wrap items-center gap-2.5">
                            <Link
                              to={app.jobId ? `/candidate/jobs/${app.jobId}` : '#'}
                              className="text-base sm:text-lg font-bold text-white hover:text-indigo-300 transition-colors truncate"
                            >
                              {app.jobTitle}
                            </Link>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.badgeClass}`}
                            >
                              {app.status}
                            </span>
                          </div>

                          {/* Company & Requisition Identifier */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                            <span className="font-semibold flex items-center gap-1.5 text-slate-200">
                              <Building className="w-3.5 h-3.5 text-slate-400" />
                              {app.company}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[11px] font-mono text-slate-400">
                              APP-REF-{app.id ? app.id.slice(0, 8).toUpperCase() : 'REQ'}
                            </span>
                            {app.candidateLocation && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                                  <MapPin className="w-3 h-3 text-slate-500" />
                                  {app.candidateLocation}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Application Credentials & Submission Date */}
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Resume:</span>
                              <span className="text-slate-200 font-medium truncate max-w-[200px]">
                                {app.resumeFileName || 'Submitted Profile Document'}
                              </span>
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Applied on {formatFullDate(app.appliedDate)}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT SECTION: MINI PIPELINE & ACTIONS */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-5 shrink-0 pt-3 lg:pt-0 border-t border-slate-800/80 lg:border-t-0">
                        {/* Mini 4-Stage Visual Progress Stepper */}
                        <div className="w-full sm:w-56 space-y-2">
                          <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            <span>Stage Progress</span>
                            <span className="text-indigo-300">
                              {isNeg ? 'Concluded' : PIPELINE_STAGES[stageIdx]?.label || 'Active'}
                            </span>
                          </div>

                          {/* Progress Stepper Bar */}
                          <div className="flex items-center justify-between relative">
                            {/* Background Connector */}
                            <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0" />
                            {/* Active Connector Fill */}
                            <div
                              className={`absolute left-2 top-1/2 -translate-y-1/2 h-0.5 transition-all duration-500 z-0 ${
                                isNeg ? 'bg-rose-500/70' : 'bg-gradient-to-r from-emerald-500 via-indigo-500 to-indigo-400'
                              }`}
                              style={{
                                width: `${Math.min(100, (stageIdx / (PIPELINE_STAGES.length - 1)) * 100)}%`
                              }}
                            />

                            {PIPELINE_STAGES.map((st, idx) => {
                              const isCompleted = idx < stageIdx;
                              const isCurrent = idx === stageIdx;

                              return (
                                <div
                                  key={st.id}
                                  className="relative z-10 flex flex-col items-center group"
                                  title={st.label}
                                >
                                  <div
                                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                                      isCompleted
                                        ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/40 ring-2 ring-emerald-500/20'
                                        : isCurrent
                                        ? isNeg
                                          ? 'bg-rose-500 text-white ring-4 ring-rose-500/20'
                                          : 'bg-indigo-600 text-white ring-4 ring-indigo-500/30'
                                        : 'bg-slate-800 border border-slate-700 text-slate-500'
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    ) : isCurrent ? (
                                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    ) : (
                                      <div className="w-1 h-1 rounded-full bg-slate-600" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Dynamic next step micro-advice */}
                          <p className="text-[11px] text-slate-400 truncate leading-snug" title={nextStepTip}>
                            {nextStepTip}
                          </p>
                        </div>

                        {/* ATS Score Indicator */}
                        <div className="hidden xl:flex flex-col items-end px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                            Match Score
                          </span>
                          <span className="text-sm font-extrabold text-emerald-400">
                            {app.atsScore || 71}/100
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                          {app.jobId && (
                            <Link to={`/candidate/jobs/${app.jobId}`} className="hidden sm:inline-block">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-slate-400 hover:text-white"
                                title="View Job Details"
                              >
                                Job Details
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedApp(app)}
                            rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                            className="text-xs shadow-md shadow-indigo-600/25 flex-1 sm:flex-none justify-center"
                          >
                            View Progress
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* ── REDESIGNED APPLICATION PROGRESS JOURNEY MODAL ────────────────────── */}
      <ApplicationTimelineModal
        application={selectedApp}
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
      />
    </div>
  );
};
