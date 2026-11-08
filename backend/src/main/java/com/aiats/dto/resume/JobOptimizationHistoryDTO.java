package com.aiats.dto.resume;

import java.time.Instant;
import java.util.UUID;

public class JobOptimizationHistoryDTO {

    private UUID id;
    private UUID candidateId;
    private UUID resumeId;
    private UUID jobId;
    private UUID analysisId;
    private UUID resumeVersionId;
    private String jobTitle;
    private String companyName;
    private String location;
    private Integer previousScore;
    private int scoreAfter;
    private String status;
    private String changesApplied;
    private String resumeSnapshot;
    private Instant createdAt;

    public JobOptimizationHistoryDTO() {}

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(UUID candidateId) {
        this.candidateId = candidateId;
    }

    public UUID getResumeId() {
        return resumeId;
    }

    public void setResumeId(UUID resumeId) {
        this.resumeId = resumeId;
    }

    public UUID getJobId() {
        return jobId;
    }

    public void setJobId(UUID jobId) {
        this.jobId = jobId;
    }

    public UUID getAnalysisId() {
        return analysisId;
    }

    public void setAnalysisId(UUID analysisId) {
        this.analysisId = analysisId;
    }

    public UUID getResumeVersionId() {
        return resumeVersionId;
    }

    public void setResumeVersionId(UUID resumeVersionId) {
        this.resumeVersionId = resumeVersionId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getPreviousScore() {
        return previousScore;
    }

    public void setPreviousScore(Integer previousScore) {
        this.previousScore = previousScore;
    }

    public int getScoreAfter() {
        return scoreAfter;
    }

    public void setScoreAfter(int scoreAfter) {
        this.scoreAfter = scoreAfter;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getChangesApplied() {
        return changesApplied;
    }

    public void setChangesApplied(String changesApplied) {
        this.changesApplied = changesApplied;
    }

    public String getResumeSnapshot() {
        return resumeSnapshot;
    }

    public void setResumeSnapshot(String resumeSnapshot) {
        this.resumeSnapshot = resumeSnapshot;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

