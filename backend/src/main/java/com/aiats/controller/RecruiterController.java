package com.aiats.controller;

import com.aiats.dto.common.ApiResponse;
import com.aiats.dto.recruiter.CompanyDTO;
import com.aiats.dto.recruiter.RecruiterAnalyticsDTO;
import com.aiats.dto.recruiter.RecruiterStatsDTO;
import com.aiats.security.UserPrincipal;
import com.aiats.service.RecruiterService;
import com.aiats.dto.recruiter.RecruiterVerificationDetailDTO;
import com.aiats.dto.recruiter.VerificationResubmitRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recruiter")
@PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
public class RecruiterController {

    private final RecruiterService recruiterService;

    public RecruiterController(RecruiterService recruiterService) {
        this.recruiterService = recruiterService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<RecruiterStatsDTO>> getStats(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(recruiterService.getStats(principal.getId())));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<RecruiterAnalyticsDTO>> getAnalytics(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(recruiterService.getAnalytics(principal.getId())));
    }

    @GetMapping("/company")
    public ResponseEntity<ApiResponse<CompanyDTO>> getCompany(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(recruiterService.getCompanyProfile(principal.getId())));
    }

    @PutMapping("/company")
    public ResponseEntity<ApiResponse<CompanyDTO>> updateCompany(
            @RequestBody CompanyDTO request,
            @AuthenticationPrincipal UserPrincipal principal) {
        CompanyDTO updated = recruiterService.updateCompanyProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Company profile updated"));
    }

    @GetMapping("/verification")
    public ResponseEntity<ApiResponse<RecruiterVerificationDetailDTO>> getVerificationDetail(
            @AuthenticationPrincipal UserPrincipal principal) {
        RecruiterVerificationDetailDTO detail = recruiterService.getRecruiterVerificationDetail(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @PostMapping("/verification/resubmit")
    public ResponseEntity<ApiResponse<RecruiterVerificationDetailDTO>> resubmitVerification(
            @RequestBody(required = false) VerificationResubmitRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        RecruiterVerificationDetailDTO updated = recruiterService.resubmitVerification(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Verification application resubmitted successfully for review"));
    }
}
