package com.aiats.dto.candidate;

public class CandidateAnalyticsDTO {
    private long totalApplications;
    private long underReview;
    private long shortlisted;
    private long interviewsScheduled;
    private long offersReceived;
    private long selected;
    private long rejected;
    private long withdrawn;

    public CandidateAnalyticsDTO() {}

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getUnderReview() { return underReview; }
    public void setUnderReview(long underReview) { this.underReview = underReview; }

    public long getShortlisted() { return shortlisted; }
    public void setShortlisted(long shortlisted) { this.shortlisted = shortlisted; }

    public long getInterviewsScheduled() { return interviewsScheduled; }
    public void setInterviewsScheduled(long interviewsScheduled) { this.interviewsScheduled = interviewsScheduled; }

    public long getOffersReceived() { return offersReceived; }
    public void setOffersReceived(long offersReceived) { this.offersReceived = offersReceived; }

    public long getSelected() { return selected; }
    public void setSelected(long selected) { this.selected = selected; }

    public long getRejected() { return rejected; }
    public void setRejected(long rejected) { this.rejected = rejected; }

    public long getWithdrawn() { return withdrawn; }
    public void setWithdrawn(long withdrawn) { this.withdrawn = withdrawn; }
}
