package com.aiats.dto.candidate;

import com.aiats.entity.CandidateReport;

public class CandidateReportDTO {
    private String id;
    private String reporterId;
    private String reporterEmail;
    private String reporterName;
    private String jobId;
    private String jobTitle;
    private String recruiterId;
    private String recruiterName;
    private String companyId;
    private String companyName;
    private String category;
    private String description;
    private String status;
    private String adminDecision;
    private String adminNotes;
    private String assignedAdmin;
    private String actionTaken;
    private String createdAt;
    private String updatedAt;

    public CandidateReportDTO() {}

    public CandidateReportDTO(CandidateReport report) {
        if (report != null) {
            this.id = report.getId() != null ? report.getId().toString() : null;
            this.reporterId = report.getReporterId() != null ? report.getReporterId().toString() : null;
            this.reporterEmail = report.getReporterEmail();
            this.reporterName = report.getReporterName();
            this.jobId = report.getJobId() != null ? report.getJobId().toString() : null;
            this.jobTitle = report.getJobTitle();
            this.recruiterId = report.getRecruiterId() != null ? report.getRecruiterId().toString() : null;
            this.recruiterName = report.getRecruiterName();
            this.companyId = report.getCompanyId() != null ? report.getCompanyId().toString() : null;
            this.companyName = report.getCompanyName();
            this.category = report.getCategory();
            this.description = report.getDescription();
            this.status = report.getStatus();
            this.adminDecision = report.getAdminDecision();
            this.adminNotes = report.getAdminNotes();
            this.assignedAdmin = report.getAssignedAdmin();
            this.actionTaken = report.getActionTaken();
            this.createdAt = report.getCreatedAt() != null ? report.getCreatedAt().toString() : null;
            this.updatedAt = report.getUpdatedAt() != null ? report.getUpdatedAt().toString() : null;
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReporterId() { return reporterId; }
    public void setReporterId(String reporterId) { this.reporterId = reporterId; }

    public String getReporterEmail() { return reporterEmail; }
    public void setReporterEmail(String reporterEmail) { this.reporterEmail = reporterEmail; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getRecruiterId() { return recruiterId; }
    public void setRecruiterId(String recruiterId) { this.recruiterId = recruiterId; }

    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

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

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
