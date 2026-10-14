package com.aiats.dto.admin;

import com.aiats.entity.AuditCleanupReceipt;
import java.util.UUID;

public class AuditCleanupReceiptDTO {
    private UUID id;
    private UUID adminId;
    private String adminEmail;
    private String adminName;
    private String operationType;
    private String targetDate;
    private String startDate;
    private String endDate;
    private String timezone;
    private long recordsSelected;
    private long recordsDeleted;
    private long recordsProtected;
    private String status;
    private String failureReason;
    private String startedAt;
    private String completedAt;
    private String clientIp;
    private String notes;

    public AuditCleanupReceiptDTO() {}

    public AuditCleanupReceiptDTO(AuditCleanupReceipt receipt) {
        if (receipt == null) return;
        this.id = receipt.getId();
        this.adminId = receipt.getAdminId();
        this.adminEmail = receipt.getAdminEmail();
        this.adminName = receipt.getAdminName();
        this.operationType = receipt.getOperationType();
        this.targetDate = receipt.getTargetDate();
        this.startDate = receipt.getStartDate() != null ? receipt.getStartDate().toString() : null;
        this.endDate = receipt.getEndDate() != null ? receipt.getEndDate().toString() : null;
        this.timezone = receipt.getTimezone();
        this.recordsSelected = receipt.getRecordsSelected();
        this.recordsDeleted = receipt.getRecordsDeleted();
        this.recordsProtected = receipt.getRecordsProtected();
        this.status = receipt.getStatus();
        this.failureReason = receipt.getFailureReason();
        this.startedAt = receipt.getStartedAt() != null ? receipt.getStartedAt().toString() : null;
        this.completedAt = receipt.getCompletedAt() != null ? receipt.getCompletedAt().toString() : null;
        this.clientIp = receipt.getClientIp();
        this.notes = receipt.getNotes();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getAdminId() { return adminId; }
    public void setAdminId(UUID adminId) { this.adminId = adminId; }

    public String getAdminEmail() { return adminEmail; }
    public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }

    public String getAdminName() { return adminName; }
    public void setAdminName(String adminName) { this.adminName = adminName; }

    public String getOperationType() { return operationType; }
    public void setOperationType(String operationType) { this.operationType = operationType; }

    public String getTargetDate() { return targetDate; }
    public void setTargetDate(String targetDate) { this.targetDate = targetDate; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public long getRecordsSelected() { return recordsSelected; }
    public void setRecordsSelected(long recordsSelected) { this.recordsSelected = recordsSelected; }

    public long getRecordsDeleted() { return recordsDeleted; }
    public void setRecordsDeleted(long recordsDeleted) { this.recordsDeleted = recordsDeleted; }

    public long getRecordsProtected() { return recordsProtected; }
    public void setRecordsProtected(long recordsProtected) { this.recordsProtected = recordsProtected; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public String getStartedAt() { return startedAt; }
    public void setStartedAt(String startedAt) { this.startedAt = startedAt; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }

    public String getClientIp() { return clientIp; }
    public void setClientIp(String clientIp) { this.clientIp = clientIp; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
