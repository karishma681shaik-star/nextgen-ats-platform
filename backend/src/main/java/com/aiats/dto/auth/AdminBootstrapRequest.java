package com.aiats.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AdminBootstrapRequest {

    @NotBlank(message = "Administrator name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Administrator email is required")
    @Email(message = "Please provide a valid administrator email address")
    private String email;

    @NotBlank(message = "Administrator password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank(message = "Bootstrap authorization token is required")
    private String bootstrapToken;

    public AdminBootstrapRequest() {}

    public AdminBootstrapRequest(String fullName, String email, String password, String bootstrapToken) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.bootstrapToken = bootstrapToken;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getBootstrapToken() {
        return bootstrapToken;
    }

    public void setBootstrapToken(String bootstrapToken) {
        this.bootstrapToken = bootstrapToken;
    }
}
