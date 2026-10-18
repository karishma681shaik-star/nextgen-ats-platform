package com.aiats.service;

import com.aiats.dto.admin.ReviewAlertRequest;
import com.aiats.dto.admin.SecurityAlertDTO;
import com.aiats.entity.Role;
import com.aiats.entity.SecurityAlert;
import com.aiats.entity.User;
import com.aiats.entity.UserStatus;
import com.aiats.exception.ResourceNotFoundException;
import com.aiats.repository.SecurityAlertRepository;
import com.aiats.repository.UserRepository;
import com.aiats.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SecurityAlertService {

    private static final Logger logger = LoggerFactory.getLogger(SecurityAlertService.class);

    private final SecurityAlertRepository securityAlertRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;

    public SecurityAlertService(SecurityAlertRepository securityAlertRepository,
                                UserRepository userRepository,
                                NotificationService notificationService,
                                ActivityLogService activityLogService) {
        this.securityAlertRepository = securityAlertRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.activityLogService = activityLogService;
    }

    @Transactional
    public SecurityAlert createAlert(UUID relatedUserId, String accountEmail, String accountRole,
                                    String riskCategory, String riskLevel, String description,
                                    String recommendedAction) {
        // Prevent flood of duplicate pending alerts for the same email and category
        if (accountEmail != null && securityAlertRepository.existsByAccountEmailAndRiskCategoryAndReviewStatus(
                accountEmail, riskCategory, "PENDING_REVIEW")) {
            logger.info("Security alert already open for {} under category {}. Skipping duplicate.", accountEmail, riskCategory);
            return null;
        }

        SecurityAlert alert = new SecurityAlert(
                relatedUserId,
                accountEmail,
                accountRole,
                riskCategory,
                riskLevel != null ? riskLevel : "MEDIUM",
                description,
                recommendedAction
        );
        SecurityAlert saved = securityAlertRepository.save(alert);
        logger.warn("SECURITY ALERT [{}] logged for {}: {}", riskLevel, accountEmail, description);

        // Notify canonical Administrator
        userRepository.findByRole(Role.ADMIN).stream().findFirst().ifPresent(admin -> {
            String title = "Security Alert: " + riskCategory;
            String message = "[" + riskLevel + " RISK] " + description;
            notificationService.createNotification(admin, title, message, "warning", "/admin/security-alerts");
        });

        return saved;
    }

    @Transactional(readOnly = true)
    public List<SecurityAlertDTO> getAlerts(String status, String riskLevel, String search) {
        String statusParam = (status != null && !status.equalsIgnoreCase("all") && !status.isBlank()) ? status.toUpperCase() : null;
        String levelParam = (riskLevel != null && !riskLevel.equalsIgnoreCase("all") && !riskLevel.isBlank()) ? riskLevel.toUpperCase() : null;
        String searchParam = (search != null && !search.isBlank()) ? search.trim() : null;

        return securityAlertRepository.filterAlerts(statusParam, levelParam, searchParam)
                .stream()
                .map(SecurityAlertDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SecurityAlertDTO getAlertById(UUID alertId) {
        SecurityAlert alert = securityAlertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Security alert not found: " + alertId));
        return new SecurityAlertDTO(alert);
    }

    @Transactional
    public SecurityAlertDTO reviewAlert(UserPrincipal adminPrincipal, UUID alertId, ReviewAlertRequest request) {
        SecurityAlert alert = securityAlertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Security alert not found: " + alertId));

        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Marcus Vance";
        UUID adminId = adminPrincipal != null ? adminPrincipal.getId() : null;

        String newStatus = request.getReviewStatus() != null ? request.getReviewStatus().toUpperCase() : "RESOLVED";
        alert.setReviewStatus(newStatus);
        alert.setAssignedAdmin(adminName);
        alert.setAdminDecision(request.getAdminDecision() != null ? request.getAdminDecision() : newStatus);
        alert.setReviewNotes(request.getReviewNotes());
        alert.setUpdatedAt(Instant.now());

        // Suspend related account if explicitly instructed and authorized
        if (request.isSuspendAccount() && alert.getRelatedUserId() != null) {
            userRepository.findById(alert.getRelatedUserId()).ifPresent(u -> {
                if (u.getRole() != Role.ADMIN) {
                    u.setStatus(UserStatus.SUSPENDED);
                    userRepository.save(u);
                    logger.warn("Account {} suspended during security review of alert {}", u.getEmail(), alertId);
                }
            });
        }

        SecurityAlert saved = securityAlertRepository.save(alert);

        if (activityLogService != null) {
            activityLogService.logActivity(
                    adminId,
                    adminName,
                    Role.ADMIN,
                    "Security Alert Reviewed",
                    alert.getRiskCategory() + " (" + alert.getAccountEmail() + ") -> " + newStatus,
                    null
            );
        }

        return new SecurityAlertDTO(saved);
    }

    @Transactional(readOnly = true)
    public long getPendingAlertsCount() {
        return securityAlertRepository.countByReviewStatus("PENDING_REVIEW");
    }

    @Transactional(readOnly = true)
    public long getTotalAlertsCount() {
        return securityAlertRepository.count();
    }

    @Transactional(readOnly = true)
    public long getHighRiskCount() {
        return securityAlertRepository.countByRiskLevel("HIGH");
    }
}
