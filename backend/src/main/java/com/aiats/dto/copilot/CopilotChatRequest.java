package com.aiats.dto.copilot;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;

public class CopilotChatRequest {

    @NotBlank(message = "Message cannot be empty")
    @Size(max = 2000, message = "Message must be under 2000 characters")
    private String message;

    private Map<String, String> context;

    public CopilotChatRequest() {}

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Map<String, String> getContext() {
        return context;
    }

    public void setContext(Map<String, String> context) {
        this.context = context;
    }
}
