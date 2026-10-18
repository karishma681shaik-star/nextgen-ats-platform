import { apiClient } from './apiClient';
import {
  AdminStats,
  User,
  Company,
  Job,
  SystemActivityLog,
  AuditSummary,
  AuditPageResult,
  AuditFilters,
  UserStatus,
  Role,
  RecruiterVerificationItem,
  AiSuggestionItem,
  VerificationHistoryItem,
  SecurityAlert,
  RecruitmentAnalytics,
  AuditCleanupPreviewRequest,
  AuditCleanupPreview,
  AuditCleanupExecutionRequest,
  AuditCleanupReceipt,
  RecruiterPerformanceItem,
  CandidatePerformanceData,
  CandidateReport,
  CandidateReportReviewRequest,
  AiRiskFlagItem,
  PlatformHealthResponse,
} from '../../types';
import { jobApi, mapJobDtoToJob } from './jobApi';

export interface UserFilters {
  role?: string;
  search?: string;
  status?: string;
}


export const adminApi = {
  async getStats(period?: string): Promise<AdminStats> {
    const url = period && period !== 'ALL' ? `/admin/stats?period=${encodeURIComponent(period)}` : '/admin/stats';
    const raw = await apiClient<any>(url);
    return {
      totalUsers: Number(raw.totalUsers ?? 0),
      totalCandidates: Number(raw.totalCandidates ?? 0),
      totalRecruiters: Number(raw.totalRecruiters ?? 0),
      pendingVerifications: Number(raw.pendingVerifications ?? 0),
      verifiedRecruiters: Number(raw.verifiedRecruiters ?? 0),
      rejectedRecruiters: Number(raw.rejectedRecruiters ?? 0),
      suspendedRecruiters: Number(raw.suspendedRecruiters ?? 0),
      additionalEvidenceRequiredRecruiters: Number(raw.additionalEvidenceRequiredRecruiters ?? 0),
      suspendedAccounts: Number(raw.suspendedAccounts ?? 0),
      activeAdmins: Number(raw.activeAdmins ?? 0),
      totalAdmins: Number(raw.totalAdmins ?? 0),
      multipleAdminsFlag: Boolean(raw.multipleAdminsFlag),
      activeUsers: Number(raw.activeUsers ?? 0),
      totalJobs: Number(raw.totalJobs ?? 0),
      activeJobs: Number(raw.activeJobs ?? 0),
      closedJobs: Number(raw.closedJobs ?? 0),
      totalApplications: Number(raw.totalApplications ?? 0),
      shortlistedCount: Number(raw.shortlistedCount ?? 0),
      selectedCount: Number(raw.selectedCount ?? 0),
      rejectedCount: Number(raw.rejectedCount ?? 0),
      placementRate: raw.placementRate !== undefined && raw.placementRate !== null ? Number(raw.placementRate) : null,
      systemHealth: raw.systemHealth || 'Operational (PostgreSQL Connected)',
      totalCompanies: Number(raw.totalCompanies ?? 0),

      // Platform Intelligence 2.0 Additions
      publishedJobsEligible: Number(raw.publishedJobsEligible ?? 0),
      candidatesInActivePipeline: Number(raw.candidatesInActivePipeline ?? 0),
      candidatesWithApplications: Number(raw.candidatesWithApplications ?? 0),
      candidatesShortlisted: Number(raw.candidatesShortlisted ?? 0),
      candidatesWithInterviews: Number(raw.candidatesWithInterviews ?? 0),
      candidatesWithOffers: Number(raw.candidatesWithOffers ?? 0),
      candidatesHired: Number(raw.candidatesHired ?? 0),
      interviewsScheduled: Number(raw.interviewsScheduled ?? 0),
      offersExtended: Number(raw.offersExtended ?? 0),
      reportingPeriod: raw.reportingPeriod || 'ALL',
      periodTotalApplications: Number(raw.periodTotalApplications ?? 0),
      periodNewUsers: Number(raw.periodNewUsers ?? 0),
      periodNewJobs: Number(raw.periodNewJobs ?? 0),
      periodSecurityAlerts: Number(raw.periodSecurityAlerts ?? 0),

      // Verification Categories (mutually exclusive)
      verificationPendingCount: Number(raw.verificationPendingCount ?? 0),
      verificationInReviewCount: Number(raw.verificationInReviewCount ?? 0),
      verificationEvidenceRequiredCount: Number(raw.verificationEvidenceRequiredCount ?? 0),
      verificationVerifiedCount: Number(raw.verificationVerifiedCount ?? 0),
      verificationRejectedCount: Number(raw.verificationRejectedCount ?? 0),
      verificationSuspendedCount: Number(raw.verificationSuspendedCount ?? 0),

      // Section 1.B Company Verification Overview
      companiesAwaitingReview: Number(raw.companiesAwaitingReview ?? 0),
      companiesVerified: Number(raw.companiesVerified ?? 0),
      companyAssociationChecksPending: Number(raw.companyAssociationChecksPending ?? 0),
      companyDiscrepanciesCount: Number(raw.companyDiscrepanciesCount ?? 0),
      companiesReverificationRequired: Number(raw.companiesReverificationRequired ?? 0),

      // Section 1.C Job Safety Overview
      jobsPendingModeration: Number(raw.jobsPendingModeration ?? 0),
      jobsPublished: Number(raw.jobsPublished ?? 0),
      jobsRejected: Number(raw.jobsRejected ?? 0),
      jobsFlaggedSuspicious: Number(raw.jobsFlaggedSuspicious ?? 0),
      jobsCandidateReported: Number(raw.jobsCandidateReported ?? 0),
      jobsUnpublishedForInvestigation: Number(raw.jobsUnpublishedForInvestigation ?? 0),

      // Section 1.D Risk Review Overview
      highPriorityRiskCases: Number(raw.highPriorityRiskCases ?? 0),
      duplicateRecruiterProfilesCount: Number(raw.duplicateRecruiterProfilesCount ?? 0),
      companyInfoMismatchesCount: Number(raw.companyInfoMismatchesCount ?? 0),
      unresolvedAssociationChecksCount: Number(raw.unresolvedAssociationChecksCount ?? 0),
      repeatedModerationViolationsCount: Number(raw.repeatedModerationViolationsCount ?? 0),
      openCandidateComplaintsCount: Number(raw.openCandidateComplaintsCount ?? 0),
    };
  },

  async getUsers(role?: Role | 'All', search?: string): Promise<User[]> {
    return this.getAllUsers({ role: role === 'All' ? undefined : role, search });
  },

  async getAllUsers(filters?: UserFilters): Promise<User[]> {
    const params = new URLSearchParams();
    if (filters?.role && filters.role !== 'All' && filters.role !== 'all') {
      params.append('role', filters.role);
    }
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.search && filters.search.trim()) {
      params.append('search', filters.search.trim());
    }

    const queryString = params.toString();
    const rawUsers = await apiClient<any[]>(`/admin/users${queryString ? `?${queryString}` : ''}`);

    return (rawUsers || []).map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as Role,
      avatar: u.avatar || null,
      companyName: u.companyName,
      status: (u.status || 'active') as UserStatus,
      createdAt: u.createdAt ? u.createdAt.split('T')[0] : '',
      phone: u.phone,
      title: u.title,
      verificationStatus: u.verificationStatus,
      verifiedAt: u.verifiedAt,
      verifiedBy: u.verifiedBy,
      rejectionReason: u.rejectionReason,
    }));
  },

  async getVerificationQueue(status?: string): Promise<RecruiterVerificationItem[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') {
      params.append('status', status);
    }
    const queryString = params.toString();
    const rawList = await apiClient<any[]>(`/admin/recruiters${queryString ? `?${queryString}` : ''}`);

    return (rawList || []).map((r: any) => ({
      recruiterId: r.recruiterId,
      recruiterName: r.recruiterName,
      recruiterEmail: r.recruiterEmail,
      recruiterPhone: r.recruiterPhone,
      companyId: r.companyId,
      companyName: r.companyName,
      companyLogo: r.companyLogo || null,
      companyTagline: r.companyTagline,
      industry: r.industry,
      website: r.website,
      location: r.location,
      size: r.size,
      description: r.description,
      foundedYear: r.foundedYear,
      benefits: r.benefits || [],
      verificationStatus: r.verificationStatus,
      verified: !!r.verified,
      createdAt: r.createdAt,
      verifiedAt: r.verifiedAt,
      verifiedBy: r.verifiedBy,
      rejectionReason: r.rejectionReason,
      rejectionCategory: r.rejectionCategory,
      correctiveActions: r.correctiveActions,
      aiSuggestions: r.aiSuggestions,
      resubmissionAllowed: r.resubmissionAllowed,
      resubmissionNotes: r.resubmissionNotes,
      resubmittedAt: r.resubmittedAt,
      history: r.history || [],

      // Trust & Verification Fields
      phoneVerified: !!r.phoneVerified,
      emailVerified: !!r.emailVerified,
      verificationReadinessScore: Number(r.verificationReadinessScore ?? 0),
      verificationReadinessStatus: r.verificationReadinessStatus || 'Mandatory Check Incomplete',
      riskScore: Number(r.riskScore ?? 0),
      riskLevel: r.riskLevel || 'LOW',

      // Company Information & Authenticity
      businessRegistrationNumber: r.businessRegistrationNumber,
      taxId: r.taxId,
      officialEmailDomain: r.officialEmailDomain,
      verificationDocumentUrl: r.verificationDocumentUrl,
      verificationEvidenceNotes: r.verificationEvidenceNotes,
      registrationCheckStatus: r.registrationCheckStatus,
      websiteConsistencyStatus: r.websiteConsistencyStatus,

      // Company Association & Authorization
      associationVerified: !!r.associationVerified,
      associationCheckStatus: r.associationCheckStatus,
      authorizationDocumentUrl: r.authorizationDocumentUrl,
      authorizationNotes: r.authorizationNotes,
      independentConfirmationNotes: r.independentConfirmationNotes,
      reverificationRequired: !!r.reverificationRequired,

      // Explainable AI Risk Flags
      aiRiskFlags: r.aiRiskFlags || [],
    }));
  },

  async approveRecruiter(recruiterId: string): Promise<RecruiterVerificationItem> {
    return apiClient<RecruiterVerificationItem>(`/admin/recruiters/${recruiterId}/approve`, {
      method: 'POST',
    });
  },

  async rejectRecruiter(
    recruiterId: string,
    decision: {
      category?: string;
      reason: string;
      correctiveActions?: string;
      aiSuggestions?: string;
      resubmissionAllowed?: boolean;
      resubmissionNotes?: string;
    } | string
  ): Promise<RecruiterVerificationItem> {
    const payload = typeof decision === 'string'
      ? { reason: decision }
      : decision;
    return apiClient<RecruiterVerificationItem>(`/admin/recruiters/${recruiterId}/reject`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async requestAdditionalEvidence(
    recruiterId: string,
    decision: {
      category?: string;
      reason: string;
      correctiveActions?: string;
      aiSuggestions?: string;
    }
  ): Promise<RecruiterVerificationItem> {
    return apiClient<RecruiterVerificationItem>(`/admin/recruiters/${recruiterId}/request-evidence`, {
      method: 'POST',
      body: JSON.stringify(decision),
    });
  },

  async reopenVerification(recruiterId: string): Promise<RecruiterVerificationItem> {
    return apiClient<RecruiterVerificationItem>(`/admin/recruiters/${recruiterId}/reopen`, {
      method: 'POST',
    });
  },

  async updateCompanyChecks(
    recruiterId: string,
    checks: Record<string, any>
  ): Promise<RecruiterVerificationItem> {
    return apiClient<RecruiterVerificationItem>(`/admin/recruiters/${recruiterId}/company-checks`, {
      method: 'PATCH',
      body: JSON.stringify(checks),
    });
  },

  async generateAiSuggestions(
    recruiterId: string,
    category: string,
    reason: string
  ): Promise<AiSuggestionItem[]> {
    return apiClient<AiSuggestionItem[]>(`/admin/recruiters/${recruiterId}/ai-suggestions`, {
      method: 'POST',
      body: JSON.stringify({ category, reason }),
    });
  },

  async getRecruiterVerificationHistory(
    recruiterId: string
  ): Promise<VerificationHistoryItem[]> {
    return apiClient<VerificationHistoryItem[]>(`/admin/recruiters/${recruiterId}/history`);
  },

  async suspendRecruiter(recruiterId: string, reason?: string): Promise<RecruiterVerificationItem> {
    return apiClient<RecruiterVerificationItem>(`/admin/recruiters/${recruiterId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || 'Account suspended by platform governance' }),
    });
  },

  async reactivateRecruiter(recruiterId: string): Promise<RecruiterVerificationItem> {
    return apiClient<RecruiterVerificationItem>(`/admin/recruiters/${recruiterId}/reactivate`, {
      method: 'POST',
    });
  },

  async deleteRejectedRecruiter(recruiterId: string): Promise<void> {
    await apiClient(`/admin/recruiters/${recruiterId}`, {
      method: 'DELETE',
    });
  },

  // ─── CANDIDATE SAFETY REPORTS MODERATION API ──────────────────────────────

  async getCandidateReports(params?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<CandidateReport[]> {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') {
      searchParams.append('status', params.status);
    }
    if (params?.category && params.category !== 'ALL') {
      searchParams.append('category', params.category);
    }
    if (params?.search && params.search.trim()) {
      searchParams.append('search', params.search.trim());
    }
    const query = searchParams.toString();
    return apiClient<CandidateReport[]>(`/admin/reports${query ? `?${query}` : ''}`);
  },

  async getCandidateReportById(reportId: string): Promise<CandidateReport> {
    return apiClient<CandidateReport>(`/admin/reports/${reportId}`);
  },

  async reviewCandidateReport(
    reportId: string,
    request: CandidateReportReviewRequest
  ): Promise<CandidateReport> {
    return apiClient<CandidateReport>(`/admin/reports/${reportId}/review`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  },

  async setUserStatus(userId: string, targetStatus: 'active' | 'suspended'): Promise<User> {
    const raw = await apiClient<any>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: targetStatus.toUpperCase() }),
    });
    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      role: raw.role as Role,
      avatar: raw.avatar || null,
      companyName: raw.companyName,
      status: (raw.status || 'active') as UserStatus,
      createdAt: raw.createdAt ? raw.createdAt.split('T')[0] : '',
      phone: raw.phone,
      title: raw.title,
      verificationStatus: raw.verificationStatus,
      verifiedAt: raw.verifiedAt,
      verifiedBy: raw.verifiedBy,
      rejectionReason: raw.rejectionReason,
    };
  },

  async toggleUserStatus(userId: string, status: UserStatus | string): Promise<User> {
    const newStatus = status === 'active' ? 'suspended' : 'active';
    return this.setUserStatus(userId, newStatus as any);
  },

  async deleteUser(userId: string): Promise<void> {
    await apiClient(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async getActivityLogs(): Promise<SystemActivityLog[]> {
    const rawLogs = await apiClient<any[]>('/admin/activity');
    return (rawLogs || []).map((l: any) => ({
      id: l.id,
      actorName: l.actorName || 'System',
      actorRole: (l.actorRole ? l.actorRole.toLowerCase() : 'admin') as Role,
      action: l.action,
      target: l.target,
      timestamp: l.timestamp,
      ipAddress: l.ipAddress,
      result: l.result || 'SUCCESS',
      reason: l.reason,
      severity: l.severity,
      eventType: l.eventType,
      eventCategory: l.eventCategory,
    }));
  },

  async getJobsForModeration(status?: string, search?: string): Promise<Job[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    const queryString = params.toString();
    const endpoint = `/admin/jobs${queryString ? `?${queryString}` : ''}`;
    const rawJobs = await apiClient<any[]>(endpoint);
    return rawJobs.map(mapJobDtoToJob);
  },

  async approveJob(jobId: string): Promise<Job> {
    const raw = await apiClient<any>(`/admin/jobs/${jobId}/approve`, {
      method: 'POST',
    });
    return mapJobDtoToJob(raw);
  },

  async rejectJob(jobId: string, reason: string): Promise<Job> {
    const raw = await apiClient<any>(`/admin/jobs/${jobId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return mapJobDtoToJob(raw);
  },

  async archiveJob(jobId: string): Promise<Job> {
    const raw = await apiClient<any>(`/admin/jobs/${jobId}/archive`, {
      method: 'POST',
    });
    return mapJobDtoToJob(raw);
  },

  async deleteJob(jobId: string): Promise<void> {
    await apiClient<void>(`/admin/jobs/${jobId}`, {
      method: 'DELETE',
    });
  },

  async moderateJob(jobId: string, action: 'approve' | 'reject' | 'remove', reason?: string): Promise<void> {
    if (action === 'approve') {
      await this.approveJob(jobId);
    } else if (action === 'reject') {
      await this.rejectJob(jobId, reason || 'Requisition does not meet platform standards');
    } else {
      await this.archiveJob(jobId);
    }
  },

  async getAllJobs(): Promise<Job[]> {
    return this.getJobsForModeration('all');
  },

  async getRecruiterPerformance(): Promise<RecruiterPerformanceItem[]> {
    return apiClient<RecruiterPerformanceItem[]>('/admin/analytics/recruiter-performance');
  },

  async getCandidatePerformance(): Promise<CandidatePerformanceData> {
    return apiClient<CandidatePerformanceData>('/admin/analytics/candidate-performance');
  },

  async getRecruitmentAnalytics(): Promise<RecruitmentAnalytics> {
    return apiClient<RecruitmentAnalytics>('/admin/analytics/recruitment');
  },

  async getPlatformHealth(): Promise<PlatformHealthResponse> {
    return apiClient<PlatformHealthResponse>('/admin/analytics/health');
  },

  async getRecentActivity(limit = 15): Promise<SystemActivityLog[]> {
    return apiClient<SystemActivityLog[]>(`/admin/analytics/recent-activity?limit=${limit}`);
  },

  async getSecurityAlerts(filters?: { status?: string; riskLevel?: string; search?: string }): Promise<SecurityAlert[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.riskLevel && filters.riskLevel !== 'all') params.append('riskLevel', filters.riskLevel);
    if (filters?.search && filters.search.trim()) params.append('search', filters.search.trim());
    const query = params.toString();
    return apiClient<SecurityAlert[]>(`/admin/security-alerts${query ? `?${query}` : ''}`);
  },

  async getSecurityAlertsSummary(): Promise<{ pendingCount: number; totalCount: number; highRiskCount: number }> {
    return apiClient<{ pendingCount: number; totalCount: number; highRiskCount: number }>('/admin/security-alerts/summary');
  },

  async reviewSecurityAlert(alertId: string, decision: { decision: string; action: string; note?: string }): Promise<SecurityAlert> {
    return apiClient<SecurityAlert>(`/admin/security-alerts/${alertId}/review`, {
      method: 'PATCH',
      body: JSON.stringify(decision),
    });
  },

  async getAuditEvents(filters?: Partial<AuditFilters>): Promise<AuditPageResult<SystemActivityLog>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters?.severity && filters.severity !== 'ALL') params.append('severity', filters.severity);
    if (filters?.result && filters.result !== 'ALL') params.append('result', filters.result);
    if (filters?.actorRole && filters.actorRole !== 'ALL') params.append('actorRole', filters.actorRole);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page !== undefined) params.append('page', String(filters.page));
    if (filters?.size !== undefined) params.append('size', String(filters.size));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortDir) params.append('sortDir', filters.sortDir);

    const query = params.toString();
    const raw = await apiClient<AuditPageResult<any>>(`/admin/audit-events${query ? `?${query}` : ''}`);
    return {
      ...raw,
      content: (raw.content || []).map((l: any) => ({
        id: l.id,
        actorId: l.actorId,
        actorName: l.actorName || 'System',
        actorRole: (l.actorRole ? l.actorRole.toLowerCase() : 'admin') as Role,
        action: l.action,
        eventType: l.eventType,
        eventCategory: l.eventCategory,
        severity: l.severity,
        result: l.result,
        target: l.target,
        targetType: l.targetType,
        targetId: l.targetId,
        previousState: l.previousState,
        newState: l.newState,
        reason: l.reason,
        ipAddress: l.ipAddress,
        correlationId: l.correlationId,
        timestamp: l.timestamp,
      })),
    };
  },

  async getAuditEvent(id: string): Promise<SystemActivityLog> {
    const l = await apiClient<any>(`/admin/audit-events/${id}`);
    return {
      id: l.id,
      actorId: l.actorId,
      actorName: l.actorName || 'System',
      actorRole: (l.actorRole ? l.actorRole.toLowerCase() : 'admin') as Role,
      action: l.action,
      eventType: l.eventType,
      eventCategory: l.eventCategory,
      severity: l.severity,
      result: l.result,
      target: l.target,
      targetType: l.targetType,
      targetId: l.targetId,
      previousState: l.previousState,
      newState: l.newState,
      reason: l.reason,
      ipAddress: l.ipAddress,
      correlationId: l.correlationId,
      timestamp: l.timestamp,
    };
  },

  async getAuditSummary(params?: {
    search?: string;
    category?: string;
    severity?: string;
    result?: string;
    actorRole?: string;
    startDate?: string;
    endDate?: string;
    timezone?: string;
  }): Promise<AuditSummary> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category && params.category !== 'ALL') searchParams.append('category', params.category);
    if (params?.severity && params.severity !== 'ALL') searchParams.append('severity', params.severity);
    if (params?.result && params.result !== 'ALL') searchParams.append('result', params.result);
    if (params?.actorRole && params.actorRole !== 'ALL') searchParams.append('actorRole', params.actorRole);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.timezone) searchParams.append('timezone', params.timezone);
    const query = searchParams.toString();
    return apiClient<AuditSummary>(`/admin/audit-events/summary${query ? `?${query}` : ''}`);
  },

  async getRelatedAuditEvents(id: string): Promise<SystemActivityLog[]> {
    const list = await apiClient<any[]>(`/admin/audit-events/${id}/related`);
    return (list || []).map((l: any) => ({
      id: l.id,
      actorId: l.actorId,
      actorName: l.actorName || 'System',
      actorRole: (l.actorRole ? l.actorRole.toLowerCase() : 'admin') as Role,
      action: l.action,
      eventType: l.eventType,
      eventCategory: l.eventCategory,
      severity: l.severity,
      result: l.result,
      target: l.target,
      targetType: l.targetType,
      targetId: l.targetId,
      previousState: l.previousState,
      newState: l.newState,
      reason: l.reason,
      ipAddress: l.ipAddress,
      correlationId: l.correlationId,
      timestamp: l.timestamp,
    }));
  },

  async exportAuditReport(filters?: Partial<AuditFilters>): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters?.severity && filters.severity !== 'ALL') params.append('severity', filters.severity);
    if (filters?.result && filters.result !== 'ALL') params.append('result', filters.result);
    if (filters?.actorRole && filters.actorRole !== 'ALL') params.append('actorRole', filters.actorRole);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const token = localStorage.getItem('ai_ats_token') || sessionStorage.getItem('ai_ats_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
    const query = params.toString();
    const url = `/api/admin/audit-events/export${query ? `?${query}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed with status ${response.status}`);
    }

    return response.blob();
  },

  async previewAuditCleanup(request: AuditCleanupPreviewRequest): Promise<AuditCleanupPreview> {
    return apiClient<AuditCleanupPreview>('/admin/audit/cleanup/preview', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async executeAuditCleanup(request: AuditCleanupExecutionRequest): Promise<AuditCleanupReceipt> {
    return apiClient<AuditCleanupReceipt>('/admin/audit/cleanup/execute', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async getAuditCleanupHistory(): Promise<AuditCleanupReceipt[]> {
    return apiClient<AuditCleanupReceipt[]>('/admin/audit/cleanup/history');
  },
};


