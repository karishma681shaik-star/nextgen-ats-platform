package com.aiats.dto.auth;

import com.aiats.entity.User;

public class UserDTO {
    private String id;
    private String name;
    private String email;
    private String role;
    private String avatar;
    private String status;
    private String createdAt;
    private String phone;
    private String companyName;
    private String title;
    private String verificationStatus;
    private String verifiedAt;
    private String verifiedBy;
    private String rejectionReason;

    public UserDTO() {}

    public UserDTO(User user) {
        this.id = user.getId().toString();
        this.name = user.getFullName();
        this.email = user.getEmail();
        this.role = user.getRole().toFrontendRole();
        this.avatar = user.getAvatarUrl();
        this.status = user.getStatus().toFrontendStatus();
        this.createdAt = user.getCreatedAt().toString();
        this.phone = user.getPhone();
        this.companyName = user.getCompanyName();
        this.title = user.getTitle();
        if (user.getVerificationStatus() != null) {
            this.verificationStatus = user.getVerificationStatus().toFrontendStatus();
        }
        if (user.getVerifiedAt() != null) {
            this.verifiedAt = user.getVerifiedAt().toString();
        }
        this.verifiedBy = user.getVerifiedBy();
        this.rejectionReason = user.getRejectionReason();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(String verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public String getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
