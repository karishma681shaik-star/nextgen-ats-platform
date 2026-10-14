package com.aiats.dto.admin;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class RecruiterPerformanceDTO {
    private String recruiterId;
    private String recruiterName;
    private String recruiterEmail;
    private String companyName;
    private String companyLogo;
    private String verificationStatus;
    private String accountStatus;
    private long jobsSubmitted;
    private long jobsPending;
    private long jobsApproved;
    private long jobsRejected;
    private long activeJobs;
    private long closedJobs;
    private long totalApplications;
    private long shortlistedCandidates;
    private long interviewsScheduled;
    private long hires;
    private Double applicationToInterviewRate;
    private Double interviewToHireRate;
    private Double placementRate;
    private String lastActivityAt;

    public RecruiterPerformanceDTO() {}

    public String getRecruiterId() { return recruiterId; }
    public void setRecruiterId(String recruiterId) { this.recruiterId = recruiterId; }

    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }

    public String getRecruiterEmail() { return recruiterEmail; }
    public void setRecruiterEmail(String recruiterEmail) { this.recruiterEmail = recruiterEmail; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }

    public long getJobsSubmitted() { return jobsSubmitted; }
    public void setJobsSubmitted(long jobsSubmitted) { this.jobsSubmitted = jobsSubmitted; }

    public long getJobsPending() { return jobsPending; }
    public void setJobsPending(long jobsPending) { this.jobsPending = jobsPending; }

    public long getJobsApproved() { return jobsApproved; }
    public void setJobsApproved(long jobsApproved) { this.jobsApproved = jobsApproved; }

    public long getJobsRejected() { return jobsRejected; }
    public void setJobsRejected(long jobsRejected) { this.jobsRejected = jobsRejected; }

    public long getActiveJobs() { return activeJobs; }
    public void setActiveJobs(long activeJobs) { this.activeJobs = activeJobs; }

    public long getClosedJobs() { return closedJobs; }
    public void setClosedJobs(long closedJobs) { this.closedJobs = closedJobs; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getShortlistedCandidates() { return shortlistedCandidates; }
    public void setShortlistedCandidates(long shortlistedCandidates) { this.shortlistedCandidates = shortlistedCandidates; }

    public long getInterviewsScheduled() { return interviewsScheduled; }
    public void setInterviewsScheduled(long interviewsScheduled) { this.interviewsScheduled = interviewsScheduled; }

    public long getHires() { return hires; }
    public void setHires(long hires) { this.hires = hires; }

    public Double getApplicationToInterviewRate() { return applicationToInterviewRate; }
    public void setApplicationToInterviewRate(Double applicationToInterviewRate) { this.applicationToInterviewRate = applicationToInterviewRate; }

    public Double getInterviewToHireRate() { return interviewToHireRate; }
    public void setInterviewToHireRate(Double interviewToHireRate) { this.interviewToHireRate = interviewToHireRate; }

    public Double getPlacementRate() { return placementRate; }
    public void setPlacementRate(Double placementRate) { this.placementRate = placementRate; }

    public String getLastActivityAt() { return lastActivityAt; }
    public void setLastActivityAt(String lastActivityAt) { this.lastActivityAt = lastActivityAt; }
}
