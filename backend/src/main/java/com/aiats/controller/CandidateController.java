package com.aiats.controller;

import com.aiats.dto.candidate.CandidateAnalyticsDTO;
import com.aiats.dto.candidate.CandidateDashboardDTO;
import com.aiats.dto.candidate.CandidateProfileDTO;
import com.aiats.dto.candidate.CandidateProfileRequest;
import com.aiats.dto.common.ApiResponse;
import com.aiats.security.UserPrincipal;
import com.aiats.service.CandidateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/candidate")
public class CandidateController {

    private final CandidateService candidateService;
    private final com.aiats.service.CandidateReportService candidateReportService;

    public CandidateController(CandidateService candidateService,
                               com.aiats.service.CandidateReportService candidateReportService) {
        this.candidateService = candidateService;
        this.candidateReportService = candidateReportService;
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<CandidateAnalyticsDTO>> getAnalytics(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(candidateService.getAnalytics(principal.getId())));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<CandidateDashboardDTO>> getDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        CandidateDashboardDTO dashboard = candidateService.getCandidateDashboard(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<CandidateProfileDTO>> getMyProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        CandidateProfileDTO profile = candidateService.getProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<CandidateProfileDTO>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody CandidateProfileRequest request) {
        CandidateProfileDTO updated = candidateService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Profile updated successfully"));
    }

    // Admin/Recruiter endpoint to view any candidate
    @GetMapping("/{userId}/profile")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<CandidateProfileDTO>> getCandidateProfile(
            @PathVariable UUID userId) {
        CandidateProfileDTO profile = candidateService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PostMapping("/reports")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<com.aiats.dto.candidate.CandidateReportDTO>> submitReport(
            @jakarta.validation.Valid @RequestBody com.aiats.dto.candidate.CandidateReportRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        com.aiats.dto.candidate.CandidateReportDTO report = candidateReportService.submitReport(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(report, "Thank you for submitting your safety report. Our moderation team has been notified."));
    }
}
