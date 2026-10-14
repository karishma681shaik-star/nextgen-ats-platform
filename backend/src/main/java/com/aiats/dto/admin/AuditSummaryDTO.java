package com.aiats.dto.admin;

import java.util.Map;

public class AuditSummaryDTO {
    private long totalEvents;
    private long administrativeActions;
    private long securityEvents;
    private long failedOperations;
    private long accountGovernance;
    private String lastSyncTime;
    private boolean databaseConnected;
    private long todayEvents;
    private long yesterdayEvents;
    private Map<String, Long> dailyCounts;
    private String timezone;

    public AuditSummaryDTO() {}

    public AuditSummaryDTO(long totalEvents, long administrativeActions, long securityEvents,
                           long failedOperations, long accountGovernance,
                           String lastSyncTime, boolean databaseConnected) {
        this.totalEvents = totalEvents;
        this.administrativeActions = administrativeActions;
        this.securityEvents = securityEvents;
        this.failedOperations = failedOperations;
        this.accountGovernance = accountGovernance;
        this.lastSyncTime = lastSyncTime;
        this.databaseConnected = databaseConnected;
    }

    public AuditSummaryDTO(long totalEvents, long administrativeActions, long securityEvents,
                           long failedOperations, long accountGovernance,
                           String lastSyncTime, boolean databaseConnected,
                           long todayEvents, long yesterdayEvents,
                           Map<String, Long> dailyCounts, String timezone) {
        this.totalEvents = totalEvents;
        this.administrativeActions = administrativeActions;
        this.securityEvents = securityEvents;
        this.failedOperations = failedOperations;
        this.accountGovernance = accountGovernance;
        this.lastSyncTime = lastSyncTime;
        this.databaseConnected = databaseConnected;
        this.todayEvents = todayEvents;
        this.yesterdayEvents = yesterdayEvents;
        this.dailyCounts = dailyCounts;
        this.timezone = timezone;
    }

    public long getTotalEvents() { return totalEvents; }
    public void setTotalEvents(long totalEvents) { this.totalEvents = totalEvents; }

    public long getAdministrativeActions() { return administrativeActions; }
    public void setAdministrativeActions(long administrativeActions) { this.administrativeActions = administrativeActions; }

    public long getSecurityEvents() { return securityEvents; }
    public void setSecurityEvents(long securityEvents) { this.securityEvents = securityEvents; }

    public long getFailedOperations() { return failedOperations; }
    public void setFailedOperations(long failedOperations) { this.failedOperations = failedOperations; }

    public long getAccountGovernance() { return accountGovernance; }
    public void setAccountGovernance(long accountGovernance) { this.accountGovernance = accountGovernance; }

    public String getLastSyncTime() { return lastSyncTime; }
    public void setLastSyncTime(String lastSyncTime) { this.lastSyncTime = lastSyncTime; }

    public boolean isDatabaseConnected() { return databaseConnected; }
    public void setDatabaseConnected(boolean databaseConnected) { this.databaseConnected = databaseConnected; }

    public long getTodayEvents() { return todayEvents; }
    public void setTodayEvents(long todayEvents) { this.todayEvents = todayEvents; }

    public long getYesterdayEvents() { return yesterdayEvents; }
    public void setYesterdayEvents(long yesterdayEvents) { this.yesterdayEvents = yesterdayEvents; }

    public Map<String, Long> getDailyCounts() { return dailyCounts; }
    public void setDailyCounts(Map<String, Long> dailyCounts) { this.dailyCounts = dailyCounts; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
}

