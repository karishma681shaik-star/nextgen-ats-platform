package com.aiats.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

    private String email;

    private String code;

    private String token;

    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String newPassword;

    public ResetPasswordRequest() {}

    public ResetPasswordRequest(String code, String newPassword) {
        this.code = code;
        this.token = code;
        this.newPassword = newPassword;
    }

    public ResetPasswordRequest(String email, String code, String newPassword) {
        this.email = email;
        this.code = code;
        this.token = code;
        this.newPassword = newPassword;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCode() {
        if (code != null && !code.isBlank()) {
            return code;
        }
        return token;
    }

    public void setCode(String code) {
        this.code = code;
        if (this.token == null) {
            this.token = code;
        }
    }

    public String getToken() {
        if (token != null && !token.isBlank()) {
            return token;
        }
        return code;
    }

    public void setToken(String token) {
        this.token = token;
        if (this.code == null) {
            this.code = token;
        }
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
