package com.aiats.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "resume_analyses", indexes = {
    @Index(name = "idx_analysis_resume", columnList = "resume_id")
})
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(name = "overall_score", nullable = false)
    private int overallScore = 0;

    @Column(name = "technical_score", nullable = false)
    private int technicalScore = 0;

    @Column(name = "keyword_score", nullable = false)
    private int keywordScore = 0;

    @Column(name = "skills_score", nullable = false)
    private int skillsScore = 0;

    @Column(name = "experience_score", nullable = false)
    private int experienceScore = 0;

    @Column(name = "education_score", nullable = false)
    private int educationScore = 0;

    @Column(name = "formatting_score", nullable = false)
    private int formattingScore = 0;

    @Column(name = "missing_keywords", columnDefinition = "TEXT")
    private String missingKeywords; // JSON or comma-separated

    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private String missingSkills; // JSON or comma-separated

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths; // JSON or newline-separated

    @Column(name = "weaknesses", columnDefinition = "TEXT")
    private String weaknesses; // JSON or newline-separated

    @Column(name = "recommendations", columnDefinition = "TEXT")
    private String recommendations; // JSON or newline-separated

    @Column(name = "last_analyzed", nullable = false)
    private Instant lastAnalyzed = Instant.now();

    public ResumeAnalysis() {}

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Resume getResume() {
        return resume;
    }

    public void setResume(Resume resume) {
        this.resume = resume;
    }

    public int getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(int overallScore) {
        this.overallScore = overallScore;
    }

    public int getTechnicalScore() {
        return technicalScore;
    }

    public void setTechnicalScore(int technicalScore) {
        this.technicalScore = technicalScore;
    }

    public int getKeywordScore() {
        return keywordScore;
    }

    public void setKeywordScore(int keywordScore) {
        this.keywordScore = keywordScore;
    }

    public int getSkillsScore() {
        return skillsScore;
    }

    public void setSkillsScore(int skillsScore) {
        this.skillsScore = skillsScore;
    }

    public int getExperienceScore() {
        return experienceScore;
    }

    public void setExperienceScore(int experienceScore) {
        this.experienceScore = experienceScore;
    }

    public int getEducationScore() {
        return educationScore;
    }

    public void setEducationScore(int educationScore) {
        this.educationScore = educationScore;
    }

    public int getFormattingScore() {
        return formattingScore;
    }

    public void setFormattingScore(int formattingScore) {
        this.formattingScore = formattingScore;
    }

    public String getMissingKeywords() {
        return missingKeywords;
    }

    public void setMissingKeywords(String missingKeywords) {
        this.missingKeywords = missingKeywords;
    }

    public String getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(String missingSkills) {
        this.missingSkills = missingSkills;
    }

    public String getStrengths() {
        return strengths;
    }

    public void setStrengths(String strengths) {
        this.strengths = strengths;
    }

    public String getWeaknesses() {
        return weaknesses;
    }

    public void setWeaknesses(String weaknesses) {
        this.weaknesses = weaknesses;
    }

    public String getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(String recommendations) {
        this.recommendations = recommendations;
    }

    public Instant getLastAnalyzed() {
        return lastAnalyzed;
    }

    public void setLastAnalyzed(Instant lastAnalyzed) {
        this.lastAnalyzed = lastAnalyzed;
    }
}
