package com.aiats.dto.admin;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CandidatePerformanceDTO {
    private long totalCandidates;
    private long activeCandidates;
    private long totalApplications;
    private long applicationsUnderReview;
    private long shortlistedCount;
    private long interviewsScheduled;
    private long offersCount;
    private long hiredCount;
    private Double shortlistingRate;
    private Double interviewRate;
    private Double placementRate;
    private List<CandidateDetailItem> candidates;

    public CandidatePerformanceDTO() {}

    public long getTotalCandidates() { return totalCandidates; }
    public void setTotalCandidates(long totalCandidates) { this.totalCandidates = totalCandidates; }

    public long getActiveCandidates() { return activeCandidates; }
    public void setActiveCandidates(long activeCandidates) { this.activeCandidates = activeCandidates; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getApplicationsUnderReview() { return applicationsUnderReview; }
    public void setApplicationsUnderReview(long applicationsUnderReview) { this.applicationsUnderReview = applicationsUnderReview; }

    public long getShortlistedCount() { return shortlistedCount; }
    public void setShortlistedCount(long shortlistedCount) { this.shortlistedCount = shortlistedCount; }

    public long getInterviewsScheduled() { return interviewsScheduled; }
    public void setInterviewsScheduled(long interviewsScheduled) { this.interviewsScheduled = interviewsScheduled; }

    public long getOffersCount() { return offersCount; }
    public void setOffersCount(long offersCount) { this.offersCount = offersCount; }

    public long getHiredCount() { return hiredCount; }
    public void setHiredCount(long hiredCount) { this.hiredCount = hiredCount; }

    public Double getShortlistingRate() { return shortlistingRate; }
    public void setShortlistingRate(Double shortlistingRate) { this.shortlistingRate = shortlistingRate; }

    public Double getInterviewRate() { return interviewRate; }
    public void setInterviewRate(Double interviewRate) { this.interviewRate = interviewRate; }

    public Double getPlacementRate() { return placementRate; }
    public void setPlacementRate(Double placementRate) { this.placementRate = placementRate; }

    public List<CandidateDetailItem> getCandidates() { return candidates; }
    public void setCandidates(List<CandidateDetailItem> candidates) { this.candidates = candidates; }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CandidateDetailItem {
        private String candidateId;
        private String candidateName;
        private String candidateEmail;
        private String registeredAt;
        private int profileCompletion;
        private boolean hasResume;
        private long applicationsCount;
        private long shortlistedCount;
        private long interviewsCount;
        private long offersCount;
        private String latestStatus;
        private String lastActivityAt;

        public CandidateDetailItem() {}

        public String getCandidateId() { return candidateId; }
        public void setCandidateId(String candidateId) { this.candidateId = candidateId; }

        public String getCandidateName() { return candidateName; }
        public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

        public String getCandidateEmail() { return candidateEmail; }
        public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

        public String getRegisteredAt() { return registeredAt; }
        public void setRegisteredAt(String registeredAt) { this.registeredAt = registeredAt; }

        public int getProfileCompletion() { return profileCompletion; }
        public void setProfileCompletion(int profileCompletion) { this.profileCompletion = profileCompletion; }

        public boolean isHasResume() { return hasResume; }
        public void setHasResume(boolean hasResume) { this.hasResume = hasResume; }

        public long getApplicationsCount() { return applicationsCount; }
        public void setApplicationsCount(long applicationsCount) { this.applicationsCount = applicationsCount; }

        public long getShortlistedCount() { return shortlistedCount; }
        public void setShortlistedCount(long shortlistedCount) { this.shortlistedCount = shortlistedCount; }

        public long getInterviewsCount() { return interviewsCount; }
        public void setInterviewsCount(long interviewsCount) { this.interviewsCount = interviewsCount; }

        public long getOffersCount() { return offersCount; }
        public void setOffersCount(long offersCount) { this.offersCount = offersCount; }

        public String getLatestStatus() { return latestStatus; }
        public void setLatestStatus(String latestStatus) { this.latestStatus = latestStatus; }

        public String getLastActivityAt() { return lastActivityAt; }
        public void setLastActivityAt(String lastActivityAt) { this.lastActivityAt = lastActivityAt; }
    }
}
