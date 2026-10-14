package com.aiats.dto.admin;

import java.util.List;

public class RecruiterVerificationDTO {
    // SECTION A: ACCOUNT INFORMATION
    private String recruiterId;
    private String recruiterName;
    private String recruiterEmail;
    private String recruiterPhone;
    private Boolean phoneVerified;
    private Boolean emailVerified;
    private String accountStatus; // active, suspended
    private String verificationStatus; // pending, in_review, verified, additional_evidence_required, unable_to_verify, rejected, suspended, resubmitted
    private boolean verified;
    private String createdAt;
    private String verifiedAt;
    private String verifiedBy;

    // SECTION B: COMPANY INFORMATION
    private String companyId;
    private String companyName;
    private String companyLogo;
    private String companyTagline;
    private String industry;
    private String website;
    private String location; // business address
    private String size;
    private String description;
    private String foundedYear;
    private List<String> benefits;
    private String businessRegistrationNumber;
    private String taxId;
    private String officialEmailDomain;
    private String verificationDocumentUrl;
    private String verificationEvidenceNotes;

    // SECTION C: IDENTITY VERIFICATION
    private String emailVerificationResult;
    private String phoneVerificationResult;
    private String professionalIdentityReview;
    private List<String> outstandingIdentityChecks;

    // SECTION D: COMPANY AUTHENTICITY
    private String registrationCheckStatus; // PENDING, VERIFIED, DISCREPANCY, UNABLE_TO_VERIFY
    private String websiteConsistencyStatus; // PENDING, CONSISTENT, INCONSISTENT
    private String companyAuthenticityReview;
    private List<String> unresolvedDiscrepancies;

    // SECTION E: COMPANY ASSOCIATION
    private Boolean associationVerified;
    private String associationCheckStatus; // PENDING, AUTHORIZED, UNRESOLVED, REJECTED
    private String authorizationDocumentUrl;
    private String authorizationNotes;
    private String independentConfirmationNotes;
    private String reviewerNotes;

    // SECTION F: VERIFICATION HISTORY & FEEDBACK
    private String rejectionReason;
    private String rejectionCategory;
    private String correctiveActions;
    private String aiSuggestions;
    private Boolean resubmissionAllowed;
    private String resubmissionNotes;
    private String resubmittedAt;
    private Boolean reverificationRequired;
    private List<VerificationHistoryDTO> history;

    // AI-ASSISTED RISK & READINESS (SECTIONS 5 & 6)
    private Integer verificationReadinessScore;
    private String verificationReadinessStatus;
    private Integer riskScore;
    private String riskLevel;
    private List<AiRiskFlagDTO> aiRiskFlags;

    public RecruiterVerificationDTO() {}

    // Section A Getters / Setters
    public String getRecruiterId() { return recruiterId; }
    public void setRecruiterId(String recruiterId) { this.recruiterId = recruiterId; }

    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }

    public String getRecruiterEmail() { return recruiterEmail; }
    public void setRecruiterEmail(String recruiterEmail) { this.recruiterEmail = recruiterEmail; }

    public String getRecruiterPhone() { return recruiterPhone; }
    public void setRecruiterPhone(String recruiterPhone) { this.recruiterPhone = recruiterPhone; }

    public Boolean getPhoneVerified() { return phoneVerified; }
    public void setPhoneVerified(Boolean phoneVerified) { this.phoneVerified = phoneVerified; }

    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(String verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    // Section B Getters / Setters
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }

    public String getCompanyTagline() { return companyTagline; }
    public void setCompanyTagline(String companyTagline) { this.companyTagline = companyTagline; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFoundedYear() { return foundedYear; }
    public void setFoundedYear(String foundedYear) { this.foundedYear = foundedYear; }

    public List<String> getBenefits() { return benefits; }
    public void setBenefits(List<String> benefits) { this.benefits = benefits; }

    public String getBusinessRegistrationNumber() { return businessRegistrationNumber; }
    public void setBusinessRegistrationNumber(String businessRegistrationNumber) { this.businessRegistrationNumber = businessRegistrationNumber; }

    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }

    public String getOfficialEmailDomain() { return officialEmailDomain; }
    public void setOfficialEmailDomain(String officialEmailDomain) { this.officialEmailDomain = officialEmailDomain; }

    public String getVerificationDocumentUrl() { return verificationDocumentUrl; }
    public void setVerificationDocumentUrl(String verificationDocumentUrl) { this.verificationDocumentUrl = verificationDocumentUrl; }

    public String getVerificationEvidenceNotes() { return verificationEvidenceNotes; }
    public void setVerificationEvidenceNotes(String verificationEvidenceNotes) { this.verificationEvidenceNotes = verificationEvidenceNotes; }

    // Section C Getters / Setters
    public String getEmailVerificationResult() { return emailVerificationResult; }
    public void setEmailVerificationResult(String emailVerificationResult) { this.emailVerificationResult = emailVerificationResult; }

    public String getPhoneVerificationResult() { return phoneVerificationResult; }
    public void setPhoneVerificationResult(String phoneVerificationResult) { this.phoneVerificationResult = phoneVerificationResult; }

    public String getProfessionalIdentityReview() { return professionalIdentityReview; }
    public void setProfessionalIdentityReview(String professionalIdentityReview) { this.professionalIdentityReview = professionalIdentityReview; }

    public List<String> getOutstandingIdentityChecks() { return outstandingIdentityChecks; }
    public void setOutstandingIdentityChecks(List<String> outstandingIdentityChecks) { this.outstandingIdentityChecks = outstandingIdentityChecks; }

    // Section D Getters / Setters
    public String getRegistrationCheckStatus() { return registrationCheckStatus; }
    public void setRegistrationCheckStatus(String registrationCheckStatus) { this.registrationCheckStatus = registrationCheckStatus; }

    public String getWebsiteConsistencyStatus() { return websiteConsistencyStatus; }
    public void setWebsiteConsistencyStatus(String websiteConsistencyStatus) { this.websiteConsistencyStatus = websiteConsistencyStatus; }

    public String getCompanyAuthenticityReview() { return companyAuthenticityReview; }
    public void setCompanyAuthenticityReview(String companyAuthenticityReview) { this.companyAuthenticityReview = companyAuthenticityReview; }

    public List<String> getUnresolvedDiscrepancies() { return unresolvedDiscrepancies; }
    public void setUnresolvedDiscrepancies(List<String> unresolvedDiscrepancies) { this.unresolvedDiscrepancies = unresolvedDiscrepancies; }

    // Section E Getters / Setters
    public Boolean getAssociationVerified() { return associationVerified; }
    public void setAssociationVerified(Boolean associationVerified) { this.associationVerified = associationVerified; }

    public String getAssociationCheckStatus() { return associationCheckStatus; }
    public void setAssociationCheckStatus(String associationCheckStatus) { this.associationCheckStatus = associationCheckStatus; }

    public String getAuthorizationDocumentUrl() { return authorizationDocumentUrl; }
    public void setAuthorizationDocumentUrl(String authorizationDocumentUrl) { this.authorizationDocumentUrl = authorizationDocumentUrl; }

    public String getAuthorizationNotes() { return authorizationNotes; }
    public void setAuthorizationNotes(String authorizationNotes) { this.authorizationNotes = authorizationNotes; }

    public String getIndependentConfirmationNotes() { return independentConfirmationNotes; }
    public void setIndependentConfirmationNotes(String independentConfirmationNotes) { this.independentConfirmationNotes = independentConfirmationNotes; }

    public String getReviewerNotes() { return reviewerNotes; }
    public void setReviewerNotes(String reviewerNotes) { this.reviewerNotes = reviewerNotes; }

    // Section F Getters / Setters
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getRejectionCategory() { return rejectionCategory; }
    public void setRejectionCategory(String rejectionCategory) { this.rejectionCategory = rejectionCategory; }

    public String getCorrectiveActions() { return correctiveActions; }
    public void setCorrectiveActions(String correctiveActions) { this.correctiveActions = correctiveActions; }

    public String getAiSuggestions() { return aiSuggestions; }
    public void setAiSuggestions(String aiSuggestions) { this.aiSuggestions = aiSuggestions; }

    public Boolean getResubmissionAllowed() { return resubmissionAllowed; }
    public void setResubmissionAllowed(Boolean resubmissionAllowed) { this.resubmissionAllowed = resubmissionAllowed; }

    public String getResubmissionNotes() { return resubmissionNotes; }
    public void setResubmissionNotes(String resubmissionNotes) { this.resubmissionNotes = resubmissionNotes; }

    public String getResubmittedAt() { return resubmittedAt; }
    public void setResubmittedAt(String resubmittedAt) { this.resubmittedAt = resubmittedAt; }

    public Boolean getReverificationRequired() { return reverificationRequired; }
    public void setReverificationRequired(Boolean reverificationRequired) { this.reverificationRequired = reverificationRequired; }

    public List<VerificationHistoryDTO> getHistory() { return history; }
    public void setHistory(List<VerificationHistoryDTO> history) { this.history = history; }

    // AI Risk & Readiness
    public Integer getVerificationReadinessScore() { return verificationReadinessScore; }
    public void setVerificationReadinessScore(Integer verificationReadinessScore) { this.verificationReadinessScore = verificationReadinessScore; }

    public String getVerificationReadinessStatus() { return verificationReadinessStatus; }
    public void setVerificationReadinessStatus(String verificationReadinessStatus) { this.verificationReadinessStatus = verificationReadinessStatus; }

    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public List<AiRiskFlagDTO> getAiRiskFlags() { return aiRiskFlags; }
    public void setAiRiskFlags(List<AiRiskFlagDTO> aiRiskFlags) { this.aiRiskFlags = aiRiskFlags; }
}
