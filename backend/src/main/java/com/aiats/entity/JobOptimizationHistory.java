package com.aiats.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "job_optimization_histories", indexes = {
    @Index(name = "idx_opt_hist_resume_job", columnList = "resume_id, job_id"),
    @Index(name = "idx_opt_hist_user", columnList = "user_id")
})
public class JobOptimizationHistory {

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

    @Column(name = "previous_score")
    private Integer previousScore;

    @Column(name = "score_after", nullable = false)
    private int scoreAfter;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "Completed";

    @Column(name = "changes_applied", columnDefinition = "TEXT")
    private String changesApplied;

    @Column(name = "resume_snapshot", columnDefinition = "TEXT", nullable = false)
    private String resumeSnapshot;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public JobOptimizationHistory() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
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

    public Integer getPreviousScore() {
        return previousScore;
    }

    public void setPreviousScore(Integer previousScore) {
        this.previousScore = previousScore;
    }

    public int getScoreAfter() {
        return scoreAfter;
    }

    public void setScoreAfter(int scoreAfter) {
        this.scoreAfter = scoreAfter;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getChangesApplied() {
        return changesApplied;
    }

    public void setChangesApplied(String changesApplied) {
        this.changesApplied = changesApplied;
    }

    public String getResumeSnapshot() {
        return resumeSnapshot;
    }

    public void setResumeSnapshot(String resumeSnapshot) {
        this.resumeSnapshot = resumeSnapshot;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

