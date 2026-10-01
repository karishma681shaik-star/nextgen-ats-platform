package com.aiats.controller;

import com.aiats.dto.common.ApiResponse;
import com.aiats.dto.issue.IssueReportResponseDTO;
import com.aiats.security.UserPrincipal;
import com.aiats.service.IssueReportService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueReportController {

    private final IssueReportService issueReportService;

    public IssueReportController(IssueReportService issueReportService) {
        this.issueReportService = issueReportService;
    }

    @PostMapping(value = "/report", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<IssueReportResponseDTO>> reportIssue(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("issueType") String issueType,
            @RequestParam("description") String description,
            @RequestParam(value = "attachments", required = false) List<MultipartFile> attachments) {

        IssueReportResponseDTO response = issueReportService.submitReport(
                principal,
                issueType,
                description,
                attachments
        );

        return ResponseEntity.ok(ApiResponse.ok("Issue report submitted successfully", response));
    }
}
