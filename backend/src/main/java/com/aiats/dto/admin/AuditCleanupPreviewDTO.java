package com.aiats.dto.admin;

public class AuditCleanupPreviewDTO {
    private String operationType;
    private String targetScopeLabel;
    private long totalMatching;
    private long eligibleForDeletion;
    private long protectedRecords;
    private String protectionReason;
    private String earliestTimestamp;
    private String latestTimestamp;
    private String timezone;
    private String estimatedReclaimedBytes;
    private String storageNotice;

    public AuditCleanupPreviewDTO() {}

    public String getOperationType() { return operationType; }
    public void setOperationType(String operationType) { this.operationType = operationType; }

    public String getTargetScopeLabel() { return targetScopeLabel; }
    public void setTargetScopeLabel(String targetScopeLabel) { this.targetScopeLabel = targetScopeLabel; }

    public long getTotalMatching() { return totalMatching; }
    public void setTotalMatching(long totalMatching) { this.totalMatching = totalMatching; }

    public long getEligibleForDeletion() { return eligibleForDeletion; }
    public void setEligibleForDeletion(long eligibleForDeletion) { this.eligibleForDeletion = eligibleForDeletion; }

    public long getProtectedRecords() { return protectedRecords; }
    public void setProtectedRecords(long protectedRecords) { this.protectedRecords = protectedRecords; }

    public String getProtectionReason() { return protectionReason; }
    public void setProtectionReason(String protectionReason) { this.protectionReason = protectionReason; }

    public String getEarliestTimestamp() { return earliestTimestamp; }
    public void setEarliestTimestamp(String earliestTimestamp) { this.earliestTimestamp = earliestTimestamp; }

    public String getLatestTimestamp() { return latestTimestamp; }
    public void setLatestTimestamp(String latestTimestamp) { this.latestTimestamp = latestTimestamp; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public String getEstimatedReclaimedBytes() { return estimatedReclaimedBytes; }
    public void setEstimatedReclaimedBytes(String estimatedReclaimedBytes) { this.estimatedReclaimedBytes = estimatedReclaimedBytes; }

    public String getStorageNotice() { return storageNotice; }
    public void setStorageNotice(String storageNotice) { this.storageNotice = storageNotice; }
}
