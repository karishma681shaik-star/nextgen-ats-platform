package com.aiats.dto.issue;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class IssueReportResponseDTO {

    private UUID reportId;
    private String userEmail;
    private String userRole;
    private String issueType;
    private String description;
    private String status;
    private List<String> attachments;
    private Instant createdAt;
    private String message;

    public IssueReportResponseDTO() {}

    public IssueReportResponseDTO(UUID reportId, String userEmail, String userRole,
                                  String issueType, String description, String status,
                                  List<String> attachments, Instant createdAt, String message) {
        this.reportId = reportId;
        this.userEmail = userEmail;
        this.userRole = userRole;
        this.issueType = issueType;
        this.description = description;
        this.status = status;
        this.attachments = attachments;
        this.createdAt = createdAt;
        this.message = message;
    }

    public UUID getReportId() {
        return reportId;
    }

    public void setReportId(UUID reportId) {
        this.reportId = reportId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
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

    public List<String> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<String> attachments) {
        this.attachments = attachments;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
