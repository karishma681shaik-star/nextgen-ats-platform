package com.aiats.entity;

public enum ApplicationStatus {
    APPLIED,
    UNDER_REVIEW,
    SHORTLISTED,
    INTERVIEW,
    OFFERED,
    SELECTED,
    REJECTED,
    WITHDRAWN;

    public String toFrontendStatus() {
        return switch (this) {
            case APPLIED -> "Applied";
            case UNDER_REVIEW -> "Under Review";
            case SHORTLISTED -> "Shortlisted";
            case INTERVIEW -> "Interview";
            case OFFERED -> "Offered";
            case SELECTED -> "Selected";
            case REJECTED -> "Rejected";
            case WITHDRAWN -> "Withdrawn";
        };
    }

    public static ApplicationStatus fromString(String str) {
        if (str == null) return APPLIED;
        String normalized = str.trim().replace(" ", "_").toUpperCase();
        if (normalized.equals("REVIEW") || normalized.equals("RESUME_REVIEW") || normalized.equals("ASSESSMENT")) {
            return UNDER_REVIEW;
        }
        if (normalized.equals("INTERVIEW_SCHEDULED") || normalized.equals("INTERVIEW_COMPLETED")) {
            return INTERVIEW;
        }
        if (normalized.equals("HIRED")) {
            return SELECTED;
        }
        try {
            return ApplicationStatus.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return APPLIED;
        }
    }
}
