package com.aiats.dto.recruiter;

public class RecruiterAnalyticsDTO {
    private long totalJobs;
    private long activeJobs;
    private long totalApplicants;
    private long reviewedApplicants;
    private long shortlisted;
    private long interviewsScheduled;
    private long offersExtended;
    private long hires;
    private long rejected;
    private long withdrawn;

    private Double reviewRate;
    private Double shortlistRate;
    private Double interviewRate;
    private Double hireRate;

    public RecruiterAnalyticsDTO() {}

    public long getTotalJobs() { return totalJobs; }
    public void setTotalJobs(long totalJobs) { this.totalJobs = totalJobs; }

    public long getActiveJobs() { return activeJobs; }
    public void setActiveJobs(long activeJobs) { this.activeJobs = activeJobs; }

    public long getTotalApplicants() { return totalApplicants; }
    public void setTotalApplicants(long totalApplicants) { this.totalApplicants = totalApplicants; }

    public long getReviewedApplicants() { return reviewedApplicants; }
    public void setReviewedApplicants(long reviewedApplicants) { this.reviewedApplicants = reviewedApplicants; }

    public long getShortlisted() { return shortlisted; }
    public void setShortlisted(long shortlisted) { this.shortlisted = shortlisted; }

    public long getInterviewsScheduled() { return interviewsScheduled; }
    public void setInterviewsScheduled(long interviewsScheduled) { this.interviewsScheduled = interviewsScheduled; }

    public long getOffersExtended() { return offersExtended; }
    public void setOffersExtended(long offersExtended) { this.offersExtended = offersExtended; }

    public long getHires() { return hires; }
    public void setHires(long hires) { this.hires = hires; }

    public long getRejected() { return rejected; }
    public void setRejected(long rejected) { this.rejected = rejected; }

    public long getWithdrawn() { return withdrawn; }
    public void setWithdrawn(long withdrawn) { this.withdrawn = withdrawn; }

    public Double getReviewRate() { return reviewRate; }
    public void setReviewRate(Double reviewRate) { this.reviewRate = reviewRate; }

    public Double getShortlistRate() { return shortlistRate; }
    public void setShortlistRate(Double shortlistRate) { this.shortlistRate = shortlistRate; }

    public Double getInterviewRate() { return interviewRate; }
    public void setInterviewRate(Double interviewRate) { this.interviewRate = interviewRate; }

    public Double getHireRate() { return hireRate; }
    public void setHireRate(Double hireRate) { this.hireRate = hireRate; }
}
