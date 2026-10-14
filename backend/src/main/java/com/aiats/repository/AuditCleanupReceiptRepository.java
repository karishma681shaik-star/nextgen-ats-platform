package com.aiats.repository;

import com.aiats.entity.AuditCleanupReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditCleanupReceiptRepository extends JpaRepository<AuditCleanupReceipt, UUID> {
    List<AuditCleanupReceipt> findAllByOrderByCompletedAtDesc();
    List<AuditCleanupReceipt> findTop20ByOrderByCompletedAtDesc();
}
