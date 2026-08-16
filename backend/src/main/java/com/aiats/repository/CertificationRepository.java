package com.aiats.repository;

import com.aiats.entity.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, UUID> {
    List<Certification> findByCandidateProfileId(UUID candidateProfileId);
    void deleteByCandidateProfileId(UUID candidateProfileId);
}
