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
    List<Job> findByStatus(JobStatus status);
    long countByStatus(JobStatus status);

    @Query("SELECT j FROM Job j WHERE " +
           "(:status IS NULL OR j.status = :status) AND " +
           "(:department IS NULL OR LOWER(j.department) LIKE LOWER(CONCAT('%', :department, '%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:type IS NULL OR j.employmentType = :type) AND " +
           "(:level IS NULL OR j.experienceLevel = :level) AND " +
           "(:search IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(j.skills) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(j.company.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Job> filterJobs(@Param("status") JobStatus status,
                         @Param("department") String department,
                         @Param("location") String location,
                         @Param("type") String type,
                         @Param("level") String level,
                         @Param("search") String search);
}
