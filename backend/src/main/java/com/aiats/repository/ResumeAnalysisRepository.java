package com.aiats.repository;

import com.aiats.entity.Resume;
import com.aiats.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, UUID> {
    Optional<ResumeAnalysis> findByResume(Resume resume);
    Optional<ResumeAnalysis> findByResumeId(UUID resumeId);
    Optional<ResumeAnalysis> findTopByResumeUserIdOrderByLastAnalyzedDesc(UUID userId);
}
