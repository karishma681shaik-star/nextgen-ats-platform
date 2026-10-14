package com.aiats.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "system_activity_logs", indexes = {
    @Index(name = "idx_log_timestamp", columnList = "timestamp"),
    @Index(name = "idx_log_event_category", columnList = "event_category"),
    @Index(name = "idx_log_severity", columnList = "severity"),
    @Index(name = "idx_log_result", columnList = "result"),
    @Index(name = "idx_log_actor_id", columnList = "actor_id")
})
public class SystemActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "actor_name", nullable = false, length = 100)
    private String actorName;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor_role", nullable = false, length = 20)
    private Role actorRole;

    @Column(name = "action", nullable = false, length = 150)
    private String action;

    @Column(name = "event_type", length = 80)
    private String eventType;

    @Column(name = "event_category", length = 80)
    private String eventCategory;

    @Column(name = "severity", length = 20)
    private String severity; // INFO, NOTICE, WARNING, HIGH

    @Column(name = "result", length = 20)
    private String result; // SUCCESS, FAILURE, BLOCKED

    @Column(name = "target", nullable = false, length = 255)
    private String target;

    @Column(name = "target_type", length = 50)
    private String targetType; // USER, RECRUITER, CANDIDATE, JOB, APPLICATION, SECURITY_ALERT, SYSTEM

    @Column(name = "target_id", length = 100)
    private String targetId;

    @Column(name = "previous_state", length = 100)
    private String previousState;

    @Column(name = "new_state", length = 100)
    private String newState;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "correlation_id", length = 100)
    private String correlationId;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp = Instant.now();

    public SystemActivityLog() {}

    public SystemActivityLog(UUID actorId, String actorName, Role actorRole, String action, String target, String ipAddress) {
        this.actorId = actorId;
        this.actorName = actorName != null ? actorName : "System";
        this.actorRole = actorRole != null ? actorRole : Role.CANDIDATE;
        this.action = action;
        this.target = target != null ? target : "Platform";
        this.ipAddress = ipAddress != null ? ipAddress : "127.0.0.1";
        this.timestamp = Instant.now();
        inferMetadata();
    }

    @PrePersist
    @PostLoad
    public void inferMetadata() {
        if (this.action == null) {
            this.action = "System Event";
        }
        String act = this.action.toLowerCase();

        if (this.result == null || this.result.isBlank()) {
            if (act.contains("blocked") || act.contains("locked") || act.contains("lockout")) {
                this.result = "BLOCKED";
            } else if (act.contains("failed") || act.contains("failure")) {
                this.result = "FAILURE";
            } else {
                this.result = "SUCCESS";
            }
        }

        if (this.severity == null || this.severity.isBlank()) {
            if (act.contains("permanent account deletion") || act.contains("security alert") || act.contains("lockout") || act.contains("blocked")) {
                this.severity = "HIGH";
            } else if (act.contains("rejected") || act.contains("suspended") || act.contains("failed") || act.contains("warning")) {
                this.severity = "WARNING";
            } else if (act.contains("status updated") || act.contains("approved") || act.contains("scheduled") || act.contains("moderated")) {
                this.severity = "NOTICE";
            } else {
                this.severity = "INFO";
            }
        }

        if (this.eventCategory == null || this.eventCategory.isBlank()) {
            if (act.contains("recruiter verification") || act.contains("verification")) {
                this.eventCategory = "RECRUITER_VERIFICATION";
            } else if (act.contains("security") || act.contains("login") || act.contains("blocked") || act.contains("throttled") || act.contains("alert")) {
                this.eventCategory = "AUTHENTICATION_SECURITY";
            } else if (act.contains("job") || act.contains("requisition")) {
                this.eventCategory = "JOB_MODERATION";
            } else if (act.contains("application") || act.contains("interview") || act.contains("resume")) {
                this.eventCategory = "CANDIDATE_APPLICATIONS";
            } else if (act.contains("user") || act.contains("account") || act.contains("candidate registered") || act.contains("recruiter registered") || act.contains("deletion") || act.contains("suspended") || act.contains("reactivated")) {
                this.eventCategory = "ACCOUNT_GOVERNANCE";
            } else {
                this.eventCategory = "SYSTEM_OPERATIONS";
            }
        }

        if (this.eventType == null || this.eventType.isBlank()) {
            if (act.contains("permanent account deletion")) {
                this.eventType = "PERMANENT_ACCOUNT_DELETION";
            } else if (act.contains("recruiter verification approved")) {
                this.eventType = "RECRUITER_VERIFICATION_APPROVED";
            } else if (act.contains("recruiter verification rejected")) {
                this.eventType = "RECRUITER_VERIFICATION_REJECTED";
            } else if (act.contains("recruiter suspended")) {
                this.eventType = "RECRUITER_SUSPENDED";
            } else if (act.contains("recruiter reactivated")) {
                this.eventType = "RECRUITER_REACTIVATED";
            } else if (act.contains("user status updated")) {
                this.eventType = "USER_STATUS_UPDATED";
            } else if (act.contains("candidate registered")) {
                this.eventType = "CANDIDATE_REGISTERED";
            } else if (act.contains("recruiter registered")) {
                this.eventType = "RECRUITER_REGISTERED";
            } else if (act.contains("job created")) {
                this.eventType = "JOB_CREATED";
            } else if (act.contains("job updated")) {
                this.eventType = "JOB_UPDATED";
            } else if (act.contains("job status changed")) {
                this.eventType = "JOB_STATUS_CHANGED";
            } else if (act.contains("application submitted")) {
                this.eventType = "APPLICATION_SUBMITTED";
            } else if (act.contains("application status updated")) {
                this.eventType = "APPLICATION_STATUS_UPDATED";
            } else if (act.contains("interview scheduled")) {
                this.eventType = "INTERVIEW_SCHEDULED";
            } else if (act.contains("security alert")) {
                this.eventType = "SECURITY_ALERT_REVIEWED";
            } else if (act.contains("login failed")) {
                this.eventType = "ADMIN_LOGIN_FAILED";
            } else if (act.contains("logged in successfully") || act.contains("authenticated")) {
                this.eventType = "ADMIN_LOGIN_SUCCESS";
            } else if (act.contains("export")) {
                this.eventType = "AUDIT_REPORT_EXPORTED";
            } else {
                this.eventType = "SYSTEM_ACTIVITY";
            }
        }

        if (this.targetType == null || this.targetType.isBlank()) {
            if (act.contains("recruiter")) {
                this.targetType = "RECRUITER";
            } else if (act.contains("candidate")) {
                this.targetType = "CANDIDATE";
            } else if (act.contains("job")) {
                this.targetType = "JOB";
            } else if (act.contains("application") || act.contains("interview")) {
                this.targetType = "APPLICATION";
            } else if (act.contains("security") || act.contains("login")) {
                this.targetType = "SECURITY_EVENT";
            } else if (act.contains("user") || act.contains("account")) {
                this.targetType = "USER";
            } else {
                this.targetType = "SYSTEM";
            }
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getActorId() {
        return actorId;
    }

    public void setActorId(UUID actorId) {
        this.actorId = actorId;
    }

    public String getActorName() {
        return actorName;
    }

    public void setActorName(String actorName) {
        this.actorName = actorName;
    }

    public Role getActorRole() {
        return actorRole;
    }

    public void setActorRole(Role actorRole) {
        this.actorRole = actorRole;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getEventCategory() {
        return eventCategory;
    }

    public void setEventCategory(String eventCategory) {
        this.eventCategory = eventCategory;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    public String getPreviousState() {
        return previousState;
    }

    public void setPreviousState(String previousState) {
        this.previousState = previousState;
    }

    public String getNewState() {
        return newState;
    }

    public void setNewState(String newState) {
        this.newState = newState;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
