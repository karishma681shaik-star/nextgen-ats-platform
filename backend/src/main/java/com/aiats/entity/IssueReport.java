package com.aiats.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "issue_reports", indexes = {
    @Index(name = "idx_issue_reports_user", columnList = "user_id"),
    @Index(name = "idx_issue_reports_status", columnList = "status"),
    @Index(name = "idx_issue_reports_created", columnList = "created_at")
})
public class IssueReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "user_email", nullable = false, length = 150)
    private String userEmail;

    @Column(name = "user_full_name", length = 100)
    private String userFullName;

    @Column(name = "user_role", nullable = false, length = 30)
    private String userRole;

    @Column(name = "issue_type", nullable = false, length = 100)
    private String issueType;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "OPEN";

    @Column(name = "attachment_filenames", columnDefinition = "TEXT")
    private String attachmentFilenames;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public IssueReport() {}

    public IssueReport(UUID userId, String userEmail, String userFullName, String userRole,
                       String issueType, String description) {
        this.userId = userId;
        this.userEmail = userEmail;
        this.userFullName = userFullName;
        this.userRole = userRole;
        this.issueType = issueType;
        this.description = description;
        this.status = "OPEN";
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

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getIssueType() {
        return issueType;
    }

    public void setIssueType(String issueType) {
        this.issueType = issueType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAttachmentFilenames() {
        return attachmentFilenames;
    }

    public void setAttachmentFilenames(String attachmentFilenames) {
        this.attachmentFilenames = attachmentFilenames;
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
