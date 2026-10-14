package com.aiats.service;

import com.aiats.entity.Role;
import com.aiats.entity.SystemActivityLog;
import com.aiats.repository.SystemActivityLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class ActivityLogService {

    private static final Logger logger = LoggerFactory.getLogger(ActivityLogService.class);
    private final SystemActivityLogRepository logRepository;

    public ActivityLogService(SystemActivityLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logActivity(UUID actorId, String actorName, Role actorRole,
                            String action, String target, String ipAddress) {
        try {
            SystemActivityLog log = new SystemActivityLog();
            log.setActorId(actorId);
            log.setActorName(actorName != null ? actorName : "System");
            log.setActorRole(actorRole != null ? actorRole : Role.CANDIDATE);
            log.setAction(action);
            log.setTarget(target != null ? target : "Platform");
            log.setIpAddress(ipAddress != null ? ipAddress : "127.0.0.1");
            log.setTimestamp(Instant.now());
            log.inferMetadata();
            logRepository.save(log);
            logger.debug("Logged system activity: [{} - {} - {}]", action, actorName, target);
        } catch (Exception ex) {
            logger.error("Failed to persist system activity log: {}", ex.getMessage());
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logDetailedActivity(UUID actorId, String actorName, Role actorRole,
                                    String action, String eventType, String eventCategory,
                                    String severity, String result,
                                    String target, String targetType, String targetId,
                                    String previousState, String newState, String reason,
                                    String ipAddress, String correlationId) {
        try {
            SystemActivityLog log = new SystemActivityLog();
            log.setActorId(actorId);
            log.setActorName(actorName != null ? actorName : "System");
            log.setActorRole(actorRole != null ? actorRole : Role.CANDIDATE);
            log.setAction(action);
            log.setEventType(eventType);
            log.setEventCategory(eventCategory);
            log.setSeverity(severity);
            log.setResult(result);
            log.setTarget(target != null ? target : "Platform");
            log.setTargetType(targetType);
            log.setTargetId(targetId);
            log.setPreviousState(previousState);
            log.setNewState(newState);
            log.setReason(reason);
            log.setIpAddress(ipAddress != null ? ipAddress : "127.0.0.1");
            log.setCorrelationId(correlationId);
            log.setTimestamp(Instant.now());
            log.inferMetadata();
            logRepository.save(log);
            logger.debug("Logged detailed system activity: [{} - {} - {} (result: {})]", action, actorName, target, result);
        } catch (Exception ex) {
            logger.error("Failed to persist detailed system activity log: {}", ex.getMessage());
        }
    }
}
