package com.aiats.dto.candidate;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class CandidateReportRequest {

    private UUID jobId;

    @NotBlank(message = "Report category is required")
    private String category; // SUSPECTED_FAKE_RECRUITER, MISLEADING_JOB_DESCRIPTION, COMPANY_IDENTITY_MISMATCH, RECRUITMENT_FEE_DEMAND, SUSPICIOUS_EXTERNAL_LINKS, OTHER

    @NotBlank(message = "Description of the issue is required")
    private String description;

    public CandidateReportRequest() {}

    public CandidateReportRequest(UUID jobId, String category, String description) {
        this.jobId = jobId;
        this.category = category;
        this.description = description;
    }

    public UUID getJobId() { return jobId; }
    public void setJobId(UUID jobId) { this.jobId = jobId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
