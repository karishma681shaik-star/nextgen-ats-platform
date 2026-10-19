import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Clock,
  ArrowRight,
  Star,
  Trophy,
  MapPin,
  Building,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { candidateService, CandidateDashboardData } from '../../services';
import { voiceAssistantService, WorkspaceContext } from '../../services/audio/voiceAssistantService';
import { soundEffectService } from '../../services/audio/soundEffectService';
import { Button } from '../../components/ui/Button';
import { formatSalaryRange } from '../../utils/formatters';
import { DepthCard } from '../../components/ui/DepthCard';
import { useToast } from '../../context/ToastContext';
import { CreateResumeModal } from '../../components/candidate/CreateResumeModal';
import { CandidateHeroSection } from '../../components/candidate/CandidateHeroSection';
import { CandidateMetricCard } from '../../components/candidate/CandidateMetricCard';
import { CandidateResumeIntelligenceSection } from '../../components/candidate/CandidateResumeIntelligenceSection';
import { CandidateApplicationJourneySection } from '../../components/candidate/CandidateApplicationJourneySection';
import { CandidateSkillRoadmapSection } from '../../components/candidate/CandidateSkillRoadmapSection';
import { CardReflectiveShine } from '../../components/common/CardReflectiveShine';

// ─── Main Candidate Dashboard Component ──────────────────────────────────────
export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [dashboardData, setDashboardData] = useState<CandidateDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalMode, setCreateModalMode] = useState<'choice' | 'upload'>('choice');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setDashboardError(null);
      const data = await candidateService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load candidate dashboard', err);
      setDashboardError('Unable to calculate profile readiness. Please try again.');
      // Graceful fallback without hardcoded fake scores
      setDashboardData({
        candidateName: user?.name || 'Candidate',
        candidateEmail: user?.email || '',
        candidateTitle: 'Candidate',
        profileCompletion: 0,
        atsScore: null,
        atsStatus: 'NO_RESUME',
        hasPrimaryResume: false,
        totalApplicationsCount: 0,
        activeApplicationsCount: 0,
        shortlistedCount: 0,
        interviewsCount: 0,
        selectedCount: 0,
        rejectedCount: 0,
        savedJobsCount: 0,
        checklist: {},
        recommendedJobs: [],
        recentApplications: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Subscribe to real-time speech synthesis state
  useEffect(() => {
    return voiceAssistantService.subscribe((speaking) => {
      setIsAiSpeaking(speaking);
    });
  }, []);

  // Automatic full-length welcome speech trigger on login
  useEffect(() => {
    if (!isLoading && (user || dashboardData)) {
      const activeUser = user || (dashboardData?.candidateName ? { name: dashboardData.candidateName, role: 'candidate' } : null);
      if (!activeUser) return;

      const userIdKey = user?.id || 'candidate_session';
      const welcomeKey = `ai_ats_voice_welcome_done_${userIdKey}`;
      const isPending = sessionStorage.getItem('ai_ats_pending_voice_welcome') === 'true';
      const alreadySpoken = sessionStorage.getItem(welcomeKey) === 'true';

      if (isPending && !alreadySpoken && !voiceAssistantService.isSpeaking()) {
        sessionStorage.setItem(welcomeKey, 'true');
        sessionStorage.removeItem('ai_ats_pending_voice_welcome');
        const context: WorkspaceContext = {
          hasResume: dashboardData?.hasPrimaryResume ?? false,
          profileCompletion: dashboardData?.profileCompletion ?? 0,
          activeApplicationsCount: dashboardData?.activeApplicationsCount ?? 0,
          hasATSAnalysis: dashboardData?.atsScore !== null && dashboardData?.atsScore !== undefined
        };
        voiceAssistantService.welcomeUser(activeUser, 'candidate', context);
      }
    }
  }, [isLoading, user, dashboardData]);

  const handleOpenUpload = () => {
    setCreateModalMode('upload');
    setCreateModalOpen(true);
  };

  const handleListenGreeting = () => {
    soundEffectService.playActionChime();
    const context: WorkspaceContext = {
      hasResume: dashboardData?.hasPrimaryResume ?? false,
      profileCompletion: dashboardData?.profileCompletion ?? 0,
      activeApplicationsCount: dashboardData?.activeApplicationsCount ?? 0,
      hasATSAnalysis: dashboardData?.atsScore !== null && dashboardData?.atsScore !== undefined
    };
    if (voiceAssistantService.isSpeaking()) {
      voiceAssistantService.stop();
    } else {
      voiceAssistantService.setEnabled(true);
      voiceAssistantService.welcomeUser(
        user || { name: dashboardData?.candidateName, role: 'candidate' },
        'candidate',
        context,
        { force: true }
      );
    }
  };

  // Normalizer for application status pill styling
  const renderStatusBadge = (statusStr: string) => {
    const s = (statusStr || '').toUpperCase();
    if (s === 'SELECTED' || s === 'OFFER') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          Offer
        </span>
      );
    }
    if (s === 'INTERVIEW') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          Interview
        </span>
      );
    }
    if (s === 'SHORTLISTED') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
          Shortlisted
        </span>
      );
    }
    if (s === 'UNDER_REVIEW' || s === 'UNDER REVIEW') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
          Under Review
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          Not Selected
        </span>
      );
    }
    if (s === 'WITHDRAWN') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
          Withdrawn
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
        Submitted
      </span>
    );
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs w-fit">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          <span>Calculating profile readiness and workspace analytics...</span>
        </div>
        <div className="space-y-6 animate-pulse">
          <div className="h-44 w-full rounded-3xl bg-slate-800/40 border border-white/5" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-800/40 border border-white/5" />
            ))}
          </div>
          <div className="h-80 w-full rounded-2xl bg-slate-800/40 border border-white/5" />
        </div>
      </div>
    );
  }

  const displayName = user?.name || dashboardData.candidateName || 'Candidate';
  const cleanName = voiceAssistantService.resolveFullName(user || { name: displayName });
  const profileCompletion = dashboardData.profileCompletion;

  return (
    <div className="space-y-8 pb-16">
      {dashboardError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-300 text-xs">
          <span>{dashboardError}</span>
          <Button variant="secondary" size="sm" onClick={loadData}>
            Retry
          </Button>
        </div>
      )}

      {/* ── SECTION 1 — CINEMATIC 3D CAREER WORKSPACE HERO ─────────────────── */}
      <CandidateHeroSection
        user={user}
        dashboardData={dashboardData}
        cleanName={cleanName}
        profileCompletion={profileCompletion}
        isAiSpeaking={isAiSpeaking}
        onListenGreeting={handleListenGreeting}
        onOpenUpload={handleOpenUpload}
        onExploreJobs={() => navigate('/candidate/jobs')}
      />

      {/* ── SECTION 2 — CAREER SNAPSHOT (METRIC CARDS) ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Resume Status */}
        <CandidateMetricCard
          index={0}
          title="Resume Status"
          value={dashboardData.hasPrimaryResume ? (dashboardData.primaryResumeFileName || 'Active') : 'No Resume'}
          subtitle={dashboardData.hasPrimaryResume ? 'Parsed & evaluated' : 'Upload to start matching'}
          icon={<FileText className="w-5 h-5 text-indigo-400" />}
          iconBg="bg-indigo-500/10 border border-indigo-500/20"
          badgeText={dashboardData.hasPrimaryResume ? 'Active' : 'Action Required'}
          badgeColor={dashboardData.hasPrimaryResume ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30'}
          linkTo={dashboardData.hasPrimaryResume ? '/candidate/resumes' : undefined}
          linkLabel={dashboardData.hasPrimaryResume ? 'Manage resume' : 'Upload resume'}
          onActionClick={!dashboardData.hasPrimaryResume ? handleOpenUpload : undefined}
          accentGraphic={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-indigo-400/40">
              <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="8" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="8" y1="16" x2="11" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        />

        {/* Metric 2: Active Applications */}
        <CandidateMetricCard
          index={1}
          title="Active Applications"
          value={dashboardData.activeApplicationsCount}
          numericValue={dashboardData.activeApplicationsCount}
          subtitle="In review with hiring teams"
          icon={<Clock className="w-5 h-5 text-blue-400" />}
          iconBg="bg-blue-500/10 border border-blue-500/20"
          badgeText={dashboardData.activeApplicationsCount > 0 ? `${dashboardData.activeApplicationsCount} active` : 'None pending'}
          badgeColor="bg-blue-500/15 text-blue-300 border-blue-500/30"
          linkTo="/candidate/applications"
          linkLabel="Track status"
          accentGraphic={
            <svg width="32" height="16" viewBox="0 0 32 16" fill="none" className="text-blue-400/50">
              <circle cx="5" cy="8" r="3" fill="currentColor" fillOpacity="0.4" />
              <line x1="8" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
              <circle cx="16" cy="8" r="3.5" fill="currentColor" />
              <line x1="19.5" y1="8" x2="24" y2="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
              <circle cx="27" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          }
        />

        {/* Metric 3: Shortlisted */}
        <CandidateMetricCard
          index={2}
          title="Shortlisted"
          value={dashboardData.shortlistedCount}
          numericValue={dashboardData.shortlistedCount}
          subtitle="Advanced to candidate shortlist"
          icon={<Star className="w-5 h-5 text-purple-400" />}
          iconBg="bg-purple-500/10 border border-purple-500/20"
          badgeText={dashboardData.shortlistedCount > 0 ? 'Shortlisted' : 'None yet'}
          badgeColor="bg-purple-500/15 text-purple-300 border-purple-500/30"
          linkTo="/candidate/applications"
          linkLabel="View shortlisted"
          accentGraphic={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-400/40">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          }
        />

        {/* Metric 4: Interviews & Offers */}
        <CandidateMetricCard
          index={3}
          title="Interviews & Offers"
          value={dashboardData.interviewsCount + dashboardData.selectedCount}
          numericValue={dashboardData.interviewsCount + dashboardData.selectedCount}
          subtitle={`${dashboardData.interviewsCount} interview · ${dashboardData.selectedCount} offer`}
          icon={<Trophy className="w-5 h-5 text-emerald-400" />}
          iconBg="bg-emerald-500/10 border border-emerald-500/20"
          badgeText={dashboardData.selectedCount > 0 ? 'Selected Offer' : dashboardData.interviewsCount > 0 ? 'Interview Stage' : 'Ready'}
          badgeColor="bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
          linkTo="/candidate/applications"
          linkLabel="View stages"
          accentGraphic={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-400/40">
              <path d="M6 9V3H18V9C18 12.31 15.31 15 12 15C8.69 15 6 12.31 6 9Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 15V19M8 21H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M6 5H4C2.9 5 2 5.9 2 7V8C2 9.1 2.9 10 4 10H6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M18 5H20C21.1 5 22 5.9 22 7V8C22 9.1 21.1 10 20 10H18" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          }
        />
      </div>

      {/* ── SECTION 3 — BUILD A STRONGER RESUME (RESUME INTELLIGENCE) ────────── */}
      <CandidateResumeIntelligenceSection
        dashboardData={dashboardData}
        onOpenUpload={handleOpenUpload}
      />

      {/* ── SECTION 4 — RECRUITER REQUISITIONS (JOB DISCOVERY & ATS MATCH) ─────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <DepthCard hoverEffect={false} glass={true} className="overflow-hidden rounded-3xl border border-white/[0.08] hover:border-indigo-500/25 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] card-shine-all-sides transition-all duration-300 relative group">
          {/* ── 4-Side Perimeter Light Rims & Inward Reflection ───────────────────── */}
          <CardReflectiveShine variant="purple" rounded="rounded-3xl" hasHoverSweep={true} />

          {/* Header Banner with 3D ATS Job Matching Visual */}
          <div className="relative overflow-hidden border-b border-white/[0.06] p-6 bg-gradient-to-r from-[#0d1633] via-[#090e24] to-[#060a18]">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  <Briefcase className="w-3 h-3 text-indigo-400" />
                  Verified Tech Requisitions & ATS Matching
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Discover relevant career opportunities
                </h2>
                <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed max-w-xl">
                  Active job requisitions posted by verified employers, matched directly with your parsed skills and ATS profile telemetry.
                </p>
                <div className="pt-2">
                  <Link
                    to="/candidate/jobs"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white font-semibold transition-colors bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-2 rounded-xl border border-white/[0.08]"
                  >
                    Browse all openings <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 3D ATS Match Visual Card */}
              <div className="md:col-span-4 relative hidden sm:block">
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-white/10 shadow-lg group bg-slate-900">
                  <img
                    src="/assets/candidate/ats_matching_3d.jpg"
                    alt="3D ATS Intelligent Job Matching"
                    className="w-full h-full object-cover filter brightness-[0.92] contrast-[1.05]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060a18]/70 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-300 flex items-center justify-between">
                    <span>ATS Matching</span>
                    <span className="text-emerald-400 font-bold">Active Engine</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Listings from real backend */}
          <div className="divide-y divide-white/[0.04]">
            {dashboardData.recommendedJobs && dashboardData.recommendedJobs.length > 0 ? (
              dashboardData.recommendedJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <Link to={`/candidate/jobs/${job.id}`}>
                      <p className="text-sm font-bold text-white hover:text-indigo-300 transition-colors truncate">
                        {job.title}
                      </p>
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {job.location}
                      </span>
                      {job.type && (
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-semibold text-slate-300">
                          {job.type}
                        </span>
                      )}
                      {/* Job-specific ATS Match Score ONLY if genuinely calculated */}
                      {typeof job.matchScore === 'number' && job.matchScore > 0 && (
                        <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-[10px] font-bold">
                          {job.matchScore}% ATS Match
                        </span>
                      )}
                      {job.salary && (job.salary.min > 0 || job.salary.max > 0) && (
                        <span className="text-xs font-semibold text-emerald-400">
                          {formatSalaryRange(job.salary.min, job.salary.max, job.salary.currency || 'INR', job.salary.period)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link to={`/candidate/jobs/${job.id}`}>
                      <Button variant="secondary" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/candidate/jobs/${job.id}`)}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-2.5 opacity-60" />
                <p className="text-sm font-semibold text-slate-300">No New Open Requisitions</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  You have applied to all current positions or recruiters have not posted new requisitions yet.
                </p>
                <Link to="/candidate/jobs" className="inline-block mt-4">
                  <Button variant="secondary" size="sm">
                    Check Career Portal
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </DepthCard>
      </motion.div>

      {/* ── SECTION 5 — APPLICATION JOURNEY & PIPELINE ───────────────────────── */}
      <CandidateApplicationJourneySection
        dashboardData={dashboardData}
        renderStatusBadge={renderStatusBadge}
      />

      {/* ── SECTION 6 — PROFILE READINESS & VIRTUAL INTERVIEW ROADMAP ────────── */}
      <CandidateSkillRoadmapSection
        dashboardData={dashboardData}
      />

      {/* Create/Upload Resume Modal */}
      <CreateResumeModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        initialMode={createModalMode}
        onSuccess={() => {
          setCreateModalOpen(false);
          loadData();
          showToast({
            type: 'success',
            title: 'Resume Uploaded',
            message: 'Resume uploaded and ATS analysis initiated successfully.'
          });
        }}
      />
    </div>
  );
};
