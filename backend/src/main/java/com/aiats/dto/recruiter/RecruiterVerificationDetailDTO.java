package com.aiats.dto.recruiter;

import com.aiats.dto.admin.VerificationHistoryDTO;
import java.util.List;

public class RecruiterVerificationDetailDTO {
    private String recruiterId;
    private String recruiterName;
    private String recruiterEmail;
    private String recruiterPhone;
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

    public CompanyDTO getCompany() { return company; }
    public void setCompany(CompanyDTO company) { this.company = company; }

    public List<VerificationHistoryDTO> getHistory() { return history; }
    public void setHistory(List<VerificationHistoryDTO> history) { this.history = history; }
}
