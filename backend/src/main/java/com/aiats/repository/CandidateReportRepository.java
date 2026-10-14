package com.aiats.repository;

import com.aiats.entity.CandidateReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateReportRepository extends JpaRepository<CandidateReport, UUID> {

    List<CandidateReport> findAllByOrderByCreatedAtDesc();

    List<CandidateReport> findByStatusOrderByCreatedAtDesc(String status);

    List<CandidateReport> findByJobIdOrderByCreatedAtDesc(UUID jobId);

    List<CandidateReport> findByRecruiterIdOrderByCreatedAtDesc(UUID recruiterId);

    long countByStatus(String status);

    long countByJobId(UUID jobId);

    long countByRecruiterId(UUID recruiterId);

    boolean existsByReporterIdAndJobIdAndStatusNot(UUID reporterId, UUID jobId, String status);

    @Query("SELECT r FROM CandidateReport r WHERE " +
           "(cast(:status as string) IS NULL OR UPPER(r.status) = UPPER(cast(:status as string))) AND " +
           "(cast(:category as string) IS NULL OR UPPER(r.category) = UPPER(cast(:category as string))) AND " +
           "(cast(:search as string) IS NULL OR " +
           " (r.jobTitle IS NOT NULL AND LOWER(r.jobTitle) LIKE LOWER(CONCAT('%', cast(:search as string), '%'))) OR " +
           " (r.companyName IS NOT NULL AND LOWER(r.companyName) LIKE LOWER(CONCAT('%', cast(:search as string), '%'))) OR " +
           " (r.recruiterName IS NOT NULL AND LOWER(r.recruiterName) LIKE LOWER(CONCAT('%', cast(:search as string), '%'))) OR " +
           " (r.description IS NOT NULL AND LOWER(r.description) LIKE LOWER(CONCAT('%', cast(:search as string), '%')))) " +
           "ORDER BY r.createdAt DESC")
    List<CandidateReport> filterReports(@Param("status") String status,
                                        @Param("category") String category,
                                        @Param("search") String search);
}
