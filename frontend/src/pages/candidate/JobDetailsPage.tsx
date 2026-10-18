import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  Calendar,
  Send,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Users,
  Check,
  ShieldCheck,
  Flag
} from 'lucide-react';
import { jobService, candidateService } from '../../services';
import { candidateApi } from '../../services/api/candidateApi';
import { actionFeedbackService } from '../../services/feedback/actionFeedbackService';
import { useToast } from '../../context/ToastContext';
import { Job, CandidateProfile, Resume } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency, formatSalaryRange, formatFullDate } from '../../utils/formatters';

export const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Apply Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('SUSPICIOUS_PAYMENT');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadJobDetails(id);
  }, [id]);

  const loadJobDetails = async (jobId: string) => {
    try {
      setIsLoading(true);
      const [jobData, profData, resumesData, savedJobs, applications] = await Promise.all([
        jobService.getJobById(jobId),
        candidateService.getProfile(),
        candidateService.getResumes(),
        candidateService.getSavedJobs(),
        candidateService.getApplications()
      ]);

      setJob(jobData);
      setProfile(profData);
      setResumes(resumesData);
      setIsSaved(savedJobs.some((j) => j.id === jobId));
      setIsApplied(applications.some((a) => a.jobId === jobId));

      if (resumesData.length > 0) {
        const primary = resumesData.find((r) => r.isPrimary) || resumesData[0];
        setSelectedResumeId(primary.id);
      }
    } catch (err) {
      console.error('Failed to load job details', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!job) return;
    const newState = await candidateService.toggleSaveJob(job.id);
    setIsSaved(newState);
    showToast({
      type: newState ? 'success' : 'info',
      title: newState ? 'Job Saved' : 'Job Removed',
      message: newState ? 'Job saved to your bookmarks.' : 'Job removed from bookmarks.'
    });
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !selectedResumeId) return;

    try {
      setIsSubmitting(true);
      const app = await candidateService.applyForJob(job.id, selectedResumeId);
      setIsApplied(true);
      setApplyModalOpen(false);
      showToast({
        type: 'success',
        title: 'Application Submitted! 🎉',
        message: `Your resume was dispatched to ${job.company}.`
      });
      actionFeedbackService.applicationSubmitted({
        jobTitle: job.title,
        companyName: job.company,
        applicationId: app?.id,
        jobId: job.id,
      });
    } catch (err: any) {
      const message = err?.message || 'Failed to submit application.';
      showToast({
        type: 'error',
        title: message.toLowerCase().includes('already applied')
          ? 'Application Already Submitted'
          : 'Application Error',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    if (!reportDescription.trim()) {
      showToast({
        type: 'warning',
        title: 'Details Required',
        message: 'Please provide specific information or evidence regarding the safety concern.'
      });
      return;
    }

    try {
      setIsSubmittingReport(true);
      await candidateApi.submitReport({
        jobId: job.id,
        category: reportCategory,
        description: reportDescription.trim()
      });
      showToast({
        type: 'success',
        title: 'Safety Report Submitted 🛡️',
        message: 'Thank you for protecting our community. Platform administrators have opened an investigation.'
      });
      setReportModalOpen(false);
      setReportDescription('');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Submission Blocked',
        message: err?.message || 'Failed to submit report. You may have already reported this requisition.'
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (isLoading || !job) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Calculate matched vs missing skills
  const candidateSkills = profile?.skills.technical || [];
  const matchedSkills = job.skills.filter((s) =>
    candidateSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = job.skills.filter(
    (s) => !candidateSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div>
        <Link
          to="/candidate/jobs"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Recommendations</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <Card glass className="p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={job.companyLogo}
              alt={job.company}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow-md shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">{job.title}</h1>
                {job.matchScore && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {job.matchScore}% AI Match
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
                <span>{job.company}</span>
                <span>•</span>
                <span className="text-slate-300 font-normal">{job.department}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {job.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  {job.type}
                </span>
                <span>•</span>
                <span className="font-semibold text-emerald-400">
                  {formatSalaryRange(job.salary?.min, job.salary?.max, job.salary?.currency || 'INR', job.salary?.period)}
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-850 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
              title="Report Suspicious Job or Recruiter"
            >
              <Flag className="w-5 h-5" />
            </button>

            <button
              onClick={handleToggleSave}
              className={`p-2.5 rounded-xl border transition-colors ${
                isSaved
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
              }`}
              title={isSaved ? 'Remove Bookmark' : 'Save Job'}
            >
              {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>

            {isApplied ? (
              <Badge variant="success" size="md" className="py-2.5 px-4 text-xs font-bold">
                <Check className="w-4 h-4 mr-1.5" /> Already Applied
              </Badge>
            ) : (
              <Button
                variant="glow"
                size="md"
                onClick={() => setApplyModalOpen(true)}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>

        {/* Platform Trust & Safety Badges Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Verification Badges:</span>
            <span
              title="Company Verified: Corporate registration and verified business email domain"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Company Verified
            </span>
            <span
              title="Recruiter Verified: Identity confirmed and authorized to represent the organization"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              Recruiter Verified
            </span>
            <span
              title="Job Approved: Audited and approved by platform governance moderation"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30"
            >
              <Check className="w-3.5 h-3.5 text-indigo-400" />
              Job Approved
            </span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span>Notice something suspicious?</span>
            <button
              onClick={() => setReportModalOpen(true)}
              className="text-rose-400 hover:text-rose-300 font-bold underline transition-colors"
            >
              Report this listing
            </button>
          </div>
        </div>
      </Card>

      {/* Main Split Body: Job Details & Skill Matching Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Description, Responsibilities, Requirements */}
        <div className="lg:col-span-2 space-y-6">
          <Card glass className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-2">Role Overview</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{job.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-white">Key Responsibilities</h3>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-white">Qualifications & Requirements</h3>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-white">Educational Requirement</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{job.educationRequired}</p>
            </div>
          </Card>
        </div>

        {/* Right Col: AI Skill Match Card & Job Meta */}
        <div className="space-y-6">
          {/* Skill Matching Widget */}
          <Card glass className="p-6 space-y-4 border-indigo-500/30">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Skill Alignment Breakdown</span>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">
                  Matched Skills ({matchedSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {matchedSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {missingSkills.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                    Missing / Skill Gaps ({missingSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-slate-400 border border-slate-700 text-xs"
                      >
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Details Sidebar */}
          <Card glass className="p-6 space-y-3.5 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
              Job Requisition Details
            </h4>

            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Experience Level:</span>
              <span className="font-semibold text-white">{job.experienceLevel} ({job.experienceRequiredYears}+ yrs)</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Total Applicants:</span>
              <span className="font-semibold text-indigo-400">{job.applicantCount} applied</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Deadline:</span>
              <span className="font-semibold text-amber-400">{formatFullDate(job.deadline)}</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Posted Date:</span>
              <span className="font-semibold text-slate-200">{formatFullDate(job.postedDate)}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* APPLICATION MODAL */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
        description={`Submit application to ${job.company}`}
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs space-y-1.5">
            <p className="font-bold text-white">{profile?.name} • {profile?.title}</p>
            <p className="text-slate-300">{profile?.email} • {profile?.phone}</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Resume Document
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 p-2.5"
              required
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fileName} {r.isPrimary ? '(Primary Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" isLoading={isSubmitting} leftIcon={<Send className="w-4 h-4" />}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* CANDIDATE SAFETY REPORT MODAL */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Job Requisition or Recruiter"
        description="Help maintain a secure and trustworthy hiring marketplace by submitting details of suspicious activity."
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Reported Position:</span>
            <p className="font-bold text-white">{job.title}</p>
            <p className="text-slate-400">{job.company} • Recruiter ID: <code className="text-slate-300 font-mono text-[11px]">{job.recruiterId || 'Verified Partner'}</code></p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Violation or Suspicion Category
            </label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-700 p-2.5 focus:outline-none focus:border-rose-500"
              required
            >
              <option value="SUSPICIOUS_PAYMENT">Demanding recruitment/training fees or suspicious payments</option>
              <option value="MISLEADING_DESCRIPTION">Misleading job description or inaccurate salary/role details</option>
              <option value="IDENTITY_MISMATCH">Company or recruiter identity mismatch</option>
              <option value="EXTERNAL_LINKS">Suspicious external links, malware, or phishing attempts</option>
              <option value="FAKE_RECRUITER">Suspected impersonation or fake recruiter profile</option>
              <option value="OTHER">Other fraudulent or policy-violating activity</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Evidence & Specific Statement
            </label>
            <textarea
              rows={4}
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Describe what occurred, quotes from communications, or suspicious URLs..."
              className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-700 p-3 focus:outline-none focus:border-rose-500 resize-none"
              required
            />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Your report is confidential and reviewed only by human trust & safety administrators. Reports are never shared with recruiters.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={isSubmittingReport}
              leftIcon={<Flag className="w-4 h-4" />}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              Submit Report to Trust & Safety
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
