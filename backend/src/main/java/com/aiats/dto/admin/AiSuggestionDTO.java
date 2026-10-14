package com.aiats.dto.admin;

public class AiSuggestionDTO {
    private String id;
    private String issue;
    private String whyItMatters;
    private String recommendedAction;
    private String requiredDocumentOrInfo;
    private String profileCorrectionInstructions;
    private boolean adminReviewRequired = true;
    private String status = "Action Required"; // Action Required, In Progress, Completed, Submitted for Review

    public AiSuggestionDTO() {}

    public AiSuggestionDTO(String id, String issue, String whyItMatters, String recommendedAction,
                           String requiredDocumentOrInfo, String profileCorrectionInstructions,
                           boolean adminReviewRequired, String status) {
        this.id = id;
        this.issue = issue;
        this.whyItMatters = whyItMatters;
        this.recommendedAction = recommendedAction;
        this.requiredDocumentOrInfo = requiredDocumentOrInfo;
        this.profileCorrectionInstructions = profileCorrectionInstructions;
        this.adminReviewRequired = adminReviewRequired;
        this.status = status != null ? status : "Action Required";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getIssue() { return issue; }
    public void setIssue(String issue) { this.issue = issue; }

    public String getWhyItMatters() { return whyItMatters; }
    public void setWhyItMatters(String whyItMatters) { this.whyItMatters = whyItMatters; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public String getRequiredDocumentOrInfo() { return requiredDocumentOrInfo; }
    public void setRequiredDocumentOrInfo(String requiredDocumentOrInfo) { this.requiredDocumentOrInfo = requiredDocumentOrInfo; }

    public String getProfileCorrectionInstructions() { return profileCorrectionInstructions; }
    public void setProfileCorrectionInstructions(String profileCorrectionInstructions) { this.profileCorrectionInstructions = profileCorrectionInstructions; }

    public boolean isAdminReviewRequired() { return adminReviewRequired; }
    public void setAdminReviewRequired(boolean adminReviewRequired) { this.adminReviewRequired = adminReviewRequired; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
