package com.aiats.controller;

import com.aiats.dto.common.ApiResponse;
import com.aiats.dto.resume.JobAnalysisDTO;
import com.aiats.dto.resume.JobOptimizationHistoryDTO;
import com.aiats.dto.resume.ResumeDTO;
import com.aiats.security.UserPrincipal;
import com.aiats.service.JobOptimizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/resumes/{resumeId}/job-optimizations")
@PreAuthorize("hasRole('CANDIDATE')")
public class JobOptimizationController {

    private final JobOptimizationService jobOptimizationService;

    public JobOptimizationController(JobOptimizationService jobOptimizationService) {
        this.jobOptimizationService = jobOptimizationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobAnalysisDTO>>> getAnalyzedJobs(
            @PathVariable UUID resumeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                jobOptimizationService.getAnalyzedJobs(principal.getId(), resumeId)));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<ApiResponse<JobAnalysisDTO>> getOrCalculateAnalysis(
            @PathVariable UUID resumeId,
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                jobOptimizationService.getOrCalculateAnalysis(principal.getId(), resumeId, jobId)));
    }

    @GetMapping("/{jobId}/history")
    public ResponseEntity<ApiResponse<List<JobOptimizationHistoryDTO>>> getOptimizationHistory(
            @PathVariable UUID resumeId,
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                jobOptimizationService.getOptimizationHistory(principal.getId(), resumeId, jobId)));
    }

    @PostMapping("/{jobId}/optimize")
    public ResponseEntity<ApiResponse<JobAnalysisDTO>> applyOptimization(
            @PathVariable UUID resumeId,
            @PathVariable UUID jobId,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                jobOptimizationService.applyOptimization(principal.getId(), resumeId, jobId, request),
                "Optimization applied successfully"));
    }

    @PostMapping("/{jobId}/history/{historyId}/restore")
    public ResponseEntity<ApiResponse<ResumeDTO>> restoreVersion(
            @PathVariable UUID resumeId,
            @PathVariable UUID jobId,
            @PathVariable UUID historyId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                jobOptimizationService.restoreVersion(principal.getId(), resumeId, jobId, historyId),
                "Resume restored to historical version"));
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<ApiResponse<Void>> deleteAnalysis(
            @PathVariable UUID resumeId,
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserPrincipal principal) {
        jobOptimizationService.deleteAnalysis(principal.getId(), resumeId, jobId);
        return ResponseEntity.ok(ApiResponse.success(null, "Analysis deleted"));
    }
}

