package com.aiats.dto.admin;

public class AdminStatsDTO {
    // Basic Platform Counts
    private long totalUsers;
    private long totalCandidates;
    private long totalRecruiters;
    private long pendingVerifications;
    private long verifiedRecruiters;
    private long rejectedRecruiters;
    private long suspendedRecruiters;
    private long activeUsers;
    private long suspendedAccounts;
    private long activeAdmins;
    private long totalAdmins;
    private boolean multipleAdminsFlag;
    private long totalJobs;
    private long activeJobs;
    private long closedJobs;
    private long totalApplications;
    private long pendingApplications;
    private long shortlistedCount;
    private long selectedCount;
    private long rejectedCount;
    private long totalCompanies;
    private Double placementRate; // null if outcome data is unavailable
    private String systemHealth = "100% Operational (PostgreSQL Connected)";

    // SECTION 1.A: RECRUITER VERIFICATION OVERVIEW
    private long additionalEvidenceRequiredRecruiters;

    // SECTION 1.B: COMPANY VERIFICATION OVERVIEW
    private long companiesAwaitingReview;
    private long companiesVerified;
    private long companyAssociationChecksPending;
    private long companyDiscrepanciesCount;
    private long companiesReverificationRequired;

    // SECTION 1.C: JOB SAFETY OVERVIEW
    private long jobsPendingModeration;
    private long jobsPublished;
    private long jobsRejected;
    private long jobsFlaggedSuspicious;
    private long jobsCandidateReported;
    private long jobsUnpublishedForInvestigation;

    // SECTION 1.D: RISK REVIEW OVERVIEW
    private long highPriorityRiskCases;
    private long duplicateRecruiterProfilesCount;
    private long companyInfoMismatchesCount;
    private long unresolvedAssociationChecksCount;
    private long repeatedModerationViolationsCount;
    private long openCandidateComplaintsCount;

    // Platform Intelligence 2.0 Additions
    private long publishedJobsEligible;
    private long candidatesInActivePipeline;
    private long candidatesWithApplications;
    private long candidatesShortlisted;
    private long candidatesWithInterviews;
    private long candidatesWithOffers;
    private long candidatesHired;
    private long interviewsScheduled;
    private long offersExtended;
    private String reportingPeriod = "ALL";
    private long periodTotalApplications;
    private long periodNewUsers;
    private long periodNewJobs;
    private long periodSecurityAlerts;

    // Verification Category Counts (mutually exclusive)
    private long verificationPendingCount;
    private long verificationInReviewCount;
    private long verificationEvidenceRequiredCount;
    private long verificationVerifiedCount;
    private long verificationRejectedCount;
    private long verificationSuspendedCount;

    public AdminStatsDTO() {}

    public long getTotalCompanies() { return totalCompanies; }
    public void setTotalCompanies(long totalCompanies) { this.totalCompanies = totalCompanies; }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalCandidates() { return totalCandidates; }
    public void setTotalCandidates(long totalCandidates) { this.totalCandidates = totalCandidates; }

    public long getTotalRecruiters() { return totalRecruiters; }
    public void setTotalRecruiters(long totalRecruiters) { this.totalRecruiters = totalRecruiters; }

    public long getPendingVerifications() { return pendingVerifications; }
    public void setPendingVerifications(long pendingVerifications) { this.pendingVerifications = pendingVerifications; }

    public long getVerifiedRecruiters() { return verifiedRecruiters; }
    public void setVerifiedRecruiters(long verifiedRecruiters) { this.verifiedRecruiters = verifiedRecruiters; }

    public long getRejectedRecruiters() { return rejectedRecruiters; }
    public void setRejectedRecruiters(long rejectedRecruiters) { this.rejectedRecruiters = rejectedRecruiters; }

    public long getSuspendedRecruiters() { return suspendedRecruiters; }
    public void setSuspendedRecruiters(long suspendedRecruiters) { this.suspendedRecruiters = suspendedRecruiters; }

    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }

    public long getTotalJobs() { return totalJobs; }
    public void setTotalJobs(long totalJobs) { this.totalJobs = totalJobs; }

    public long getActiveJobs() { return activeJobs; }
    public void setActiveJobs(long activeJobs) { this.activeJobs = activeJobs; }

    public long getClosedJobs() { return closedJobs; }
    public void setClosedJobs(long closedJobs) { this.closedJobs = closedJobs; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getPendingApplications() { return pendingApplications; }
    public void setPendingApplications(long pendingApplications) { this.pendingApplications = pendingApplications; }

    public long getShortlistedCount() { return shortlistedCount; }
    public void setShortlistedCount(long shortlistedCount) { this.shortlistedCount = shortlistedCount; }

    public long getSelectedCount() { return selectedCount; }
    public void setSelectedCount(long selectedCount) { this.selectedCount = selectedCount; }

    public long getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(long rejectedCount) { this.rejectedCount = rejectedCount; }

    public Double getPlacementRate() { return placementRate; }
    public void setPlacementRate(Double placementRate) { this.placementRate = placementRate; }

    public String getSystemHealth() { return systemHealth; }
    public void setSystemHealth(String systemHealth) { this.systemHealth = systemHealth; }

    public long getSuspendedAccounts() { return suspendedAccounts; }
    public void setSuspendedAccounts(long suspendedAccounts) { this.suspendedAccounts = suspendedAccounts; }

    public long getActiveAdmins() { return activeAdmins; }
    public void setActiveAdmins(long activeAdmins) { this.activeAdmins = activeAdmins; }

    public long getTotalAdmins() { return totalAdmins; }
    public void setTotalAdmins(long totalAdmins) { this.totalAdmins = totalAdmins; }

    public boolean isMultipleAdminsFlag() { return multipleAdminsFlag; }
    public void setMultipleAdminsFlag(boolean multipleAdminsFlag) { this.multipleAdminsFlag = multipleAdminsFlag; }

    // Section 1.A Getters and Setters
    public long getAdditionalEvidenceRequiredRecruiters() { return additionalEvidenceRequiredRecruiters; }
    public void setAdditionalEvidenceRequiredRecruiters(long additionalEvidenceRequiredRecruiters) { this.additionalEvidenceRequiredRecruiters = additionalEvidenceRequiredRecruiters; }

    // Section 1.B Getters and Setters
    public long getCompaniesAwaitingReview() { return companiesAwaitingReview; }
    public void setCompaniesAwaitingReview(long companiesAwaitingReview) { this.companiesAwaitingReview = companiesAwaitingReview; }

    public long getCompaniesVerified() { return companiesVerified; }
    public void setCompaniesVerified(long companiesVerified) { this.companiesVerified = companiesVerified; }

    public long getCompanyAssociationChecksPending() { return companyAssociationChecksPending; }
    public void setCompanyAssociationChecksPending(long companyAssociationChecksPending) { this.companyAssociationChecksPending = companyAssociationChecksPending; }

    public long getCompanyDiscrepanciesCount() { return companyDiscrepanciesCount; }
    public void setCompanyDiscrepanciesCount(long companyDiscrepanciesCount) { this.companyDiscrepanciesCount = companyDiscrepanciesCount; }

    public long getCompaniesReverificationRequired() { return companiesReverificationRequired; }
    public void setCompaniesReverificationRequired(long companiesReverificationRequired) { this.companiesReverificationRequired = companiesReverificationRequired; }

    // Section 1.C Getters and Setters
    public long getJobsPendingModeration() { return jobsPendingModeration; }
    public void setJobsPendingModeration(long jobsPendingModeration) { this.jobsPendingModeration = jobsPendingModeration; }

    public long getJobsPublished() { return jobsPublished; }
    public void setJobsPublished(long jobsPublished) { this.jobsPublished = jobsPublished; }

    public long getJobsRejected() { return jobsRejected; }
    public void setJobsRejected(long jobsRejected) { this.jobsRejected = jobsRejected; }

    public long getJobsFlaggedSuspicious() { return jobsFlaggedSuspicious; }
    public void setJobsFlaggedSuspicious(long jobsFlaggedSuspicious) { this.jobsFlaggedSuspicious = jobsFlaggedSuspicious; }

    public long getJobsCandidateReported() { return jobsCandidateReported; }
    public void setJobsCandidateReported(long jobsCandidateReported) { this.jobsCandidateReported = jobsCandidateReported; }

    public long getJobsUnpublishedForInvestigation() { return jobsUnpublishedForInvestigation; }
    public void setJobsUnpublishedForInvestigation(long jobsUnpublishedForInvestigation) { this.jobsUnpublishedForInvestigation = jobsUnpublishedForInvestigation; }

    // Section 1.D Getters and Setters
    public long getHighPriorityRiskCases() { return highPriorityRiskCases; }
    public void setHighPriorityRiskCases(long highPriorityRiskCases) { this.highPriorityRiskCases = highPriorityRiskCases; }

    public long getDuplicateRecruiterProfilesCount() { return duplicateRecruiterProfilesCount; }
    public void setDuplicateRecruiterProfilesCount(long duplicateRecruiterProfilesCount) { this.duplicateRecruiterProfilesCount = duplicateRecruiterProfilesCount; }

    public long getCompanyInfoMismatchesCount() { return companyInfoMismatchesCount; }
    public void setCompanyInfoMismatchesCount(long companyInfoMismatchesCount) { this.companyInfoMismatchesCount = companyInfoMismatchesCount; }

    public long getUnresolvedAssociationChecksCount() { return unresolvedAssociationChecksCount; }
    public void setUnresolvedAssociationChecksCount(long unresolvedAssociationChecksCount) { this.unresolvedAssociationChecksCount = unresolvedAssociationChecksCount; }

    public long getRepeatedModerationViolationsCount() { return repeatedModerationViolationsCount; }
    public void setRepeatedModerationViolationsCount(long repeatedModerationViolationsCount) { this.repeatedModerationViolationsCount = repeatedModerationViolationsCount; }

    public long getOpenCandidateComplaintsCount() { return openCandidateComplaintsCount; }
    public void setOpenCandidateComplaintsCount(long openCandidateComplaintsCount) { this.openCandidateComplaintsCount = openCandidateComplaintsCount; }

    public long getPublishedJobsEligible() { return publishedJobsEligible; }
    public void setPublishedJobsEligible(long publishedJobsEligible) { this.publishedJobsEligible = publishedJobsEligible; }

    public long getCandidatesInActivePipeline() { return candidatesInActivePipeline; }
    public void setCandidatesInActivePipeline(long candidatesInActivePipeline) { this.candidatesInActivePipeline = candidatesInActivePipeline; }

    public long getCandidatesWithApplications() { return candidatesWithApplications; }
    public void setCandidatesWithApplications(long candidatesWithApplications) { this.candidatesWithApplications = candidatesWithApplications; }

    public long getCandidatesShortlisted() { return candidatesShortlisted; }
    public void setCandidatesShortlisted(long candidatesShortlisted) { this.candidatesShortlisted = candidatesShortlisted; }

    public long getCandidatesWithInterviews() { return candidatesWithInterviews; }
    public void setCandidatesWithInterviews(long candidatesWithInterviews) { this.candidatesWithInterviews = candidatesWithInterviews; }

    public long getCandidatesWithOffers() { return candidatesWithOffers; }
    public void setCandidatesWithOffers(long candidatesWithOffers) { this.candidatesWithOffers = candidatesWithOffers; }

    public long getCandidatesHired() { return candidatesHired; }
    public void setCandidatesHired(long candidatesHired) { this.candidatesHired = candidatesHired; }

    public long getInterviewsScheduled() { return interviewsScheduled; }
    public void setInterviewsScheduled(long interviewsScheduled) { this.interviewsScheduled = interviewsScheduled; }

    public long getOffersExtended() { return offersExtended; }
    public void setOffersExtended(long offersExtended) { this.offersExtended = offersExtended; }

    public String getReportingPeriod() { return reportingPeriod; }
    public void setReportingPeriod(String reportingPeriod) { this.reportingPeriod = reportingPeriod; }

    public long getPeriodTotalApplications() { return periodTotalApplications; }
    public void setPeriodTotalApplications(long periodTotalApplications) { this.periodTotalApplications = periodTotalApplications; }

    public long getPeriodNewUsers() { return periodNewUsers; }
    public void setPeriodNewUsers(long periodNewUsers) { this.periodNewUsers = periodNewUsers; }

    public long getPeriodNewJobs() { return periodNewJobs; }
    public void setPeriodNewJobs(long periodNewJobs) { this.periodNewJobs = periodNewJobs; }

    public long getPeriodSecurityAlerts() { return periodSecurityAlerts; }
    public void setPeriodSecurityAlerts(long periodSecurityAlerts) { this.periodSecurityAlerts = periodSecurityAlerts; }

    public long getVerificationPendingCount() { return verificationPendingCount; }
    public void setVerificationPendingCount(long verificationPendingCount) { this.verificationPendingCount = verificationPendingCount; }

    public long getVerificationInReviewCount() { return verificationInReviewCount; }
    public void setVerificationInReviewCount(long verificationInReviewCount) { this.verificationInReviewCount = verificationInReviewCount; }

    public long getVerificationEvidenceRequiredCount() { return verificationEvidenceRequiredCount; }
    public void setVerificationEvidenceRequiredCount(long verificationEvidenceRequiredCount) { this.verificationEvidenceRequiredCount = verificationEvidenceRequiredCount; }

    public long getVerificationVerifiedCount() { return verificationVerifiedCount; }
    public void setVerificationVerifiedCount(long verificationVerifiedCount) { this.verificationVerifiedCount = verificationVerifiedCount; }

    public long getVerificationRejectedCount() { return verificationRejectedCount; }
    public void setVerificationRejectedCount(long verificationRejectedCount) { this.verificationRejectedCount = verificationRejectedCount; }

    public long getVerificationSuspendedCount() { return verificationSuspendedCount; }
    public void setVerificationSuspendedCount(long verificationSuspendedCount) { this.verificationSuspendedCount = verificationSuspendedCount; }
}
