package com.aiats.controller;

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

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
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
}
