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
    long countByJobId(UUID jobId);
    long countByStatus(ApplicationStatus status);
    long countByJobRecruiterId(UUID recruiterId);
    long countByJobRecruiterIdAndStatus(UUID recruiterId, ApplicationStatus status);
    long countByCandidateId(UUID candidateId);
    long countByCandidateIdAndStatus(UUID candidateId, ApplicationStatus status);

    @Query("SELECT COUNT(DISTINCT a.candidate.id) FROM Application a WHERE a.status IN (" +
           "com.aiats.entity.ApplicationStatus.APPLIED, " +
           "com.aiats.entity.ApplicationStatus.UNDER_REVIEW, " +
           "com.aiats.entity.ApplicationStatus.SHORTLISTED, " +
           "com.aiats.entity.ApplicationStatus.INTERVIEW, " +
           "com.aiats.entity.ApplicationStatus.OFFERED)")
    long countDistinctCandidatesInActivePipeline();

    @Query("SELECT COUNT(DISTINCT a.candidate.id) FROM Application a")
    long countDistinctCandidatesWithApplications();

    @Query("SELECT COUNT(DISTINCT a.candidate.id) FROM Application a WHERE a.status = :status")
    long countDistinctCandidatesByStatus(@Param("status") ApplicationStatus status);

    long countByAppliedDateAfter(java.time.Instant date);

    @Query("SELECT a FROM Application a WHERE " +
           "a.job.recruiter.id = :recruiterId AND " +
           "(:jobId IS NULL OR a.job.id = :jobId) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:minAtsScore IS NULL OR a.atsScore >= :minAtsScore) AND " +
           "(:search IS NULL OR LOWER(a.candidate.fullName) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(a.candidate.email) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(a.job.title) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%'))")
    List<Application> filterApplicants(@Param("recruiterId") UUID recruiterId,
                                       @Param("jobId") UUID jobId,
                                       @Param("status") ApplicationStatus status,
                                       @Param("minAtsScore") Integer minAtsScore,
                                       @Param("search") String search);
}
