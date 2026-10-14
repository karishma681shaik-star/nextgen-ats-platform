package com.aiats.entity;

public enum VerificationStatus {
    PENDING,
    IN_REVIEW,
    VERIFIED,
    ADDITIONAL_EVIDENCE_REQUIRED,
    UNABLE_TO_VERIFY,
    REJECTED,
    SUSPENDED,
    ARCHIVED,
    RESUBMITTED;

    public String toFrontendStatus() {
        return name().toLowerCase();
    }

    public static VerificationStatus fromString(String val) {
        if (val == null || val.isBlank()) return PENDING;
        String normalized = val.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        if (normalized.equals("UNDER_REVIEW")) {
            return IN_REVIEW;
        }
        if (normalized.equals("ADDITIONAL_EVIDENCE") || normalized.equals("EVIDENCE_REQUIRED")) {
            return ADDITIONAL_EVIDENCE_REQUIRED;
        }
        try {
            return VerificationStatus.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return PENDING;
        }
    }
}
