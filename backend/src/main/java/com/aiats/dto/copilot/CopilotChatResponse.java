package com.aiats.dto.copilot;

public class CopilotChatResponse {

    private boolean success;
    private String message;
    private String role;

    public CopilotChatResponse() {}

    public CopilotChatResponse(boolean success, String message, String role) {
        this.success = success;
        this.message = message;
        this.role = role;
    }

    public static CopilotChatResponse ok(String message, String role) {
        return new CopilotChatResponse(true, message, role);
    }

    public static CopilotChatResponse error(String message) {
        return new CopilotChatResponse(false, message, null);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
