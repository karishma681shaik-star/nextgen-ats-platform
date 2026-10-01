package com.aiats.dto.candidate;

import com.aiats.dto.application.ApplicationDTO;
import com.aiats.dto.job.JobDTO;

import java.util.List;
import java.util.Map;

public class CandidateDashboardDTO {
    private String candidateName;
    private String candidateEmail;
    private String candidateTitle;
    private String avatar;

    // Truthful, calculated Profile & ATS Score
    private int profileCompletion;
    private int atsScore;
    private String atsTier;
    private String atsSummary;

    // Primary resume info
    private boolean hasPrimaryResume;
    private String primaryResumeId;
    private String primaryResumeFileName;

    // Real application counts
    private long totalApplicationsCount;
    private long activeApplicationsCount; // APPLIED + UNDER_REVIEW
    private long shortlistedCount;
    private long interviewsCount;
    private long selectedCount;
    private long rejectedCount;
    private long savedJobsCount;

    // Content Checklist for exact score breakdown
    private Map<String, Boolean> checklist;

    // Real Recruiter-Posted Recommended Jobs & Recent Applications
    private List<JobDTO> recommendedJobs;
    private List<ApplicationDTO> recentApplications;

    public CandidateDashboardDTO() {}

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public String getCandidateTitle() { return candidateTitle; }
    public void setCandidateTitle(String candidateTitle) { this.candidateTitle = candidateTitle; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public int getProfileCompletion() { return profileCompletion; }
    public void setProfileCompletion(int profileCompletion) { this.profileCompletion = profileCompletion; }

    public int getAtsScore() { return atsScore; }
    public void setAtsScore(int atsScore) { this.atsScore = atsScore; }

    public String getAtsTier() { return atsTier; }
    public void setAtsTier(String atsTier) { this.atsTier = atsTier; }

    public String getAtsSummary() { return atsSummary; }
    public void setAtsSummary(String atsSummary) { this.atsSummary = atsSummary; }

    public boolean isHasPrimaryResume() { return hasPrimaryResume; }
    public void setHasPrimaryResume(boolean hasPrimaryResume) { this.hasPrimaryResume = hasPrimaryResume; }

    public String getPrimaryResumeId() { return primaryResumeId; }
    public void setPrimaryResumeId(String primaryResumeId) { this.primaryResumeId = primaryResumeId; }

    public String getPrimaryResumeFileName() { return primaryResumeFileName; }
    public void setPrimaryResumeFileName(String primaryResumeFileName) { this.primaryResumeFileName = primaryResumeFileName; }

    public long getTotalApplicationsCount() { return totalApplicationsCount; }
    public void setTotalApplicationsCount(long totalApplicationsCount) { this.totalApplicationsCount = totalApplicationsCount; }

    public long getActiveApplicationsCount() { return activeApplicationsCount; }
    public void setActiveApplicationsCount(long activeApplicationsCount) { this.activeApplicationsCount = activeApplicationsCount; }

    public long getShortlistedCount() { return shortlistedCount; }
    public void setShortlistedCount(long shortlistedCount) { this.shortlistedCount = shortlistedCount; }

    public long getInterviewsCount() { return interviewsCount; }
    public void setInterviewsCount(long interviewsCount) { this.interviewsCount = interviewsCount; }

    public long getSelectedCount() { return selectedCount; }
    public void setSelectedCount(long selectedCount) { this.selectedCount = selectedCount; }

    public long getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(long rejectedCount) { this.rejectedCount = rejectedCount; }

    public long getSavedJobsCount() { return savedJobsCount; }
    public void setSavedJobsCount(long savedJobsCount) { this.savedJobsCount = savedJobsCount; }

    public Map<String, Boolean> getChecklist() { return checklist; }
    public void setChecklist(Map<String, Boolean> checklist) { this.checklist = checklist; }

    public List<JobDTO> getRecommendedJobs() { return recommendedJobs; }
    public void setRecommendedJobs(List<JobDTO> recommendedJobs) { this.recommendedJobs = recommendedJobs; }

    public List<ApplicationDTO> getRecentApplications() { return recentApplications; }
    public void setRecentApplications(List<ApplicationDTO> recentApplications) { this.recentApplications = recentApplications; }
}
