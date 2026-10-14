package com.aiats.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "candidate_reports", indexes = {
    @Index(name = "idx_cand_reports_reporter", columnList = "reporter_id"),
    @Index(name = "idx_cand_reports_job", columnList = "job_id"),
    @Index(name = "idx_cand_reports_recruiter", columnList = "recruiter_id"),
    @Index(name = "idx_cand_reports_status", columnList = "status"),
    @Index(name = "idx_cand_reports_created", columnList = "created_at")
})
public class CandidateReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "reporter_id", nullable = false)
    private UUID reporterId;

    @Column(name = "reporter_email", nullable = false, length = 150)
    private String reporterEmail;

    @Column(name = "reporter_name", length = 100)
    private String reporterName;

    @Column(name = "job_id")
    private UUID jobId;

    @Column(name = "job_title", length = 150)
    private String jobTitle;

    @Column(name = "recruiter_id")
    private UUID recruiterId;

    @Column(name = "recruiter_name", length = 100)
    private String recruiterName;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "company_name", length = 150)
    private String companyName;

    @Column(name = "category", nullable = false, length = 100)
    private String category; // SUSPECTED_FAKE_RECRUITER, MISLEADING_JOB_DESCRIPTION, COMPANY_IDENTITY_MISMATCH, RECRUITMENT_FEE_DEMAND, SUSPICIOUS_EXTERNAL_LINKS, OTHER

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, UNDER_INVESTIGATION, RESOLVED, DISMISSED

    @Column(name = "admin_decision", length = 100)
    private String adminDecision;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "assigned_admin", length = 100)
    private String assignedAdmin;

    @Column(name = "action_taken", length = 100)
    private String actionTaken; // JOB_UNPUBLISHED, RECRUITER_FLAGGED, VERIFICATION_REOPENED, DISMISSED_NO_VIOLATION, NONE

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public CandidateReport() {}

    public CandidateReport(UUID reporterId, String reporterEmail, String reporterName,
                           UUID jobId, String jobTitle, UUID recruiterId, String recruiterName,
                           UUID companyId, String companyName, String category, String description) {
        this.reporterId = reporterId;
        this.reporterEmail = reporterEmail;
        this.reporterName = reporterName;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.recruiterId = recruiterId;
        this.recruiterName = recruiterName;
        this.companyId = companyId;
        this.companyName = companyName;
        this.category = category;
        this.description = description;
        this.status = "PENDING";
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

    public UUID getReporterId() { return reporterId; }
    public void setReporterId(UUID reporterId) { this.reporterId = reporterId; }

    public String getReporterEmail() { return reporterEmail; }
    public void setReporterEmail(String reporterEmail) { this.reporterEmail = reporterEmail; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public UUID getJobId() { return jobId; }
    public void setJobId(UUID jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public UUID getRecruiterId() { return recruiterId; }
    public void setRecruiterId(UUID recruiterId) { this.recruiterId = recruiterId; }

    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }

    public UUID getCompanyId() { return companyId; }
    public void setCompanyId(UUID companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminDecision() { return adminDecision; }
    public void setAdminDecision(String adminDecision) { this.adminDecision = adminDecision; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public String getAssignedAdmin() { return assignedAdmin; }
    public void setAssignedAdmin(String assignedAdmin) { this.assignedAdmin = assignedAdmin; }

    public String getActionTaken() { return actionTaken; }
    public void setActionTaken(String actionTaken) { this.actionTaken = actionTaken; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
