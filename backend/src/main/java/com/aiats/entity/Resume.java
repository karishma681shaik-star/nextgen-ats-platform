package com.aiats.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "resumes", indexes = {
    @Index(name = "idx_resumes_user", columnList = "user_id")
})
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "file_name", nullable = false, length = 250)
    private String fileName;

    @Column(name = "file_size", length = 50)
    private String fileSize;

    @Column(name = "file_type", length = 20)
    private String fileType = "pdf";

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "is_primary", nullable = false)
    private boolean primary = false;

    @Column(name = "status", length = 30)
    private String status = "ready"; // ready, processing, parsed

    @Column(name = "extracted_skills", columnDefinition = "TEXT")
    private String extractedSkills; // JSON or comma-separated

    @Column(name = "extracted_education", columnDefinition = "TEXT")
    private String extractedEducation;

    @Column(name = "extracted_experience", columnDefinition = "TEXT")
    private String extractedExperience;

    @Column(name = "extracted_projects", columnDefinition = "TEXT")
    private String extractedProjects;

    @Column(name = "extracted_certifications", columnDefinition = "TEXT")
    private String extractedCertifications;

    @Column(name = "resume_data", columnDefinition = "TEXT")
    private String resumeData;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Resume() {}

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

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileSize() {
        return fileSize;
    }

    public void setFileSize(String fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public boolean isPrimary() {
        return primary;
    }

    public void setPrimary(boolean primary) {
        this.primary = primary;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getExtractedSkills() {
        return extractedSkills;
    }

    public void setExtractedSkills(String extractedSkills) {
        this.extractedSkills = extractedSkills;
    }

    public String getExtractedEducation() {
        return extractedEducation;
    }

    public void setExtractedEducation(String extractedEducation) {
        this.extractedEducation = extractedEducation;
    }

    public String getExtractedExperience() {
        return extractedExperience;
    }

    public void setExtractedExperience(String extractedExperience) {
        this.extractedExperience = extractedExperience;
    }

    public String getExtractedProjects() {
        return extractedProjects;
    }

    public void setExtractedProjects(String extractedProjects) {
        this.extractedProjects = extractedProjects;
    }

    public String getExtractedCertifications() {
        return extractedCertifications;
    }

    public void setExtractedCertifications(String extractedCertifications) {
        this.extractedCertifications = extractedCertifications;
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

    public String getResumeData() {
        return resumeData;
    }

    public void setResumeData(String resumeData) {
        this.resumeData = resumeData;
    }
}
