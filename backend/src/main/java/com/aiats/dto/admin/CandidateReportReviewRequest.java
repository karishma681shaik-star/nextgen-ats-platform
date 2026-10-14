package com.aiats.dto.admin;

public class CandidateReportReviewRequest {
    private String status; // RESOLVED, DISMISSED, UNDER_INVESTIGATION
    private String adminDecision;
    private String adminNotes;
    private String actionTaken; // JOB_UNPUBLISHED, RECRUITER_FLAGGED, VERIFICATION_REOPENED, DISMISSED_NO_VIOLATION, NONE

    public CandidateReportReviewRequest() {}

    public CandidateReportReviewRequest(String status, String adminDecision, String adminNotes, String actionTaken) {
        this.status = status;
        this.adminDecision = adminDecision;
        this.adminNotes = adminNotes;
        this.actionTaken = actionTaken;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminDecision() { return adminDecision; }
    public void setAdminDecision(String adminDecision) { this.adminDecision = adminDecision; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public String getActionTaken() { return actionTaken; }
    public void setActionTaken(String actionTaken) { this.actionTaken = actionTaken; }
}
