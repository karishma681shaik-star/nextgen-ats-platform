package com.aiats.dto.admin;

public class JobModerationDecisionRequest {
    private String reason;
    private String notes;

    public JobModerationDecisionRequest() {}

    public JobModerationDecisionRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
