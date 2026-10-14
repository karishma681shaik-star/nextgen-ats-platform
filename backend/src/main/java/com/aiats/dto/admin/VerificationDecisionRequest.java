package com.aiats.dto.admin;

public class VerificationDecisionRequest {
    private String category;
    private String reason;
    private String correctiveActions;
    private String aiSuggestions;
    private Boolean resubmissionAllowed = true;
    private String resubmissionNotes;

    public VerificationDecisionRequest() {}

    public VerificationDecisionRequest(String reason) {
        this.reason = reason;
    }

    public VerificationDecisionRequest(String category, String reason, String correctiveActions,
                                     String aiSuggestions, Boolean resubmissionAllowed, String resubmissionNotes) {
        this.category = category;
        this.reason = reason;
        this.correctiveActions = correctiveActions;
        this.aiSuggestions = aiSuggestions;
        this.resubmissionAllowed = resubmissionAllowed != null ? resubmissionAllowed : true;
        this.resubmissionNotes = resubmissionNotes;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getCorrectiveActions() {
        return correctiveActions;
    }

    public void setCorrectiveActions(String correctiveActions) {
        this.correctiveActions = correctiveActions;
    }

    public String getAiSuggestions() {
        return aiSuggestions;
    }

    public void setAiSuggestions(String aiSuggestions) {
        this.aiSuggestions = aiSuggestions;
    }

    public Boolean getResubmissionAllowed() {
        return resubmissionAllowed != null ? resubmissionAllowed : true;
    }

    public void setResubmissionAllowed(Boolean resubmissionAllowed) {
        this.resubmissionAllowed = resubmissionAllowed;
    }

    public String getResubmissionNotes() {
        return resubmissionNotes;
    }

    public void setResubmissionNotes(String resubmissionNotes) {
        this.resubmissionNotes = resubmissionNotes;
    }
}
