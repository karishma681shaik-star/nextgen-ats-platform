package com.aiats.entity;

public enum SkillType {
    TECHNICAL,
    SOFT,
    TOOLS,
    LANGUAGES;

    public String toFrontendKey() {
        return name().toLowerCase();
    }

    public static SkillType fromString(String str) {
        if (str == null) return TECHNICAL;
        try {
            return SkillType.valueOf(str.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return TECHNICAL;
        }
    }
}
