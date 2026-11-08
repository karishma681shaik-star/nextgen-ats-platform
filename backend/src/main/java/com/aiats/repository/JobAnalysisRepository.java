package com.aiats.repository;

import com.aiats.entity.JobAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobAnalysisRepository extends JpaRepository<JobAnalysis, UUID> {
    List<JobAnalysis> findByResumeIdOrderByUpdatedAtDesc(UUID resumeId);
    Optional<JobAnalysis> findByResumeIdAndJobId(UUID resumeId, UUID jobId);
    void deleteByResumeIdAndJobId(UUID resumeId, UUID jobId);
    boolean existsByResumeIdAndJobId(UUID resumeId, UUID jobId);
}

