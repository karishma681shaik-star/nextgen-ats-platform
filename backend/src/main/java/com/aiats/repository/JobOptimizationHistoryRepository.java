package com.aiats.repository;

import com.aiats.entity.JobOptimizationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobOptimizationHistoryRepository extends JpaRepository<JobOptimizationHistory, UUID> {
    List<JobOptimizationHistory> findByResumeIdAndJobIdOrderByCreatedAtDesc(UUID resumeId, UUID jobId);
}

