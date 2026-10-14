package com.aiats.controller;

import com.aiats.dto.admin.AdminStatsDTO;
import com.aiats.dto.admin.RecruiterVerificationDTO;
import com.aiats.dto.admin.RecruitmentAnalyticsDTO;
import com.aiats.dto.admin.SystemActivityLogDTO;
import com.aiats.dto.admin.AiSuggestionDTO;
import com.aiats.dto.admin.AuditCleanupExecutionRequest;
import com.aiats.dto.admin.AuditCleanupPreviewDTO;
import com.aiats.dto.admin.AuditCleanupPreviewRequest;
import com.aiats.dto.admin.AuditCleanupReceiptDTO;
import com.aiats.dto.admin.VerificationDecisionRequest;
import com.aiats.dto.admin.VerificationHistoryDTO;
import com.aiats.dto.job.JobDTO;
import com.aiats.dto.admin.JobModerationDecisionRequest;
import com.aiats.dto.admin.RecruiterPerformanceDTO;
import com.aiats.dto.admin.CandidatePerformanceDTO;
import com.aiats.dto.admin.PlatformHealthResponseDTO;
import com.aiats.dto.auth.UserDTO;
import com.aiats.dto.common.ApiResponse;
import com.aiats.security.UserPrincipal;
import com.aiats.service.AdminService;
import com.aiats.dto.candidate.CandidateReportDTO;
import com.aiats.dto.admin.CandidateReportReviewRequest;
import com.aiats.service.CandidateReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final CandidateReportService candidateReportService;

    public AdminController(AdminService adminService, CandidateReportService candidateReportService) {
        this.adminService = adminService;
        this.candidateReportService = candidateReportService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDTO>> getStats(
            @RequestParam(required = false, defaultValue = "ALL") String period) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStats(period)));
    }

    @GetMapping("/analytics/health")
    public ResponseEntity<ApiResponse<PlatformHealthResponseDTO>> getPlatformHealth() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getPlatformHealth()));
    }

    @GetMapping("/analytics/recent-activity")
    public ResponseEntity<ApiResponse<List<SystemActivityLogDTO>>> getRecentActivity(
            @RequestParam(required = false, defaultValue = "15") int limit) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getRecentActivityLogs(limit)));
    }

    @GetMapping("/analytics/recruitment")
    public ResponseEntity<ApiResponse<RecruitmentAnalyticsDTO>> getRecruitmentAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getRecruitmentAnalytics()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers(role, status, search)));
    }

    @GetMapping("/recruiters")
    public ResponseEntity<ApiResponse<List<RecruiterVerificationDTO>>> getRecruiterVerificationQueue(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getRecruiterVerificationQueue(status)));
    }

    @PostMapping("/recruiters/{recruiterId}/approve")
    public ResponseEntity<ApiResponse<RecruiterVerificationDTO>> approveRecruiter(
            @PathVariable UUID recruiterId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Administrator";
        RecruiterVerificationDTO approved = adminService.approveRecruiter(recruiterId, adminName);
        return ResponseEntity.ok(ApiResponse.success(approved, "Recruiter verified successfully"));
    }

    @PostMapping("/recruiters/{recruiterId}/reject")
    public ResponseEntity<ApiResponse<RecruiterVerificationDTO>> rejectRecruiter(
            @PathVariable UUID recruiterId,
            @RequestBody(required = false) VerificationDecisionRequest body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Administrator";
        RecruiterVerificationDTO rejected = adminService.rejectRecruiter(recruiterId, body, adminName);
        return ResponseEntity.ok(ApiResponse.success(rejected, "Recruiter verification declined"));
    }

    @PostMapping("/recruiters/{recruiterId}/ai-suggestions")
    public ResponseEntity<ApiResponse<List<AiSuggestionDTO>>> generateAiSuggestions(
            @PathVariable UUID recruiterId,
            @RequestBody(required = false) VerificationDecisionRequest body) {
        String category = body != null ? body.getCategory() : null;
        String reason = body != null ? body.getReason() : null;
        List<AiSuggestionDTO> suggestions = adminService.generateImprovementSuggestions(recruiterId, category, reason);
        return ResponseEntity.ok(ApiResponse.success(suggestions, "Improvement suggestions generated"));
    }

    @GetMapping("/recruiters/{recruiterId}/history")
    public ResponseEntity<ApiResponse<List<VerificationHistoryDTO>>> getRecruiterVerificationHistory(
            @PathVariable UUID recruiterId) {
        List<VerificationHistoryDTO> history = adminService.getVerificationHistory(recruiterId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @PostMapping("/recruiters/{recruiterId}/suspend")
    public ResponseEntity<ApiResponse<RecruiterVerificationDTO>> suspendRecruiter(
            @PathVariable UUID recruiterId,
            @RequestBody(required = false) VerificationDecisionRequest body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Administrator";
        String reason = body != null ? body.getReason() : null;
        RecruiterVerificationDTO suspended = adminService.suspendRecruiter(recruiterId, reason, adminName);
        return ResponseEntity.ok(ApiResponse.success(suspended, "Recruiter account suspended"));
    }

    @PostMapping("/recruiters/{recruiterId}/reactivate")
    public ResponseEntity<ApiResponse<RecruiterVerificationDTO>> reactivateRecruiter(
            @PathVariable UUID recruiterId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Administrator";
        RecruiterVerificationDTO reactivated = adminService.reactivateRecruiter(recruiterId, adminName);
        return ResponseEntity.ok(ApiResponse.success(reactivated, "Recruiter account reactivated successfully"));
    }

    @PostMapping("/recruiters/{recruiterId}/request-evidence")
    public ResponseEntity<ApiResponse<RecruiterVerificationDTO>> requestAdditionalEvidence(
            @PathVariable UUID recruiterId,
            @RequestBody(required = false) VerificationDecisionRequest body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Administrator";
        RecruiterVerificationDTO updated = adminService.requestAdditionalEvidence(recruiterId, body, adminName);
        return ResponseEntity.ok(ApiResponse.success(updated, "Additional evidence requested from recruiter"));
    }

    @PostMapping("/recruiters/{recruiterId}/reopen")
    public ResponseEntity<ApiResponse<RecruiterVerificationDTO>> reopenVerification(
            @PathVariable UUID recruiterId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Administrator";
        RecruiterVerificationDTO reopened = adminService.reopenVerification(recruiterId, adminName);
        return ResponseEntity.ok(ApiResponse.success(reopened, "Recruiter verification reopened for investigation"));
    }

    @PatchMapping("/recruiters/{recruiterId}/company-checks")
    public ResponseEntity<ApiResponse<RecruiterVerificationDTO>> updateCompanyChecks(
            @PathVariable UUID recruiterId,
            @RequestBody Map<String, Object> checks,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Administrator";
        RecruiterVerificationDTO updated = adminService.updateCompanyChecks(recruiterId, checks, adminName);
        return ResponseEntity.ok(ApiResponse.success(updated, "Company verification checks updated successfully"));
    }

    @DeleteMapping("/recruiters/{recruiterId}")
    public ResponseEntity<ApiResponse<Void>> deleteRejectedRecruiter(
            @PathVariable UUID recruiterId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Administrator";
        adminService.deleteRejectedRecruiter(recruiterId, adminName);
        return ResponseEntity.ok(ApiResponse.success(null, "Rejected recruiter application permanently deleted from verification queue"));
    }

    @GetMapping("/activity")
    public ResponseEntity<ApiResponse<List<SystemActivityLogDTO>>> getActivityLogs() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getActivityLogs()));
    }

    @GetMapping("/audit-events")
    public ResponseEntity<ApiResponse<com.aiats.dto.admin.AuditPageResult<SystemActivityLogDTO>>> getAuditEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String result,
            @RequestParam(required = false) String actorRole,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Instant start = null;
        if (startDate != null && !startDate.isBlank()) {
            try { start = Instant.parse(startDate); } catch (Exception ignored) {}
        }

        Instant end = null;
        if (endDate != null && !endDate.isBlank()) {
            try { end = Instant.parse(endDate); } catch (Exception ignored) {}
        }

        var resultPage = adminService.getPageAuditEvents(
                search, category, severity, result, actorRole, start, end, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(resultPage));
    }

    @GetMapping("/audit-events/{eventId}")
    public ResponseEntity<ApiResponse<SystemActivityLogDTO>> getAuditEventById(
            @PathVariable UUID eventId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAuditEventById(eventId)));
    }

    @GetMapping("/audit-events/summary")
    public ResponseEntity<ApiResponse<com.aiats.dto.admin.AuditSummaryDTO>> getAuditSummary(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String result,
            @RequestParam(required = false) String actorRole,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String timezone) {

        Instant start = null;
        if (startDate != null && !startDate.isBlank()) {
            try { start = Instant.parse(startDate); } catch (Exception ignored) {}
        }

        Instant end = null;
        if (endDate != null && !endDate.isBlank()) {
            try { end = Instant.parse(endDate); } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(ApiResponse.success(
                adminService.getAuditSummary(search, category, severity, result, actorRole, start, end, timezone)));
    }

    @GetMapping("/audit-events/{eventId}/related")
    public ResponseEntity<ApiResponse<List<SystemActivityLogDTO>>> getRelatedAuditEvents(
            @PathVariable UUID eventId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getRelatedAuditEvents(eventId)));
    }

    @GetMapping("/audit-events/export")
    public ResponseEntity<byte[]> exportAuditEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String result,
            @RequestParam(required = false) String actorRole,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @AuthenticationPrincipal UserPrincipal adminPrincipal,
            HttpServletRequest request) {

        Instant start = null;
        if (startDate != null && !startDate.isBlank()) {
            try { start = Instant.parse(startDate); } catch (Exception ignored) {}
        }

        Instant end = null;
        if (endDate != null && !endDate.isBlank()) {
            try { end = Instant.parse(endDate); } catch (Exception ignored) {}
        }

        UUID adminId = adminPrincipal != null ? adminPrincipal.getId() : null;
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Administrator";
        String ipAddress = request != null ? request.getRemoteAddr() : "127.0.0.1";

        String csvData = adminService.exportAuditEventsCsv(
                search, category, severity, result, actorRole, start, end, adminId, adminName, ipAddress);

        byte[] csvBytes = csvData.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"audit-events-report.csv\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csvBytes);
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<UserDTO>> updateUserStatus(
            @PathVariable UUID userId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal adminPrincipal,
            HttpServletRequest request) {
        UUID adminId = adminPrincipal != null ? adminPrincipal.getId() : null;
        String adminIdentifier = adminPrincipal != null ? adminPrincipal.getFullName() : null;
        String ipAddress = request != null ? request.getRemoteAddr() : null;
        UserDTO updated = adminService.updateUserStatus(userId, body.get("status"), adminId, adminIdentifier, ipAddress);
        return ResponseEntity.ok(ApiResponse.success(updated, "User status updated"));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal,
            HttpServletRequest request) {
        String adminIdentifier = adminPrincipal != null ? adminPrincipal.getFullName() : "Administrator";
        String ipAddress = request != null ? request.getRemoteAddr() : null;
        adminService.deleteUser(userId, adminPrincipal, adminIdentifier, ipAddress);
        return ResponseEntity.ok(ApiResponse.success(null, "Account permanently deleted successfully."));
    }

    @PostMapping("/audit/cleanup/preview")
    public ResponseEntity<ApiResponse<AuditCleanupPreviewDTO>> previewAuditCleanup(
            @RequestBody AuditCleanupPreviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.previewAuditCleanup(request)));
    }

    @PostMapping("/audit/cleanup/execute")
    public ResponseEntity<ApiResponse<AuditCleanupReceiptDTO>> executeAuditCleanup(
            @RequestBody AuditCleanupExecutionRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal,
            HttpServletRequest httpRequest) {

        UUID adminId = adminPrincipal != null ? adminPrincipal.getId() : null;
        String adminEmail = adminPrincipal != null ? adminPrincipal.getUsername() : "admin@ai-ats.internal";
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Administrator";
        String ipAddress = httpRequest != null ? httpRequest.getRemoteAddr() : "127.0.0.1";

        AuditCleanupReceiptDTO receipt = adminService.executeAuditCleanup(
                request, adminId, adminEmail, adminName, ipAddress);

        return ResponseEntity.ok(ApiResponse.success(receipt, "Audit log cleanup completed successfully."));
    }

    @GetMapping("/audit/cleanup/history")
    public ResponseEntity<ApiResponse<List<AuditCleanupReceiptDTO>>> getAuditCleanupHistory() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAuditCleanupHistory()));
    }

    // ─── JOB REQUISITION MODERATION ENDPOINTS ────────────────────────────────

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<List<JobDTO>>> getJobsForModeration(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getJobsForModeration(status, search)));
    }

    @PostMapping("/jobs/{jobId}/approve")
    public ResponseEntity<ApiResponse<JobDTO>> approveJob(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Administrator";
        JobDTO approved = adminService.approveJob(jobId, adminName);
        return ResponseEntity.ok(ApiResponse.success(approved, "Job requisition approved and published successfully."));
    }

    @PostMapping("/jobs/{jobId}/reject")
    public ResponseEntity<ApiResponse<JobDTO>> rejectJob(
            @PathVariable UUID jobId,
            @RequestBody(required = false) JobModerationDecisionRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Administrator";
        String reason = (request != null && request.getReason() != null) ? request.getReason() : "Does not meet platform requisition standards";
        JobDTO rejected = adminService.rejectJob(jobId, reason, adminName);
        return ResponseEntity.ok(ApiResponse.success(rejected, "Job requisition rejected with revision feedback."));
    }

    @PostMapping("/jobs/{jobId}/archive")
    public ResponseEntity<ApiResponse<JobDTO>> archiveJob(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Administrator";
        JobDTO archived = adminService.archiveJob(jobId, adminName);
        return ResponseEntity.ok(ApiResponse.success(archived, "Job requisition unpublished and archived from candidate discovery."));
    }

    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Administrator";
        adminService.deleteJobByAdmin(jobId, adminName);
        return ResponseEntity.ok(ApiResponse.success(null, "Job requisition permanently deleted."));
    }

    // ─── PLATFORM PERFORMANCE ANALYTICS ENDPOINTS ────────────────────────────

    @GetMapping("/analytics/recruiter-performance")
    public ResponseEntity<ApiResponse<List<RecruiterPerformanceDTO>>> getRecruiterPerformance() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getRecruiterPerformanceList()));
    }

    @GetMapping("/analytics/candidate-performance")
    public ResponseEntity<ApiResponse<CandidatePerformanceDTO>> getCandidatePerformance() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getCandidatePerformanceOverview()));
    }

    // ─── CANDIDATE SAFETY REPORTS MODERATION ENDPOINTS ───────────────────────

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<List<CandidateReportDTO>>> getCandidateReports(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(candidateReportService.getReports(status, category, search)));
    }

    @GetMapping("/reports/{reportId}")
    public ResponseEntity<ApiResponse<CandidateReportDTO>> getCandidateReportById(@PathVariable UUID reportId) {
        return ResponseEntity.ok(ApiResponse.success(candidateReportService.getReportById(reportId)));
    }

    @PatchMapping("/reports/{reportId}/review")
    public ResponseEntity<ApiResponse<CandidateReportDTO>> reviewCandidateReport(
            @PathVariable UUID reportId,
            @RequestBody CandidateReportReviewRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        UUID adminId = adminPrincipal != null ? adminPrincipal.getId() : null;
        String adminName = adminPrincipal != null ? adminPrincipal.getFullName() : "Administrator";
        CandidateReportDTO reviewed = candidateReportService.reviewReport(adminId, adminName, reportId, request);
        return ResponseEntity.ok(ApiResponse.success(reviewed, "Candidate report moderated successfully."));
    }
}

