package com.aiats.dto.admin;

public class AiRiskFlagDTO {
    private String id;
    private String category;
    private String reason;
    private String evidence;
    private String severity; // LOW, MEDIUM, HIGH
    private String recommendedAction;
    private String reviewStatus; // AI_FLAGGED, REVIEWED_CONFIRMED, REVIEWED_DISMISSED

    public AiRiskFlagDTO() {}

    public AiRiskFlagDTO(String id, String category, String reason, String evidence,
                         String severity, String recommendedAction, String reviewStatus) {
        this.id = id;
        this.category = category;
        this.reason = reason;
        this.evidence = evidence;
        this.severity = severity;
        this.recommendedAction = recommendedAction;
        this.reviewStatus = reviewStatus;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getEvidence() { return evidence; }
    public void setEvidence(String evidence) { this.evidence = evidence; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public String getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(String reviewStatus) { this.reviewStatus = reviewStatus; }
}
