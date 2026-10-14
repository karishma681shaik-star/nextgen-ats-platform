package com.aiats.repository;

import com.aiats.entity.VerificationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VerificationHistoryRepository extends JpaRepository<VerificationHistory, UUID> {
    List<VerificationHistory> findByRecruiterIdOrderByCreatedAtDesc(UUID recruiterId);
}
