import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Building,
  MapPin,
  CheckCircle2,
  FileText,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Briefcase,
  Eye,
  Upload,
  Check
} from 'lucide-react';
import { Job, Resume, CandidateProfile } from '../../types';
import { candidateService } from '../../services';
import { actionFeedbackService } from '../../services/feedback/actionFeedbackService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { formatSalaryRange, formatFullDate } from '../../utils/formatters';

export interface EasyApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (jobId: string) => void;
}

type Step = 'profile' | 'resume' | 'review' | 'success';

export const EasyApplyModal: React.FC<EasyApplyModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>('profile');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedApplicationId, setSubmittedApplicationId] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(true);

  // Reset modal state whenever opened for a new job
  useEffect(() => {
    if (isOpen && job) {
      setStep('profile');
      setErrorMessage(null);
      setSubmittedApplicationId(null);
      setIsConfirmed(true);
      loadCandidateData();
    }
  }, [isOpen, job?.id]);

  const loadCandidateData = async () => {
    try {
      setIsLoadingData(true);
      const [resumesData, profileData] = await Promise.all([
        candidateService.getResumes().catch(() => []),
        candidateService.getProfile().catch(() => null),
      ]);

      setResumes(resumesData || []);
      setProfile(profileData);

      // Auto-select primary resume, or first available
      if (resumesData && resumesData.length > 0) {
        const primary = resumesData.find((r) => r.isPrimary) || resumesData[0];
        setSelectedResumeId(primary.id);
      } else {
        setSelectedResumeId('');
      }
    } catch (err) {
      console.error('Failed to load candidate application data', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const selectedResume = useMemo(() => {
    if (!selectedResumeId) return null;
    return resumes.find((r) => r.id === selectedResumeId) || null;
  }, [selectedResumeId, resumes]);

  const isProfileVerified = useMemo(() => {
    const status = user?.verificationStatus || (user as any)?.status;
    return (
      status === 'APPROVED' ||
      status === 'VERIFIED' ||
      (user as any)?.isVerified === true ||
      (profile as any)?.isVerified === true
    );
  }, [user, profile]);

  const candidateHeadline = profile?.title || user?.title;
  const candidateLocation = profile?.location;

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    if (!selectedResumeId) {
      setErrorMessage('Please choose a resume before submitting your application.');
      setStep('resume');
      return;
    }

    if (!isConfirmed) {
      setErrorMessage('Please confirm your submission details before proceeding.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const app = await candidateService.applyForJob(job.id, selectedResumeId);

      // Set actual reference if returned by backend
      setSubmittedApplicationId(app?.id || null);
      setStep('success');

      showToast({
        type: 'success',
        title: 'Application Submitted! 🎉',
        message: `Successfully applied to ${job.title} at ${job.company}.`,
      });

      actionFeedbackService.applicationSubmitted({
        jobTitle: job.title,
        companyName: job.company,
        applicationId: app?.id,
        jobId: job.id,
      });

      if (onSuccess) {
        onSuccess(job.id);
      }
    } catch (err: any) {
      const msg = err?.message || 'Could not submit application. Please check your connection and try again.';
      setErrorMessage(msg);
      showToast({
        type: 'error',
        title: msg.toLowerCase().includes('already applied')
          ? 'Application Already Submitted'
          : 'Application Error',
        message: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCandidateInitials = (name?: string) => {
    if (!name) return 'CA';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  if (!isOpen || !job) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={step === 'success' ? onClose : !isSubmitting ? onClose : undefined}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          aria-hidden="true"
        />

        {/* Modal Dialog Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl sm:max-w-2xl bg-gradient-to-b from-[#0c142c] via-[#080d22] to-[#060918] border border-white/10 rounded-3xl shadow-[0_24px_70px_-15px_rgba(0,0,0,0.9),0_0_45px_-10px_rgba(99,102,241,0.28)] flex flex-col max-h-[92vh] overflow-hidden z-10 select-text"
          role="dialog"
          aria-modal="true"
          aria-labelledby="easy-apply-heading"
        >
          {/* Luminous Top-Edge Highlight Line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent pointer-events-none z-20" />
          <div className="absolute top-0 left-12 w-48 h-10 bg-radial-gradient from-cyan-400/15 via-indigo-500/05 to-transparent blur-md pointer-events-none z-10" />

          {/* ── DIALOG HEADER ────────────────────────────────────────────── */}
          <div className="px-6 sm:px-7 pt-6 pb-4 border-b border-white/[0.08] relative z-10 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                    <Send className="w-3 h-3 text-indigo-400" />
                    Apply for Position
                  </span>
                  {job.type && (
                    <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                      {job.type}
                    </span>
                  )}
                </div>

                <h2
                  id="easy-apply-heading"
                  className="text-lg sm:text-xl font-extrabold text-white tracking-tight truncate"
                  title={job.title}
                >
                  {job.title}
                </h2>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    {job.company}
                  </span>
                  {job.location && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {job.location}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Close dialog"
                className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Progress Indicator (Hidden on Success) */}
            {step !== 'success' && (
              <div className="flex items-center justify-between gap-2 pt-4 mt-2 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('profile')}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      step === 'profile'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">1</span>
                    <span>Profile</span>
                  </button>

                  <span className="text-slate-600 text-xs">/</span>

                  <button
                    type="button"
                    onClick={() => setStep('resume')}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      step === 'resume'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">2</span>
                    <span>Resume</span>
                  </button>

                  <span className="text-slate-600 text-xs">/</span>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedResumeId) setStep('review');
                    }}
                    disabled={!selectedResumeId}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                      step === 'review'
                        ? 'bg-indigo-600 text-white shadow-xs cursor-pointer'
                        : selectedResumeId
                        ? 'text-slate-400 hover:text-slate-200 cursor-pointer'
                        : 'text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">3</span>
                    <span>Review & Submit</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 hidden sm:block">
                  Step {step === 'profile' ? '1' : step === 'resume' ? '2' : '3'} of 3
                </div>
              </div>
            )}
          </div>

          {/* ── DIALOG BODY (Scrollable content) ─────────────────────────── */}
          <div className="px-6 sm:px-7 py-5 overflow-y-auto space-y-5 flex-1 relative z-10 custom-scrollbar">
            {/* Inline Error Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-rose-300">Application Notice</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* ── STEP 1: YOUR APPLICATION PROFILE ─────────────────────────── */}
            {step === 'profile' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Your Application Profile</h3>
                  <p className="text-xs text-slate-400 leading-snug">
                    Review your contact details before continuing. These details will help the hiring team identify your application.
                  </p>
                </div>

                {/* Candidate Identity Card */}
                <div className="card-upper-edge-luminous rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    {/* Actual Avatar or Initials */}
                    {user?.avatar || profile?.avatar ? (
                      <img
                        src={user?.avatar || profile?.avatar}
                        alt={user?.name || profile?.name || 'Candidate'}
                        className="w-14 h-14 rounded-2xl object-cover bg-slate-900 border border-white/10 shadow-md shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-800 to-slate-900 border border-white/10 flex items-center justify-center text-indigo-200 font-extrabold text-base tracking-wider font-mono shadow-md shrink-0 select-none">
                        {getCandidateInitials(user?.name || profile?.name)}
                      </div>
                    )}

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-extrabold text-white tracking-tight truncate">
                          {user?.name || profile?.name || 'Registered Candidate'}
                        </p>
                        {isProfileVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/25">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            Verified Candidate
                          </span>
                        )}
                      </div>

                      {candidateHeadline && (
                        <p className="text-xs font-medium text-slate-300 truncate">
                          {candidateHeadline}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 pt-1">
                        <span>{user?.email || profile?.email || 'Authenticated Account'}</span>
                        {candidateLocation && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span>{candidateLocation}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submission Profile Notice Banner */}
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)] shrink-0" />
                      <span>Your application will be submitted using this profile.</span>
                    </div>

                    <Link
                      to="/candidate/profile"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-300 hover:text-indigo-200 font-semibold shrink-0 transition-colors"
                    >
                      Edit Profile <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: CHOOSE YOUR RESUME ──────────────────────────────── */}
            {step === 'resume' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Choose Your Resume</h3>
                  <p className="text-xs text-slate-400 leading-snug">
                    Select the resume you want to send for this position.
                  </p>
                </div>

                {isLoadingData ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-20 rounded-xl bg-white/[0.04] animate-pulse border border-white/[0.08]" />
                    ))}
                  </div>
                ) : resumes.length === 0 ? (
                  /* Friendly Empty State */
                  <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">You haven't created a resume yet.</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Create or upload a resume before continuing with your application.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link
                        to="/candidate/resumes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload or Create Resume
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Resume List Cards */}
                    {resumes.map((resume) => {
                      const isSelected = selectedResumeId === resume.id;
                      const resumeTitle = resume.title || resume.fileName || 'Resume Document';
                      const resumeDate = resume.uploadDate ? formatFullDate(resume.uploadDate) : null;
                      const fileTypeLabel = resume.fileType ? resume.fileType.toUpperCase() : 'PDF';

                      return (
                        <div
                          key={resume.id}
                          onClick={() => setSelectedResumeId(resume.id)}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') setSelectedResumeId(resume.id);
                          }}
                          className={`relative p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'card-upper-edge-luminous border-indigo-400/60 bg-gradient-to-r from-indigo-950/60 via-[#0c1430]/70 to-[#070b1a] shadow-[0_0_20px_rgba(99,102,241,0.22)]'
                              : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.08]'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                isSelected
                                  ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300'
                                  : 'bg-white/[0.04] border-white/[0.08] text-slate-400'
                              }`}
                            >
                              <FileText className="w-5 h-5" />
                            </div>

                            <div className="space-y-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate">
                                {resumeTitle}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-300">
                                  {fileTypeLabel}
                                </span>
                                {resumeDate && (
                                  <>
                                    <span>•</span>
                                    <span>Updated {resumeDate}</span>
                                  </>
                                )}
                                {resume.isPrimary && (
                                  <span className="font-semibold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/25">
                                    Primary
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Preview Resume Link */}
                            <a
                              href={`/candidate/resume-builder/${resume.id}?tab=preview`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-indigo-300 transition-colors p-1"
                              title="Preview this resume in new tab"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </a>

                            {/* Custom Radio Circle */}
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'border-indigo-400 bg-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                                  : 'border-white/20 bg-transparent'
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: REVIEW YOUR APPLICATION ─────────────────────────── */}
            {step === 'review' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Review Your Application</h3>
                  <p className="text-xs text-slate-400 leading-snug">
                    Check your details and resume before sending your application.
                  </p>
                </div>

                <div className="card-upper-edge-luminous rounded-2xl p-5 space-y-4 text-xs">
                  {/* A. Job Details */}
                  <div className="pb-3 border-b border-white/[0.06] space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Position Details
                    </span>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white text-sm">{job.title}</p>
                        <p className="text-slate-300 flex items-center gap-1.5 pt-0.5">
                          <Building className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{job.company}</span>
                          {job.location && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span>{job.location}</span>
                            </>
                          )}
                          {job.type && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-400">({job.type})</span>
                            </>
                          )}
                        </p>
                      </div>

                      {job.salary && (job.salary.min > 0 || job.salary.max > 0) && (
                        <span className="font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/25 shrink-0">
                          {formatSalaryRange(job.salary.min, job.salary.max, job.salary.currency || 'INR', job.salary.period)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* B. Your Details */}
                  <div className="pb-3 border-b border-white/[0.06] space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Applicant Contact Information
                    </span>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="font-bold text-white">{user?.name || profile?.name || 'Registered Candidate'}</p>
                        <p className="text-slate-400">{user?.email || profile?.email}</p>
                      </div>
                      <Link
                        to="/candidate/profile"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-300 hover:text-indigo-200 font-semibold"
                      >
                        Edit Profile
                      </Link>
                    </div>
                  </div>

                  {/* C. Selected Resume */}
                  <div className="pb-3 border-b border-white/[0.06] space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Selected Resume
                    </span>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{selectedResume?.title || selectedResume?.fileName || 'Attached Resume'}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep('resume')}
                        className="text-indigo-300 hover:text-indigo-200 font-semibold underline cursor-pointer"
                      >
                        Change Resume
                      </button>
                    </div>
                  </div>

                  {/* D. Final Confirmation Checkbox */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] cursor-pointer hover:bg-white/[0.05] transition-colors">
                    <input
                      type="checkbox"
                      checked={isConfirmed}
                      onChange={(e) => setIsConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-white/20 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-xs text-slate-300 leading-relaxed select-none">
                      I confirm that the information and resume selected above are the ones I want to submit for this position.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* ── STEP 4: SUCCESS CONFIRMATION ──────────────────────────── */}
            {step === 'success' && (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_24px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Application Submitted Successfully
                  </h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto">
                    Your application for <span className="text-white font-semibold">{job.title}</span> at{' '}
                    <span className="text-white font-semibold">{job.company}</span> has been submitted.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] max-w-md mx-auto text-xs text-slate-300 text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Position:</span>
                    <span className="font-semibold text-white">{job.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Company:</span>
                    <span className="font-semibold text-white">{job.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Submission Date:</span>
                    <span className="font-mono text-slate-300">{formatFullDate(new Date().toISOString())}</span>
                  </div>
                  {submittedApplicationId && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Application ID:</span>
                      <span className="font-mono text-indigo-300">{submittedApplicationId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-semibold text-emerald-400">Applied • Under Review</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── DIALOG FOOTER ACTIONS ────────────────────────────────────── */}
          <div className="px-6 sm:px-7 py-4 bg-slate-900/60 border-t border-white/[0.08] flex items-center justify-between gap-3 relative z-10 shrink-0">
            {step === 'success' ? (
              <div className="flex items-center justify-end w-full gap-3">
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Return to Jobs
                </Button>
                <Button
                  variant="glow"
                  size="sm"
                  leftIcon={<Briefcase className="w-3.5 h-3.5" />}
                  onClick={() => {
                    onClose();
                    navigate('/candidate/applications');
                  }}
                >
                  View My Applications
                </Button>
              </div>
            ) : (
              <>
                <div>
                  {step === 'profile' && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  )}

                  {step === 'resume' && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                      onClick={() => setStep('profile')}
                      disabled={isSubmitting}
                    >
                      Back to Profile
                    </Button>
                  )}

                  {step === 'review' && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                      onClick={() => setStep('resume')}
                      disabled={isSubmitting}
                    >
                      Back to Resume
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {step === 'profile' && (
                    <Button
                      type="button"
                      variant="glow"
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => setStep('resume')}
                    >
                      Continue to Resume
                    </Button>
                  )}

                  {step === 'resume' && (
                    <Button
                      type="button"
                      variant="glow"
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => setStep('review')}
                      disabled={!selectedResumeId}
                    >
                      Continue to Review
                    </Button>
                  )}

                  {step === 'review' && (
                    <Button
                      type="button"
                      variant="glow"
                      size="sm"
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                      isLoading={isSubmitting}
                      disabled={isSubmitting || !selectedResumeId || !isConfirmed}
                      onClick={handleFinalSubmit}
                    >
                      {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
