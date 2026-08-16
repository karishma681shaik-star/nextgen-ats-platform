package com.aiats.entity;

public enum ApplicationStatus {
    APPLIED,
    UNDER_REVIEW,
    SHORTLISTED,
    INTERVIEW,
    SELECTED,
    REJECTED;

    public String toFrontendStatus() {
        return switch (this) {
            case APPLIED -> "Applied";
            case UNDER_REVIEW -> "Under Review";
            case SHORTLISTED -> "Shortlisted";
            case INTERVIEW -> "Interview";
            case SELECTED -> "Selected";
            case REJECTED -> "Rejected";
        };
    }

    public static ApplicationStatus fromString(String str) {
        if (str == null) return APPLIED;
        String normalized = str.trim().replace(" ", "_").toUpperCase();
        try {
            return ApplicationStatus.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return APPLIED;
        }
    }
}
