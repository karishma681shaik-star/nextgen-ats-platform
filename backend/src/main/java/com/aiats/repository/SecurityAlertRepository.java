package com.aiats.repository;

import com.aiats.entity.SecurityAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SecurityAlertRepository extends JpaRepository<SecurityAlert, UUID> {
    List<SecurityAlert> findAllByOrderByCreatedAtDesc();

    long countByReviewStatus(String reviewStatus);

    long countByRiskLevel(String riskLevel);

    long countByRiskCategory(String riskCategory);

    long countByRiskCategoryContainingIgnoreCase(String categoryPart);

    boolean existsByAccountEmailAndRiskCategoryAndReviewStatus(String email, String category, String reviewStatus);

    long countByCreatedAtAfter(java.time.Instant date);

    @Query("SELECT a FROM SecurityAlert a WHERE " +
           "(:reviewStatus IS NULL OR a.reviewStatus = :reviewStatus) AND " +
           "(:riskLevel IS NULL OR a.riskLevel = :riskLevel) AND " +
           "(:search IS NULL OR LOWER(a.accountEmail) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(a.description) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(a.riskCategory) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%')) " +
           "ORDER BY a.createdAt DESC")
    List<SecurityAlert> filterAlerts(@Param("reviewStatus") String reviewStatus,
                                     @Param("riskLevel") String riskLevel,
                                     @Param("search") String search);
}
