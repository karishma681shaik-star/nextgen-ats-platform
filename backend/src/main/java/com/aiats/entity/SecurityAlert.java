package com.aiats.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "security_alerts", indexes = {
    @Index(name = "idx_sec_alerts_status", columnList = "review_status"),
    @Index(name = "idx_sec_alerts_level", columnList = "risk_level"),
    @Index(name = "idx_sec_alerts_category", columnList = "risk_category"),
    @Index(name = "idx_sec_alerts_email", columnList = "account_email"),
    @Index(name = "idx_sec_alerts_created", columnList = "created_at")
})
public class SecurityAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "related_user_id")
    private UUID relatedUserId;

    @Column(name = "account_email", length = 150)
    private String accountEmail;

    @Column(name = "account_role", length = 30)
    private String accountRole;

    @Column(name = "risk_category", nullable = false, length = 100)
    private String riskCategory;

    @Column(name = "risk_level", nullable = false, length = 20)
    private String riskLevel = "MEDIUM"; // LOW, MEDIUM, HIGH

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "recommended_action", columnDefinition = "TEXT")
    private String recommendedAction;

    @Column(name = "review_status", nullable = false, length = 40)
    private String reviewStatus = "PENDING_REVIEW"; // PENDING_REVIEW, UNDER_REVIEW, CONFIRMED_POLICY_VIOLATION, FALSE_POSITIVE, RESOLVED

    @Column(name = "assigned_admin", length = 100)
    private String assignedAdmin;

    @Column(name = "admin_decision", length = 100)
    private String adminDecision;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public SecurityAlert() {}

    public SecurityAlert(UUID relatedUserId, String accountEmail, String accountRole,
                         String riskCategory, String riskLevel, String description,
                         String recommendedAction) {
        this.relatedUserId = relatedUserId;
        this.accountEmail = accountEmail;
        this.accountRole = accountRole;
        this.riskCategory = riskCategory;
        this.riskLevel = riskLevel;
        this.description = description;
        this.recommendedAction = recommendedAction;
        this.reviewStatus = "PENDING_REVIEW";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getRelatedUserId() { return relatedUserId; }
    public void setRelatedUserId(UUID relatedUserId) { this.relatedUserId = relatedUserId; }

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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
