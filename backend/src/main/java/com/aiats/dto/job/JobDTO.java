package com.aiats.dto.job;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobDTO {
    private String id;
    private String title;
    private String company;
    private String companyId;
    private String companyLogo;
    private String department;
    private String location;
    private String type;
    private String experienceLevel;
    private String salaryMin;
    private String salaryMax;
    private String currency;
    private String salaryPeriod;
    private String description;
    private List<String> requirements;
    private List<String> responsibilities;
    private List<String> skills;
    private String educationRequired;
    private String status;        // ACTIVE, PENDING_APPROVAL, REJECTED, CLOSED, ARCHIVED, DRAFT
    private String postedAt;
    private String deadline;
    private int applicantsCount;
    private boolean saved;
    private boolean applied;
    private String matchScore;
    private String recruiterName;
    private String recruiterId;
    private String recruiterEmail;
    private String recruiterVerificationStatus;
    private boolean verifiedRecruiter;
    private boolean companyVerified;
    private String rejectionReason;
    private String approvedBy;
    private String approvedAt;
    private String moderatedAt;
    private String closedReason;
    private String closedAt;

    public String getClosedReason() { return closedReason; }
    public void setClosedReason(String closedReason) { this.closedReason = closedReason; }

    public String getClosedAt() { return closedAt; }
    public void setClosedAt(String closedAt) { this.closedAt = closedAt; }

    public String getRecruiterId() { return recruiterId; }
    public void setRecruiterId(String recruiterId) { this.recruiterId = recruiterId; }

    public String getRecruiterEmail() { return recruiterEmail; }
    public void setRecruiterEmail(String recruiterEmail) { this.recruiterEmail = recruiterEmail; }

    public String getRecruiterVerificationStatus() { return recruiterVerificationStatus; }
    public void setRecruiterVerificationStatus(String recruiterVerificationStatus) { this.recruiterVerificationStatus = recruiterVerificationStatus; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public String getApprovedAt() { return approvedAt; }
    public void setApprovedAt(String approvedAt) { this.approvedAt = approvedAt; }

    public String getModeratedAt() { return moderatedAt; }
    public void setModeratedAt(String moderatedAt) { this.moderatedAt = moderatedAt; }

    public boolean isVerifiedRecruiter() { return verifiedRecruiter; }
    public void setVerifiedRecruiter(boolean verifiedRecruiter) { this.verifiedRecruiter = verifiedRecruiter; }

    public boolean isCompanyVerified() { return companyVerified; }
    public void setCompanyVerified(boolean companyVerified) { this.companyVerified = companyVerified; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
    public String getSalaryMin() { return salaryMin; }
    public void setSalaryMin(String salaryMin) { this.salaryMin = salaryMin; }
    public String getSalaryMax() { return salaryMax; }
    public void setSalaryMax(String salaryMax) { this.salaryMax = salaryMax; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getSalaryPeriod() { return salaryPeriod; }
    public void setSalaryPeriod(String salaryPeriod) { this.salaryPeriod = salaryPeriod; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getRequirements() { return requirements; }
    public void setRequirements(List<String> requirements) { this.requirements = requirements; }
    public List<String> getResponsibilities() { return responsibilities; }
    public void setResponsibilities(List<String> responsibilities) { this.responsibilities = responsibilities; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPostedAt() { return postedAt; }
    public void setPostedAt(String postedAt) { this.postedAt = postedAt; }
    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
    public int getApplicantsCount() { return applicantsCount; }
    public void setApplicantsCount(int applicantsCount) { this.applicantsCount = applicantsCount; }
    public boolean isSaved() { return saved; }
    public void setSaved(boolean saved) { this.saved = saved; }
    public boolean isApplied() { return applied; }
    public void setApplied(boolean applied) { this.applied = applied; }
    public String getMatchScore() { return matchScore; }
    public void setMatchScore(String matchScore) { this.matchScore = matchScore; }
    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }
    public String getEducationRequired() { return educationRequired; }
    public void setEducationRequired(String educationRequired) { this.educationRequired = educationRequired; }
}
