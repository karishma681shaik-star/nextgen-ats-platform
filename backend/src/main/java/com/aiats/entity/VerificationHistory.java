package com.aiats.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "verification_history", indexes = {
    @Index(name = "idx_vh_recruiter", columnList = "recruiter_id"),
    @Index(name = "idx_vh_created_at", columnList = "created_at")
})
public class VerificationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 30)
    private VerificationStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", length = 30, nullable = false)
    private VerificationStatus newStatus;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "actor_name", length = 150)
    private String actorName;

    @Column(name = "rejection_category", length = 150)
    private String rejectionCategory;

    @Column(name = "decision_reason", columnDefinition = "TEXT")
    private String decisionReason;

    @Column(name = "corrective_actions", columnDefinition = "TEXT")
    private String correctiveActions;

    @Column(name = "ai_suggestions", columnDefinition = "TEXT")
    private String aiSuggestions;

    @Column(name = "resubmission_allowed")
    private Boolean resubmissionAllowed = true;

    @Column(name = "recruiter_notes", columnDefinition = "TEXT")
    private String recruiterNotes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public VerificationHistory() {}

    public VerificationHistory(User recruiter, VerificationStatus previousStatus, VerificationStatus newStatus,
                               UUID actorId, String actorName, String rejectionCategory, String decisionReason,
                               String correctiveActions, String aiSuggestions, Boolean resubmissionAllowed,
                               String recruiterNotes) {
        this.recruiter = recruiter;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.actorId = actorId;
        this.actorName = actorName;
        this.rejectionCategory = rejectionCategory;
        this.decisionReason = decisionReason;
        this.correctiveActions = correctiveActions;
        this.aiSuggestions = aiSuggestions;
        this.resubmissionAllowed = resubmissionAllowed != null ? resubmissionAllowed : true;
        this.recruiterNotes = recruiterNotes;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getRecruiter() { return recruiter; }
    public void setRecruiter(User recruiter) { this.recruiter = recruiter; }

    public VerificationStatus getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(VerificationStatus previousStatus) { this.previousStatus = previousStatus; }

    public VerificationStatus getNewStatus() { return newStatus; }
    public void setNewStatus(VerificationStatus newStatus) { this.newStatus = newStatus; }

    public UUID getActorId() { return actorId; }
    public void setActorId(UUID actorId) { this.actorId = actorId; }

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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
