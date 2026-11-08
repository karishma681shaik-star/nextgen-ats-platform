package com.aiats.dto.resume;

import java.util.List;

public class ResumeAtsAnalysisDTO {

    private String resumeId;
    private int atsScore;
    private int overallScore;
    private String readinessLabel;
    private int pendingCount;
    private int completedCount;
    private int deletedCount;
    private int totalCount;
    private List<ResumeRecommendationDTO> pending;
    private List<ResumeRecommendationDTO> completed;
    private List<ResumeRecommendationDTO> deleted;
    private List<ResumeRecommendationDTO> allRecommendations;

    public ResumeAtsAnalysisDTO() {}

    public ResumeAtsAnalysisDTO(String resumeId, int atsScore, String readinessLabel,
                                List<ResumeRecommendationDTO> pending,
                                List<ResumeRecommendationDTO> completed,
                                List<ResumeRecommendationDTO> deleted,
                                List<ResumeRecommendationDTO> allRecommendations) {
        this.resumeId = resumeId;
        this.atsScore = atsScore;
        this.overallScore = atsScore;
        this.readinessLabel = readinessLabel;
        this.pending = pending;
        this.completed = completed;
        this.deleted = deleted;
        this.allRecommendations = allRecommendations;
        this.pendingCount = pending != null ? pending.size() : 0;
        this.completedCount = completed != null ? completed.size() : 0;
        this.deletedCount = deleted != null ? deleted.size() : 0;
        this.totalCount = this.pendingCount + this.completedCount + this.deletedCount;
    }

    public String getResumeId() { return resumeId; }
    public void setResumeId(String resumeId) { this.resumeId = resumeId; }

    public int getAtsScore() { return atsScore; }
    public void setAtsScore(int atsScore) {
        this.atsScore = atsScore;
        this.overallScore = atsScore;
    }

    public int getOverallScore() { return overallScore > 0 ? overallScore : atsScore; }
    public void setOverallScore(int overallScore) {
        this.overallScore = overallScore;
        this.atsScore = overallScore;
    }

    public String getReadinessLabel() { return readinessLabel; }
    public void setReadinessLabel(String readinessLabel) { this.readinessLabel = readinessLabel; }

    public int getPendingCount() { return pendingCount; }
    public void setPendingCount(int pendingCount) { this.pendingCount = pendingCount; }

    public int getCompletedCount() { return completedCount; }
    public void setCompletedCount(int completedCount) { this.completedCount = completedCount; }

    public int getDeletedCount() { return deletedCount; }
    public void setDeletedCount(int deletedCount) { this.deletedCount = deletedCount; }

    public int getTotalCount() { return totalCount; }
    public void setTotalCount(int totalCount) { this.totalCount = totalCount; }

    public List<ResumeRecommendationDTO> getPending() { return pending; }
    public void setPending(List<ResumeRecommendationDTO> pending) {
        this.pending = pending;
        this.pendingCount = pending != null ? pending.size() : 0;
        this.totalCount = this.pendingCount + this.completedCount + this.deletedCount;
    }

    public List<ResumeRecommendationDTO> getCompleted() { return completed; }
    public void setCompleted(List<ResumeRecommendationDTO> completed) {
        this.completed = completed;
        this.completedCount = completed != null ? completed.size() : 0;
        this.totalCount = this.pendingCount + this.completedCount + this.deletedCount;
    }

    public List<ResumeRecommendationDTO> getDeleted() { return deleted; }
    public void setDeleted(List<ResumeRecommendationDTO> deleted) {
        this.deleted = deleted;
        this.deletedCount = deleted != null ? deleted.size() : 0;
        this.totalCount = this.pendingCount + this.completedCount + this.deletedCount;
    }

    public List<ResumeRecommendationDTO> getAllRecommendations() { return allRecommendations; }
    public void setAllRecommendations(List<ResumeRecommendationDTO> allRecommendations) {
        this.allRecommendations = allRecommendations;
    }
}

