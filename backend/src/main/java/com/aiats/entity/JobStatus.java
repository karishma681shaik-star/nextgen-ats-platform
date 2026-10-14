package com.aiats.entity;

public enum JobStatus {
    ACTIVE,
    PENDING_APPROVAL,
    REJECTED,
    CLOSED,
    ARCHIVED,
    DRAFT;

    public String toFrontendStatus() {
        return name().toLowerCase();
    }

    public static JobStatus fromString(String str) {
        if (str == null) return ACTIVE;
        String normalized = str.trim().toUpperCase().replace(" ", "_").replace("-", "_");
        if (normalized.equals("PENDING") || normalized.equals("PENDING_MODERATION")) {
            return PENDING_APPROVAL;
        }
        if (normalized.equals("PUBLISHED") || normalized.equals("APPROVED")) {
            return ACTIVE;
        }
        if (normalized.equals("WITHDRAWN")) {
            return ARCHIVED;
        }
        try {
            return JobStatus.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return ACTIVE;
        }
    }
}
