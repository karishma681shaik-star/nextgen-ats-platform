package com.aiats.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_cleanup_receipts", indexes = {
    @Index(name = "idx_cleanup_receipt_completed", columnList = "completed_at"),
    @Index(name = "idx_cleanup_receipt_admin", columnList = "admin_id"),
    @Index(name = "idx_cleanup_receipt_type", columnList = "operation_type")
})
public class AuditCleanupReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "admin_id", nullable = false)
    private UUID adminId;

    @Column(name = "admin_email", nullable = false, length = 150)
    private String adminEmail;

    @Column(name = "admin_name", nullable = false, length = 100)
    private String adminName;

    @Column(name = "operation_type", nullable = false, length = 50)
    private String operationType; // SPECIFIC_DATE, DATE_RANGE, DELETE_ALL

    @Column(name = "target_date", length = 30)
    private String targetDate;

    @Column(name = "start_date")
    private Instant startDate;

    @Column(name = "end_date")
    private Instant endDate;

    @Column(name = "timezone", length = 50)
    private String timezone;

    @Column(name = "records_selected", nullable = false)
    private long recordsSelected;

    @Column(name = "records_deleted", nullable = false)
    private long recordsDeleted;

    @Column(name = "records_protected", nullable = false)
    private long recordsProtected;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // SUCCESS, PARTIAL, FAILED

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt;

    @Column(name = "client_ip", length = 60)
    private String clientIp;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public AuditCleanupReceipt() {}

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

    public Instant getStartDate() { return startDate; }
    public void setStartDate(Instant startDate) { this.startDate = startDate; }

    public Instant getEndDate() { return endDate; }
    public void setEndDate(Instant endDate) { this.endDate = endDate; }

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

    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public String getClientIp() { return clientIp; }
    public void setClientIp(String clientIp) { this.clientIp = clientIp; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
