package com.aiats.repository;

import com.aiats.entity.Application;
import com.aiats.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByCandidateIdOrderByAppliedDateDesc(UUID candidateId);
    List<Application> findByJobIdOrderByAppliedDateDesc(UUID jobId);
    List<Application> findByJobRecruiterIdOrderByAppliedDateDesc(UUID recruiterId);
    Optional<Application> findByCandidateIdAndJobId(UUID candidateId, UUID jobId);
    boolean existsByCandidateIdAndJobId(UUID candidateId, UUID jobId);
    long countByStatus(ApplicationStatus status);
    long countByJobRecruiterId(UUID recruiterId);
    long countByJobRecruiterIdAndStatus(UUID recruiterId, ApplicationStatus status);

    @Query("SELECT a FROM Application a WHERE " +
           "a.job.recruiter.id = :recruiterId AND " +
           "(:jobId IS NULL OR a.job.id = :jobId) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:minAtsScore IS NULL OR a.atsScore >= :minAtsScore) AND " +
           "(:search IS NULL OR LOWER(a.candidate.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.candidate.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.job.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Application> filterApplicants(@Param("recruiterId") UUID recruiterId,
                                       @Param("jobId") UUID jobId,
                                       @Param("status") ApplicationStatus status,
                                       @Param("minAtsScore") Integer minAtsScore,
                                       @Param("search") String search);
}
