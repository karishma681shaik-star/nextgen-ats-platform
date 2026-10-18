package com.aiats.service;

import com.aiats.entity.Job;
import com.aiats.entity.JobStatus;
import com.aiats.entity.Role;
import com.aiats.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;

@Service
public class JobDeadlineService {

    private static final Logger logger = LoggerFactory.getLogger(JobDeadlineService.class);

    private final JobRepository jobRepository;
    private final ActivityLogService activityLogService;

    @Value("${app.timezone:}")
    private String configuredTimezone;

    public JobDeadlineService(JobRepository jobRepository, ActivityLogService activityLogService) {
        this.jobRepository = jobRepository;
        this.activityLogService = activityLogService;
    }

    /**
     * Resolves the configured zone ID, with fallback to system default.
     */
    public ZoneId getAppZoneId() {
        if (configuredTimezone != null && !configuredTimezone.isBlank()) {
            try {
                return ZoneId.of(configuredTimezone.trim());
            } catch (Exception e) {
                logger.warn("Invalid timezone '{}' configured, falling back to system default.", configuredTimezone);
            }
        }
        return ZoneId.systemDefault();
    }

    /**
     * Determines whether the given deadline string represents a time that has already passed.
     * A date without time (e.g., 2026-10-17 or Oct 17, 2026) expires at the END of that day (23:59:59.999)
     * in the application's configured timezone.
     */
    public boolean isDeadlinePassed(String deadlineStr) {
        if (deadlineStr == null || deadlineStr.trim().isEmpty()) {
            return false; // No deadline specified; does not expire automatically
        }
        String d = deadlineStr.trim();
        Instant now = Instant.now();
        ZoneId zoneId = getAppZoneId();

        // 1. Try ISO Date (yyyy-MM-dd)
        try {
            LocalDate date = LocalDate.parse(d, DateTimeFormatter.ISO_LOCAL_DATE);
            Instant endOfDay = date.atTime(LocalTime.MAX).atZone(zoneId).toInstant();
            return now.isAfter(endOfDay);
        } catch (DateTimeParseException ignored) {}

        // 2. Try English format (e.g. Oct 17, 2026)
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH);
            LocalDate date = LocalDate.parse(d, formatter);
            Instant endOfDay = date.atTime(LocalTime.MAX).atZone(zoneId).toInstant();
            return now.isAfter(endOfDay);
        } catch (DateTimeParseException ignored) {}

        // 3. Try English long format (e.g. October 17, 2026)
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.ENGLISH);
            LocalDate date = LocalDate.parse(d, formatter);
            Instant endOfDay = date.atTime(LocalTime.MAX).atZone(zoneId).toInstant();
            return now.isAfter(endOfDay);
        } catch (DateTimeParseException ignored) {}

        // 4. Try slash format (e.g. MM/dd/yyyy or yyyy/MM/dd)
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy", Locale.ENGLISH);
            LocalDate date = LocalDate.parse(d, formatter);
            Instant endOfDay = date.atTime(LocalTime.MAX).atZone(zoneId).toInstant();
            return now.isAfter(endOfDay);
        } catch (DateTimeParseException ignored) {}

        // 5. Try ISO Instant/DateTime (e.g. 2026-10-17T23:59:59Z)
        try {
            Instant instant = Instant.parse(d);
            return now.isAfter(instant);
        } catch (DateTimeParseException ignored) {}

        return false;
    }

    /**
     * Scheduled job running every 60 seconds to automatically close active jobs
     * whose deadline has passed.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void closeExpiredActiveJobs() {
        List<Job> activeJobs = jobRepository.findByStatus(JobStatus.ACTIVE);
        if (activeJobs == null || activeJobs.isEmpty()) {
            return;
        }

        Instant now = Instant.now();
        int closedCount = 0;

        for (Job job : activeJobs) {
            if (isDeadlinePassed(job.getDeadline())) {
                job.setStatus(JobStatus.CLOSED);
                job.setClosedReason("DEADLINE_EXPIRED");
                job.setClosedAt(now);
                jobRepository.save(job);
                closedCount++;

                logger.info("Automatically closed expired job [ID: {}, Title: '{}', Deadline: '{}']",
                        job.getId(), job.getTitle(), job.getDeadline());

                if (activityLogService != null) {
                    activityLogService.logDetailedActivity(
                            null,
                            "System Deadline Enforcer",
                            Role.ADMIN,
                            "AUTOMATIC_JOB_EXPIRATION",
                            "JOB_LIFECYCLE",
                            "SYSTEM",
                            "INFO",
                            "SUCCESS",
                            job.getTitle(),
                            "JOB",
                            job.getId().toString(),
                            "ACTIVE",
                            "CLOSED",
                            "Automatic closure: application deadline passed (" + job.getDeadline() + ")",
                            "127.0.0.1",
                            null
                    );
                }
            }
        }

        if (closedCount > 0) {
            logger.info("Deadline Scheduler: Successfully closed {} expired active job(s).", closedCount);
        }
    }
}
