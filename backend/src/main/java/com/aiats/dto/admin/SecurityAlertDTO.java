package com.aiats.dto.admin;

import com.aiats.entity.SecurityAlert;
import java.util.UUID;

public class SecurityAlertDTO {
    private String id;
    private String relatedUserId;
    private String accountEmail;
    private String accountRole;
    private String riskCategory;
    private String riskLevel;
    private String description;
    private String recommendedAction;
    private String reviewStatus;
    private String assignedAdmin;
    private String adminDecision;
    private String reviewNotes;
    private String createdAt;
    private String updatedAt;

    public SecurityAlertDTO() {}

    public SecurityAlertDTO(SecurityAlert alert) {
        if (alert == null) return;
        this.id = alert.getId() != null ? alert.getId().toString() : null;
        this.relatedUserId = alert.getRelatedUserId() != null ? alert.getRelatedUserId().toString() : null;
        this.accountEmail = alert.getAccountEmail();
        this.accountRole = alert.getAccountRole();
        this.riskCategory = alert.getRiskCategory();
        this.riskLevel = alert.getRiskLevel();
        this.description = alert.getDescription();
        this.recommendedAction = alert.getRecommendedAction();
        this.reviewStatus = alert.getReviewStatus();
        this.assignedAdmin = alert.getAssignedAdmin();
        this.adminDecision = alert.getAdminDecision();
        this.reviewNotes = alert.getReviewNotes();
        this.createdAt = alert.getCreatedAt() != null ? alert.getCreatedAt().toString() : null;
        this.updatedAt = alert.getUpdatedAt() != null ? alert.getUpdatedAt().toString() : null;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRelatedUserId() { return relatedUserId; }
    public void setRelatedUserId(String relatedUserId) { this.relatedUserId = relatedUserId; }

    public String getAccountEmail() { return accountEmail; }
    public void setAccountEmail(String accountEmail) { this.accountEmail = accountEmail; }

    public String getAccountRole() { return accountRole; }
    public void setAccountRole(String accountRole) { this.accountRole = accountRole; }

    public String getRiskCategory() { return riskCategory; }
    public void setRiskCategory(String riskCategory) { this.riskCategory = riskCategory; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public String getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(String reviewStatus) { this.reviewStatus = reviewStatus; }

    public String getAssignedAdmin() { return assignedAdmin; }
    public void setAssignedAdmin(String assignedAdmin) { this.assignedAdmin = assignedAdmin; }

    public String getAdminDecision() { return adminDecision; }
    public void setAdminDecision(String adminDecision) { this.adminDecision = adminDecision; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
