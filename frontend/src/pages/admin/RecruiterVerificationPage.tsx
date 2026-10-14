import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Globe,
  MapPin,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Users,
  User,
  Search,
  Clock,
  Ban,
  Sparkles,
  RotateCcw,
  History,
  FileText,
  Check,
  Trash2,
  Info,
  ChevronRight,
  AlertCircle,
  Eye,
  ArrowLeft,
  ArrowRight,
  Send,
  HelpCircle,
  Layers
} from 'lucide-react';
import { adminService } from '../../services';
import { useToast } from '../../context/ToastContext';
import {
  RecruiterVerificationItem,
  VerificationStatus,
  AiSuggestionItem,
  VerificationHistoryItem
} from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatFullDate } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import { RecruiterVerificationWorkspaceModal } from '../../components/admin/RecruiterVerificationWorkspaceModal';

const REJECTION_CATEGORIES = [
  'Business registration could not be verified',
  'Company information is incomplete',
  'Corporate email domain could not be verified',
  'Company website could not be verified',
  'Employer identity documents are missing',
  'Submitted documents are inconsistent',
  'Required business information is missing',
  'Uploaded documents are unreadable',
  'Potential duplicate employer account',
  'Other — administrator must specify the reason'
];

export const RecruiterVerificationPage: React.FC = () => {
  const [recruiters, setRecruiters] = useState<RecruiterVerificationItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Decision & Action State
  const [approveConfirm, setApproveConfirm] = useState<RecruiterVerificationItem | null>(null);
  const [suspendItem, setSuspendItem] = useState<RecruiterVerificationItem | null>(null);
  const [deletePermanentItem, setDeletePermanentItem] = useState<RecruiterVerificationItem | null>(null);
  const [reactivateConfirm, setReactivateConfirm] = useState<RecruiterVerificationItem | null>(null);
  const [viewReasonItem, setViewReasonItem] = useState<RecruiterVerificationItem | null>(null);
  const [detailsItem, setDetailsItem] = useState<RecruiterVerificationItem | null>(null);
  const [workspaceStep, setWorkspaceStep] = useState<1 | 2>(1);
  const [workspaceDecision, setWorkspaceDecision] = useState<'APPROVE' | 'REQUEST_EVIDENCE' | 'REJECT' | 'REFER_REVIEW'>('APPROVE');
  const [historyItem, setHistoryItem] = useState<RecruiterVerificationItem | null>(null);
  const [historyList, setHistoryList] = useState<VerificationHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [decisionReason, setDecisionReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Structured Rejection Modal State
  const [rejectItem, setRejectItem] = useState<RecruiterVerificationItem | null>(null);
  const [modalStep, setModalStep] = useState<'form' | 'preview'>('form');
  const [rejectionCategory, setRejectionCategory] = useState<string>(REJECTION_CATEGORIES[0]);
  const [detailedReason, setDetailedReason] = useState<string>('');
  const [evidenceNotes, setEvidenceNotes] = useState<string>('');
  const [correctiveActions, setCorrectiveActions] = useState<string>('');
  const [resubmissionAllowed, setResubmissionAllowed] = useState<boolean>(true);
  const [resubmissionNotes, setResubmissionNotes] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestionItem[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ category?: string; reason?: string }>({});

  // Request Additional Evidence State
  const [requestEvidenceItem, setRequestEvidenceItem] = useState<RecruiterVerificationItem | null>(null);
  const [evidenceCategory, setEvidenceCategory] = useState<string>('Business registration & tax ID documentation');
  const [evidenceReason, setEvidenceReason] = useState<string>('');
  const [evidenceGuidance, setEvidenceGuidance] = useState<string>('');

  // Reopen Verification State
  const [reopenConfirm, setReopenConfirm] = useState<RecruiterVerificationItem | null>(null);

  // In-line checks edit state for Details Workspace
  const [editChecks, setEditChecks] = useState<{
    associationVerified: boolean;
    associationCheckStatus: string;
    registrationCheckStatus: string;
    websiteConsistencyStatus: string;
    reverificationRequired: boolean;
    phoneVerified: boolean;
    independentConfirmationNotes: string;
  }>({
    associationVerified: false,
    associationCheckStatus: 'Pending',
    registrationCheckStatus: 'Pending',
    websiteConsistencyStatus: 'Pending',
    reverificationRequired: false,
    phoneVerified: false,
    independentConfirmationNotes: ''
  });
  const [isSavingChecks, setIsSavingChecks] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<'overview' | 'authenticity' | 'association' | 'aiRisk' | 'history'>('overview');

  const { showToast } = useToast();

  useEffect(() => {
    loadQueue();
  }, [statusFilter]);

  const loadQueue = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getVerificationQueue(statusFilter === 'all' ? undefined : statusFilter);
      setRecruiters(data);
    } catch (err: any) {
      console.error('Failed to load recruiter verification queue', err);
      setError(err?.message || 'Failed to load verification queue from PostgreSQL database.');
    } finally {
      setIsLoading(false);
    }
  };

  const openRejectModal = (item: RecruiterVerificationItem) => {
    setRejectItem(item);
    setModalStep('form');
    setRejectionCategory(item.rejectionCategory || REJECTION_CATEGORIES[0]);
    setDetailedReason('');
    setEvidenceNotes('');
    setCorrectiveActions(item.correctiveActions || '');
    setResubmissionAllowed(item.resubmissionAllowed ?? true);
    setResubmissionNotes(item.resubmissionNotes || '');
    setAiSuggestions([]);
    setAiNotice(null);
    setValidationErrors({});
  };

  const handleGenerateAiSuggestions = async () => {
    if (!rejectItem) return;
    try {
      setIsGeneratingAi(true);
      setAiNotice(null);
      const suggestions = await adminService.generateAiSuggestions(
        rejectItem.recruiterId,
        rejectionCategory,
        detailedReason || 'Verification credentials require administrative clarification.'
      );
      setAiSuggestions(suggestions);
      setAiNotice('AI improvement suggestions generated based on verified profile fields. Please review and refine before submission.');
    } catch (err: any) {
      console.error('AI generation notice', err);
      setAiNotice('AI suggestion service currently utilizing deterministic compliance fallback. You may edit all fields manually.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleRemoveAiSuggestion = (id: string) => {
    setAiSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleValidateFormAndPreview = () => {
    const errors: { category?: string; reason?: string } = {};
    if (!rejectionCategory || !rejectionCategory.trim()) {
      errors.category = 'Rejection category is required.';
    }
    const trimmedReason = detailedReason.trim();
    if (!trimmedReason) {
      errors.reason = 'Detailed rejection reason is required and cannot be whitespace.';
    } else if (trimmedReason.length < 10) {
      errors.reason = 'Detailed reason must be at least 10 characters long to provide actionable guidance.';
    } else if (trimmedReason.length > 2000) {
      errors.reason = 'Detailed reason exceeds maximum length of 2000 characters.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setModalStep('preview');
  };

  const handleConfirmRejection = async () => {
    if (!rejectItem) return;
    try {
      setIsSubmitting(true);
      const updated = await adminService.rejectRecruiter(rejectItem.recruiterId, {
        category: rejectionCategory.trim(),
        reason: detailedReason.trim(),
        correctiveActions: correctiveActions.trim() || undefined,
        aiSuggestions: aiSuggestions.length > 0 ? JSON.stringify(aiSuggestions) : undefined,
        resubmissionAllowed,
        resubmissionNotes: resubmissionNotes.trim() || undefined,
      });

      showToast({
        type: 'info',
        title: 'Verification Declined & Recruiter Notified',
        message: `${updated.recruiterName} (${updated.companyName}) has received the structured decision and corrective instructions.`
      });

      setRejectItem(null);
      loadQueue();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Rejection Failed',
        message: err?.message || 'Failed to persist verification decision.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!approveConfirm) return;
    try {
      setIsSubmitting(true);
      const updated = await adminService.approveRecruiter(approveConfirm.recruiterId);
      showToast({
        type: 'success',
        title: 'Recruiter Verified',
        message: `${updated.recruiterName} (${updated.companyName}) is now authorized to create and publish live job requisitions.`
      });
      setApproveConfirm(null);
      loadQueue();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Approval Failed', message: err?.message || 'Failed to approve recruiter.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendItem) return;
    try {
      setIsSubmitting(true);
      const updated = await adminService.suspendRecruiter(
        suspendItem.recruiterId,
        decisionReason || 'Account suspended by administrator governance.'
      );
      showToast({
        type: 'warning',
        title: 'Recruiter Suspended',
        message: `${updated.recruiterName} (${updated.companyName}) account has been suspended.`
      });
      setSuspendItem(null);
      setDecisionReason('');
      loadQueue();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Suspension Failed', message: err?.message || 'Failed to suspend recruiter.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactivate = async () => {
    if (!reactivateConfirm) return;
    try {
      setIsSubmitting(true);
      const updated = await adminService.reactivateRecruiter(reactivateConfirm.recruiterId);
      showToast({
        type: 'success',
        title: 'Account Reactivated',
        message: `${updated.recruiterName} (${updated.companyName}) account has been reactivated successfully.`
      });
      setReactivateConfirm(null);
      loadQueue();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Reactivation Failed',
        message: err?.message || 'Failed to reactivate recruiter account.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePermanently = async () => {
    if (!deletePermanentItem) return;
    try {
      setIsSubmitting(true);
      await adminService.deleteRejectedRecruiter(deletePermanentItem.recruiterId);
      showToast({
        type: 'success',
        title: 'Application Deleted',
        message: `Rejected application for ${deletePermanentItem.recruiterName} (${deletePermanentItem.companyName}) has been permanently removed.`
      });
      setDeletePermanentItem(null);
      loadQueue();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err?.message || 'Failed to permanently delete rejected application.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWorkspaceModal = (
    item: RecruiterVerificationItem,
    step: 1 | 2 = 1,
    decision: 'APPROVE' | 'REQUEST_EVIDENCE' | 'REJECT' | 'REFER_REVIEW' = 'APPROVE'
  ) => {
    setDetailsItem(item);
    setWorkspaceStep(step);
    setWorkspaceDecision(decision);
  };

  const handleSaveChecks = async () => {
    if (!detailsItem) return;
    try {
      setIsSavingChecks(true);
      const updated = await adminService.updateCompanyChecks(detailsItem.recruiterId, editChecks);
      setDetailsItem(updated);
      setRecruiters((prev) => prev.map((r) => (r.recruiterId === updated.recruiterId ? updated : r)));
      showToast({
        type: 'success',
        title: 'Company Checks Saved',
        message: 'Authenticity, registry verification, and authorization checks updated.'
      });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Update Failed', message: err?.message || 'Failed to save checks.' });
    } finally {
      setIsSavingChecks(false);
    }
  };

  const handleRequestEvidenceSubmit = async () => {
    if (!requestEvidenceItem) return;
    if (!evidenceReason.trim()) {
      showToast({ type: 'warning', title: 'Details Required', message: 'Please specify the exact missing documentation.' });
      return;
    }
    try {
      setIsSubmitting(true);
      const updated = await adminService.requestAdditionalEvidence(requestEvidenceItem.recruiterId, {
        category: evidenceCategory,
        reason: evidenceReason.trim(),
        correctiveActions: evidenceGuidance.trim() || undefined
      });
      showToast({
        type: 'info',
        title: 'Evidence Requested',
        message: `Notification & guidance sent to ${updated.recruiterName}. Account transitioned to Additional Evidence Required.`
      });
      setRequestEvidenceItem(null);
      setEvidenceReason('');
      setEvidenceGuidance('');
      if (detailsItem?.recruiterId === updated.recruiterId) {
        setDetailsItem(updated);
      }
      loadQueue();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Request Failed', message: err?.message || 'Failed to request evidence.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReopenSubmit = async () => {
    if (!reopenConfirm) return;
    try {
      setIsSubmitting(true);
      const updated = await adminService.reopenVerification(reopenConfirm.recruiterId);
      showToast({
        type: 'info',
        title: 'Verification Reopened',
        message: `Verification for ${updated.recruiterName} has been reopened for administrative investigation.`
      });
      setReopenConfirm(null);
      if (detailsItem?.recruiterId === updated.recruiterId) {
        setDetailsItem(updated);
      }
      loadQueue();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Reopen Failed', message: err?.message || 'Failed to reopen verification.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openHistoryModal = async (r: RecruiterVerificationItem) => {
    setHistoryItem(r);
    setIsLoadingHistory(true);
    try {
      const list = await adminService.getRecruiterVerificationHistory(r.recruiterId);
      setHistoryList(list);
    } catch (err) {
      console.error('Failed to load history', err);
      setHistoryList(r.history || []);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success" size="sm" className="bg-emerald-500/15 border-emerald-500/30 text-emerald-300"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified Recruiter</Badge>;
      case 'additional_evidence_required':
        return <Badge variant="outline" size="sm" className="bg-cyan-500/15 border-cyan-500/30 text-cyan-300"><HelpCircle className="w-3.5 h-3.5 mr-1" /> Additional Evidence Required</Badge>;
      case 'in_review':
        return <Badge variant="outline" size="sm" className="bg-blue-500/15 border-blue-500/30 text-blue-300"><Clock className="w-3.5 h-3.5 mr-1" /> In Review</Badge>;
      case 'resubmitted':
        return <Badge variant="warning" size="sm" className="bg-indigo-500/15 border-indigo-500/30 text-indigo-300"><RotateCcw className="w-3.5 h-3.5 mr-1" /> Resubmitted for Review</Badge>;
      case 'rejected':
        return <Badge variant="danger" size="sm" className="bg-rose-500/15 border-rose-500/30 text-rose-300"><XCircle className="w-3.5 h-3.5 mr-1" /> Verification Declined</Badge>;
      case 'suspended':
        return <Badge variant="danger" size="sm" className="bg-amber-500/15 border-amber-500/30 text-amber-300"><Ban className="w-3.5 h-3.5 mr-1" /> Suspended</Badge>;
      case 'unable_to_verify':
        return <Badge variant="outline" size="sm" className="bg-slate-500/15 border-slate-500/30 text-slate-300"><AlertCircle className="w-3.5 h-3.5 mr-1" /> Unable to Verify</Badge>;
      default:
        return <Badge variant="warning" size="sm" className="bg-amber-500/15 border-amber-500/30 text-amber-300"><Clock className="w-3.5 h-3.5 mr-1" /> Verification Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Recruiter Verification Queue</h1>
        <p className="text-xs text-slate-400">
          Enforce enterprise recruitment integrity. Review and authorize company employer accounts before job publishing permissions are granted.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { key: 'pending', label: 'Pending Verification' },
          { key: 'additional_evidence_required', label: 'Additional Evidence Required' },
          { key: 'in_review', label: 'In Review' },
          { key: 'resubmitted', label: 'Resubmitted Applications' },
          { key: 'verified', label: 'Verified Recruiters' },
          { key: 'rejected', label: 'Declined Applications' },
          { key: 'suspended', label: 'Suspended Accounts' },
          { key: 'all', label: 'All Organizations' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === tab.key
                ? 'bg-purple-600 text-white shadow-glow'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={loadQueue}>
            Retry
          </Button>
        </div>
      )}

      {/* Queue Listing */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : recruiters.length === 0 ? (
        <Card className="p-12 text-center bg-slate-900/60 border-slate-800">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No applications in this category</h3>
          <p className="text-xs text-slate-400 mt-1">
            {statusFilter === 'pending'
              ? 'All recruiter verification requests have been reviewed and audited.'
              : `No employer profiles found matching status "${statusFilter}".`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {recruiters.map((r) => (
            <Card
              key={r.recruiterId}
              className={`p-6 bg-slate-900/60 border transition-all ${
                r.verificationStatus === 'resubmitted'
                  ? 'border-indigo-500/40 ring-1 ring-indigo-500/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4 min-w-0">
                  {r.companyLogo ? (
                    <img
                      src={r.companyLogo}
                      alt={r.companyName}
                      className="w-14 h-14 rounded-2xl object-cover bg-slate-800 border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-slate-400" />
                    </div>
                  )}

                  <div className="min-w-0 space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight truncate">
                        {r.companyName}
                      </h3>
                      {getStatusBadge(r.verificationStatus)}
                      {r.resubmittedAt && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          Resubmitted {formatFullDate(r.resubmittedAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="text-purple-300 font-medium">Recruiter: {r.recruiterName}</span>
                      <span className="flex items-center gap-1 font-mono text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {r.recruiterEmail}
                      </span>
                      {r.recruiterPhone && (
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          {r.recruiterPhone}
                        </span>
                      )}
                      {r.website && (
                        <a
                          href={r.website.startsWith('http') ? r.website : `https://${r.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-indigo-400 hover:underline"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Website
                        </a>
                      )}
                    </div>

                    {/* Trust Indicators: Readiness, Risk & Association */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                        Readiness: <strong className="text-white">{r.verificationReadinessStatus || 'Mandatory Check Incomplete'}</strong> ({r.verificationReadinessScore ?? 0}/5)
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg font-bold border ${
                        r.riskLevel === 'HIGH'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : r.riskLevel === 'MEDIUM'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {r.riskLevel || 'LOW'} Risk ({r.riskScore ?? 0}/100)
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg font-medium border ${
                        r.associationVerified
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      }`}>
                        Association: {r.associationVerified ? '✓ Authorized Representative' : (r.associationCheckStatus || 'Pending Check')}
                      </span>
                      {r.businessRegistrationNumber && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                          Reg: {r.businessRegistrationNumber}
                        </span>
                      )}
                    </div>

                    {/* Resubmission Notes Banner if present */}
                    {r.resubmissionNotes && (
                      <div className="text-xs p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 mt-2 max-w-3xl">
                        <div className="flex items-center gap-1.5 font-bold text-[11px] text-indigo-300 uppercase tracking-wider mb-0.5">
                          <RotateCcw className="w-3 h-3" />
                          Recruiter Resubmission Response
                        </div>
                        <p className="text-slate-200 leading-relaxed">{r.resubmissionNotes}</p>
                      </div>
                    )}

                    {/* Rejection / Historical Reason */}
                    {r.rejectionReason && (
                      <div className="text-xs p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 mt-2 max-w-3xl">
                        <div className="flex items-center gap-1.5 font-bold text-[11px] text-rose-400 uppercase tracking-wider mb-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          {r.rejectionCategory ? `Decline Category: ${r.rejectionCategory}` : 'Decline Reason'}
                        </div>
                        <p className="text-rose-200 leading-relaxed">{r.rejectionReason}</p>
                        {r.correctiveActions && (
                          <div className="mt-1.5 pt-1.5 border-t border-rose-500/20 text-[11px] text-rose-300">
                            <span className="font-semibold text-rose-200">Required Action: </span>
                            {r.correctiveActions}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Review attribution */}
                    {r.verifiedBy && (
                      <div className="text-[11px] text-slate-500 pt-1 font-mono">
                        Audited by: <span className="text-slate-300">{r.verifiedBy}</span>
                        {r.verifiedAt && <span> on {formatFullDate(r.verifiedAt)}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Governance Action Buttons */}
                <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800 min-w-[200px]">
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-bold"
                      onClick={() => openWorkspaceModal(r)}
                    >
                      Workspace
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openHistoryModal(r)}
                      className="text-xs text-slate-400 hover:text-white"
                      title="View Verification Audit Trail"
                    >
                      <History className="w-3.5 h-3.5 mr-1" />
                      History
                    </Button>
                  </div>

                  {/* PENDING, IN_REVIEW, RESUBMITTED, ADDITIONAL_EVIDENCE_REQUIRED */}
                  {(r.verificationStatus === 'pending' ||
                    r.verificationStatus === 'resubmitted' ||
                    r.verificationStatus === 'in_review' ||
                    r.verificationStatus === 'additional_evidence_required') && (
                    <>
                      <Button
                        variant="glow"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                        onClick={() => openWorkspaceModal(r, 2, 'APPROVE')}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Approve Recruiter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
                        onClick={() => openWorkspaceModal(r, 2, 'REQUEST_EVIDENCE')}
                      >
                        <HelpCircle className="w-3.5 h-3.5 mr-1" />
                        Request Evidence
                      </Button>
                      <Button
                        id={`reject-btn-${r.recruiterId}`}
                        variant="outline"
                        size="sm"
                        className="border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
                        onClick={() => openWorkspaceModal(r, 2, 'REJECT')}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Reject Application
                      </Button>
                    </>
                  )}

                  {/* VERIFIED: Suspend Recruiter or Reopen */}
                  {r.verificationStatus === 'verified' && (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSuspendItem(r);
                          setDecisionReason('');
                        }}
                      >
                        Suspend Recruiter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                        onClick={() => setReopenConfirm(r)}
                      >
                        Reopen for Review
                      </Button>
                    </>
                  )}

                  {/* REJECTED: Reopen, Edit Decision, Delete permanently */}
                  {r.verificationStatus === 'rejected' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10"
                        onClick={() => openWorkspaceModal(r, 2, 'REFER_REVIEW')}
                      >
                        Reopen for Review
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openWorkspaceModal(r, 2, 'REJECT')}
                      >
                        Edit Decision
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="bg-rose-700/80 hover:bg-rose-700 text-white font-semibold"
                        onClick={() => setDeletePermanentItem(r)}
                      >
                        Delete Permanently
                      </Button>
                    </>
                  )}

                  {/* SUSPENDED: Reactivate or Reopen */}
                  {r.verificationStatus === 'suspended' && (
                    <>
                      <Button
                        variant="glow"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                        onClick={() => setReactivateConfirm(r)}
                      >
                        Reactivate Account
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                        onClick={() => setReopenConfirm(r)}
                      >
                        Reopen for Review
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* APPROVE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={!!approveConfirm}
        onClose={() => setApproveConfirm(null)}
        onConfirm={handleApprove}
        title="Authorize Recruiter Organization"
        message={`Approve ${approveConfirm?.recruiterName} representing ${approveConfirm?.companyName}? This grants immediate authorization to create and publish live job requisitions on the platform.`}
        confirmText="Approve Recruiter"
        variant="primary"
        isLoading={isSubmitting}
      />

      {/* ========================================================
          1. PREMIUM ADMIN REJECTION INTERFACE MODAL
          ======================================================== */}
      {rejectItem && (
        <Modal
          isOpen={!!rejectItem}
          onClose={() => setRejectItem(null)}
          maxWidth="3xl"
        >
          <div className="bg-[#0B1120] text-slate-100 p-6 -m-6 rounded-2xl space-y-6">
            {/* Modal Header */}
            <div className="border-b border-slate-800 pb-4 flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
                  RECRUITER VERIFICATION
                </span>
                <h2 className="text-xl font-bold text-white mt-1">Review Verification Decision</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Document the verification decision and provide actionable guidance to help the recruiter resolve outstanding issues.
                </p>
              </div>
              <button
                type="button"
                id="close-reject-modal-btn"
                onClick={() => setRejectItem(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Real Entity Identity Card */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-slate-400 font-semibold">Company Name</p>
                <p className="font-bold text-white mt-0.5 truncate">{rejectItem.companyName}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Recruiter Name</p>
                <p className="font-bold text-white mt-0.5 truncate">{rejectItem.recruiterName}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Registered Email</p>
                <p className="font-mono text-cyan-300 mt-0.5 truncate">{rejectItem.recruiterEmail}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Application ID</p>
                <p className="font-mono text-slate-400 mt-0.5 truncate">{rejectItem.recruiterId}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Current Status</p>
                <div className="mt-0.5">
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border',
                      rejectItem.verificationStatus === 'verified' && 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                      rejectItem.verificationStatus === 'resubmitted' && 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
                      rejectItem.verificationStatus === 'rejected' && 'bg-rose-500/15 text-rose-300 border-rose-500/30',
                      rejectItem.verificationStatus === 'suspended' && 'bg-rose-500/15 text-rose-300 border-rose-500/30',
                      rejectItem.verificationStatus === 'pending' && 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    )}
                  >
                    {rejectItem.verificationStatus}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Submission Date</p>
                <p className="text-slate-300 mt-0.5">
                  {rejectItem.createdAt ? formatFullDate(rejectItem.createdAt) : 'Registered Date N/A'}
                </p>
              </div>
            </div>

            {/* STEP 1: STRUCTURED FORM */}
            {modalStep === 'form' && (
              <div className="space-y-5">
                {/* Rejection Category (Required) */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
                    Rejection Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="rejection-category-select"
                    className={`w-full bg-slate-900 border rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer ${
                      validationErrors.category ? 'border-rose-500' : 'border-slate-700'
                    }`}
                    value={rejectionCategory}
                    onChange={(e) => {
                      setRejectionCategory(e.target.value);
                      if (validationErrors.category) {
                        setValidationErrors((prev) => ({ ...prev, category: undefined }));
                      }
                    }}
                  >
                    {REJECTION_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {validationErrors.category && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.category}
                    </p>
                  )}
                </div>

                {/* Detailed Rejection Reason (Required) */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Detailed Rejection Reason <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {detailedReason.length}/2000 characters
                    </span>
                  </div>
                  <textarea
                    id="detailed-rejection-reason-textarea"
                    className={`w-full h-28 bg-slate-900 border rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      validationErrors.reason ? 'border-rose-500' : 'border-slate-700'
                    }`}
                    placeholder="Provide a specific, professional explanation of the issue encountered during verification review..."
                    value={detailedReason}
                    maxLength={2000}
                    onChange={(e) => {
                      setDetailedReason(e.target.value);
                      if (validationErrors.reason) {
                        setValidationErrors((prev) => ({ ...prev, reason: undefined }));
                      }
                    }}
                  />
                  {validationErrors.reason && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.reason}
                    </p>
                  )}
                </div>

                {/* Optional Fields Accordion / Panel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Evidence or Verification Notes <span className="text-slate-500 font-normal">(Optional internal audit)</span>
                    </label>
                    <textarea
                      id="evidence-notes-textarea"
                      className="w-full h-20 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g. Looked up entity in Delaware corporate registry on 2026-10-13; corporate license is inactive."
                      value={evidenceNotes}
                      onChange={(e) => setEvidenceNotes(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Required Corrective Actions <span className="text-slate-500 font-normal">(Optional actionable steps)</span>
                    </label>
                    <textarea
                      id="corrective-actions-textarea"
                      className="w-full h-20 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g. Upload a clear, uncropped copy of the Certificate of Good Standing or verified state tax filing."
                      value={correctiveActions}
                      onChange={(e) => setCorrectiveActions(e.target.value)}
                    />
                  </div>
                </div>

                {/* Resubmission Toggle */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="resubmissionCheck"
                      checked={resubmissionAllowed}
                      onChange={(e) => setResubmissionAllowed(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                    />
                    <div>
                      <label htmlFor="resubmissionCheck" className="text-xs font-bold text-white cursor-pointer">
                        Permit Employer Corrections & Resubmission
                      </label>
                      <p className="text-[11px] text-slate-400">
                        When enabled, the recruiter can update their profile in the Verification & Improvement Centre and submit for re-review.
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI-Assisted Improvement Suggestions Section */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        AI-Assisted Improvement Guidance
                      </h4>
                    </div>
                    <Button
                      id="generate-ai-suggestions-btn"
                      variant="outline"
                      size="sm"
                      className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 text-xs"
                      onClick={handleGenerateAiSuggestions}
                      isLoading={isGeneratingAi}
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Generate Improvement Suggestions
                    </Button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    AI analyzes authorized verification fields and company profile data to generate structured recommendations.
                    All suggestions must be reviewed and approved by the administrator before transmission.
                  </p>

                  {aiNotice && (
                    <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>{aiNotice}</span>
                    </div>
                  )}

                  {/* Suggestion Cards */}
                  {aiSuggestions.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                        Active Suggestions ({aiSuggestions.length}) — Click Trash to exclude
                      </span>
                      {aiSuggestions.map((s, idx) => (
                        <div
                          key={s.id || idx}
                          className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                AI-Assisted Recommendation #{idx + 1}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                Admin Review Required
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveAiSuggestion(s.id)}
                              className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                              title="Exclude this suggestion"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-slate-400 font-semibold">Identified Issue</p>
                              <p className="text-white font-medium mt-0.5">{s.issue}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-semibold">Recommended Correction</p>
                              <p className="text-slate-200 mt-0.5">{s.recommendedAction}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-semibold">Required Supporting Information</p>
                              <p className="text-slate-300 mt-0.5">{s.requiredDocumentOrInfo}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-semibold">Profile Correction Guidance</p>
                              <p className="text-slate-300 mt-0.5">{s.profileCorrectionInstructions}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                  <Button variant="secondary" onClick={() => setRejectItem(null)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button
                    id="preview-decision-btn"
                    variant="glow"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                    onClick={handleValidateFormAndPreview}
                  >
                    Preview Decision Summary
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: VERIFICATION DECISION SUMMARY PREVIEW */}
            {modalStep === 'preview' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-rose-400" />
                      <h3 className="font-bold text-white text-sm">VERIFICATION DECISION SUMMARY</h3>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      Pending Administrator Authorization
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400">Employer Organization</p>
                      <p className="font-bold text-white mt-0.5">{rejectItem.companyName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Recruiter Recipient</p>
                      <p className="font-bold text-white mt-0.5">{rejectItem.recruiterName} &lt;{rejectItem.recruiterEmail}&gt;</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400">Selected Rejection Category</p>
                      <p className="font-semibold text-rose-300 mt-0.5">{rejectionCategory}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400">Detailed Explanation</p>
                      <p className="text-slate-200 mt-0.5 p-3 rounded-lg bg-slate-950 border border-slate-800 whitespace-pre-wrap">
                        {detailedReason}
                      </p>
                    </div>
                    {correctiveActions && (
                      <div className="col-span-2">
                        <p className="text-slate-400">Required Corrective Actions</p>
                        <p className="text-slate-200 mt-0.5 p-3 rounded-lg bg-slate-950 border border-slate-800">
                          {correctiveActions}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-slate-400">Resubmission Permitted?</p>
                      <p className="font-bold text-white mt-0.5">
                        {resubmissionAllowed ? 'Yes — Employer may submit updated verification' : 'No — Account locked from resubmission'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">AI Improvement Suggestions Attached</p>
                      <p className="font-bold text-white mt-0.5">{aiSuggestions.length} structured suggestion(s)</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2.5">
                    <Send className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-indigo-300">Notification Dispatch Notice: </span>
                      <span>
                        Upon confirmation, a persistent in-app notification will be recorded in PostgreSQL for {rejectItem.recruiterName}.
                        The recruiter will be directed to their Verification & Improvement Centre at <code className="font-mono text-indigo-300">/recruiter/verification</code>.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <Button
                    id="edit-decision-btn"
                    variant="secondary"
                    onClick={() => setModalStep('form')}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    Edit Decision
                  </Button>
                  <Button
                    id="confirm-reject-btn"
                    variant="danger"
                    className="bg-rose-700 hover:bg-rose-600 text-white font-bold px-6 shadow-glow"
                    onClick={handleConfirmRejection}
                    isLoading={isSubmitting}
                  >
                    Reject Verification & Notify Recruiter
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* SUSPEND MODAL */}
      <Modal
        isOpen={!!suspendItem}
        onClose={() => setSuspendItem(null)}
        title="Suspend Recruiter Account"
        description="Suspension revokes job publishing and requisition management permissions."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Suspension Reason
            </label>
            <textarea
              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="e.g. Terms of service violation, unauthenticated job postings, or fraudulent listings."
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSuspendItem(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleSuspend}
              isLoading={isSubmitting}
            >
              Confirm Suspension
            </Button>
          </div>
        </div>
      </Modal>

      {/* INTELLIGENT RECRUITER VERIFICATION WORKSPACE 2.0 */}
      <RecruiterVerificationWorkspaceModal
        isOpen={!!detailsItem}
        onClose={() => setDetailsItem(null)}
        item={detailsItem}
        initialStep={workspaceStep}
        initialDecision={workspaceDecision}
        onSuccess={() => {
          setDetailsItem(null);
          loadQueue();
        }}
      />

      {/* REQUEST ADDITIONAL EVIDENCE MODAL */}
      <Modal
        isOpen={!!requestEvidenceItem}
        onClose={() => setRequestEvidenceItem(null)}
        title={`Request Evidence: ${requestEvidenceItem?.companyName || ''}`}
        description="Provide clear corrective guidance to the recruiter detailing the missing documents or corporate information required to complete verification."
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
              Evidence Category
            </label>
            <select
              value={evidenceCategory}
              onChange={(e) => setEvidenceCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="Business registration & tax ID documentation">Business registration & tax ID documentation</option>
              <option value="Proof of recruiter-company authorization">Proof of recruiter-company authorization (letterhead / contract)</option>
              <option value="Corporate domain email verification">Corporate domain email verification</option>
              <option value="Company website and physical presence confirmation">Company website and physical presence confirmation</option>
              <option value="Employer identity verification">Employer identity verification</option>
              <option value="Other additional supporting documentation">Other additional supporting documentation</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
              Required Information / Reason Stated <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={evidenceReason}
              onChange={(e) => setEvidenceReason(e.target.value)}
              placeholder="e.g. Please provide your corporate business registration number or upload an authorized representation certificate."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
              Corrective Guidance & Resubmission Instructions
            </label>
            <textarea
              rows={3}
              value={evidenceGuidance}
              onChange={(e) => setEvidenceGuidance(e.target.value)}
              placeholder="e.g. Log in to the Recruiter Verification Center, navigate to Company Credentials, enter the valid registration number and tax ID, then click Resubmit."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="secondary" onClick={() => setRequestEvidenceItem(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRequestEvidenceSubmit}
              isLoading={isSubmitting}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
            >
              Send Request to Recruiter
            </Button>
          </div>
        </div>
      </Modal>

      {/* REOPEN VERIFICATION CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={!!reopenConfirm}
        onClose={() => setReopenConfirm(null)}
        onConfirm={handleReopenSubmit}
        title="Reopen Recruiter Verification"
        message={`Reopen verification record for ${reopenConfirm?.recruiterName} (${reopenConfirm?.companyName})? The account will transition to 'In Review' status, and previous published jobs will be subjected to compliance review.`}
        confirmText="Reopen for Investigation"
        variant="primary"
        isLoading={isSubmitting}
      />

      {/* VERIFICATION HISTORY MODAL */}
      <Modal
        isOpen={!!historyItem}
        onClose={() => setHistoryItem(null)}
        title={`Verification History: ${historyItem?.companyName || ''}`}
        description="Chronological record of verification reviews, decisions, and recruiter resubmissions."
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs max-h-[65vh] overflow-y-auto">
          {isLoadingHistory ? (
            <div className="p-8 text-center text-slate-400">Loading audit history...</div>
          ) : historyList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <History className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No historical decision events recorded yet for this organization.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyList.map((h, idx) => (
                <div key={h.id || idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {h.previousStatus ? `${h.previousStatus.toUpperCase()} → ` : ''}
                        <strong className="text-white">{h.newStatus.toUpperCase()}</strong>
                      </span>
                      {h.actorName && (
                        <span className="text-slate-400">by <strong className="text-slate-200">{h.actorName}</strong></span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {h.createdAt ? formatFullDate(h.createdAt) : ''}
                    </span>
                  </div>

                  {h.rejectionCategory && (
                    <p className="text-rose-300 font-semibold">
                      Category: {h.rejectionCategory}
                    </p>
                  )}

                  {h.decisionReason && (
                    <p className="text-slate-300 whitespace-pre-wrap bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      {h.decisionReason}
                    </p>
                  )}

                  {h.recruiterNotes && (
                    <div className="bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-500/20 text-indigo-200">
                      <span className="font-bold text-[11px] block text-indigo-300">Recruiter Notes:</span>
                      {h.recruiterNotes}
                    </div>
                  )}

                  {h.correctiveActions && (
                    <p className="text-amber-300 text-[11px]">
                      Required Corrections: {h.correctiveActions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <Button variant="secondary" onClick={() => setHistoryItem(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* VIEW REJECTION REASON MODAL */}
      <Modal
        isOpen={!!viewReasonItem}
        onClose={() => setViewReasonItem(null)}
        title="Verification Decision Details"
        description="Reason and notes provided during administrator audit."
      >
        {viewReasonItem && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <p className="text-slate-400 font-semibold">Organization</p>
              <p className="text-sm font-bold text-white">{viewReasonItem.companyName}</p>
              <p className="text-slate-400 font-semibold pt-2">Reason Stated</p>
              <p className="text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                {viewReasonItem.rejectionReason}
              </p>
              {viewReasonItem.correctiveActions && (
                <>
                  <p className="text-slate-400 font-semibold pt-2">Corrective Actions</p>
                  <p className="text-amber-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    {viewReasonItem.correctiveActions}
                  </p>
                </>
              )}
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setViewReasonItem(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* REACTIVATE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={!!reactivateConfirm}
        onClose={() => setReactivateConfirm(null)}
        onConfirm={handleReactivate}
        title="Reactivate Recruiter Account"
        message={`Reactivate account for ${reactivateConfirm?.recruiterName} (${reactivateConfirm?.companyName})? This restores full access to the platform.`}
        confirmText="Reactivate Account"
        variant="primary"
        isLoading={isSubmitting}
      />

      {/* PERMANENT DELETION MODAL */}
      <ConfirmDialog
        isOpen={!!deletePermanentItem}
        onClose={() => setDeletePermanentItem(null)}
        onConfirm={handleDeletePermanently}
        title="Permanently Delete Rejected Application"
        message={`Are you sure you want to permanently delete ${deletePermanentItem?.recruiterName} (${deletePermanentItem?.companyName}) from the platform? This action cannot be undone.`}
        confirmText="Delete Permanently"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};
