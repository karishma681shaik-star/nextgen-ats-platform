package com.aiats.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe in-memory login rate limiter / brute-force protection
 * for sensitive authentication terminals including Admin Login.
 */
@Component
public class LoginRateLimiter {

    private static final Logger logger = LoggerFactory.getLogger(LoginRateLimiter.class);

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

    private static class AttemptRecord {
        int failedAttempts;
        Instant firstFailedAt;
        Instant lockedUntil;

        AttemptRecord() {
            this.failedAttempts = 1;
            this.firstFailedAt = Instant.now();
            this.lockedUntil = null;
        }
    }

    private final Map<String, AttemptRecord> attemptsMap = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        cleanExpiredEntries();
        AttemptRecord record = attemptsMap.get(key);
        if (record == null) {
            return false;
        }
        if (record.lockedUntil != null && Instant.now().isBefore(record.lockedUntil)) {
            logger.warn("SECURITY AUDIT: Throttled attempt for key [{}]. Lockout expires at [{}]", key, record.lockedUntil);
            return true;
        }
        return false;
    }

    public void recordFailedAttempt(String key) {
        cleanExpiredEntries();
        attemptsMap.compute(key, (k, record) -> {
            Instant now = Instant.now();
            if (record == null) {
                return new AttemptRecord();
            }
            // If previous lockout expired, reset
            if (record.lockedUntil != null && now.isAfter(record.lockedUntil)) {
                return new AttemptRecord();
            }
            record.failedAttempts++;
            if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
                record.lockedUntil = now.plusMillis(LOCKOUT_DURATION_MS);
                logger.warn("SECURITY AUDIT: Threshold reached ({} attempts). Key [{}] is now locked out for 5 minutes.",
                        record.failedAttempts, key);
            }
            return record;
        });
    }

    public void recordSuccess(String key) {
        attemptsMap.remove(key);
    }

    private void cleanExpiredEntries() {
        if (attemptsMap.size() > 500) {
            Instant now = Instant.now();
            attemptsMap.entrySet().removeIf(entry -> {
                AttemptRecord rec = entry.getValue();
                if (rec.lockedUntil != null && now.isAfter(rec.lockedUntil)) {
                    return true;
                }
                return rec.firstFailedAt.plusMillis(LOCKOUT_DURATION_MS).isBefore(now);
            });
        }
    }
}
