package com.aiats.repository;

import com.aiats.entity.CandidateProfile;
import com.aiats.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, UUID> {
    Optional<CandidateProfile> findByUser(User user);
    Optional<CandidateProfile> findByUserId(UUID userId);
}
