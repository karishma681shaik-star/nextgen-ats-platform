package com.aiats.repository;

import com.aiats.entity.Job;
import com.aiats.entity.SavedJob;
import com.aiats.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, UUID> {
    List<SavedJob> findByCandidateOrderBySavedAtDesc(User candidate);
    List<SavedJob> findByCandidateIdOrderBySavedAtDesc(UUID candidateId);
    Optional<SavedJob> findByCandidateIdAndJobId(UUID candidateId, UUID jobId);
    boolean existsByCandidateIdAndJobId(UUID candidateId, UUID jobId);
    long countByCandidateId(UUID candidateId);
    void deleteByCandidateIdAndJobId(UUID candidateId, UUID jobId);
}
