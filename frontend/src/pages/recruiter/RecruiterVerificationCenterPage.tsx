import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  Building2,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  FileText,
  Globe,
  MapPin,
  Briefcase,
  Users,
  Send,
  History,
  Info,
  ChevronRight,
  ExternalLink,
  Edit3,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { recruiterApi } from '../../services/api/recruiterApi';
import { RecruiterVerificationDetail, AiSuggestionItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { DepthCard } from '../../components/ui/DepthCard';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../utils/cn';
import { formatFullDate } from '../../utils/formatters';

type ChecklistItemStatus = 'Action Required' | 'In Progress' | 'Completed';

export const RecruiterVerificationCenterPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [detail, setDetail] = useState<RecruiterVerificationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit fields
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
  const [taxId, setTaxId] = useState('');
  const [officialEmailDomain, setOfficialEmailDomain] = useState('');
  const [authorizationDocumentUrl, setAuthorizationDocumentUrl] = useState('');
  const [authorizationNotes, setAuthorizationNotes] = useState('');
  const [verificationDocumentUrl, setVerificationDocumentUrl] = useState('');
  const [verificationEvidenceNotes, setVerificationEvidenceNotes] = useState('');
  const [resubmissionNotes, setResubmissionNotes] = useState('');

  // Checklist items completion tracker
  const [suggestionStatuses, setSuggestionStatuses] = useState<Record<number, ChecklistItemStatus>>({});

  // Confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const fetchDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await recruiterApi.getVerificationDetail();
      setDetail(data);

      setCompanyName(data.companyName || data.company?.name || '');
      setCompanyWebsite(data.companyWebsite || data.company?.website || '');
      setCompanyIndustry(data.companyIndustry || data.company?.industry || '');
      setCompanyLocation(data.companyLocation || data.company?.location || '');
      setCompanySize(data.companySize || data.company?.size || '');
      setCompanyDescription(data.companyDescription || data.company?.description || '');
      setBusinessRegistrationNumber(data.company?.businessRegistrationNumber || data.businessRegistrationNumber || '');
      setTaxId(data.company?.taxId || data.taxId || '');
      setOfficialEmailDomain(data.company?.officialEmailDomain || data.officialEmailDomain || '');
      setAuthorizationDocumentUrl(data.company?.authorizationDocumentUrl || data.authorizationDocumentUrl || '');
      setAuthorizationNotes(data.company?.authorizationNotes || data.authorizationNotes || '');
      setVerificationDocumentUrl(data.company?.verificationDocumentUrl || data.verificationDocumentUrl || '');
      setVerificationEvidenceNotes(data.company?.verificationEvidenceNotes || data.verificationEvidenceNotes || '');
      setResubmissionNotes(data.resubmissionNotes || '');

      // Initialize suggestion statuses
      if (data.aiSuggestions && data.aiSuggestions.length > 0) {
        const initStatus: Record<number, ChecklistItemStatus> = {};
        data.aiSuggestions.forEach((_, idx) => {
          initStatus[idx] = 'Action Required';
        });
        setSuggestionStatuses(initStatus);
      }
    } catch (err: any) {
      console.error('Failed to load recruiter verification detail:', err);
      setError(err?.message || 'Failed to retrieve verification details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  const handleStatusCycle = (idx: number) => {
    setSuggestionStatuses((prev) => {
      const current = prev[idx] || 'Action Required';
      let next: ChecklistItemStatus = 'Action Required';
      if (current === 'Action Required') next = 'In Progress';
      else if (current === 'In Progress') next = 'Completed';
      else next = 'Action Required';
      return { ...prev, [idx]: next };
    });
  };

  const handleResubmit = async () => {
    if (!companyName.trim()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Legal Company Name is required for verification.'
      });
      return;
    }

    if (!resubmissionNotes.trim()) {
      showToast({
        type: 'error',
        title: 'Action Notes Required',
        message: 'Please provide a summary of the corrections made.'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await recruiterApi.resubmitVerification({
        name: companyName.trim(),
        companyName: companyName.trim(),
        companyWebsite: companyWebsite.trim(),
        website: companyWebsite.trim(),
        companyIndustry: companyIndustry.trim(),
        industry: companyIndustry.trim(),
        companyLocation: companyLocation.trim(),
        location: companyLocation.trim(),
        companySize: companySize.trim(),
        size: companySize.trim(),
        companyDescription: companyDescription.trim(),
        description: companyDescription.trim(),
        businessRegistrationNumber: businessRegistrationNumber.trim(),
        taxId: taxId.trim(),
        officialEmailDomain: officialEmailDomain.trim(),
        authorizationDocumentUrl: authorizationDocumentUrl.trim(),
        authorizationNotes: authorizationNotes.trim(),
        verificationDocumentUrl: verificationDocumentUrl.trim(),
        recruiterNotes: resubmissionNotes.trim(),
        resubmissionNotes: resubmissionNotes.trim()
      });

      setDetail(updated);
      setIsConfirmModalOpen(false);
      showToast({
        type: 'success',
        title: 'Verification Resubmitted',
        message: 'Your corrected verification details and evidence have been routed to the compliance team.'
      });
    } catch (err: any) {
      console.error('Failed to resubmit verification:', err);
      showToast({
        type: 'error',
        title: 'Resubmission Failed',
        message: err?.message || 'Could not submit verification request.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Loading Verification Status & Feedback...</p>
        <p className="text-xs text-slate-500">Querying enterprise compliance records</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Verification Center Unavailable</h2>
        <p className="text-sm text-slate-400">{error || 'Could not find your recruiter verification record.'}</p>
        <Button onClick={fetchDetail} variant="outline" className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
        </Button>
      </div>
    );
  }

  const statusStr = (detail.verificationStatus || '').toLowerCase();
  const isAdditionalEvidence = statusStr === 'additional_evidence_required';
  const isRejected = statusStr === 'rejected';
  const isSuspended = statusStr === 'suspended';
  const isResubmitted = statusStr === 'resubmitted';
  const isVerified = statusStr === 'verified';
  const isPending = statusStr === 'pending' || statusStr === 'in_review';
  const isUnableToVerify = statusStr === 'unable_to_verify';

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0c1322] via-[#090e1a] to-[#060a14] border border-slate-800/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Employer Trust & Verification
              </span>
              <span className="text-xs text-slate-500 font-mono">APP-REF #{detail.recruiterId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Verification & Improvement Centre
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Review authoritative verification findings, address compliance requirements, and resubmit verified business credentials.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {detail.history && detail.history.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setIsHistoryModalOpen(true)}
                className="bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white text-xs h-10 px-4"
              >
                <History className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                Audit Trail ({detail.history.length})
              </Button>
            )}
            <Button
              variant="outline"
              onClick={fetchDetail}
              className="bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white text-xs h-10 px-3"
              title="Refresh status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* SECTION A: VERIFICATION STATUS BANNER */}
      <div
        className={cn(
          'rounded-2xl p-6 border transition-all shadow-lg',
          (isRejected || isSuspended) && 'bg-rose-950/20 border-rose-500/30 text-rose-200',
          isAdditionalEvidence && 'bg-amber-950/20 border-amber-500/40 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
          isResubmitted && 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200',
          isVerified && 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200',
          (isPending || isUnableToVerify) && 'bg-amber-950/20 border-amber-500/30 text-amber-200'
        )}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-inner',
                (isRejected || isSuspended) && 'bg-rose-500/20 border-rose-500/40 text-rose-300',
                isAdditionalEvidence && 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse',
                isResubmitted && 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
                isVerified && 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
                (isPending || isUnableToVerify) && 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              )}
            >
              {(isRejected || isSuspended) && <ShieldAlert className="w-6 h-6" />}
              {isAdditionalEvidence && <AlertCircle className="w-6 h-6" />}
              {isResubmitted && <Clock className="w-6 h-6 animate-pulse" />}
              {isVerified && <ShieldCheck className="w-6 h-6" />}
              {(isPending || isUnableToVerify) && <Clock className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">
                  {isAdditionalEvidence && 'Additional Evidence Required'}
                  {isRejected && 'Verification Application Rejected'}
                  {isSuspended && 'Recruiter Account Suspended'}
                  {isResubmitted && 'Updated Verification Under Review'}
                  {isVerified && 'Organization Fully Verified'}
                  {isPending && 'Verification Decision Pending'}
                  {isUnableToVerify && 'Unable to Verify Organization'}
                </h2>
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border tracking-wider',
                    (isRejected || isSuspended) && 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                    isAdditionalEvidence && 'bg-amber-500/20 text-amber-300 border-amber-500/50',
                    isResubmitted && 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                    isVerified && 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                    (isPending || isUnableToVerify) && 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  )}
                >
                  {detail.verificationStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAdditionalEvidence && 'The administrator reviewed your application and requested additional evidence (business registration, tax ID, or authorization documentation) to verify your company representation.'}
                {isRejected && 'The compliance team reviewed your submission and documented reasons for rejecting this application.'}
                {isSuspended && 'This account has been temporarily suspended by platform governance administrators. Re-verification required.'}
                {isResubmitted && `Your updated business profile and evidence were submitted on ${formatFullDate(detail.resubmittedAt || detail.updatedAt)}. An administrator is reviewing the records.`}
                {isVerified && 'Your enterprise recruiter identity is confirmed. All job posting and recruitment pipeline features are active.'}
                {isPending && 'Your application is awaiting primary administrator review.'}
                {isUnableToVerify && 'The compliance team was unable to independently verify your organization registration with the provided details.'}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 font-mono text-[11px] text-slate-400">
            <div>Last Updated: {formatFullDate(detail.updatedAt)}</div>
            {detail.resubmittedAt && <div>Resubmitted: {formatFullDate(detail.resubmittedAt)}</div>}
          </div>
        </div>
      </div>

      {/* SECTION B: ADMINISTRATOR FEEDBACK (WHEN REJECTED, ADDITIONAL EVIDENCE, OR RESUBMITTED) */}
      {(isRejected || isResubmitted || isAdditionalEvidence || isSuspended || isUnableToVerify) && (
        <div className="bg-[#0b1220]/90 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Administrator Compliance Feedback
                </h3>
                <p className="text-xs text-slate-400">Official findings and required verification amendments</p>
              </div>
            </div>
            {detail.rejectionCategory && (
              <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                {detail.rejectionCategory}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Primary Decision Explanation
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                {detail.rejectionReason || 'No specific reason entered by the administrator.'}
              </p>
            </div>

            <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                Required Corrective Actions
              </span>
              <p className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                {detail.correctiveActions ||
                  'Please review the company registration details below, amend any discrepancies, and submit the corrected profile for verification.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION C: AI-ASSISTED RECOMMENDED IMPROVEMENTS */}
      {detail.aiSuggestions && detail.aiSuggestions.length > 0 && (
        <div className="bg-[#0b1220]/90 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Approved Improvement Guidance
                  </h3>
                  <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                    AI-Assisted Compliance Analysis
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Step-by-step guidance curated to assist your profile resubmission
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Click status pill to track completion
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detail.aiSuggestions.map((sug, idx) => {
              const currentStatus = suggestionStatuses[idx] || 'Action Required';
              return (
                <div
                  key={idx}
                  className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3.5 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                        ITEM #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStatusCycle(idx)}
                        className={cn(
                          'text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer',
                          currentStatus === 'Action Required' && 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20',
                          currentStatus === 'In Progress' && 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20',
                          currentStatus === 'Completed' && 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                        )}
                      >
                        {currentStatus === 'Completed' && '✓ '}
                        {currentStatus}
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-white">{sug.issue}</h4>

                    {sug.whyItMatters && (
                      <p className="text-xs text-slate-400 italic">
                        <span className="text-slate-500 not-italic font-semibold">Context: </span>
                        {sug.whyItMatters}
                      </p>
                    )}

                    <div className="text-xs text-slate-300 space-y-1 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                      <p className="font-semibold text-indigo-300">Action: {sug.recommendedAction}</p>
                      {sug.requiredSupportingInfo && (
                        <p className="text-slate-400">Required: {sug.requiredSupportingInfo}</p>
                      )}
                      {sug.profileCorrectionInstructions && (
                        <p className="text-slate-400">Instructions: {sug.profileCorrectionInstructions}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/50">
                    <span>Admin Re-review: {sug.adminReviewRequired !== false ? 'Required' : 'Automated'}</span>
                    <button
                      type="button"
                      onClick={() => handleStatusCycle(idx)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Update Progress
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION D: COMPANY PROFILE CORRECTIONS FORM */}
      <div className="bg-[#0b1220]/90 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Company Profile Corrections
              </h3>
              <p className="text-xs text-slate-400">
                Update legal organization details and business registration information
              </p>
            </div>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Directly saved to database upon resubmission
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Legal Organization Name <span className="text-rose-400">*</span></span>
              <span className="text-[10px] text-slate-500">As registered with state authorities</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Technologies Inc."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Official Corporate Website</span>
              <span className="text-[10px] text-slate-500">https://company.domain</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="https://acmecorp.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Industry / Sector</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={companyIndustry}
                onChange={(e) => setCompanyIndustry(e.target.value)}
                placeholder="e.g. Enterprise Software & AI"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Headquarters / Registered Location</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA, USA"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Organization Scale / Team Size</label>
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                placeholder="e.g. 50-250 Employees"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Recruiter Corporate Email</label>
            <input
              type="email"
              disabled
              value={detail.email}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Company Description & Verification Summary</label>
            <textarea
              rows={3}
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Provide a concise description of company operations, primary products, and public references..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Corporate Authenticity & Registration Credentials */}
          <div className="md:col-span-2 pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
              Corporate Registration & Authorization Credentials
            </h4>
            <p className="text-[11px] text-slate-400 mb-4">
              Submit authoritative business identification and proof of authority to represent this employer.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Business Registration / Incorporation Number
                </label>
                <input
                  type="text"
                  value={businessRegistrationNumber}
                  onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                  placeholder="e.g. C3849102 / SEC-2023-8841"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Tax Identification Number (TIN / EIN / VAT)
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="e.g. 12-3456789"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Official Corporate Email Domain
                </label>
                <input
                  type="text"
                  value={officialEmailDomain}
                  onChange={(e) => setOfficialEmailDomain(e.target.value)}
                  placeholder="e.g. companyname.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Authorization Letter / POA URL
                </label>
                <input
                  type="url"
                  value={authorizationDocumentUrl}
                  onChange={(e) => setAuthorizationDocumentUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or cloud document link"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Authorization & Company Representation Evidence Notes
                </label>
                <input
                  type="text"
                  value={authorizationNotes}
                  onChange={(e) => setAuthorizationNotes(e.target.value)}
                  placeholder="Describe your role, corporate authorization, or link to employer directory verification..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION E: RESUBMISSION NOTES & ACTION */}
      <div className="bg-[#0b1220]/90 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Edit3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Resubmission Notes & Explanations
            </h3>
            <p className="text-xs text-slate-400">
              Summarize the changes and clarifications submitted for administrator re-review
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Clarification for Reviewing Administrator <span className="text-rose-400">*</span></span>
            <span className="text-[10px] text-slate-500">{resubmissionNotes.length}/1000 characters</span>
          </label>
          <textarea
            rows={4}
            maxLength={1000}
            value={resubmissionNotes}
            onChange={(e) => setResubmissionNotes(e.target.value)}
            placeholder="Explain how each flagged item was addressed (e.g., 'Corrected legal entity name to match registration certificate, updated official corporate website, and verified domain ownership.')."
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
          />
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Resubmission transitions status to <strong className="text-cyan-300">RESUBMITTED</strong> for administrator audit.
            </span>
          </div>

          <Button
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={!detail.resubmissionAllowed || !companyName.trim() || !resubmissionNotes.trim() || isVerified}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold px-8 h-12 shadow-lg shadow-indigo-600/20"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Updated Verification
          </Button>
        </div>
      </div>

      {/* CONFIRM RESUBMISSION MODAL */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => !isSubmitting && setIsConfirmModalOpen(false)}
        title="Confirm Verification Resubmission"
      >
        <div className="space-y-5 p-1">
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 space-y-2">
            <p className="font-semibold text-white">Ready to resubmit verification details?</p>
            <p>
              Your updated company profile and notes will be transferred to the administrator verification queue.
              You will receive an in-app notification once the administrator completes the re-review.
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Organization:</span>
              <span className="font-bold text-white">{companyName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Website:</span>
              <span className="text-slate-300">{companyWebsite || 'None specified'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Location:</span>
              <span className="text-slate-300">{companyLocation || 'None specified'}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResubmit}
              disabled={isSubmitting}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Routing to Queue...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Confirm & Resubmit
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* AUDIT TRAIL MODAL */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Verification Audit Trail — ${detail.recruiterName}`}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {detail.history && detail.history.length > 0 ? (
            <div className="space-y-3">
              {detail.history.map((h, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      {h.action}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatFullDate(h.createdAt)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500 font-mono">Transition: </span>
                    <span className="text-rose-400">{h.previousStatus || 'NONE'}</span>
                    <span className="text-slate-600"> → </span>
                    <span className="text-cyan-400 font-bold">{h.newStatus}</span>
                  </div>
                  {h.rejectionCategory && (
                    <div className="text-xs text-slate-400">
                      <span className="text-slate-500">Category: </span>
                      {h.rejectionCategory}
                    </div>
                  )}
                  {h.rejectionReason && (
                    <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Feedback / Reason</span>
                      {h.rejectionReason}
                    </div>
                  )}
                  {h.resubmissionNotes && (
                    <div className="text-xs text-cyan-300 bg-cyan-950/20 p-2.5 rounded-lg border border-cyan-500/20">
                      <span className="text-cyan-500 block text-[10px] uppercase font-bold">Recruiter Submission Note</span>
                      {h.resubmissionNotes}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Actor: {h.actorName || 'System'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No historical records available.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};
