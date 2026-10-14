package com.aiats.repository;

import com.aiats.entity.Job;
import com.aiats.entity.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {
    List<Job> findByRecruiterId(UUID recruiterId);
    List<Job> findByRecruiterIdOrderByCreatedAtDesc(UUID recruiterId);
    List<Job> findByStatus(JobStatus status);
    List<Job> findByStatusOrderByCreatedAtDesc(JobStatus status);
    List<Job> findAllByOrderByCreatedAtDesc();
    long countByStatus(JobStatus status);
    long countByRecruiterId(UUID recruiterId);
    long countByRecruiterIdAndStatus(UUID recruiterId, JobStatus status);

    @Query("SELECT COUNT(j) FROM Job j WHERE " +
           "j.status = com.aiats.entity.JobStatus.ACTIVE AND " +
           "j.recruiter.verificationStatus = com.aiats.entity.VerificationStatus.VERIFIED AND " +
           "j.recruiter.status = com.aiats.entity.UserStatus.ACTIVE")
    long countPublicActiveJobs();

    long countByCreatedAtAfter(java.time.Instant date);

    @Query("SELECT j FROM Job j WHERE " +
           "j.status = com.aiats.entity.JobStatus.ACTIVE AND " +
           "j.recruiter.verificationStatus = com.aiats.entity.VerificationStatus.VERIFIED AND " +
           "j.recruiter.status = com.aiats.entity.UserStatus.ACTIVE AND " +
           "(:department IS NULL OR LOWER(j.department) LIKE CONCAT('%', LOWER(CAST(:department AS String)), '%')) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE CONCAT('%', LOWER(CAST(:location AS String)), '%')) AND " +
           "(:type IS NULL OR j.employmentType = :type) AND " +
           "(:level IS NULL OR j.experienceLevel = :level) AND " +
           "(:search IS NULL OR LOWER(j.title) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(j.description) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(j.skills) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(j.company.name) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%')) " +
           "ORDER BY j.createdAt DESC")
    List<Job> filterPublicActiveJobs(@Param("department") String department,
                                     @Param("location") String location,
                                     @Param("type") String type,
                                     @Param("level") String level,
                                     @Param("search") String search);

    @Query("SELECT j FROM Job j WHERE " +
           "j.company.id = :companyId AND " +
           "j.status = com.aiats.entity.JobStatus.ACTIVE AND " +
           "j.recruiter.verificationStatus = com.aiats.entity.VerificationStatus.VERIFIED AND " +
           "j.recruiter.status = com.aiats.entity.UserStatus.ACTIVE " +
           "ORDER BY j.createdAt DESC")
    List<Job> findPublicActiveJobsByCompanyId(@Param("companyId") UUID companyId);

    @Query("SELECT j FROM Job j WHERE " +
           "(:status IS NULL OR j.status = :status) AND " +
           "(:search IS NULL OR LOWER(j.title) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(j.company.name) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(j.recruiter.fullName) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(j.recruiter.email) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%')) " +
           "ORDER BY j.createdAt DESC")
    List<Job> filterModerationJobs(@Param("status") JobStatus status,
                                   @Param("search") String search);

    @Query("SELECT j FROM Job j WHERE " +
           "(:status IS NULL OR j.status = :status) AND " +
           "(:department IS NULL OR LOWER(j.department) LIKE CONCAT('%', LOWER(CAST(:department AS String)), '%')) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE CONCAT('%', LOWER(CAST(:location AS String)), '%')) AND " +
           "(:type IS NULL OR j.employmentType = :type) AND " +
           "(:level IS NULL OR j.experienceLevel = :level) AND " +
           "(:search IS NULL OR LOWER(j.title) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(j.description) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(j.skills) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(j.company.name) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%'))")
    List<Job> filterJobs(@Param("status") JobStatus status,
                         @Param("department") String department,
                         @Param("location") String location,
                         @Param("type") String type,
                         @Param("level") String level,
                         @Param("search") String search);
}
