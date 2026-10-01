package com.aiats.controller;

import com.aiats.dto.application.ApplicationDTO;
import com.aiats.dto.common.ApiResponse;
import com.aiats.security.UserPrincipal;
import com.aiats.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // ─── CANDIDATE ──────────────────────────────────────────────────────────

    @PostMapping("/apply")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ApplicationDTO>> apply(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID jobId = UUID.fromString(body.get("jobId"));
        UUID resumeId = body.containsKey("resumeId") ? UUID.fromString(body.get("resumeId")) : null;
        ApplicationDTO result = applicationService.applyForJob(principal.getId(), jobId, resumeId);
        return ResponseEntity.ok(ApiResponse.success(result, "Application submitted successfully"));
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<ApplicationDTO>>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.getCandidateApplications(principal.getId())));
    }

    // ─── RECRUITER ──────────────────────────────────────────────────────────

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<ApplicationDTO>>> getRecruiterApplications(
            @RequestParam(required = false) UUID jobId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer minScore,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.getRecruiterApplications(principal.getId(), jobId, status, minScore, search)));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<ApplicationDTO>>> getJobApplications(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.getJobApplications(principal.getId(), jobId)));
    }

    @PatchMapping("/{applicationId}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<ApplicationDTO>> updateStatus(
            @PathVariable UUID applicationId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        String newStatus = body.get("status");
        String note = body.get("note");
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.updateStatus(principal.getId(), applicationId, newStatus, note),
                "Status updated successfully"));
    }

    @PostMapping("/{applicationId}/notes")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<ApplicationDTO>> addNote(
            @PathVariable UUID applicationId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.addNote(principal.getId(), applicationId, body.get("note")),
                "Note added"));
    }

    @PatchMapping("/{applicationId}/ats-score")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<ApplicationDTO>> updateAtsScore(
            @PathVariable UUID applicationId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        int score = ((Number) body.get("atsScore")).intValue();
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.updateAtsScore(principal.getId(), applicationId, score),
                "ATS score updated"));
    }

    @DeleteMapping("/{applicationId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<Void>> deleteApplication(
            @PathVariable UUID applicationId,
            @AuthenticationPrincipal UserPrincipal principal) {
        applicationService.deleteApplication(principal.getId(), applicationId);
        return ResponseEntity.ok(ApiResponse.success(null, "Application removed from pipeline"));
    }
}
