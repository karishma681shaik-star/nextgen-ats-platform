package com.aiats.dto.admin;

public class RecruitmentAnalyticsDTO {
    // Account Metrics
    private long totalCandidates;
    private long totalRecruiters;
    private long pendingVerifications;
    private long verifiedRecruiters;
    private long rejectedRecruiters;
    private long suspendedAccounts;
    private long activeAdmins;

    // Job Metrics
    private long totalJobs;
    private long activeJobs;
    private long closedJobs;
    private long draftJobs;

    // Application Pipeline Metrics
    private long totalApplications;
    private long awaitingReview;
    private long shortlisted;
    private long interviewsScheduled;
    private long offersIssued;
    private long successfulHires;
    private long rejectedApplications;
    private long withdrawnApplications;

    // Security Metrics
    private long pendingSecurityAlerts;
    private long totalSecurityAlerts;
    private long highRiskAlerts;

    // Conversion Rates (Percentages, null if denominator is 0)
    private Double applicationToShortlistRate;
    private Double shortlistToInterviewRate;
    private Double interviewToOfferRate;
    private Double offerToHireRate;
    private Double overallPlacementRate;

    public RecruitmentAnalyticsDTO() {}

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

    public long getSuspendedAccounts() { return suspendedAccounts; }
    public void setSuspendedAccounts(long suspendedAccounts) { this.suspendedAccounts = suspendedAccounts; }

    public long getActiveAdmins() { return activeAdmins; }
    public void setActiveAdmins(long activeAdmins) { this.activeAdmins = activeAdmins; }

    public long getTotalJobs() { return totalJobs; }
    public void setTotalJobs(long totalJobs) { this.totalJobs = totalJobs; }

    public long getActiveJobs() { return activeJobs; }
    public void setActiveJobs(long activeJobs) { this.activeJobs = activeJobs; }

    public long getClosedJobs() { return closedJobs; }
    public void setClosedJobs(long closedJobs) { this.closedJobs = closedJobs; }

    public long getDraftJobs() { return draftJobs; }
    public void setDraftJobs(long draftJobs) { this.draftJobs = draftJobs; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getAwaitingReview() { return awaitingReview; }
    public void setAwaitingReview(long awaitingReview) { this.awaitingReview = awaitingReview; }

    public long getShortlisted() { return shortlisted; }
    public void setShortlisted(long shortlisted) { this.shortlisted = shortlisted; }

    public long getInterviewsScheduled() { return interviewsScheduled; }
    public void setInterviewsScheduled(long interviewsScheduled) { this.interviewsScheduled = interviewsScheduled; }

    public long getOffersIssued() { return offersIssued; }
    public void setOffersIssued(long offersIssued) { this.offersIssued = offersIssued; }

    public long getSuccessfulHires() { return successfulHires; }
    public void setSuccessfulHires(long successfulHires) { this.successfulHires = successfulHires; }

    public long getRejectedApplications() { return rejectedApplications; }
    public void setRejectedApplications(long rejectedApplications) { this.rejectedApplications = rejectedApplications; }

    public long getWithdrawnApplications() { return withdrawnApplications; }
    public void setWithdrawnApplications(long withdrawnApplications) { this.withdrawnApplications = withdrawnApplications; }

    public long getPendingSecurityAlerts() { return pendingSecurityAlerts; }
    public void setPendingSecurityAlerts(long pendingSecurityAlerts) { this.pendingSecurityAlerts = pendingSecurityAlerts; }

    public long getTotalSecurityAlerts() { return totalSecurityAlerts; }
    public void setTotalSecurityAlerts(long totalSecurityAlerts) { this.totalSecurityAlerts = totalSecurityAlerts; }

    public long getHighRiskAlerts() { return highRiskAlerts; }
    public void setHighRiskAlerts(long highRiskAlerts) { this.highRiskAlerts = highRiskAlerts; }

    public Double getApplicationToShortlistRate() { return applicationToShortlistRate; }
    public void setApplicationToShortlistRate(Double applicationToShortlistRate) { this.applicationToShortlistRate = applicationToShortlistRate; }

    public Double getShortlistToInterviewRate() { return shortlistToInterviewRate; }
    public void setShortlistToInterviewRate(Double shortlistToInterviewRate) { this.shortlistToInterviewRate = shortlistToInterviewRate; }

    public Double getInterviewToOfferRate() { return interviewToOfferRate; }
    public void setInterviewToOfferRate(Double interviewToOfferRate) { this.interviewToOfferRate = interviewToOfferRate; }

    public Double getOfferToHireRate() { return offerToHireRate; }
    public void setOfferToHireRate(Double offerToHireRate) { this.offerToHireRate = offerToHireRate; }

    public Double getOverallPlacementRate() { return overallPlacementRate; }
    public void setOverallPlacementRate(Double overallPlacementRate) { this.overallPlacementRate = overallPlacementRate; }
}
