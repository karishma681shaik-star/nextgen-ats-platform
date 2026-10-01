package com.aiats.dto.admin;

public class AdminStatsDTO {
    private long totalUsers;
    private long totalCandidates;
    private long totalRecruiters;
    private long totalJobs;
    private long activeJobs;
    private long totalApplications;
    private long pendingApplications;
    private long totalCompanies;

    public long getTotalUsers() { return totalUsers; } public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getTotalCandidates() { return totalCandidates; } public void setTotalCandidates(long totalCandidates) { this.totalCandidates = totalCandidates; }
    public long getTotalRecruiters() { return totalRecruiters; } public void setTotalRecruiters(long totalRecruiters) { this.totalRecruiters = totalRecruiters; }
    public long getTotalJobs() { return totalJobs; } public void setTotalJobs(long totalJobs) { this.totalJobs = totalJobs; }
    public long getActiveJobs() { return activeJobs; } public void setActiveJobs(long activeJobs) { this.activeJobs = activeJobs; }
    public long getTotalApplications() { return totalApplications; } public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }
    public long getPendingApplications() { return pendingApplications; } public void setPendingApplications(long pendingApplications) { this.pendingApplications = pendingApplications; }
    public long getTotalCompanies() { return totalCompanies; } public void setTotalCompanies(long totalCompanies) { this.totalCompanies = totalCompanies; }
}
