package com.aiats.controller;

import com.aiats.dto.common.ApiResponse;
import com.aiats.dto.job.JobDTO;
import com.aiats.dto.job.JobRequest;
import com.aiats.security.UserPrincipal;
import com.aiats.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    // ─── PUBLIC ENDPOINTS ────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobDTO>>> getJobs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String level,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID viewerId = principal != null ? principal.getId() : null;
        List<JobDTO> jobs = jobService.getPublicJobs(search, location, type, level, viewerId);
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<ApiResponse<JobDTO>> getJobById(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID viewerId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(ApiResponse.success(jobService.getJobById(jobId, viewerId)));
    }

    // ─── CANDIDATE ENDPOINTS ─────────────────────────────────────────────────

    @PostMapping("/{jobId}/save")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleSave(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isSaved = jobService.toggleSaveJob(principal.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("saved", isSaved)));
    }

    @GetMapping("/saved")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<JobDTO>>> getSavedJobs(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getSavedJobs(principal.getId())));
    }

    // ─── RECRUITER ENDPOINTS ──────────────────────────────────────────────────

    @GetMapping("/my-jobs")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<JobDTO>>> getMyJobs(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getRecruiterJobs(principal.getId())));
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<JobDTO>> createJob(
            @Valid @RequestBody JobRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        JobDTO created = jobService.createJob(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(created, "Job posted successfully"));
    }

    @PutMapping("/{jobId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<JobDTO>> updateJob(
            @PathVariable UUID jobId,
            @Valid @RequestBody JobRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        JobDTO updated = jobService.updateJob(principal.getId(), jobId, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Job updated successfully"));
    }

    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserPrincipal principal) {
        jobService.deleteJob(principal.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success(null, "Job deleted successfully"));
    }
}
