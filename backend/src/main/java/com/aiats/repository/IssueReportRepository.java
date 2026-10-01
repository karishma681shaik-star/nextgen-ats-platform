package com.aiats.repository;

import com.aiats.entity.IssueReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IssueReportRepository extends JpaRepository<IssueReport, UUID> {
    List<IssueReport> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<IssueReport> findByStatusOrderByCreatedAtDesc(String status);
}
