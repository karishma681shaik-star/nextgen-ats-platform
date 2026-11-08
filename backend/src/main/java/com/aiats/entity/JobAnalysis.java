package com.aiats.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "job_analyses", uniqueConstraints = {
    @UniqueConstraint(name = "uk_resume_job", columnNames = {"resume_id", "job_id"})
}, indexes = {
    @Index(name = "idx_job_analysis_resume", columnList = "resume_id"),
    @Index(name = "idx_job_analysis_job", columnList = "job_id"),
    @Index(name = "idx_job_analysis_user", columnList = "user_id")
})
public class JobAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "match_score", nullable = false)
    private int matchScore = 0;

    @Column(name = "match_label", length = 50)
    private String matchLabel = "Fair Match";

    @Column(name = "readiness_score", nullable = false)
    private int readinessScore = 0;

    @Column(name = "readiness_label", length = 50)
    private String readinessLabel = "Apply Ready";

    @Column(name = "fit_assessment", columnDefinition = "TEXT")
    private String fitAssessment;

    @Column(name = "strong_keywords", columnDefinition = "TEXT")
    private String strongKeywords;

    @Column(name = "good_to_have_keywords", columnDefinition = "TEXT")
    private String goodToHaveKeywords;

    @Column(name = "role_alignment_criteria", columnDefinition = "TEXT")
    private String roleAlignmentCriteria;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public JobAnalysis() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Resume getResume() {
        return resume;
    }

    public void setResume(Resume resume) {
        this.resume = resume;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public int getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(int matchScore) {
        this.matchScore = matchScore;
    }

    public String getMatchLabel() {
        return matchLabel;
    }

    public void setMatchLabel(String matchLabel) {
        this.matchLabel = matchLabel;
    }

    public int getReadinessScore() {
        return readinessScore;
    }

    public void setReadinessScore(int readinessScore) {
        this.readinessScore = readinessScore;
    }

    public String getReadinessLabel() {
        return readinessLabel;
    }

    public void setReadinessLabel(String readinessLabel) {
        this.readinessLabel = readinessLabel;
    }

    public String getFitAssessment() {
        return fitAssessment;
    }

    public void setFitAssessment(String fitAssessment) {
        this.fitAssessment = fitAssessment;
    }

    public String getStrongKeywords() {
        return strongKeywords;
    }

    public void setStrongKeywords(String strongKeywords) {
        this.strongKeywords = strongKeywords;
    }

    public String getGoodToHaveKeywords() {
        return goodToHaveKeywords;
    }

    public void setGoodToHaveKeywords(String goodToHaveKeywords) {
        this.goodToHaveKeywords = goodToHaveKeywords;
    }

    public String getRoleAlignmentCriteria() {
        return roleAlignmentCriteria;
    }

    public void setRoleAlignmentCriteria(String roleAlignmentCriteria) {
        this.roleAlignmentCriteria = roleAlignmentCriteria;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

