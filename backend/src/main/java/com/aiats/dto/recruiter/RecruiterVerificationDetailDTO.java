package com.aiats.dto.recruiter;

import com.aiats.dto.admin.VerificationHistoryDTO;
import java.util.List;

public class RecruiterVerificationDetailDTO {
    private String recruiterId;
    private String recruiterName;
    private String recruiterEmail;
    private String recruiterPhone;
    private String recruiterTitle;
    private String title;
    private String department;
    private String companyName;
    private String professionalProfileUrl;
    private String verificationStatus;
    private boolean verified;
    private String rejectionCategory;
    private String rejectionReason;
    private String correctiveActions;
    private String aiSuggestions;
    private Boolean resubmissionAllowed;
    private String resubmissionNotes;
    private String verifiedAt;
    private String verifiedBy;
    private String resubmittedAt;
    private String createdAt;
    private String updatedAt;
    private String registrationCheckStatus;
    private String associationCheckStatus;
    private Boolean associationVerified;
    private Boolean phoneVerified;
    private Boolean emailVerified;
    private String reviewDate;
    private CompanyDTO company;
    private List<VerificationHistoryDTO> history;

    public RecruiterVerificationDetailDTO() {}

    public String getRecruiterId() { return recruiterId; }
    public void setRecruiterId(String recruiterId) { this.recruiterId = recruiterId; }

    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }

    public String getRecruiterEmail() { return recruiterEmail; }
    public void setRecruiterEmail(String recruiterEmail) { this.recruiterEmail = recruiterEmail; }

    public String getRecruiterPhone() { return recruiterPhone; }
    public void setRecruiterPhone(String recruiterPhone) { this.recruiterPhone = recruiterPhone; }

    public String getRecruiterTitle() { return recruiterTitle; }
    public void setRecruiterTitle(String recruiterTitle) { this.recruiterTitle = recruiterTitle; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getProfessionalProfileUrl() { return professionalProfileUrl; }
    public void setProfessionalProfileUrl(String professionalProfileUrl) { this.professionalProfileUrl = professionalProfileUrl; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public String getRejectionCategory() { return rejectionCategory; }
    public void setRejectionCategory(String rejectionCategory) { this.rejectionCategory = rejectionCategory; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getCorrectiveActions() { return correctiveActions; }
    public void setCorrectiveActions(String correctiveActions) { this.correctiveActions = correctiveActions; }

    public String getAiSuggestions() { return aiSuggestions; }
    public void setAiSuggestions(String aiSuggestions) { this.aiSuggestions = aiSuggestions; }

    public Boolean getResubmissionAllowed() { return resubmissionAllowed != null ? resubmissionAllowed : true; }
    public void setResubmissionAllowed(Boolean resubmissionAllowed) { this.resubmissionAllowed = resubmissionAllowed; }

    public String getResubmissionNotes() { return resubmissionNotes; }
    public void setResubmissionNotes(String resubmissionNotes) { this.resubmissionNotes = resubmissionNotes; }

    public String getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(String verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public String getResubmittedAt() { return resubmittedAt; }
    public void setResubmittedAt(String resubmittedAt) { this.resubmittedAt = resubmittedAt; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getRegistrationCheckStatus() { return registrationCheckStatus; }
    public void setRegistrationCheckStatus(String registrationCheckStatus) { this.registrationCheckStatus = registrationCheckStatus; }

    public String getAssociationCheckStatus() { return associationCheckStatus; }
    public void setAssociationCheckStatus(String associationCheckStatus) { this.associationCheckStatus = associationCheckStatus; }

    public Boolean getAssociationVerified() { return associationVerified; }
    public void setAssociationVerified(Boolean associationVerified) { this.associationVerified = associationVerified; }

    public Boolean getPhoneVerified() { return phoneVerified; }
    public void setPhoneVerified(Boolean phoneVerified) { this.phoneVerified = phoneVerified; }

    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getReviewDate() { return reviewDate; }
    public void setReviewDate(String reviewDate) { this.reviewDate = reviewDate; }

    public CompanyDTO getCompany() { return company; }
    public void setCompany(CompanyDTO company) { this.company = company; }

    public List<VerificationHistoryDTO> getHistory() { return history; }
    public void setHistory(List<VerificationHistoryDTO> history) { this.history = history; }
}
