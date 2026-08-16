package com.aiats.entity;

public enum UserStatus {
    ACTIVE,
    SUSPENDED,
    PENDING;

    public String toFrontendStatus() {
        return name().toLowerCase();
    }

    public static UserStatus fromString(String statusStr) {
        if (statusStr == null) return ACTIVE;
        try {
            return UserStatus.valueOf(statusStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ACTIVE;
        }
    }
}
