package com.aiats.dto.admin;

public class AuditCleanupPreviewRequest {
    private String operationType; // SPECIFIC_DATE, DATE_RANGE, DELETE_ALL
    private String date; // YYYY-MM-DD
    private String startDate; // ISO or YYYY-MM-DD
    private String endDate; // ISO or YYYY-MM-DD
    private String timezone; // e.g. "Asia/Kolkata"
    private boolean preserveHighSeverity = true;
    private boolean preserveActiveToday = true;

    public AuditCleanupPreviewRequest() {}

    public String getOperationType() { return operationType; }
    public void setOperationType(String operationType) { this.operationType = operationType; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public boolean isPreserveHighSeverity() { return preserveHighSeverity; }
    public void setPreserveHighSeverity(boolean preserveHighSeverity) { this.preserveHighSeverity = preserveHighSeverity; }

    public boolean isPreserveActiveToday() { return preserveActiveToday; }
    public void setPreserveActiveToday(boolean preserveActiveToday) { this.preserveActiveToday = preserveActiveToday; }
}
