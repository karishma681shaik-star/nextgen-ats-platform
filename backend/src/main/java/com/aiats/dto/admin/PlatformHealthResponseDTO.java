package com.aiats.dto.admin;

import java.util.ArrayList;
import java.util.List;

public class PlatformHealthResponseDTO {
    private String overallStatus; // OPERATIONAL, DEGRADED, UNAVAILABLE
    private String checkedAt;
    private long totalServicesMonitored;
    private long healthyServicesCount;
    private List<ServiceHealthDTO> services = new ArrayList<>();

    public PlatformHealthResponseDTO() {}

    public PlatformHealthResponseDTO(String overallStatus, String checkedAt, List<ServiceHealthDTO> services) {
        this.overallStatus = overallStatus;
        this.checkedAt = checkedAt;
        this.services = services != null ? services : new ArrayList<>();
        this.totalServicesMonitored = this.services.size();
        this.healthyServicesCount = this.services.stream()
                .filter(s -> "OPERATIONAL".equalsIgnoreCase(s.getStatus()))
                .count();
    }

    public String getOverallStatus() {
        return overallStatus;
    }

    public void setOverallStatus(String overallStatus) {
        this.overallStatus = overallStatus;
    }

    public String getCheckedAt() {
        return checkedAt;
    }

    public void setCheckedAt(String checkedAt) {
        this.checkedAt = checkedAt;
    }

    public long getTotalServicesMonitored() {
        return totalServicesMonitored;
    }

    public void setTotalServicesMonitored(long totalServicesMonitored) {
        this.totalServicesMonitored = totalServicesMonitored;
    }

    public long getHealthyServicesCount() {
        return healthyServicesCount;
    }

    public void setHealthyServicesCount(long healthyServicesCount) {
        this.healthyServicesCount = healthyServicesCount;
    }

    public List<ServiceHealthDTO> getServices() {
        return services;
    }

    public void setServices(List<ServiceHealthDTO> services) {
        this.services = services;
        if (services != null) {
            this.totalServicesMonitored = services.size();
            this.healthyServicesCount = services.stream()
                    .filter(s -> "OPERATIONAL".equalsIgnoreCase(s.getStatus()))
                    .count();
        }
    }
}
