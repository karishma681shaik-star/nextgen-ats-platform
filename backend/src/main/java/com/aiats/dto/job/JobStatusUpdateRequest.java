package com.aiats.dto.job;

import jakarta.validation.constraints.NotBlank;

public class JobStatusUpdateRequest {

    @NotBlank(message = "Status is required")
    private String status;

    private String reason;

    public JobStatusUpdateRequest() {}

    public JobStatusUpdateRequest(String status, String reason) {
        this.status = status;
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
