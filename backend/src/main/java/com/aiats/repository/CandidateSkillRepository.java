package com.aiats.repository;

import com.aiats.entity.CandidateSkill;
import com.aiats.entity.SkillType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateSkillRepository extends JpaRepository<CandidateSkill, UUID> {
    List<CandidateSkill> findByCandidateProfileId(UUID candidateProfileId);
    List<CandidateSkill> findByCandidateProfileIdAndSkillType(UUID candidateProfileId, SkillType skillType);
    void deleteByCandidateProfileId(UUID candidateProfileId);
}
