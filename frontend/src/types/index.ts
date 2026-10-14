export type Role = 'candidate' | 'recruiter' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'pending';

export type VerificationStatus =
  | 'pending'
  | 'in_review'
  | 'verified'
  | 'additional_evidence_required'
  | 'unable_to_verify'
  | 'rejected'
  | 'suspended'
  | 'archived'
  | 'resubmitted';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  status: UserStatus;
  createdAt: string;
  phone?: string;
  companyName?: string;
  title?: string;
  verificationStatus?: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  verificationReadinessScore?: number;
  verificationReadinessStatus?: string;
  riskScore?: number;
  riskLevel?: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  grade?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  technologies?: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  githubUrl?: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
  credentialId?: string;
}

export interface SkillCategory {
  technical: string[];
  soft: string[];
  tools: string[];
  languages: string[];
}

export interface CandidateProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  bio: string;
  avatar: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  skills: SkillCategory;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  profileCompletion: number; // 0 to 100
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  title?: string;
  fileSize: string;
  uploadDate: string;
  isPrimary: boolean;
  fileType: 'pdf' | 'docx';
  status: 'ready' | 'processing' | 'parsed';
  parsedData?: {
    extractedSkills: string[];
    extractedEducation: string[];
    extractedExperience: string[];
    extractedProjects: string[];
    extractedCertifications: string[];
  };
  resumeData?: string;
}

export interface ATSScoreBreakdown {
  keywordScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  formattingScore: number;
}

export interface ATSAnalysis {
  id: string;
  resumeId: string;
  overallScore: number;
  technicalScore: number;
  breakdown: ATSScoreBreakdown;
  missingKeywords: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  lastAnalyzed: string;
}

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid' | 'Internship';
export type ExperienceLevel = 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Lead' | 'Executive';
export type JobStatus = 'active' | 'closed' | 'draft' | 'pending_approval' | 'rejected' | 'archived';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string;
  companyLogo: string;
  department: string;
  location: string;
  type: EmploymentType;
  experienceLevel: ExperienceLevel;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: 'yearly' | 'monthly' | 'hourly';
  };
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  educationRequired: string;
  experienceRequiredYears: number;
  deadline: string;
  postedDate: string;
  status: JobStatus;
  applicantCount: number;
  recruiterId: string;
  matchScore?: number; // Computed score for candidate
  applied?: boolean;
  saved?: boolean;
  verifiedRecruiter?: boolean;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  moderatedAt?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterVerificationStatus?: string;
}

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Selected'
  | 'Rejected';

export interface ApplicationTimelineEvent {
  status: ApplicationStatus;
  date: string;
  note?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyLogo: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar: string;
  candidateTitle: string;
  candidateLocation: string;
  resumeId: string;
  resumeFileName: string;
  resumeUrl?: string;
  appliedDate: string;
  status: ApplicationStatus;
  atsScore: number;
  matchPercentage: number;
  skills: string[];
  experienceYears: number;
  education?: string;
  notes: string[];
  timeline: ApplicationTimelineEvent[];
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  industry: string;
  website: string;
  location: string;
  size: string;
  description: string;
  foundedYear: string;
  benefits: string[];
  contactEmail: string;
  contactPhone: string;
  verified: boolean;
  recruiterId?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  verificationStatus?: VerificationStatus;
  createdAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  businessRegistrationNumber?: string;
  taxId?: string;
  officialEmailDomain?: string;
  verificationDocumentUrl?: string;
  verificationEvidenceNotes?: string;
  registrationCheckStatus?: string;
  websiteConsistencyStatus?: string;
  associationVerified?: boolean;
  associationCheckStatus?: string;
  authorizationDocumentUrl?: string;
  authorizationNotes?: string;
  independentConfirmationNotes?: string;
  reverificationRequired?: boolean;
}

export interface PublicCompany {
  id: string;
  name: string;
  logo?: string;
  tagline?: string;
  industry?: string;
  website?: string;
  location?: string;
  size?: string;
  description?: string;
  foundedYear?: string;
  benefits?: string[];
  contactEmail?: string;
  verified?: boolean;
  recruiterName?: string;
  recruiterVerified?: boolean;
  activeJobsCount?: number;
}

export interface AdminStats {
  totalUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  pendingVerifications: number;
  verifiedRecruiters: number;
  rejectedRecruiters: number;
  suspendedRecruiters: number;
  additionalEvidenceRequiredRecruiters?: number;
  suspendedAccounts: number;
  activeAdmins: number;
  totalAdmins: number;
  multipleAdminsFlag: boolean;
  activeUsers: number;
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  totalApplications: number;
  pendingApplications?: number;
  shortlistedCount: number;
  selectedCount: number;
  rejectedCount: number;
  placementRate: number | null;
  systemHealth: string;

  // Section 1.B Company Verification Overview
  companiesAwaitingReview?: number;
  companiesVerified?: number;
  companyAssociationChecksPending?: number;
  companyDiscrepanciesCount?: number;
  companiesReverificationRequired?: number;

  // Section 1.C Job Safety Overview
  jobsPendingModeration?: number;
  jobsPublished?: number;
  jobsRejected?: number;
  jobsFlaggedSuspicious?: number;
  jobsCandidateReported?: number;
  jobsUnpublishedForInvestigation?: number;

  // Section 1.D Risk Review Overview
  highPriorityRiskCases?: number;
  duplicateRecruiterProfilesCount?: number;
  companyInfoMismatchesCount?: number;
  unresolvedAssociationChecksCount?: number;
  repeatedModerationViolationsCount?: number;
  openCandidateComplaintsCount?: number;
}

export interface RecruiterStats {
  activeJobs: number;
  totalApplicants: number;
  shortlisted: number;
  interviewsScheduled: number;
  hiresThisMonth: number;
  averageTimeToHireDays: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export type AuditSeverity = 'INFO' | 'NOTICE' | 'WARNING' | 'HIGH';
export type AuditResult = 'SUCCESS' | 'FAILURE' | 'BLOCKED';
export type AuditCategory =
  | 'ALL'
  | 'ACCOUNT_GOVERNANCE'
  | 'AUTHENTICATION_SECURITY'
  | 'RECRUITER_VERIFICATION'
  | 'JOB_MODERATION'
  | 'CANDIDATE_APPLICATIONS'
  | 'SYSTEM_OPERATIONS';

export interface SystemActivityLog {
  id: string;
  actorId?: string;
  actorName: string;
  actorRole: Role;
  action: string;
  eventType?: string;
  eventCategory?: string;
  severity?: AuditSeverity;
  result?: AuditResult;
  target: string;
  targetType?: string;
  targetId?: string;
  previousState?: string;
  newState?: string;
  reason?: string;
  ipAddress?: string;
  correlationId?: string;
  timestamp: string;
}

export interface AuditSummary {
  totalEvents: number;
  administrativeActions: number;
  securityEvents: number;
  failedOperations: number;
  accountGovernance: number;
  lastSyncTime: string;
  databaseConnected: boolean;
  todayEvents?: number;
  yesterdayEvents?: number;
  dailyCounts?: Record<string, number>;
  timezone?: string;
}

export interface AuditPageResult<T = SystemActivityLog> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AuditFilters {
  search?: string;
  category?: string;
  severity?: string;
  result?: string;
  actorRole?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  size: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

export interface AuditCleanupPreviewRequest {
  operationType: 'SPECIFIC_DATE' | 'DATE_RANGE' | 'DELETE_ALL';
  date?: string;
  startDate?: string;
  endDate?: string;
  timezone?: string;
  preserveHighSeverity?: boolean;
  preserveActiveToday?: boolean;
}

export interface AuditCleanupPreview {
  operationType: string;
  targetScopeLabel: string;
  totalMatching: number;
  eligibleForDeletion: number;
  protectedRecords: number;
  protectionReason: string;
  earliestTimestamp?: string;
  latestTimestamp?: string;
  timezone: string;
  estimatedReclaimedBytes: string;
  storageNotice: string;
}

export interface AuditCleanupExecutionRequest {
  operationType: 'SPECIFIC_DATE' | 'DATE_RANGE' | 'DELETE_ALL';
  date?: string;
  startDate?: string;
  endDate?: string;
  timezone?: string;
  confirmationCode?: string;
  preserveHighSeverity?: boolean;
  preserveActiveToday?: boolean;
  notes?: string;
}

export interface AuditCleanupReceipt {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  operationType: string;
  targetDate?: string;
  startDate?: string;
  endDate?: string;
  timezone: string;
  recordsSelected: number;
  recordsDeleted: number;
  recordsProtected: number;
  status: string;
  failureReason?: string;
  startedAt: string;
  completedAt: string;
  clientIp?: string;
  notes?: string;
}


export interface AiRiskFlagItem {
  category: string;
  reason: string;
  evidence: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendedAction: string;
  reviewStatus: string;
}

export interface RecruiterVerificationItem {
  recruiterId: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhone?: string;
  companyId?: string;
  companyName: string;
  companyLogo?: string;
  companyTagline?: string;
  industry?: string;
  website?: string;
  location?: string;
  size?: string;
  description?: string;
  foundedYear?: string;
  benefits?: string[];
  verificationStatus: VerificationStatus;
  verified: boolean;
  createdAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  rejectionCategory?: string;
  correctiveActions?: string;
  aiSuggestions?: string;
  resubmissionAllowed?: boolean;
  resubmissionNotes?: string;
  resubmittedAt?: string;
  history?: VerificationHistoryItem[];

  // Trust & Verification Fields
  phoneVerified?: boolean;
  emailVerified?: boolean;
  verificationReadinessScore?: number;
  verificationReadinessStatus?: string;
  riskScore?: number;
  riskLevel?: string;

  // Company Information & Authenticity
  businessRegistrationNumber?: string;
  taxId?: string;
  officialEmailDomain?: string;
  verificationDocumentUrl?: string;
  verificationEvidenceNotes?: string;
  registrationCheckStatus?: string;
  websiteConsistencyStatus?: string;

  // Company Association & Authorization
  associationVerified?: boolean;
  associationCheckStatus?: string;
  authorizationDocumentUrl?: string;
  authorizationNotes?: string;
  independentConfirmationNotes?: string;
  reverificationRequired?: boolean;

  // Explainable AI Risk Flags
  aiRiskFlags?: AiRiskFlagItem[];
}

export interface AiSuggestionItem {
  id: string;
  issue: string;
  whyItMatters: string;
  recommendedAction: string;
  requiredDocumentOrInfo: string;
  profileCorrectionInstructions: string;
  adminReviewRequired: boolean;
  status: string;
}

export interface VerificationHistoryItem {
  id: string;
  recruiterId: string;
  previousStatus?: string;
  newStatus?: string;
  action?: string;
  actorId?: string;
  actorName?: string;
  rejectionCategory?: string;
  rejectionReason?: string;
  decisionReason?: string;
  correctiveActions?: string;
  aiSuggestions?: any;
  resubmissionAllowed?: boolean;
  resubmissionNotes?: string;
  recruiterNotes?: string;
  createdAt: string;
}

export interface RecruiterVerificationDetail {
  recruiterId: string;
  recruiterName: string;
  recruiterEmail?: string;
  email?: string;
  recruiterPhone?: string;
  verificationStatus: VerificationStatus;
  verified: boolean;
  rejectionCategory?: string;
  rejectionReason?: string;
  correctiveActions?: string;
  aiSuggestions?: any;
  resubmissionAllowed?: boolean;
  resubmissionNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  resubmittedAt?: string;
  updatedAt?: string;
  company?: Company;
  companyName?: string;
  companyWebsite?: string;
  companyIndustry?: string;
  companyLocation?: string;
  companySize?: string;
  companyDescription?: string;
  businessRegistrationNumber?: string;
  taxId?: string;
  officialEmailDomain?: string;
  verificationDocumentUrl?: string;
  verificationEvidenceNotes?: string;
  authorizationDocumentUrl?: string;
  authorizationNotes?: string;
  history?: VerificationHistoryItem[];
}

export type CompanyProfile = Company;

export interface SecurityAlert {
  id: string;
  riskRecord: string;
  accountEmail: string;
  accountRole: 'RECRUITER' | 'CANDIDATE' | 'UNKNOWN';
  riskCategory: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  reviewStatus: 'PENDING' | 'UNDER_REVIEW' | 'CONFIRMED' | 'DISMISSED';
  adminDecision?: string;
  reviewedByAdmin?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecruitmentAnalytics {
  totalCandidates: number;
  totalRecruiters: number;
  pendingVerifications: number;
  verifiedRecruiters: number;
  rejectedRecruiters: number;
  suspendedAccounts: number;
  activeAdmins: number;
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  draftJobs: number;
  totalApplications: number;
  awaitingReview: number;
  shortlisted: number;
  interviewsScheduled: number;
  offersIssued: number;
  successfulHires: number;
  rejectedApplications: number;
  withdrawnApplications: number;
  pendingSecurityAlerts: number;
  totalSecurityAlerts: number;
  highRiskAlerts: number;
  applicationToShortlistRate: number | null;
  shortlistToInterviewRate: number | null;
  interviewToOfferRate: number | null;
  offerToHireRate: number | null;
  overallPlacementRate: number | null;
}

export interface RecruiterPerformanceItem {
  recruiterId: string;
  recruiterName: string;
  recruiterEmail: string;
  companyName: string;
  companyLogo?: string;
  verificationStatus: string;
  accountStatus: string;
  jobsSubmitted: number;
  jobsPending: number;
  jobsApproved: number;
  jobsRejected: number;
  activeJobs: number;
  closedJobs: number;
  totalApplications: number;
  shortlistedCandidates: number;
  interviewsScheduled: number;
  hires: number;
  applicationToInterviewRate?: number | null;
  interviewToHireRate?: number | null;
  placementRate?: number | null;
  lastActivityAt?: string;
}

export interface CandidatePerformanceItem {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  registeredAt?: string;
  profileCompletion: number;
  hasResume: boolean;
  applicationsCount: number;
  shortlistedCount: number;
  interviewsCount: number;
  offersCount: number;
  latestStatus?: string;
  lastActivityAt?: string;
}

export interface CandidatePerformanceData {
  totalCandidates: number;
  activeCandidates: number;
  totalApplications: number;
  applicationsUnderReview: number;
  shortlistedCount: number;
  interviewsScheduled: number;
  offersCount: number;
  hiredCount: number;
  shortlistingRate?: number | null;
  interviewRate?: number | null;
  placementRate?: number | null;
  candidates: CandidatePerformanceItem[];
}

export interface CandidateReport {
  id: string;
  reporterId: string;
  reporterEmail: string;
  reporterName: string;
  jobId: string;
  jobTitle: string;
  recruiterId?: string;
  recruiterName?: string;
  companyId?: string;
  companyName?: string;
  category: string;
  description: string;
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';
  assignedAdmin?: string;
  adminDecision?: string;
  adminNotes?: string;
  actionTaken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateReportRequest {
  jobId: string;
  category: string;
  description: string;
}

export interface CandidateReportReviewRequest {
  status: string;
  adminDecision?: string;
  adminNotes?: string;
  actionTaken?: string;
}


