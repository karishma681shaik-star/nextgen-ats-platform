import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Globe,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  User,
  Clock,
  Sparkles,
  RotateCcw,
  FileText,
  Check,
  Trash2,
  Info,
  ChevronRight,
  AlertCircle,
  Eye,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Lock,
  Layers,
  CheckSquare
} from 'lucide-react';
import { adminService } from '../../services';
import { useToast } from '../../context/ToastContext';
import {
  RecruiterVerificationItem,
  VerificationStatus,
  AiSuggestionItem
} from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { formatFullDate } from '../../utils/formatters';

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

const EVIDENCE_CATEGORIES = [
  'Business registration & tax ID documentation',
  'Proof of recruiter-company authorization (letterhead / contract)',
  'Corporate domain email verification',
  'Company website and physical presence confirmation',
  'Employer identity verification',
  'Other additional supporting documentation'
];

export interface RecruiterVerificationWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RecruiterVerificationItem | null;
  initialStep?: 1 | 2;
  initialDecision?: 'APPROVE' | 'REQUEST_EVIDENCE' | 'REJECT' | 'REFER_REVIEW';
  onSuccess: (updated: RecruiterVerificationItem) => void;
}

export const RecruiterVerificationWorkspaceModal: React.FC<RecruiterVerificationWorkspaceModalProps> = ({
  isOpen,
  onClose,
  item,
  initialStep = 1,
  initialDecision = 'APPROVE',
  onSuccess
}) => {
  const { showToast } = useToast();

  // Workflow Navigation
  const [workspaceStep, setWorkspaceStep] = useState<1 | 2>(initialStep);
  const [decisionSubStep, setDecisionSubStep] = useState<'form' | 'preview'>('form');
  const [selectedDecision, setSelectedDecision] = useState<'APPROVE' | 'REQUEST_EVIDENCE' | 'REJECT' | 'REFER_REVIEW'>(initialDecision);

  // In-line checks edit state (Page 1)
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

  // Automatic AI Analysis State (Page 2)
  const [aiAnalysisStatus, setAiAnalysisStatus] = useState<'idle' | 'analyzing' | 'ready' | 'error'>('idle');
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);
  const [analyzedRecruiterId, setAnalyzedRecruiterId] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestionItem[]>([]);
  const [hasManualEdits, setHasManualEdits] = useState<boolean>(false);

  // Dynamic Editable Form Draft Fields (Page 2)
  const [draftVerificationSummary, setDraftVerificationSummary] = useState<string>('');
  const [draftEvidenceNotes, setDraftEvidenceNotes] = useState<string>('');
  const [draftCorrectiveActions, setDraftCorrectiveActions] = useState<string>('');
  const [draftDecisionReason, setDraftDecisionReason] = useState<string>('');
  const [draftRejectionCategory, setDraftRejectionCategory] = useState<string>(REJECTION_CATEGORIES[0]);
  const [draftEvidenceCategory, setDraftEvidenceCategory] = useState<string>(EVIDENCE_CATEGORIES[0]);
  const [draftResubmissionAllowed, setDraftResubmissionAllowed] = useState<boolean>(true);
  const [draftResubmissionNotes, setDraftResubmissionNotes] = useState<string>('');
  const [draftReferralReason, setDraftReferralReason] = useState<string>('');
  const [draftAdditionalChecks, setDraftAdditionalChecks] = useState<string>('');
  const [draftInternalNotes, setDraftInternalNotes] = useState<string>('');

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset / Initialize on item or initialStep change
  useEffect(() => {
    if (item && isOpen) {
      setWorkspaceStep(initialStep);
      setDecisionSubStep('form');
      setSelectedDecision(initialDecision);
      setHasManualEdits(false);
      setAiAnalysisStatus('idle');
      setAiAnalysisError(null);
      setAnalyzedRecruiterId(null);
      setAiSuggestions([]);
      setFormErrors({});

      setEditChecks({
        associationVerified: !!item.associationVerified,
        associationCheckStatus: item.associationCheckStatus || 'Pending',
        registrationCheckStatus: item.registrationCheckStatus || 'Pending',
        websiteConsistencyStatus: item.websiteConsistencyStatus || 'Pending',
        reverificationRequired: !!item.reverificationRequired,
        phoneVerified: !!item.phoneVerified,
        independentConfirmationNotes: item.independentConfirmationNotes || ''
      });

      setDraftRejectionCategory(item.rejectionCategory || REJECTION_CATEGORIES[0]);
      setDraftEvidenceCategory(EVIDENCE_CATEGORIES[0]);
      setDraftDecisionReason(item.rejectionReason || '');
      setDraftEvidenceNotes(item.independentConfirmationNotes || item.verificationEvidenceNotes || '');
      setDraftCorrectiveActions(item.correctiveActions || '');
      setDraftResubmissionAllowed(item.resubmissionAllowed ?? true);
      setDraftResubmissionNotes(item.resubmissionNotes || '');
      setDraftVerificationSummary('');
      setDraftReferralReason('');
      setDraftAdditionalChecks('');
      setDraftInternalNotes('');
    }
  }, [item?.recruiterId, isOpen, initialStep, initialDecision]);

  // AUTOMATIC AI ANALYSIS TRIGGER: When Page 2 opens, run AI analysis automatically!
  useEffect(() => {
    if (isOpen && item && workspaceStep === 2) {
      if (analyzedRecruiterId !== item.recruiterId || aiAnalysisStatus === 'idle') {
        runAutomaticAiAnalysis(item);
      }
    }
  }, [isOpen, workspaceStep, item?.recruiterId]);

  // Association Checks Calculation
  const getAssociationChecks = (r: RecruiterVerificationItem, checks: typeof editChecks) => {
    const recruiterDomain = r.recruiterEmail?.includes('@') ? r.recruiterEmail.split('@')[1].toLowerCase() : '';
    const officialDomain = r.officialEmailDomain ? r.officialEmailDomain.replace('@', '').toLowerCase() : '';
    const websiteDomain = r.website ? r.website.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '').toLowerCase() : '';
    const isPublicWebmail = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'].includes(recruiterDomain);

    let emailStatus: 'VERIFIED' | 'PENDING REVIEW' | 'MISSING' | 'INCONSISTENT' | 'UNABLE TO VERIFY' | 'NOT APPLICABLE' = 'PENDING REVIEW';
    if (officialDomain && recruiterDomain === officialDomain) {
      emailStatus = 'VERIFIED';
    } else if (websiteDomain && recruiterDomain === websiteDomain) {
      emailStatus = 'VERIFIED';
    } else if (officialDomain && recruiterDomain !== officialDomain && !isPublicWebmail) {
      emailStatus = 'INCONSISTENT';
    } else if (isPublicWebmail) {
      emailStatus = 'PENDING REVIEW';
    }

    let authLetterStatus: 'VERIFIED' | 'PENDING REVIEW' | 'MISSING' | 'INCONSISTENT' | 'UNABLE TO VERIFY' | 'NOT APPLICABLE' = 'MISSING';
    if (checks.associationVerified) {
      authLetterStatus = 'VERIFIED';
    } else if (r.authorizationDocumentUrl) {
      authLetterStatus = 'PENDING REVIEW';
    } else {
      authLetterStatus = 'MISSING';
    }

    let regDocStatus: 'VERIFIED' | 'PENDING REVIEW' | 'MISSING' | 'INCONSISTENT' | 'UNABLE TO VERIFY' | 'NOT APPLICABLE' = 'MISSING';
    if (checks.registrationCheckStatus === 'Verified') {
      regDocStatus = 'VERIFIED';
    } else if (checks.registrationCheckStatus === 'Unable to Verify') {
      regDocStatus = 'UNABLE TO VERIFY';
    } else if (checks.registrationCheckStatus === 'Additional Evidence Required') {
      regDocStatus = 'MISSING';
    } else if (r.businessRegistrationNumber || r.verificationDocumentUrl) {
      regDocStatus = 'PENDING REVIEW';
    } else {
      regDocStatus = 'MISSING';
    }

    let websiteStatus: 'VERIFIED' | 'PENDING REVIEW' | 'MISSING' | 'INCONSISTENT' | 'UNABLE TO VERIFY' | 'NOT APPLICABLE' = 'MISSING';
    if (checks.websiteConsistencyStatus === 'Consistent') {
      websiteStatus = 'VERIFIED';
    } else if (checks.websiteConsistencyStatus === 'Discrepancy Detected') {
      websiteStatus = 'INCONSISTENT';
    } else if (checks.websiteConsistencyStatus === 'Unverified') {
      websiteStatus = 'UNABLE TO VERIFY';
    } else if (r.website) {
      websiteStatus = 'PENDING REVIEW';
    } else {
      websiteStatus = 'MISSING';
    }

    let representativeStatus: 'VERIFIED' | 'PENDING REVIEW' | 'MISSING' | 'INCONSISTENT' | 'UNABLE TO VERIFY' | 'NOT APPLICABLE' = 'PENDING REVIEW';
    if (checks.associationCheckStatus === 'Verified') {
      representativeStatus = 'VERIFIED';
    } else if (checks.associationCheckStatus === 'Unauthorized') {
      representativeStatus = 'INCONSISTENT';
    } else if (checks.associationCheckStatus === 'Unable to Verify') {
      representativeStatus = 'UNABLE TO VERIFY';
    } else if (checks.associationCheckStatus === 'Authorization Required') {
      representativeStatus = 'MISSING';
    } else {
      representativeStatus = 'PENDING REVIEW';
    }

    return [
      {
        id: 'corporate_email',
        name: 'Corporate Email Domain Verification',
        status: emailStatus,
        details: r.officialEmailDomain ? `Official Domain: @${r.officialEmailDomain} · Recruiter Email: ${r.recruiterEmail}` : `Recruiter Email: ${r.recruiterEmail} (No corporate domain on file)`,
        explanation: {
          whatIsMissing: 'Recruiter registered with a personal webmail address rather than an official corporate email domain.',
          whyItMatters: 'Matching corporate email domains verify direct institutional affiliation and prevent external impersonation.',
          whatShouldBeCheckedNext: `Request corporate mailbox confirmation (@${r.officialEmailDomain || websiteDomain || 'company.com'}) or inspect DNS MX records.`
        }
      },
      {
        id: 'authorization_letter',
        name: 'Proof of Recruiter Authorization',
        status: authLetterStatus,
        details: r.authorizationDocumentUrl ? `Letter Submitted: ${r.authorizationDocumentUrl}` : 'No authorization letter or agency contract submitted.',
        explanation: {
          whatIsMissing: 'Authorization evidence has not been provided.',
          whyItMatters: 'The application does not currently contain evidence establishing the recruiter\'s authority to represent the stated organization.',
          whatShouldBeCheckedNext: 'Request an authorization letter or another acceptable form of evidence under the verification policy.'
        }
      },
      {
        id: 'business_registration',
        name: 'Business Registration Documentation',
        status: regDocStatus,
        details: r.businessRegistrationNumber ? `Reg Number: ${r.businessRegistrationNumber} · Tax ID: ${r.taxId || 'Not provided'}` : 'Business registration number or incorporation filing missing.',
        explanation: {
          whatIsMissing: 'Official commercial registration documentation or incorporation license.',
          whyItMatters: 'Confirms that the hiring entity is an active, legally established corporation in good standing.',
          whatShouldBeCheckedNext: 'Query state or national corporate registry or request Certificate of Incorporation.'
        }
      },
      {
        id: 'website_presence',
        name: 'Official Company Website & Directory',
        status: websiteStatus,
        details: r.website ? `Website: ${r.website}` : 'No official company website provided.',
        explanation: {
          whatIsMissing: 'Active public corporate website or verifiable commercial directory presence.',
          whyItMatters: 'Legitimate employers maintain verifiable online domains, active career pages, or professional registry listings.',
          whatShouldBeCheckedNext: 'Audit corporate domain registration, SSL certificates, or official LinkedIn company profile.'
        }
      },
      {
        id: 'authorized_rep',
        name: 'Authorized Representative Confirmation',
        status: representativeStatus,
        details: checks.associationVerified ? 'Confirmed as authorized representative' : 'Pending direct company confirmation',
        explanation: {
          whatIsMissing: 'Direct senior HR or executive leadership confirmation of recruiter\'s representation mandate.',
          whyItMatters: 'Protects applicant safety by guaranteeing hiring requisitions originate from legitimate internal talent partners.',
          whatShouldBeCheckedNext: 'Contact primary corporate headquarters number or verify recruiter on official staff directory.'
        }
      }
    ];
  };

  const computedChecks = item ? getAssociationChecks(item, editChecks) : [];
  const computedSummary = {
    completedCount: computedChecks.filter((c) => c.status === 'VERIFIED').length,
    awaitingReviewCount: computedChecks.filter((c) => c.status === 'PENDING REVIEW').length,
    missingCount: computedChecks.filter((c) => c.status === 'MISSING').length,
    investigationCount: computedChecks.filter((c) => c.status === 'INCONSISTENT' || c.status === 'UNABLE TO VERIFY').length
  };

  // Run Automatic AI Analysis
  const runAutomaticAiAnalysis = async (targetItem: RecruiterVerificationItem, force = false) => {
    if (!force && analyzedRecruiterId === targetItem.recruiterId && aiAnalysisStatus === 'ready') {
      return;
    }
    setAiAnalysisStatus('analyzing');
    setAiAnalysisError(null);
    try {
      const categoryToUse = selectedDecision === 'REJECT' ? draftRejectionCategory : 'Business registration & organization verification';
      const reasonToUse = draftDecisionReason.trim() || 'Automated verification readiness & risk evaluation';
      const suggestions = await adminService.generateAiSuggestions(targetItem.recruiterId, categoryToUse, reasonToUse);
      setAiSuggestions(suggestions);
      setAiAnalysisStatus('ready');
      setAnalyzedRecruiterId(targetItem.recruiterId);

      // Auto-populate editable draft fields if admin has not manually edited them
      if (!hasManualEdits) {
        // 1. Verification Summary
        const summaryText = `Evaluated recruiter identity (${targetItem.recruiterName}) and organization profile (${targetItem.companyName}). Checks completed: ${computedSummary.completedCount}/5. ${
          computedSummary.missingCount > 0 ? `${computedSummary.missingCount} required check(s) lack supporting documentation.` : 'All baseline company parameters verified.'
        } ${computedSummary.investigationCount > 0 ? `${computedSummary.investigationCount} discrepancy detected requiring verification.` : ''}`;
        setDraftVerificationSummary(summaryText);

        // 2. Findings / Evidence Notes
        if (suggestions && suggestions.length > 0) {
          const findingsText = suggestions.map((s) => `• [${s.issue}]: ${s.whyItMatters}`).join('\n');
          setDraftEvidenceNotes((prev) => (prev ? `${prev}\n\nAI Findings:\n${findingsText}` : `AI Findings:\n${findingsText}`));

          // 3. Required Corrective Actions
          const actionsText = suggestions
            .map((s, idx) => `${idx + 1}. ${s.recommendedAction || s.profileCorrectionInstructions}`)
            .join('\n');
          setDraftCorrectiveActions(actionsText);
        }

        // 4. Suggested Decision Rationale
        if (selectedDecision === 'APPROVE') {
          setDraftDecisionReason(`Recruiter credentials, company registration, and corporate association verified. Approved to publish job postings on behalf of ${targetItem.companyName}.`);
        } else if (selectedDecision === 'REQUEST_EVIDENCE') {
          const topIssue = suggestions?.[0]?.issue || 'business registration & authorization documentation';
          setDraftDecisionReason(`Additional evidence required regarding ${topIssue.toLowerCase()}. Please upload supporting documentation for re-review.`);
        } else if (selectedDecision === 'REJECT') {
          const topIssue = suggestions?.[0]?.issue || 'verification credentials';
          setDraftDecisionReason(`Verification application could not be verified due to: ${topIssue.toLowerCase()}. Review corrective guidance and update your company profile.`);
        } else if (selectedDecision === 'REFER_REVIEW') {
          setDraftReferralReason(`Referred for secondary compliance verification due to pending corporate evidence and cross-registry validation.`);
        }
      }
    } catch (err: any) {
      console.error('Failed to run automatic AI analysis:', err);
      setAiAnalysisStatus('error');
      setAiAnalysisError(err?.message || 'AI suggestion service currently utilizing deterministic compliance fallback. You may edit all fields manually.');
      if (!hasManualEdits) {
        if (!draftVerificationSummary) {
          setDraftVerificationSummary(`Verification review in progress for ${targetItem.recruiterName} (${targetItem.companyName}). Checks completed: ${computedSummary.completedCount}/5.`);
        }
        if (!draftDecisionReason) {
          if (selectedDecision === 'APPROVE') {
            setDraftDecisionReason(`Recruiter credentials and corporate affiliation verified for ${targetItem.companyName}.`);
          } else if (selectedDecision === 'REQUEST_EVIDENCE') {
            setDraftDecisionReason(`Please provide official proof of corporate authorization or business registration.`);
          } else if (selectedDecision === 'REJECT') {
            setDraftDecisionReason(`Verification declined: documentation provided does not satisfy verification policy requirements.`);
          }
        }
      }
    }
  };

  const handleSelectDecision = (outcome: 'APPROVE' | 'REQUEST_EVIDENCE' | 'REJECT' | 'REFER_REVIEW') => {
    setSelectedDecision(outcome);
    setFormErrors({});
    if (!hasManualEdits && item) {
      if (outcome === 'APPROVE') {
        setDraftDecisionReason(`Recruiter identity and company association verified. Authorized to post jobs on behalf of ${item.companyName}.`);
      } else if (outcome === 'REQUEST_EVIDENCE') {
        const topIssue = aiSuggestions?.[0]?.issue || 'business registration & authorization documentation';
        setDraftDecisionReason(`Additional evidence required regarding ${topIssue.toLowerCase()}. Please upload supporting documentation for re-review.`);
      } else if (outcome === 'REJECT') {
        const topIssue = aiSuggestions?.[0]?.issue || 'verification documentation';
        setDraftDecisionReason(`Verification application could not be approved due to: ${topIssue.toLowerCase()}. Review corrective guidance and update your company profile.`);
      } else if (outcome === 'REFER_REVIEW') {
        setDraftReferralReason(`Referred for secondary compliance review and independent registry confirmation.`);
      }
    }
  };

  const handleAcceptAiSuggestion = (s: AiSuggestionItem) => {
    const actionText = s.recommendedAction || s.profileCorrectionInstructions;
    setDraftCorrectiveActions((prev) => (prev ? `${prev}\n• ${actionText}` : `• ${actionText}`));
    setDraftEvidenceNotes((prev) => (prev ? `${prev}\n• [Accepted Finding: ${s.issue}]` : `• [Accepted Finding: ${s.issue}]`));
    setHasManualEdits(true);
    showToast({
      type: 'info',
      title: 'Suggestion Accepted',
      message: 'AI recommendation applied to draft corrective actions and evidence notes.'
    });
  };

  const handleDismissAiSuggestion = (id: string) => {
    setAiSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveChecks = async () => {
    if (!item) return;
    try {
      setIsSavingChecks(true);
      const updated = await adminService.updateCompanyChecks(item.recruiterId, editChecks);
      showToast({
        type: 'success',
        title: 'Company Checks Saved',
        message: 'Authenticity, registry verification, and authorization checks updated.'
      });
      onSuccess(updated);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Update Failed', message: err?.message || 'Failed to save checks.' });
    } finally {
      setIsSavingChecks(false);
    }
  };

  const handleProceedToPreview = () => {
    const errors: { [key: string]: string } = {};

    if (selectedDecision === 'REJECT') {
      const trimmed = draftDecisionReason.trim();
      if (!trimmed) {
        errors.reason = 'Detailed rejection reason is required.';
      } else if (trimmed.length < 10) {
        errors.reason = 'Detailed reason must be at least 10 characters long to provide actionable guidance.';
      }
    } else if (selectedDecision === 'REQUEST_EVIDENCE') {
      if (!draftDecisionReason.trim()) {
        errors.reason = 'Explanation detailing required evidence is mandatory.';
      }
    } else if (selectedDecision === 'REFER_REVIEW') {
      if (!draftReferralReason.trim()) {
        errors.reason = 'Reason for referral is mandatory.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setDecisionSubStep('preview');
  };

  const handleFinalDecisionSubmit = async () => {
    if (!item) return;
    try {
      setIsSubmitting(true);
      let updated: RecruiterVerificationItem;

      if (selectedDecision === 'APPROVE') {
        updated = await adminService.approveRecruiter(item.recruiterId);
        showToast({
          type: 'success',
          title: 'Recruiter Verified & Authorized',
          message: `${updated.recruiterName} (${updated.companyName}) is now approved and authorized to publish job requisitions.`
        });
      } else if (selectedDecision === 'REQUEST_EVIDENCE') {
        updated = await adminService.requestAdditionalEvidence(item.recruiterId, {
          category: draftEvidenceCategory,
          reason: draftDecisionReason.trim(),
          correctiveActions: draftCorrectiveActions.trim() || undefined
        });
        showToast({
          type: 'info',
          title: 'Additional Evidence Requested',
          message: `Notification & corrective instructions sent to ${updated.recruiterName}. Status updated to Additional Evidence Required.`
        });
      } else if (selectedDecision === 'REJECT') {
        updated = await adminService.rejectRecruiter(item.recruiterId, {
          category: draftRejectionCategory.trim(),
          reason: draftDecisionReason.trim(),
          correctiveActions: draftCorrectiveActions.trim() || undefined,
          aiSuggestions: aiSuggestions.length > 0 ? JSON.stringify(aiSuggestions) : undefined,
          resubmissionAllowed: draftResubmissionAllowed,
          resubmissionNotes: draftResubmissionNotes.trim() || undefined
        });
        showToast({
          type: 'info',
          title: 'Verification Declined',
          message: `Structured decision saved and notified to ${updated.recruiterName} (${updated.companyName}).`
        });
      } else {
        // REFER_REVIEW
        updated = await adminService.reopenVerification(item.recruiterId);
        if (draftReferralReason || editChecks.independentConfirmationNotes) {
          await adminService.updateCompanyChecks(item.recruiterId, {
            ...editChecks,
            independentConfirmationNotes: (draftReferralReason + (draftEvidenceNotes ? `\n${draftEvidenceNotes}` : '')).trim()
          });
        }
        showToast({
          type: 'info',
          title: 'Application Referred for Investigation',
          message: `Verification for ${updated.recruiterName} has been escalated for further compliance review.`
        });
      }

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: err?.message || 'Failed to persist verification decision.'
      });
    } finally {
      setIsSubmitting(false);
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
        return <Badge variant="danger" size="sm" className="bg-amber-500/15 border-amber-500/30 text-amber-300"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Suspended</Badge>;
      case 'unable_to_verify':
        return <Badge variant="outline" size="sm" className="bg-slate-500/15 border-slate-500/30 text-slate-300"><AlertCircle className="w-3.5 h-3.5 mr-1" /> Unable to Verify</Badge>;
      default:
        return <Badge variant="warning" size="sm" className="bg-amber-500/15 border-amber-500/30 text-amber-300"><Clock className="w-3.5 h-3.5 mr-1" /> Verification Pending</Badge>;
    }
  };

  const getCheckStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">VERIFIED</span>;
      case 'PENDING REVIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">PENDING REVIEW</span>;
      case 'MISSING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">MISSING</span>;
      case 'INCONSISTENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">INCONSISTENT</span>;
      case 'UNABLE TO VERIFY':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">UNABLE TO VERIFY</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">NOT APPLICABLE</span>;
    }
  };

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={workspaceStep === 1 ? 'Recruiter Verification Review' : 'Verification Decision'}
      description={
        workspaceStep === 1
          ? "Review the recruiter's identity, company information, and supporting evidence before making a decision."
          : "Review the findings, finalize your decision, and communicate the next steps to the recruiter."
      }
      maxWidth="5xl"
    >
      <div className="space-y-5 text-xs">
        {/* Step Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setWorkspaceStep(1);
                setDecisionSubStep('form');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                workspaceStep === 1
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-950/50 flex items-center justify-center text-[10px] font-mono">1</span>
              <span>Page 1: Recruiter & Company Review</span>
            </button>

            <ChevronRight className="w-4 h-4 text-slate-600" />

            <button
              onClick={() => {
                setWorkspaceStep(2);
                setDecisionSubStep('form');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                workspaceStep === 2
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-950/50 flex items-center justify-center text-[10px] font-mono">2</span>
              <span>Page 2: Verification Decision & Guidance</span>
              {aiAnalysisStatus === 'analyzing' && (
                <div className="w-3.5 h-3.5 border-2 border-white/60 border-t-transparent rounded-full animate-spin ml-1" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500">Application Reference:</span>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300 font-bold">
              APP-{item.recruiterId.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PAGE 1: RECRUITER & COMPANY REVIEW */}
        {/* ======================================================== */}
        {workspaceStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            {/* SECTION 1: RECRUITER IDENTITY */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  {item.companyLogo ? (
                    <img
                      src={item.companyLogo}
                      alt={item.companyName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{item.companyName}</h3>
                      {getStatusBadge(item.verificationStatus)}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Representative: <strong className="text-violet-300">{item.recruiterName}</strong> · Account ID: <span className="font-mono text-slate-500">{item.recruiterId}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Application Reference</span>
                  <span className="font-mono text-indigo-300 font-bold text-xs">APP-{item.recruiterId.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>

              {/* Compact Identity Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Recruiter Full Name</span>
                  <strong className="text-white text-xs block mt-0.5 truncate">{item.recruiterName}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Registered Email</span>
                  <strong className="text-cyan-300 font-mono text-xs block mt-0.5 truncate">{item.recruiterEmail}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Phone Verification Status</span>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    {editChecks.phoneVerified ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified ({item.recruiterPhone || 'On File'})
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        {item.recruiterPhone ? `${item.recruiterPhone} (Unverified)` : 'Not provided'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Registration Date</span>
                  <span className="text-white text-xs block mt-0.5">
                    {item.createdAt ? formatFullDate(item.createdAt) : 'Not recorded'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>
                  Telemetry Note: Information loaded from registered employer profile. Missing details are audited as incomplete documentation rather than automatic evidence of fraud.
                </span>
              </div>
            </div>

            {/* SECTION 2: COMPANY INFORMATION */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Section 2: Company Profile & Business Credentials</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-500">Two-Column Essential Layout</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1 */}
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Legal Organization Name</span>
                    <strong className="text-white text-xs">{item.companyName}</strong>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Official Company Website</span>
                    {item.website ? (
                      <a
                        href={item.website.startsWith('http') ? item.website : `https://${item.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline flex items-center gap-1 font-mono text-xs mt-0.5"
                      >
                        {item.website} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-500">Not provided</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Corporate Email Domain</span>
                    <span className="font-mono text-cyan-300 text-xs">
                      {item.officialEmailDomain ? `@${item.officialEmailDomain}` : 'Not registered'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Industry / Sector</span>
                    <span className="text-slate-200">{item.industry || 'Not provided'}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Registered Location / Address</span>
                    <span className="text-slate-200">{item.location || 'Not provided'}</span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Business Registration Number</span>
                    <span className="font-mono text-white text-xs">{item.businessRegistrationNumber || 'Not provided'}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Tax / Employer ID (EIN)</span>
                    <span className="font-mono text-white text-xs">{item.taxId || 'Not provided'}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Organization Size</span>
                    <span className="text-slate-200">{item.size || 'Not provided'}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Primary Verification Document</span>
                    {item.verificationDocumentUrl ? (
                      <a
                        href={item.verificationDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-xs mt-0.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Evidence ({item.verificationDocumentUrl})</span>
                      </a>
                    ) : (
                      <span className="text-slate-500">No external document URL uploaded</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Supporting Authorization Document</span>
                    {item.authorizationDocumentUrl ? (
                      <a
                        href={item.authorizationDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-xs mt-0.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Evidence ({item.authorizationDocumentUrl})</span>
                      </a>
                    ) : (
                      <span className="text-slate-500">No authorization letter uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Description */}
              {item.description && (
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-1">Company Description</span>
                  <p className="text-slate-300 leading-relaxed text-xs">{item.description}</p>
                </div>
              )}

              {/* Recruiter Notes */}
              {item.verificationEvidenceNotes && (
                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200">
                  <span className="font-bold text-[10px] uppercase block text-indigo-300 mb-1">Recruiter Supporting Notes</span>
                  <p className="leading-relaxed text-xs">{item.verificationEvidenceNotes}</p>
                </div>
              )}
            </div>

            {/* SECTION 3: COMPANY ASSOCIATION & EVIDENCE */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Section 3: Proof of Company Association</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Review whether the recruiter is authorized to represent the organization. Examine primary corporate evidence.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Human Audit</span>
              </div>

              {/* 5 Association Checks Table / Cards */}
              <div className="space-y-3">
                {computedChecks.map((check) => (
                  <div
                    key={check.id}
                    className={`p-3.5 rounded-xl border space-y-2.5 transition-colors ${
                      check.status === 'VERIFIED'
                        ? 'bg-emerald-950/15 border-emerald-500/20'
                        : check.status === 'MISSING'
                        ? 'bg-amber-950/15 border-amber-500/20'
                        : check.status === 'INCONSISTENT'
                        ? 'bg-rose-950/20 border-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-white text-xs">{check.name}</span>
                        {getCheckStatusBadge(check.status)}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{check.details}</span>
                    </div>

                    {/* Explanations for Missing or Inconsistent Items */}
                    {(check.status === 'MISSING' || check.status === 'INCONSISTENT' || check.status === 'UNABLE TO VERIFY') && (
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-[11px]">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <span className="text-rose-400 font-bold block uppercase text-[10px]">What is missing?</span>
                            <p className="text-slate-300 mt-0.5">{check.explanation.whatIsMissing}</p>
                          </div>
                          <div>
                            <span className="text-amber-400 font-bold block uppercase text-[10px]">Why does it matter?</span>
                            <p className="text-slate-400 mt-0.5">{check.explanation.whyItMatters}</p>
                          </div>
                          <div>
                            <span className="text-cyan-400 font-bold block uppercase text-[10px]">What should be checked next?</span>
                            <p className="text-indigo-300 mt-0.5">{check.explanation.whatShouldBeCheckedNext}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* In-Line Audit Check Controls */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Record Verification Findings & Registry Updates
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Representative Status</label>
                    <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editChecks.associationVerified}
                        onChange={(e) => setEditChecks({ ...editChecks, associationVerified: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                      />
                      <span className={editChecks.associationVerified ? 'text-emerald-400 font-bold text-xs' : 'text-slate-400 text-xs'}>
                        {editChecks.associationVerified ? '✓ Authorized Representative' : 'Pending Confirmation'}
                      </span>
                    </label>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Registry Check Status</label>
                    <select
                      value={editChecks.registrationCheckStatus}
                      onChange={(e) => setEditChecks({ ...editChecks, registrationCheckStatus: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Verified">Verified</option>
                      <option value="Additional Evidence Required">Additional Evidence Required</option>
                      <option value="Unable to Verify">Unable to Verify</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Website Consistency</label>
                    <select
                      value={editChecks.websiteConsistencyStatus}
                      onChange={(e) => setEditChecks({ ...editChecks, websiteConsistencyStatus: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                    >
                      <option value="Consistent">Consistent</option>
                      <option value="Pending">Pending</option>
                      <option value="Discrepancy Detected">Discrepancy Detected</option>
                      <option value="Unverified">Unverified</option>
                    </select>
                  </div>

                  <div className="col-span-1 sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">
                      Independent Confirmation Notes (Internal Audit)
                    </label>
                    <textarea
                      rows={2}
                      value={editChecks.independentConfirmationNotes}
                      onChange={(e) => setEditChecks({ ...editChecks, independentConfirmationNotes: e.target.value })}
                      placeholder="Document any phone calls, registry checks, or official company confirmations conducted..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveChecks}
                    isLoading={isSavingChecks}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Save Company Checks
                  </Button>
                </div>
              </div>
            </div>

            {/* SECTION 4: VERIFICATION SUMMARY */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Section 4: Verification Summary</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-500">Calculated from Actual Checks</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Checks Completed</span>
                  <span className="text-base font-bold text-emerald-400 mt-1 block">
                    {computedSummary.completedCount} / 5
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Checks Awaiting Review</span>
                  <span className="text-base font-bold text-amber-400 mt-1 block">
                    {computedSummary.awaitingReviewCount} / 5
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Missing Required Info</span>
                  <span className="text-base font-bold text-rose-400 mt-1 block">
                    {computedSummary.missingCount} / 5
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Requires Investigation</span>
                  <span className="text-base font-bold text-cyan-400 mt-1 block">
                    {computedSummary.investigationCount} / 5
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 5: AI FINDINGS PREVIEW */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Section 5: AI Findings Preview</span>
                </h4>
                <span className="text-[10px] text-slate-500">Explainable Signals</span>
              </div>

              {computedSummary.missingCount === 0 && computedSummary.investigationCount === 0 && (!item.aiRiskFlags || item.aiRiskFlags.length === 0) ? (
                <div className="p-4 text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <p className="font-bold text-white text-xs">No active compliance discrepancies identified</p>
                  <p className="text-[11px] text-slate-400">All submitted fields and company credentials satisfy baseline requirements.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {computedChecks
                    .filter((c) => c.status === 'MISSING' || c.status === 'INCONSISTENT' || c.status === 'UNABLE TO VERIFY')
                    .map((c) => (
                      <div key={c.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{c.name}</span>
                            {c.status === 'MISSING' ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">MISSING INFO</span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300">DISCREPANCY</span>
                            )}
                          </div>
                          <p className="text-slate-300 text-[11px]">{c.explanation.whatIsMissing}</p>
                          <p className="text-slate-500 text-[10px] font-mono">Reference: {c.details}</p>
                        </div>
                      </div>
                    ))}

                  {(item.aiRiskFlags || []).map((flag, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{flag.category}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300">
                            {flag.severity} RISK
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{flag.reason}</p>
                        <p className="text-slate-500 text-[10px] font-mono">Evidence: {flag.evidence}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PAGE 1 ACTIONS */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <Button variant="secondary" onClick={onClose}>
                Close Workspace
              </Button>
              <Button
                variant="primary"
                onClick={() => setWorkspaceStep(2)}
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold"
              >
                Continue to Decision <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 2: DECISION & AUTOMATIC AI GUIDANCE */}
        {/* ======================================================== */}
        {workspaceStep === 2 && decisionSubStep === 'form' && (
          <div className="space-y-5 animate-fade-in">
            {/* SECTION 1 & 3: AUTOMATIC AI ANALYSIS BANNER */}
            <div>
              {aiAnalysisStatus === 'analyzing' && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <div>
                    <p className="font-bold text-white text-xs">Analyzing verification information...</p>
                    <p className="text-[11px] text-indigo-300 mt-0.5">
                      Evaluating recruiter identity, company profile, submitted credentials, and compliance history. Draft guidance will populate automatically.
                    </p>
                  </div>
                </div>
              )}

              {aiAnalysisStatus === 'ready' && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-300 text-xs">AI guidance ready for review.</span>
                      <span className="text-slate-400 text-[11px] block sm:inline sm:ml-2">
                        Recommendations automatically generated and populated into editable draft fields below.
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 text-xs py-1"
                    onClick={() => runAutomaticAiAnalysis(item, true)}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Re-run Analysis
                  </Button>
                </div>
              )}

              {aiAnalysisStatus === 'error' && (
                <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-rose-300 text-xs">{aiAnalysisError}</span>
                      <span className="text-slate-400 text-[11px] block">
                        Manual verification workflow is active and unaffected.
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs py-1"
                    onClick={() => runAutomaticAiAnalysis(item, true)}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Retry AI Analysis
                  </Button>
                </div>
              )}
            </div>

            {/* SECTION 4: FOUR SIMPLE DECISION OPTIONS */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Select Verification Outcome
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* OPTION A: APPROVE */}
                <button
                  type="button"
                  onClick={() => handleSelectDecision('APPROVE')}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    selectedDecision === 'APPROVE'
                      ? 'bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Approve Recruiter
                    </span>
                    <input
                      type="radio"
                      name="decisionOutcome"
                      checked={selectedDecision === 'APPROVE'}
                      onChange={() => handleSelectDecision('APPROVE')}
                      className="text-emerald-500 focus:ring-0"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Checks satisfied. Authorizes immediate job posting permissions on the platform.
                  </p>
                </button>

                {/* OPTION B: REQUEST ADDITIONAL EVIDENCE */}
                <button
                  type="button"
                  onClick={() => handleSelectDecision('REQUEST_EVIDENCE')}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    selectedDecision === 'REQUEST_EVIDENCE'
                      ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      Request Evidence
                    </span>
                    <input
                      type="radio"
                      name="decisionOutcome"
                      checked={selectedDecision === 'REQUEST_EVIDENCE'}
                      onChange={() => handleSelectDecision('REQUEST_EVIDENCE')}
                      className="text-cyan-500 focus:ring-0"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Application may be genuine, but specific documentation or clarification is required.
                  </p>
                </button>

                {/* OPTION C: REJECT VERIFICATION */}
                <button
                  type="button"
                  onClick={() => handleSelectDecision('REJECT')}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    selectedDecision === 'REJECT'
                      ? 'bg-rose-950/30 border-rose-500 shadow-md shadow-rose-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      Reject Verification
                    </span>
                    <input
                      type="radio"
                      name="decisionOutcome"
                      checked={selectedDecision === 'REJECT'}
                      onChange={() => handleSelectDecision('REJECT')}
                      className="text-rose-500 focus:ring-0"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Findings justify rejection under platform verification compliance policy.
                  </p>
                </button>

                {/* OPTION D: REFER FOR FURTHER REVIEW */}
                <button
                  type="button"
                  onClick={() => handleSelectDecision('REFER_REVIEW')}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    selectedDecision === 'REFER_REVIEW'
                      ? 'bg-amber-950/30 border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Refer for Review
                    </span>
                    <input
                      type="radio"
                      name="decisionOutcome"
                      checked={selectedDecision === 'REFER_REVIEW'}
                      onChange={() => handleSelectDecision('REFER_REVIEW')}
                      className="text-amber-500 focus:ring-0"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Escalate for secondary investigation, manual registry audit, or senior review.
                  </p>
                </button>
              </div>
            </div>

            {/* SECTION 6: REVIEWABLE AI GUIDANCE PANEL */}
            {aiSuggestions.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Reviewable AI Guidance ({aiSuggestions.length})
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Draft Recommendations</span>
                </div>

                <div className="space-y-3">
                  {aiSuggestions.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Finding #{idx + 1}: {s.issue}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAcceptAiSuggestion(s)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Accept Suggestion
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDismissAiSuggestion(s.id)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 text-[10px]"
                            title="Dismiss suggestion"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] space-y-1">
                        <p className="text-slate-300">
                          <strong className="text-slate-400">Why It Matters: </strong>
                          {s.whyItMatters}
                        </p>
                        <p className="text-cyan-300">
                          <strong className="text-cyan-400">Recommended Action: </strong>
                          {s.recommendedAction || s.profileCorrectionInstructions}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2 & 5: DYNAMIC FORM FIELDS */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  {selectedDecision === 'APPROVE' && 'Approval Record & Verification Notes'}
                  {selectedDecision === 'REQUEST_EVIDENCE' && 'Evidence Request & Recruiter Instructions'}
                  {selectedDecision === 'REJECT' && 'Structured Rejection Rationale & Policy Findings'}
                  {selectedDecision === 'REFER_REVIEW' && 'Investigation Referral & Compliance Notes'}
                </h4>
                <span className="text-[10px] font-mono text-slate-500">Editable Form</span>
              </div>

              {/* IF APPROVE */}
              {selectedDecision === 'APPROVE' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Decision Summary
                    </label>
                    <input
                      type="text"
                      value={draftDecisionReason}
                      onChange={(e) => {
                        setDraftDecisionReason(e.target.value);
                        setHasManualEdits(true);
                      }}
                      placeholder="e.g. Recruiter credentials and corporate affiliation confirmed."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Verification Findings Notes
                    </label>
                    <textarea
                      rows={3}
                      value={draftEvidenceNotes}
                      onChange={(e) => {
                        setDraftEvidenceNotes(e.target.value);
                        setHasManualEdits(true);
                      }}
                      placeholder="Summary of checks, registry lookup results, and corporate domain verification..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Optional Internal Audit Notes <span className="text-slate-500 font-normal">(Never shared with recruiter)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={draftInternalNotes}
                      onChange={(e) => {
                        setDraftInternalNotes(e.target.value);
                        setHasManualEdits(true);
                      }}
                      placeholder="Internal audit notes or reviewer credentials..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              )}

              {/* IF REQUEST ADDITIONAL EVIDENCE */}
              {selectedDecision === 'REQUEST_EVIDENCE' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Required Missing Evidence Category
                    </label>
                    <select
                      value={draftEvidenceCategory}
                      onChange={(e) => {
                        setDraftEvidenceCategory(e.target.value);
                        setHasManualEdits(true);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    >
                      {EVIDENCE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Explanation for Request <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={draftDecisionReason}
                      onChange={(e) => {
                        setDraftDecisionReason(e.target.value);
                        setHasManualEdits(true);
                        if (formErrors.reason) setFormErrors({ ...formErrors, reason: '' });
                      }}
                      placeholder="Explain what specific documentation is needed and why it matters under verification policy..."
                      className={`w-full bg-slate-900 border rounded-xl p-3 text-xs text-white placeholder-slate-500 ${
                        formErrors.reason ? 'border-rose-500' : 'border-slate-700'
                      }`}
                    />
                    {formErrors.reason && <p className="text-rose-400 text-[10px] mt-1">{formErrors.reason}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Specific Corrective Actions
                    </label>
                    <textarea
                      rows={3}
                      value={draftCorrectiveActions}
                      onChange={(e) => {
                        setDraftCorrectiveActions(e.target.value);
                        setHasManualEdits(true);
                      }}
                      placeholder="Step-by-step instructions for the recruiter to fulfill this request..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Resubmission Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={draftResubmissionNotes}
                      onChange={(e) => {
                        setDraftResubmissionNotes(e.target.value);
                        setHasManualEdits(true);
                      }}
                      placeholder="e.g. Upload your document in the Verification Center and click Resubmit for Review."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              )}

              {/* IF REJECT */}
              {selectedDecision === 'REJECT' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Rejection Category <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={draftRejectionCategory}
                      onChange={(e) => {
                        setDraftRejectionCategory(e.target.value);
                        setHasManualEdits(true);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    >
                      {REJECTION_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-300 uppercase">
                        Mandatory Rejection Reason <span className="text-rose-400">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">{draftDecisionReason.length}/2000 chars</span>
                    </div>
                    <textarea
                      rows={3}
                      value={draftDecisionReason}
                      onChange={(e) => {
                        setDraftDecisionReason(e.target.value);
                        setHasManualEdits(true);
                        if (formErrors.reason) setFormErrors({ ...formErrors, reason: '' });
                      }}
                      placeholder="Provide a specific, professional explanation of the issue encountered during verification review..."
                      className={`w-full bg-slate-900 border rounded-xl p-3 text-xs text-white placeholder-slate-500 ${
                        formErrors.reason ? 'border-rose-500' : 'border-slate-700'
                      }`}
                    />
                    {formErrors.reason && <p className="text-rose-400 text-[10px] mt-1">{formErrors.reason}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Supporting Findings / Evidence Notes
                    </label>
                    <textarea
                      rows={2}
                      value={draftEvidenceNotes}
                      onChange={(e) => {
                        setDraftEvidenceNotes(e.target.value);
                        setHasManualEdits(true);
                      }}
                      placeholder="Evidence notes or registry check details..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Corrective Actions <span className="text-slate-500 font-normal">(Permits recruiter to rectify issues)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={draftCorrectiveActions}
                      onChange={(e) => {
                        setDraftCorrectiveActions(e.target.value);
                        setHasManualEdits(true);
                      }}
                      placeholder="Actionable steps the recruiter should take to resolve this decision..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draftResubmissionAllowed}
                        onChange={(e) => {
                          setDraftResubmissionAllowed(e.target.checked);
                          setHasManualEdits(true);
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Permit Employer Corrections & Resubmission</span>
                        <span className="text-[11px] text-slate-400 block">
                          When checked, recruiter may update their profile and submit for re-review.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* IF REFER_REVIEW */}
              {selectedDecision === 'REFER_REVIEW' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Reason for Referral <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={draftReferralReason}
                      onChange={(e) => {
                        setDraftReferralReason(e.target.value);
                        setHasManualEdits(true);
                        if (formErrors.reason) setFormErrors({ ...formErrors, reason: '' });
                      }}
                      placeholder="Specify why this application requires secondary compliance review or manual investigation..."
                      className={`w-full bg-slate-900 border rounded-xl p-3 text-xs text-white placeholder-slate-500 ${
                        formErrors.reason ? 'border-rose-500' : 'border-slate-700'
                      }`}
                    />
                    {formErrors.reason && <p className="text-rose-400 text-[10px] mt-1">{formErrors.reason}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Additional Checks Required
                    </label>
                    <textarea
                      rows={2}
                      value={draftAdditionalChecks}
                      onChange={(e) => {
                        setDraftAdditionalChecks(e.target.value);
                        setHasManualEdits(true);
                      }}
                      placeholder="e.g. Cross-check entity in commercial court database or place direct telephone call."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Internal Investigation Notes
                    </label>
                    <textarea
                      rows={2}
                      value={draftEvidenceNotes}
                      onChange={(e) => {
                        setDraftEvidenceNotes(e.target.value);
                        setHasManualEdits(true);
                      }}
                      placeholder="Internal audit observations..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* PAGE 2 FORM ACTIONS */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <Button variant="secondary" onClick={() => setWorkspaceStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Review
              </Button>
              <Button
                variant="primary"
                onClick={handleProceedToPreview}
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold"
              >
                Preview Decision Summary <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 2: DECISION PREVIEW (SECTION 7) */}
        {/* ======================================================== */}
        {workspaceStep === 2 && decisionSubStep === 'preview' && (
          <div className="space-y-5 animate-fade-in">
            {/* Summary Header Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Decision Target</span>
                <h3 className="text-base font-bold text-white mt-0.5">{item.companyName}</h3>
                <p className="text-slate-400 text-xs">
                  Representative: <strong className="text-violet-300">{item.recruiterName}</strong> ({item.recruiterEmail})
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Outcome</span>
                  <span
                    className={`font-bold text-xs uppercase px-2.5 py-1 rounded-lg border ${
                      selectedDecision === 'APPROVE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : selectedDecision === 'REQUEST_EVIDENCE'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : selectedDecision === 'REJECT'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {selectedDecision.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Status Transition</span>
                  <span className="font-mono text-indigo-300 text-xs font-bold">
                    {item.verificationStatus.toUpperCase()} →{' '}
                    {selectedDecision === 'APPROVE'
                      ? 'VERIFIED'
                      : selectedDecision === 'REQUEST_EVIDENCE'
                      ? 'ADDITIONAL_EVIDENCE_REQUIRED'
                      : selectedDecision === 'REJECT'
                      ? 'REJECTED'
                      : 'IN_REVIEW'}
                  </span>
                </div>
              </div>
            </div>

            {/* Clear Separation of Shared Info vs Internal Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CONTAINER 1: SHARED WITH RECRUITER */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      Information Shared with Recruiter
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400">Delivered via Email & App</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-cyan-400/80 font-bold uppercase block">Stated Reason / Message</span>
                    <p className="text-white bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 leading-relaxed mt-1">
                      {selectedDecision === 'REFER_REVIEW' ? draftReferralReason : draftDecisionReason || 'No message stated.'}
                    </p>
                  </div>

                  {draftCorrectiveActions && (
                    <div>
                      <span className="text-[10px] text-cyan-400/80 font-bold uppercase block">Required Corrective Actions</span>
                      <p className="text-amber-300 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 leading-relaxed mt-1 whitespace-pre-wrap">
                        {draftCorrectiveActions}
                      </p>
                    </div>
                  )}

                  {selectedDecision === 'REJECT' && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px]">
                      <span className="text-slate-400 font-semibold">Resubmission Permission:</span>
                      <span className={draftResubmissionAllowed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {draftResubmissionAllowed ? 'Permitted by Administrator' : 'Declined (Final)'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* CONTAINER 2: INTERNAL ADMINISTRATOR NOTES */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Internal Administrator Notes
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400">Strictly Confidential</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Evidence & Audit Notes</span>
                    <p className="text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800 leading-relaxed mt-1 whitespace-pre-wrap">
                      {draftEvidenceNotes || draftInternalNotes || 'No additional internal audit notes documented.'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Recorded System Checks</span>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-[11px] mt-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Association Check:</span>
                        <span className="text-white font-mono">{editChecks.associationCheckStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Registry Check:</span>
                        <span className="text-white font-mono">{editChecks.registrationCheckStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Website Consistency:</span>
                        <span className="text-white font-mono">{editChecks.websiteConsistencyStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CONFIRMATION ACTIONS */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <Button variant="secondary" onClick={() => setDecisionSubStep('form')} disabled={isSubmitting}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Edit
              </Button>
              <Button
                variant="primary"
                onClick={handleFinalDecisionSubmit}
                isLoading={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Confirm & Execute Decision
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
