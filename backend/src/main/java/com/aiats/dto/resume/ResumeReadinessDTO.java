package com.aiats.dto.resume;

/**
 * Response DTO returned by the resume readiness check endpoint.
 * Tells the frontend whether a resume has enough meaningful content
 * to be scored against job descriptions.
 */
public class ResumeReadinessDTO {

    /** 0–100 overall readiness score based on content analysis */
    private int readinessScore;

    /** true when readinessScore >= 40 (minimum "Good" threshold) */
    private boolean ready;

    /** Human-readable tier: "Poor", "Fair", "Good", "Excellent" */
    private String tier;

    /** Short explanation returned to the UI */
    private String message;

    /** Whether the resume has a non-empty name field */
    private boolean hasName;
    /** Whether the resume has a non-empty summary/bio field */
    private boolean hasSummary;
    /** Whether at least one skill is listed */
    private boolean hasSkills;
    /** Whether at least one experience entry is present */
    private boolean hasExperience;
    /** Whether at least one education entry is present */
    private boolean hasEducation;

    public ResumeReadinessDTO() {}

    public ResumeReadinessDTO(int readinessScore, boolean ready, String tier, String message,
                               boolean hasName, boolean hasSummary, boolean hasSkills,
                               boolean hasExperience, boolean hasEducation) {
        this.readinessScore = readinessScore;
        this.ready = ready;
        this.tier = tier;
        this.message = message;
        this.hasName = hasName;
        this.hasSummary = hasSummary;
        this.hasSkills = hasSkills;
        this.hasExperience = hasExperience;
        this.hasEducation = hasEducation;
    }

    public int getReadinessScore() { return readinessScore; }
    public void setReadinessScore(int readinessScore) { this.readinessScore = readinessScore; }

    public boolean isReady() { return ready; }
    public void setReady(boolean ready) { this.ready = ready; }

    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isHasName() { return hasName; }
    public void setHasName(boolean hasName) { this.hasName = hasName; }

    public boolean isHasSummary() { return hasSummary; }
    public void setHasSummary(boolean hasSummary) { this.hasSummary = hasSummary; }

    public boolean isHasSkills() { return hasSkills; }
    public void setHasSkills(boolean hasSkills) { this.hasSkills = hasSkills; }

    public boolean isHasExperience() { return hasExperience; }
    public void setHasExperience(boolean hasExperience) { this.hasExperience = hasExperience; }

    public boolean isHasEducation() { return hasEducation; }
    public void setHasEducation(boolean hasEducation) { this.hasEducation = hasEducation; }
}
