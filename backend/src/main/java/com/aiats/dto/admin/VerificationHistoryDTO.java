package com.aiats.dto.admin;

import com.aiats.entity.VerificationHistory;

public class VerificationHistoryDTO {
    private String id;
    private String recruiterId;
    private String previousStatus;
    private String newStatus;
    private String actorId;
    private String actorName;
    private String rejectionCategory;
    private String decisionReason;
    private String correctiveActions;
    private String aiSuggestions;
    private Boolean resubmissionAllowed;
    private String recruiterNotes;
    private String createdAt;

    public VerificationHistoryDTO() {}

    public VerificationHistoryDTO(VerificationHistory vh) {
        if (vh != null) {
            this.id = vh.getId() != null ? vh.getId().toString() : null;
            this.recruiterId = vh.getRecruiter() != null ? vh.getRecruiter().getId().toString() : null;
            this.previousStatus = vh.getPreviousStatus() != null ? vh.getPreviousStatus().toFrontendStatus() : null;
            this.newStatus = vh.getNewStatus() != null ? vh.getNewStatus().toFrontendStatus() : null;
            this.actorId = vh.getActorId() != null ? vh.getActorId().toString() : null;
            this.actorName = vh.getActorName();
            this.rejectionCategory = vh.getRejectionCategory();
            this.decisionReason = vh.getDecisionReason();
            this.correctiveActions = vh.getCorrectiveActions();
            this.aiSuggestions = vh.getAiSuggestions();
            this.resubmissionAllowed = vh.getResubmissionAllowed();
            this.recruiterNotes = vh.getRecruiterNotes();
            this.createdAt = vh.getCreatedAt() != null ? vh.getCreatedAt().toString() : null;
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecruiterId() { return recruiterId; }
    public void setRecruiterId(String recruiterId) { this.recruiterId = recruiterId; }

    public String getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(String previousStatus) { this.previousStatus = previousStatus; }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }

    public String getActorId() { return actorId; }
    public void setActorId(String actorId) { this.actorId = actorId; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }

    public String getRejectionCategory() { return rejectionCategory; }
    public void setRejectionCategory(String rejectionCategory) { this.rejectionCategory = rejectionCategory; }

    public String getDecisionReason() { return decisionReason; }
    public void setDecisionReason(String decisionReason) { this.decisionReason = decisionReason; }

    public String getCorrectiveActions() { return correctiveActions; }
    public void setCorrectiveActions(String correctiveActions) { this.correctiveActions = correctiveActions; }

    public String getAiSuggestions() { return aiSuggestions; }
    public void setAiSuggestions(String aiSuggestions) { this.aiSuggestions = aiSuggestions; }

    public Boolean getResubmissionAllowed() { return resubmissionAllowed; }
    public void setResubmissionAllowed(Boolean resubmissionAllowed) { this.resubmissionAllowed = resubmissionAllowed; }

    public String getRecruiterNotes() { return recruiterNotes; }
    public void setRecruiterNotes(String recruiterNotes) { this.recruiterNotes = recruiterNotes; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
