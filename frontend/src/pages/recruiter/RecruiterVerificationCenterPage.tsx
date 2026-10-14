import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  Building2,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  FileText,
  Globe,
  MapPin,
  Briefcase,
  Users,
  Send,
  History,
  Info,
  ExternalLink,
  Edit3,
  AlertCircle,
  Copy,
  Check,
  UserCheck,
  Award,
  Link as LinkIcon,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { recruiterApi } from '../../services/api/recruiterApi';
import { RecruiterVerificationDetail } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../utils/cn';
import { formatFullDate } from '../../utils/formatters';

type ChecklistItemStatus = 'Action Required' | 'In Progress' | 'Completed';

interface FormValidationErrors {
  companyName?: string;
  companyWebsite?: string;
  officialEmailDomain?: string;
  authorizationDocumentUrl?: string;
  resubmissionNotes?: string;
}

export const RecruiterVerificationCenterPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [detail, setDetail] = useState<RecruiterVerificationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCopiedId, setHasCopiedId] = useState(false);

  // Edit fields (Form state)
  const [companyName, setCompanyName] = useState('');
  const [recruiterTitle, setRecruiterTitle] = useState('');
  const [recruiterPhone, setRecruiterPhone] = useState('');
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

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({});
  const [isFormDirty, setIsFormDirty] = useState(false);

  // AI checklist items tracker
  const [suggestionStatuses, setSuggestionStatuses] = useState<Record<number, ChecklistItemStatus>>({});

  // Modals
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await recruiterApi.getVerificationDetail();
      setDetail(data);

      setCompanyName(data.companyName || data.company?.name || '');
      setRecruiterTitle(data.recruiterTitle || data.title || user?.title || '');
      setRecruiterPhone(data.recruiterPhone || data.phone || user?.phone || '');
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
      setIsFormDirty(false);

      if (data.aiSuggestions && Array.isArray(data.aiSuggestions) && data.aiSuggestions.length > 0) {
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
  }, [user]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty]);

  const handleCopyAccountId = (idToCopy: string) => {
    if (!idToCopy) return;
    navigator.clipboard.writeText(idToCopy).then(() => {
      setHasCopiedId(true);
      setTimeout(() => setHasCopiedId(false), 2200);
    });
  };

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

  const validateForm = (): boolean => {
    const errors: FormValidationErrors = {};

    if (!companyName.trim()) {
      errors.companyName = 'Legal organization name is required.';
    }

    if (companyWebsite.trim()) {
      try {
        const parsed = new URL(companyWebsite.trim());
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          errors.companyWebsite = 'Website must use http:// or https:// protocol.';
        }
      } catch {
        errors.companyWebsite = 'Please enter a valid website URL (e.g. https://company.com).';
      }
    }

    if (officialEmailDomain.trim()) {
      const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      const cleaned = officialEmailDomain.trim().replace(/^@/, '');
      if (!domainPattern.test(cleaned)) {
        errors.officialEmailDomain = 'Enter a valid domain name (e.g. company.com).';
      }
    }

    if (authorizationDocumentUrl.trim()) {
      try {
        const parsed = new URL(authorizationDocumentUrl.trim());
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          errors.authorizationDocumentUrl = 'URL must start with http:// or https://';
        }
      } catch {
        errors.authorizationDocumentUrl = 'Please enter a valid document link URL.';
      }
    }

    if (!resubmissionNotes.trim()) {
      errors.resubmissionNotes = 'Please explain what changes or clarifications you are submitting.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenResubmitModal = () => {
    if (validateForm()) {
      setIsConfirmModalOpen(true);
    } else {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please resolve the highlighted field errors before resubmitting.'
      });
    }
  };

  const handleResubmit = async () => {
    if (!validateForm()) {
      setIsConfirmModalOpen(false);
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await recruiterApi.resubmitVerification({
        name: companyName.trim(),
        title: recruiterTitle.trim(),
        contactPhone: recruiterPhone.trim(),
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
        officialEmailDomain: officialEmailDomain.trim().replace(/^@/, ''),
        authorizationDocumentUrl: authorizationDocumentUrl.trim(),
        authorizationNotes: authorizationNotes.trim(),
        verificationDocumentUrl: verificationDocumentUrl.trim(),
        verificationEvidenceNotes: verificationEvidenceNotes.trim(),
        recruiterNotes: resubmissionNotes.trim(),
        resubmissionNotes: resubmissionNotes.trim()
      });

      setDetail(updated);
      setIsConfirmModalOpen(false);
      setIsFormDirty(false);
      showToast({
        type: 'success',
        title: 'Verification Resubmitted',
        message: 'Your corrected verification details and association evidence have been routed to compliance.'
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
        <p className="text-xs text-slate-500">Querying platform compliance records</p>
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

  // Canonical Status Mapping
  const rawStatus = (detail.verificationStatus || '').toLowerCase();
  const isVerified = rawStatus === 'verified';
  const isAdditionalEvidence = rawStatus === 'additional_evidence_required';
  const isRejected = rawStatus === 'rejected';
  const isSuspended = rawStatus === 'suspended';
  const isResubmitted = rawStatus === 'resubmitted';
  const isUnderReview = rawStatus === 'in_review' || isResubmitted;
  const isPending = rawStatus === 'pending';
  const isUnableToVerify = rawStatus === 'unable_to_verify';

  // Resolved Display Badge for Overall Verification Status
  const getOverallStatusDisplay = () => {
    if (isVerified) return { label: 'Verified', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' };
    if (isAdditionalEvidence) return { label: 'Additional Information Required', color: 'bg-amber-500/15 text-amber-300 border-amber-500/40' };
    if (isUnderReview) return { label: 'Under Review', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40' };
    if (isRejected) return { label: 'Rejected', color: 'bg-rose-500/15 text-rose-300 border-rose-500/40' };
    if (isSuspended) return { label: 'Suspended', color: 'bg-rose-500/15 text-rose-300 border-rose-500/40' };
    if (isUnableToVerify) return { label: 'Unable to Verify', color: 'bg-amber-500/15 text-amber-300 border-amber-500/40' };
    return { label: 'Pending Review', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40' };
  };

  const overallBadge = getOverallStatusDisplay();

  // Verification Pillars (Recruiter Identity, Company Authenticity, Company Association)
  // 1. Recruiter Identity
  const getIdentityPillar = () => {
    if (isVerified) return { status: 'Verified', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (isRejected || isSuspended) return { status: isSuspended ? 'Suspended' : 'Rejected', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    if (detail.emailVerified || user?.emailVerified) return { status: 'Under Review', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
    return { status: 'Pending Review', color: 'text-slate-400 bg-slate-800/60 border-slate-700/60' };
  };

  // 2. Company Authenticity
  const getAuthenticityPillar = () => {
    const regCheck = (detail.company?.registrationCheckStatus || detail.registrationCheckStatus || '').toUpperCase();
    if (isVerified || regCheck === 'VERIFIED') {
      return { status: 'Verified', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    }
    if (regCheck === 'DISCREPANCY') {
      return { status: 'Discrepancy Flagged', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    }
    if (regCheck === 'UNABLE_TO_VERIFY') {
      return { status: 'Unable to Verify', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    }
    if (isUnderReview) {
      return { status: 'Under Review', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
    }
    return { status: 'Pending Review', color: 'text-slate-400 bg-slate-800/60 border-slate-700/60' };
  };

  // 3. Company Association
  const getAssociationPillar = () => {
    const assocCheck = (detail.company?.associationCheckStatus || detail.associationCheckStatus || '').toUpperCase();
    const isAssocVerified = Boolean(detail.company?.associationVerified || detail.associationVerified);
    const hasEvidence = Boolean(detail.company?.officialEmailDomain || detail.officialEmailDomain || detail.company?.authorizationDocumentUrl || detail.authorizationDocumentUrl);

    if (isVerified || isAssocVerified || assocCheck === 'AUTHORIZED') {
      return { status: 'Verified', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    }
    if (assocCheck === 'REJECTED') {
      return { status: 'Rejected', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    }
    if (isAdditionalEvidence || assocCheck === 'UNRESOLVED') {
      return { status: 'Additional Evidence Required', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    }
    if (!hasEvidence) {
      return { status: 'Not Submitted', color: 'text-slate-500 bg-slate-800/40 border-slate-700/40' };
    }
    if (isUnderReview) {
      return { status: 'Under Review', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
    }
    return { status: 'Pending Review', color: 'text-slate-400 bg-slate-800/60 border-slate-700/60' };
  };

  const identityPillar = getIdentityPillar();
  const authenticityPillar = getAuthenticityPillar();
  const associationPillar = getAssociationPillar();

  // Last Updated Date Calculation (strictly non-fabricated)
  const lastUpdatedDisplay = detail.updatedAt || detail.resubmittedAt || detail.verifiedAt
    ? formatFullDate(detail.updatedAt || detail.resubmittedAt || detail.verifiedAt)
    : null;

  const hasFeedback = Boolean(
    detail.rejectionReason || detail.rejectionCategory || detail.correctiveActions
  );

  return (
    <div className="space-y-7 pb-16 max-w-6xl mx-auto">
      {/* 2. PROFESSIONAL PAGE HEADER */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 bg-[#0b1220]/95 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Verification & Improvement Centre
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Manage your professional identity, company credentials, and verification requirements.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {detail.history && detail.history.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setIsHistoryModalOpen(true)}
                className="bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white text-xs h-9 px-3.5"
              >
                <History className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                Audit Trail ({detail.history.length})
              </Button>
            )}
            <Button
              variant="outline"
              onClick={fetchDetail}
              className="bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white text-xs h-9 px-3"
              title="Refresh status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Compact Information Row */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
              APP-REF #{detail.recruiterId}
            </span>
            <span className={cn('px-3 py-0.5 rounded-full font-semibold border text-[11px]', overallBadge.color)}>
              {overallBadge.label}
            </span>
          </div>

          <div className="font-mono text-[11px] text-slate-400">
            {lastUpdatedDisplay ? (
              <span>Last Updated: <strong className="text-slate-300 font-semibold">{lastUpdatedDisplay}</strong></span>
            ) : (
              <span className="text-slate-500">Last Updated: Awaiting initial sync</span>
            )}
          </div>
        </div>
      </div>

      {/* 6. REDESIGNED VERIFICATION STATUS SUMMARY */}
      <div className="bg-[#0b1220]/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              Verification Status Summary
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Authoritative review findings across all three employer trust pillars
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {isVerified ? 'All checks approved' : 'Compliance review in progress'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Pillar A */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">A. Recruiter Identity</span>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md border', identityPillar.color)}>
                {identityPillar.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Recruiter email and professional credentials confirmation.
            </p>
          </div>

          {/* Pillar B */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">B. Company Authenticity</span>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md border', authenticityPillar.color)}>
                {authenticityPillar.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Official corporate presence and business registration check.
            </p>
          </div>

          {/* Pillar C */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">C. Company Association</span>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md border', associationPillar.color)}>
                {associationPillar.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Authorization proof linking the recruiter to the organization.
            </p>
          </div>
        </div>

        {!isVerified && (
          <div className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 flex items-start gap-2.5">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              All three verification checks are reviewed by platform administrators. Full job publishing and candidate pipeline capabilities remain protected until verification is complete.
            </span>
          </div>
        )}
      </div>

      {/* 3. RECRUITER PROFESSIONAL PROFILE SECTION */}
      <div className="bg-[#0b1220]/90 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Recruiter Professional Profile
              </h2>
              <p className="text-xs text-slate-400">
                Primary identity and account details linked to this recruitment portal
              </p>
            </div>
          </div>

          {detail.resubmissionAllowed && !isVerified && (
            <a
              href="#corrections-form"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              Edit Profile
            </a>
          )}
        </div>

        {/* Balanced Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name & Designation Header Card */}
          <div className="md:col-span-2 bg-gradient-to-r from-slate-900/90 to-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-base shrink-0">
              {(detail.recruiterName || 'R').charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                Primary Account Holder
              </span>
              <h3 className="text-lg font-bold text-white">
                {detail.recruiterName || user?.name || 'Recruiter'}
              </h3>
              <p className="text-xs text-slate-400">
                {detail.recruiterTitle || detail.title || user?.title || 'Talent Acquisition / Recruiter'}
              </p>
            </div>
          </div>

          {/* Registered Email */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Registered Email</span>
            <div className="text-sm font-semibold text-white flex items-center justify-between">
              <span className="truncate">{detail.recruiterEmail || detail.email || user?.email || 'Not provided'}</span>
              <span className="text-[10px] text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Confirmed
              </span>
            </div>
          </div>

          {/* Phone Number */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Phone Number</span>
            <div className="text-sm font-semibold text-white">
              {detail.recruiterPhone || detail.phone || user?.phone || 'Not provided'}
            </div>
          </div>

          {/* Company Name */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Company Name</span>
            <div className="text-sm font-semibold text-white">
              {detail.company?.name || detail.companyName || user?.companyName || 'Not provided'}
            </div>
          </div>

          {/* Department */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Department</span>
            <div className="text-sm font-semibold text-slate-300">
              {detail.department || 'Not provided'}
            </div>
          </div>

          {/* Professional Profile URL */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Professional Profile URL</span>
            <div className="text-sm font-semibold text-slate-300 truncate">
              {detail.professionalProfileUrl ? (
                <a
                  href={detail.professionalProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1.5"
                >
                  <span className="truncate">{detail.professionalProfileUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                'Not provided'
              )}
            </div>
          </div>

          {/* Account ID with Copy Button */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Account ID</span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-300 truncate">
                {detail.recruiterId || user?.id}
              </span>
              <button
                type="button"
                onClick={() => handleCopyAccountId(detail.recruiterId || user?.id || '')}
                className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 transition-colors shrink-0"
                title="Copy Account ID"
              >
                {hasCopiedId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CLEAR COMPANY IDENTITY SECTION */}
      <div className="bg-[#0b1220]/90 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Company Information
              </h2>
              <p className="text-xs text-slate-400">
                Legal organization credentials and public profile information
              </p>
            </div>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {detail.company?.verified ? 'Verified Employer' : 'Pending Verification'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Legal Organization Name */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1 md:col-span-2">
            <span className="text-[11px] font-medium text-slate-400">Legal Organization Name</span>
            <div className="text-sm font-semibold text-white">
              {detail.company?.name || detail.companyName || 'Not provided'}
            </div>
          </div>

          {/* Official Company Website */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1 md:col-span-2">
            <span className="text-[11px] font-medium text-slate-400">Official Company Website</span>
            <div className="text-sm font-semibold text-cyan-400 truncate">
              {detail.company?.website ? (
                <a
                  href={detail.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span className="truncate">{detail.company.website}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-slate-400 font-normal">Not provided</span>
              )}
            </div>
          </div>

          {/* Industry / Sector */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Industry / Sector</span>
            <div className="text-sm font-semibold text-slate-200">
              {detail.company?.industry || 'Not provided'}
            </div>
          </div>

          {/* Headquarters / Location */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Headquarters / Location</span>
            <div className="text-sm font-semibold text-slate-200">
              {detail.company?.location || 'Not provided'}
            </div>
          </div>

          {/* Organization Size */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Organization Size</span>
            <div className="text-sm font-semibold text-slate-200">
              {detail.company?.size || 'Not provided'}
            </div>
          </div>

          {/* Recruiter Corporate Email */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Recruiter Corporate Email</span>
            <div className="text-sm font-semibold text-slate-200 truncate">
              {detail.recruiterEmail || detail.email || user?.email || 'Not provided'}
            </div>
          </div>

          {/* Business Registration Number */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1 md:col-span-2">
            <span className="text-[11px] font-medium text-slate-400">Business Registration Number</span>
            <div className="text-sm font-mono text-slate-200">
              {detail.company?.businessRegistrationNumber || 'Not provided'}
            </div>
          </div>

          {/* Tax Identification Number */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1 md:col-span-2">
            <span className="text-[11px] font-medium text-slate-400">Tax Identification Number (TIN / EIN / VAT)</span>
            <div className="text-sm font-mono text-slate-200">
              {detail.company?.taxId || 'Not provided'}
            </div>
          </div>
        </div>
      </div>

      {/* 5. COMPACT COMPANY ASSOCIATION SECTION */}
      <div className="bg-[#0b1220]/90 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Proof of Company Association
              </h2>
              <p className="text-xs text-slate-400">
                Verification evidence establishing recruiter authorization to represent this employer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Evidence Status:</span>
            <span className={cn('text-[11px] font-bold px-2.5 py-0.5 rounded-full border', associationPillar.color)}>
              {associationPillar.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Corporate Email Domain */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Corporate Email Domain</span>
            <div className="text-sm font-mono text-slate-200">
              {detail.company?.officialEmailDomain || 'Not provided'}
            </div>
            <p className="text-[10px] text-slate-500">Official domain associated with organizational email</p>
          </div>

          {/* Recruiter Designation */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Recruiter Designation</span>
            <div className="text-sm font-semibold text-slate-200">
              {detail.recruiterTitle || detail.title || user?.title || 'Not provided'}
            </div>
            <p className="text-[10px] text-slate-500">Official recruitment title declared to state authorities</p>
          </div>

          {/* Authorization Letter or Evidence URL */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1 md:col-span-2">
            <span className="text-[11px] font-medium text-slate-400">Company Authorization Evidence</span>
            <div className="text-sm font-semibold text-cyan-400">
              {detail.company?.authorizationDocumentUrl ? (
                <a
                  href={detail.company.authorizationDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-1.5 truncate max-w-full"
                >
                  <LinkIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{detail.company.authorizationDocumentUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-slate-400 font-normal">No authorization document link submitted</span>
              )}
            </div>
          </div>

          {/* Company Representation Notes */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1 md:col-span-2">
            <span className="text-[11px] font-medium text-slate-400">Company Representation Notes</span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
              {detail.company?.authorizationNotes ||
                detail.company?.verificationEvidenceNotes ||
                'No representation notes provided yet.'}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
          <span>
            Supporting documents and authorization letters are securely stored and restricted to authorized compliance reviewers. They are never published on the public careers portal.
          </span>
        </div>
      </div>

      {/* 7. ADMINISTRATOR FEEDBACK AND ACTION REQUIRED SECTION */}
      <div className="bg-[#0b1220]/90 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center border',
                hasFeedback
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              )}
            >
              {hasFeedback ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Administrator Feedback & Required Actions
              </h2>
              <p className="text-xs text-slate-400">
                Official compliance assessment and required actions from the reviewing team
              </p>
            </div>
          </div>

          {detail.rejectionCategory && (
            <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
              {detail.rejectionCategory}
            </span>
          )}
        </div>

        {hasFeedback ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Reason for Request / Assessment Finding
                </span>
                <p className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {detail.rejectionReason || 'No specific explanation recorded by the administrator.'}
                </p>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                  Required Corrective Action
                </span>
                <p className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                  {detail.correctiveActions ||
                    'Please review the company registration details below, amend any flagged discrepancies, and submit the corrected profile for verification.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 font-mono">
              <div>
                Review Date: <span className="text-slate-300">{lastUpdatedDisplay || 'Recorded in audit log'}</span>
              </div>
              <div>
                Resubmission Status:{' '}
                <span className={cn('font-semibold', isResubmitted ? 'text-cyan-300' : 'text-amber-300')}>
                  {isResubmitted ? 'Resubmission Submitted — Awaiting Review' : 'Corrections Pending Submission'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-2 bg-slate-900/40 rounded-xl border border-slate-800/80">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-semibold text-white">No additional corrections have been requested.</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your verification application is currently in good standing or awaiting primary review by the platform compliance team.
            </p>
          </div>
        )}
      </div>

      {/* AI Suggestions Checklist (Preserved when available) */}
      {detail.aiSuggestions && Array.isArray(detail.aiSuggestions) && detail.aiSuggestions.length > 0 && (
        <div className="bg-[#0b1220]/90 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Approved Improvement Guidance
                </h3>
                <p className="text-xs text-slate-400">
                  Step-by-step guidance curated to assist your profile resubmission
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-500 font-mono">Click status pill to track completion</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detail.aiSuggestions.map((sug: any, idx: number) => {
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
                          currentStatus === 'Action Required' && 'bg-rose-500/10 text-rose-300 border-rose-500/30',
                          currentStatus === 'In Progress' && 'bg-amber-500/10 text-amber-300 border-amber-500/30',
                          currentStatus === 'Completed' && 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
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
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. IMPROVED COMPANY PROFILE CORRECTION FORM */}
      <div id="corrections-form" className="bg-[#0b1220]/90 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-7">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Company Profile Corrections
              </h2>
              <p className="text-xs text-slate-400">
                Update legal organization details and business registration information
              </p>
            </div>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Directly saved to database upon resubmission
          </span>
        </div>

        {/* GROUP A: ORGANIZATION DETAILS */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Group A: Organization Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Legal Organization Name <span className="text-rose-400">*</span></span>
                <span className="text-[10px] text-slate-500">As registered with state authorities</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  setIsFormDirty(true);
                  if (validationErrors.companyName) setValidationErrors((v) => ({ ...v, companyName: undefined }));
                }}
                placeholder="e.g. Acme Technologies Inc."
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
                  validationErrors.companyName ? 'border-rose-500/80' : 'border-slate-800'
                )}
              />
              {validationErrors.companyName && (
                <p className="text-[11px] text-rose-400">{validationErrors.companyName}</p>
              )}
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
                  onChange={(e) => {
                    setCompanyWebsite(e.target.value);
                    setIsFormDirty(true);
                    if (validationErrors.companyWebsite) setValidationErrors((v) => ({ ...v, companyWebsite: undefined }));
                  }}
                  placeholder="https://acmecorp.com"
                  className={cn(
                    'w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
                    validationErrors.companyWebsite ? 'border-rose-500/80' : 'border-slate-800'
                  )}
                />
              </div>
              {validationErrors.companyWebsite && (
                <p className="text-[11px] text-rose-400">{validationErrors.companyWebsite}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Industry / Sector</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={companyIndustry}
                  onChange={(e) => {
                    setCompanyIndustry(e.target.value);
                    setIsFormDirty(true);
                  }}
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
                  onChange={(e) => {
                    setCompanyLocation(e.target.value);
                    setIsFormDirty(true);
                  }}
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
                  onChange={(e) => {
                    setCompanySize(e.target.value);
                    setIsFormDirty(true);
                  }}
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
                value={detail.recruiterEmail || detail.email || user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Company Description & Verification Summary</label>
              <textarea
                rows={3}
                value={companyDescription}
                onChange={(e) => {
                  setCompanyDescription(e.target.value);
                  setIsFormDirty(true);
                }}
                placeholder="Provide a concise description of company operations, primary products, and public references..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* GROUP B: BUSINESS CREDENTIALS */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Group B: Business Credentials
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Business Registration Number
              </label>
              <input
                type="text"
                value={businessRegistrationNumber}
                onChange={(e) => {
                  setBusinessRegistrationNumber(e.target.value);
                  setIsFormDirty(true);
                }}
                placeholder="e.g. C3849102 / SEC-2023-8841"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-500">Applicable country/state business identifier</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Tax Identification Number
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => {
                  setTaxId(e.target.value);
                  setIsFormDirty(true);
                }}
                placeholder="e.g. 12-3456789 / VAT-991823"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-500">EIN / TIN / VAT number</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Official Corporate Email Domain
              </label>
              <input
                type="text"
                value={officialEmailDomain}
                onChange={(e) => {
                  setOfficialEmailDomain(e.target.value);
                  setIsFormDirty(true);
                  if (validationErrors.officialEmailDomain) setValidationErrors((v) => ({ ...v, officialEmailDomain: undefined }));
                }}
                placeholder="e.g. companyname.com"
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
                  validationErrors.officialEmailDomain ? 'border-rose-500/80' : 'border-slate-800'
                )}
              />
              {validationErrors.officialEmailDomain ? (
                <p className="text-[11px] text-rose-400">{validationErrors.officialEmailDomain}</p>
              ) : (
                <p className="text-[10px] text-slate-500">Domain matching recruiter email</p>
              )}
            </div>
          </div>
        </div>

        {/* GROUP C: COMPANY AUTHORIZATION */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400">
            Group C: Company Authorization
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Recruiter Professional Designation / Title
              </label>
              <input
                type="text"
                value={recruiterTitle}
                onChange={(e) => {
                  setRecruiterTitle(e.target.value);
                  setIsFormDirty(true);
                }}
                placeholder="e.g. Senior Talent Acquisition Manager"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Recruiter Direct Phone Number
              </label>
              <input
                type="tel"
                value={recruiterPhone}
                onChange={(e) => {
                  setRecruiterPhone(e.target.value);
                  setIsFormDirty(true);
                }}
                placeholder="e.g. +1 (555) 019-2834"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">
                Authorization Letter or Supporting Evidence URL
              </label>
              <input
                type="url"
                value={authorizationDocumentUrl}
                onChange={(e) => {
                  setAuthorizationDocumentUrl(e.target.value);
                  setIsFormDirty(true);
                  if (validationErrors.authorizationDocumentUrl) setValidationErrors((v) => ({ ...v, authorizationDocumentUrl: undefined }));
                }}
                placeholder="https://drive.google.com/... or secure cloud document link"
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
                  validationErrors.authorizationDocumentUrl ? 'border-rose-500/80' : 'border-slate-800'
                )}
              />
              {validationErrors.authorizationDocumentUrl && (
                <p className="text-[11px] text-rose-400">{validationErrors.authorizationDocumentUrl}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Company Representation Evidence Notes
              </label>
              <input
                type="text"
                value={authorizationNotes}
                onChange={(e) => {
                  setAuthorizationNotes(e.target.value);
                  setIsFormDirty(true);
                }}
                placeholder="Describe your role, corporate authorization, or link to employer directory verification..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 9. MAKE RESUBMISSION SIMPLE AND TRANSPARENT */}
      <div className="bg-[#0b1220]/90 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Edit3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Resubmission Notes & Explanations
            </h2>
            <p className="text-xs text-slate-400">
              Summarize the changes and clarifications submitted for administrator re-review
            </p>
          </div>
        </div>

        {/* Previous Feedback Reference */}
        {hasFeedback && (
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Previous Compliance Request Addressed:
            </span>
            <p className="text-slate-300 font-sans italic">
              "{detail.rejectionReason || detail.correctiveActions || 'Please update and clarify company authorization information.'}"
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Clarification for Reviewing Administrator <span className="text-rose-400">*</span></span>
            <span className="text-[10px] text-slate-500">{resubmissionNotes.length}/1000 characters</span>
          </label>
          <textarea
            rows={4}
            maxLength={1000}
            value={resubmissionNotes}
            onChange={(e) => {
              setResubmissionNotes(e.target.value);
              setIsFormDirty(true);
              if (validationErrors.resubmissionNotes) setValidationErrors((v) => ({ ...v, resubmissionNotes: undefined }));
            }}
            placeholder="Explain how each flagged item was addressed (e.g., 'Corrected legal entity name to match registration certificate, updated official corporate website, and verified domain ownership.')."
            className={cn(
              'w-full px-4 py-3 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed',
              validationErrors.resubmissionNotes ? 'border-rose-500/80' : 'border-slate-800'
            )}
          />
          {validationErrors.resubmissionNotes && (
            <p className="text-[11px] text-rose-400">{validationErrors.resubmissionNotes}</p>
          )}
        </div>

        {/* Action Button Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Resubmission transitions status to <strong className="text-cyan-300">Under Review</strong> for administrator audit.
            </span>
          </div>

          <Button
            onClick={handleOpenResubmitModal}
            disabled={!detail.resubmissionAllowed || isVerified || isSubmitting}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold px-8 h-12 shadow-lg shadow-indigo-600/20"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit for Re-Review
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
              Your updated company profile, authorization evidence, and explanation will be transferred to the administrator verification queue.
              Final verification decisions remain with authorized platform administrators.
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Organization:</span>
              <span className="font-bold text-white">{companyName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Designation:</span>
              <span className="text-slate-300">{recruiterTitle || 'Not specified'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Website:</span>
              <span className="text-slate-300">{companyWebsite || 'None specified'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Official Domain:</span>
              <span className="text-slate-300">{officialEmailDomain || 'None specified'}</span>
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
