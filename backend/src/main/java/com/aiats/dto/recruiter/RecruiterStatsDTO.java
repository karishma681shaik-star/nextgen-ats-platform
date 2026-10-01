package com.aiats.dto.recruiter;

public class RecruiterStatsDTO {
    private long activeJobs;
    private long totalApplicants;
    private long shortlisted;
    private long interviewsScheduled;
    private long hiresThisMonth;
    private int averageTimeToHireDays;

    public long getActiveJobs() { return activeJobs; } public void setActiveJobs(long activeJobs) { this.activeJobs = activeJobs; }
    public long getTotalApplicants() { return totalApplicants; } public void setTotalApplicants(long totalApplicants) { this.totalApplicants = totalApplicants; }
    public long getShortlisted() { return shortlisted; } public void setShortlisted(long shortlisted) { this.shortlisted = shortlisted; }
    public long getInterviewsScheduled() { return interviewsScheduled; } public void setInterviewsScheduled(long interviewsScheduled) { this.interviewsScheduled = interviewsScheduled; }
    public long getHiresThisMonth() { return hiresThisMonth; } public void setHiresThisMonth(long hiresThisMonth) { this.hiresThisMonth = hiresThisMonth; }
    public int getAverageTimeToHireDays() { return averageTimeToHireDays; } public void setAverageTimeToHireDays(int averageTimeToHireDays) { this.averageTimeToHireDays = averageTimeToHireDays; }
}
