package com.aiats.repository;

import com.aiats.entity.SystemActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SystemActivityLogRepository extends JpaRepository<SystemActivityLog, UUID> {
    List<SystemActivityLog> findTop50ByOrderByTimestampDesc();
}
