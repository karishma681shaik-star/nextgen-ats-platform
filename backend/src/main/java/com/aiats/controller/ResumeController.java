package com.aiats.controller;

import com.aiats.dto.common.ApiResponse;
import com.aiats.dto.resume.ResumeDTO;
import com.aiats.dto.resume.ResumeReadinessDTO;
import com.aiats.security.UserPrincipal;
import com.aiats.service.ResumeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/resumes")
@PreAuthorize("hasRole('CANDIDATE')")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResumeDTO>>> getResumes(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.getResumes(principal.getId())));
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ResumeDTO>> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
        ResumeDTO uploaded = resumeService.uploadResume(principal.getId(), file);
        return ResponseEntity.ok(ApiResponse.success(uploaded, "Resume uploaded successfully"));
    }

    @DeleteMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<Void>> deleteResume(
            @PathVariable UUID resumeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        resumeService.deleteResume(principal.getId(), resumeId);
        return ResponseEntity.ok(ApiResponse.success(null, "Resume deleted"));
    }

    @PatchMapping("/{resumeId}/primary")
    public ResponseEntity<ApiResponse<List<ResumeDTO>>> setPrimary(
            @PathVariable UUID resumeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                resumeService.setPrimary(principal.getId(), resumeId)));
    }

    @PostMapping("/{resumeId}/parse")
    public ResponseEntity<ApiResponse<ResumeDTO>> parseResume(
            @PathVariable UUID resumeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                resumeService.parseResume(principal.getId(), resumeId),
                "Resume parsed successfully"));
    }

    @GetMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<ResumeDTO>> getResume(
            @PathVariable UUID resumeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                resumeService.getResume(principal.getId(), resumeId)));
    }

    @PutMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<ResumeDTO>> updateResume(
            @PathVariable UUID resumeId,
            @RequestBody ResumeDTO dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                resumeService.updateResume(principal.getId(), resumeId, dto),
                "Resume updated successfully"));
    }

    /**
     * GET /api/resumes/{resumeId}/readiness
     * Analyzes the resume content and returns a readiness score (0–100).
     * ready=true means the resume has enough content for meaningful ATS scoring.
     */
    @GetMapping("/{resumeId}/readiness")
    public ResponseEntity<ApiResponse<ResumeReadinessDTO>> checkReadiness(
            @PathVariable UUID resumeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        ResumeReadinessDTO dto = resumeService.checkReadiness(principal.getId(), resumeId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping("/blank")
    public ResponseEntity<ApiResponse<ResumeDTO>> createBlankResume(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                resumeService.createBlankResume(principal.getId()),
                "Blank resume created successfully"));
    }

    /**
     * GET /api/resumes/{resumeId}/recommendations
     * Evaluates resume content and returns ATS analysis with recommendations categorized
     * into PENDING, COMPLETED, and DELETED.
     */
    @GetMapping("/{resumeId}/recommendations")
    public ResponseEntity<ApiResponse<com.aiats.dto.resume.ResumeAtsAnalysisDTO>> getAtsRecommendations(
            @PathVariable UUID resumeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                resumeService.getAtsAnalysis(principal.getId(), resumeId)));
    }

    /**
     * POST /api/resumes/{resumeId}/recommendations/{recommendationId}/dismiss
     * Dismisses a recommendation, moving it to DELETED without altering resume content.
     */
    @PostMapping("/{resumeId}/recommendations/{recommendationId}/dismiss")
    public ResponseEntity<ApiResponse<com.aiats.dto.resume.ResumeAtsAnalysisDTO>> dismissRecommendation(
            @PathVariable UUID resumeId,
            @PathVariable String recommendationId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                resumeService.dismissRecommendation(principal.getId(), resumeId, recommendationId),
                "Recommendation dismissed"));
    }

    /**
     * POST /api/resumes/{resumeId}/recommendations/{recommendationId}/restore
     * Restores a previously dismissed recommendation back to PENDING or COMPLETED based on current resume data.
     */
    @PostMapping("/{resumeId}/recommendations/{recommendationId}/restore")
    public ResponseEntity<ApiResponse<com.aiats.dto.resume.ResumeAtsAnalysisDTO>> restoreRecommendation(
            @PathVariable UUID resumeId,
            @PathVariable String recommendationId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                resumeService.restoreRecommendation(principal.getId(), resumeId, recommendationId),
                "Recommendation restored"));
    }
}
