package com.aiats.dto.admin;

public class ReviewAlertRequest {
    private String reviewStatus; // UNDER_REVIEW, CONFIRMED_POLICY_VIOLATION, FALSE_POSITIVE, RESOLVED
    private String adminDecision;
    private String reviewNotes;
    private boolean suspendAccount;

    public ReviewAlertRequest() {}

    public String getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(String reviewStatus) { this.reviewStatus = reviewStatus; }

    public String getAdminDecision() { return adminDecision; }
    public void setAdminDecision(String adminDecision) { this.adminDecision = adminDecision; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }

    public boolean isSuspendAccount() { return suspendAccount; }
    public void setSuspendAccount(boolean suspendAccount) { this.suspendAccount = suspendAccount; }
}
