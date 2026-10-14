package com.aiats.controller;

import com.aiats.dto.admin.ReviewAlertRequest;
import com.aiats.dto.admin.SecurityAlertDTO;
import com.aiats.dto.common.ApiResponse;
import com.aiats.security.UserPrincipal;
import com.aiats.service.SecurityAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/security-alerts")
@PreAuthorize("hasRole('ADMIN')")
public class SecurityAlertController {

    private final SecurityAlertService securityAlertService;

    public SecurityAlertController(SecurityAlertService securityAlertService) {
        this.securityAlertService = securityAlertService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SecurityAlertDTO>>> getAlerts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String search) {
        List<SecurityAlertDTO> alerts = securityAlertService.getAlerts(status, riskLevel, search);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "pendingCount", securityAlertService.getPendingAlertsCount(),
                "totalCount", securityAlertService.getTotalAlertsCount(),
                "highRiskCount", securityAlertService.getHighRiskCount()
        )));
    }

    @GetMapping("/{alertId}")
    public ResponseEntity<ApiResponse<SecurityAlertDTO>> getAlertById(@PathVariable UUID alertId) {
        return ResponseEntity.ok(ApiResponse.success(securityAlertService.getAlertById(alertId)));
    }

    @PatchMapping("/{alertId}/review")
    public ResponseEntity<ApiResponse<SecurityAlertDTO>> reviewAlert(
            @PathVariable UUID alertId,
            @RequestBody ReviewAlertRequest body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        SecurityAlertDTO updated = securityAlertService.reviewAlert(adminPrincipal, alertId, body);
        return ResponseEntity.ok(ApiResponse.success(updated, "Security alert review recorded successfully"));
    }
}
