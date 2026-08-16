package com.aiats.entity;

public enum JobStatus {
    ACTIVE,
    CLOSED,
    DRAFT;

    public String toFrontendStatus() {
        return name().toLowerCase();
    }

    public static JobStatus fromString(String str) {
        if (str == null) return ACTIVE;
        try {
            return JobStatus.valueOf(str.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ACTIVE;
        }
    }
}
