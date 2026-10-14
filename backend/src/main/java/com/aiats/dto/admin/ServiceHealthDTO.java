package com.aiats.dto.admin;

public class ServiceHealthDTO {
    private String serviceName;
    private String category;
    private String status; // OPERATIONAL, DEGRADED, UNAVAILABLE, MONITORING_UNAVAILABLE
    private Long latencyMs;
    private String lastChecked;
    private String details;

    public ServiceHealthDTO() {}

    public ServiceHealthDTO(String serviceName, String category, String status, Long latencyMs, String lastChecked, String details) {
        this.serviceName = serviceName;
        this.category = category;
        this.status = status;
        this.latencyMs = latencyMs;
        this.lastChecked = lastChecked;
        this.details = details;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getLatencyMs() {
        return latencyMs;
    }

    public void setLatencyMs(Long latencyMs) {
        this.latencyMs = latencyMs;
    }

    public String getLastChecked() {
        return lastChecked;
    }

    public void setLastChecked(String lastChecked) {
        this.lastChecked = lastChecked;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
