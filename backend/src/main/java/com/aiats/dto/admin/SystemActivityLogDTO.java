package com.aiats.dto.admin;

import com.aiats.entity.SystemActivityLog;

public class SystemActivityLogDTO {
    private String id;
    private String actorId;
    private String actorName;
    private String actorRole;
    private String action;
    private String eventType;
    private String eventCategory;
    private String severity;
    private String result;
    private String target;
    private String targetType;
    private String targetId;
    private String previousState;
    private String newState;
    private String reason;
    private String ipAddress;
    private String correlationId;
    private String timestamp;

    public SystemActivityLogDTO() {}

    public SystemActivityLogDTO(SystemActivityLog log) {
        if (log != null) {
            log.inferMetadata(); // ensure defaulted values
            this.id = log.getId() != null ? log.getId().toString() : null;
            this.actorId = log.getActorId() != null ? log.getActorId().toString() : null;
            this.actorName = log.getActorName();
            this.actorRole = log.getActorRole() != null ? log.getActorRole().toFrontendRole() : "candidate";
            this.action = log.getAction();
            this.eventType = log.getEventType();
            this.eventCategory = log.getEventCategory();
            this.severity = log.getSeverity();
            this.result = log.getResult();
            this.target = log.getTarget();
            this.targetType = log.getTargetType();
            this.targetId = log.getTargetId();
            this.previousState = log.getPreviousState();
            this.newState = log.getNewState();
            this.reason = log.getReason();
            this.ipAddress = log.getIpAddress();
            this.correlationId = log.getCorrelationId();
            this.timestamp = log.getTimestamp() != null ? log.getTimestamp().toString() : null;
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getActorId() { return actorId; }
    public void setActorId(String actorId) { this.actorId = actorId; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getEventCategory() { return eventCategory; }
    public void setEventCategory(String eventCategory) { this.eventCategory = eventCategory; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }

    public String getPreviousState() { return previousState; }
    public void setPreviousState(String previousState) { this.previousState = previousState; }

    public String getNewState() { return newState; }
    public void setNewState(String newState) { this.newState = newState; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
