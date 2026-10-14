package com.aiats.repository;

import com.aiats.entity.SystemActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SystemActivityLogRepository extends JpaRepository<SystemActivityLog, UUID>, JpaSpecificationExecutor<SystemActivityLog> {
    List<SystemActivityLog> findTop50ByOrderByTimestampDesc();
    Optional<SystemActivityLog> findTop1ByOrderByTimestampDesc();
    List<SystemActivityLog> findTop20ByTargetIdOrderByTimestampDesc(String targetId);
    List<SystemActivityLog> findTop20ByActorIdOrderByTimestampDesc(UUID actorId);
    List<SystemActivityLog> findTop20ByCorrelationIdOrderByTimestampDesc(String correlationId);

    // Range preview counts
    @Query("SELECT COUNT(l) FROM SystemActivityLog l WHERE l.timestamp >= :start AND l.timestamp <= :end")
    long countByTimestampBetween(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT COUNT(l) FROM SystemActivityLog l WHERE l.timestamp >= :start AND l.timestamp <= :end AND l.severity = 'HIGH'")
    long countProtectedHighSeverityBetween(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT MIN(l.timestamp) FROM SystemActivityLog l WHERE l.timestamp >= :start AND l.timestamp <= :end")
    Instant findMinTimestampBetween(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT MAX(l.timestamp) FROM SystemActivityLog l WHERE l.timestamp >= :start AND l.timestamp <= :end")
    Instant findMaxTimestampBetween(@Param("start") Instant start, @Param("end") Instant end);

    // Targeted range bulk deletions (runs at PostgreSQL engine level, zero heap entity loading)
    @Modifying
    @Query("DELETE FROM SystemActivityLog l WHERE l.timestamp >= :start AND l.timestamp <= :end AND (l.severity IS NULL OR l.severity != 'HIGH')")
    int deleteByTimestampBetweenExcludingHighSeverity(@Param("start") Instant start, @Param("end") Instant end);

    @Modifying
    @Query("DELETE FROM SystemActivityLog l WHERE l.timestamp >= :start AND l.timestamp <= :end")
    int deleteByTimestampBetween(@Param("start") Instant start, @Param("end") Instant end);

    // All-time preview counts & bounds
    @Query("SELECT COUNT(l) FROM SystemActivityLog l WHERE l.severity = 'HIGH'")
    long countAllProtectedHighSeverity();

    @Query("SELECT MIN(l.timestamp) FROM SystemActivityLog l")
    Instant findMinTimestampAll();

    @Query("SELECT MAX(l.timestamp) FROM SystemActivityLog l")
    Instant findMaxTimestampAll();

    // Delete all excluding high severity or older than today
    @Modifying
    @Query("DELETE FROM SystemActivityLog l WHERE l.timestamp < :cutoff AND (l.severity IS NULL OR l.severity != 'HIGH')")
    int deleteAllOlderThanExcludingHighSeverity(@Param("cutoff") Instant cutoff);

    @Modifying
    @Query("DELETE FROM SystemActivityLog l WHERE l.timestamp < :cutoff")
    int deleteAllOlderThan(@Param("cutoff") Instant cutoff);

    @Modifying
    @Query("DELETE FROM SystemActivityLog l WHERE (l.severity IS NULL OR l.severity != 'HIGH')")
    int deleteAllExcludingHighSeverity();
}

