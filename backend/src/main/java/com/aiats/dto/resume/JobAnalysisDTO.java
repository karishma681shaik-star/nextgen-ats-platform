package com.aiats.dto.resume;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class JobAnalysisDTO {

    private UUID id;
    private UUID resumeId;
    private UUID jobId;
    private String jobTitle;
    private String companyName;
    private String companyLogo;
    private String location;
    private String experienceRequired;
    private String employmentType;
    private String salary;
    private int matchScore;
    private String matchLabel;
    private int readinessScore;
    private String readinessLabel;
    private String fitAssessment;
    private String strongKeywords;
    private String goodToHaveKeywords;
    private String roleAlignmentCriteria;
    private Instant createdAt;
    private Instant updatedAt;

    public JobAnalysisDTO() {}

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public String getCompanyLogo() {
        return companyLogo;
    }

    public void setCompanyLogo(String companyLogo) {
        this.companyLogo = companyLogo;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getExperienceRequired() {
        return experienceRequired;
    }

    public void setExperienceRequired(String experienceRequired) {
        this.experienceRequired = experienceRequired;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public String getSalary() {
        return salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
    }

    public int getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(int matchScore) {
        this.matchScore = matchScore;
    }

    public String getMatchLabel() {
        return matchLabel;
    }

    public void setMatchLabel(String matchLabel) {
        this.matchLabel = matchLabel;
    }

    public int getReadinessScore() {
        return readinessScore;
    }

    public void setReadinessScore(int readinessScore) {
        this.readinessScore = readinessScore;
    }

    public String getReadinessLabel() {
        return readinessLabel;
    }

    public void setReadinessLabel(String readinessLabel) {
        this.readinessLabel = readinessLabel;
    }

    public String getFitAssessment() {
        return fitAssessment;
    }

    public void setFitAssessment(String fitAssessment) {
        this.fitAssessment = fitAssessment;
    }

    public String getStrongKeywords() {
        return strongKeywords;
    }

    public void setStrongKeywords(String strongKeywords) {
        this.strongKeywords = strongKeywords;
    }

    public String getGoodToHaveKeywords() {
        return goodToHaveKeywords;
    }

    public void setGoodToHaveKeywords(String goodToHaveKeywords) {
        this.goodToHaveKeywords = goodToHaveKeywords;
    }

    public String getRoleAlignmentCriteria() {
        return roleAlignmentCriteria;
    }

    public void setRoleAlignmentCriteria(String roleAlignmentCriteria) {
        this.roleAlignmentCriteria = roleAlignmentCriteria;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

