package com.aiats.dto.application;

import java.util.List;

public class ApplicationDTO {
    private String id;
    private String jobId;
    private String jobTitle;
    private String company;
    private String companyLogo;
    private String candidateId;
    private String candidateName;
    private String candidateEmail;
    private String candidateAvatar;
    private String candidateTitle;
    private String candidateLocation;
    private String resumeId;
    private String resumeFileName;
    private String appliedDate;
    private String status;
    private int atsScore;
    private int matchPercentage;
    private List<String> skills;
    private int experienceYears;
    private List<String> notes;
    private List<TimelineEventDTO> timeline;

    // ─── Getters & Setters ────────────────────────────────────────────────────
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }
    public String getCandidateId() { return candidateId; }
    public void setCandidateId(String candidateId) { this.candidateId = candidateId; }
    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }
    public String getCandidateAvatar() { return candidateAvatar; }
    public void setCandidateAvatar(String candidateAvatar) { this.candidateAvatar = candidateAvatar; }
    public String getCandidateTitle() { return candidateTitle; }
    public void setCandidateTitle(String candidateTitle) { this.candidateTitle = candidateTitle; }
    public String getCandidateLocation() { return candidateLocation; }
    public void setCandidateLocation(String candidateLocation) { this.candidateLocation = candidateLocation; }
    public String getResumeId() { return resumeId; }
    public void setResumeId(String resumeId) { this.resumeId = resumeId; }
    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }
    public String getAppliedDate() { return appliedDate; }
    public void setAppliedDate(String appliedDate) { this.appliedDate = appliedDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getAtsScore() { return atsScore; }
    public void setAtsScore(int atsScore) { this.atsScore = atsScore; }
    public int getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(int matchPercentage) { this.matchPercentage = matchPercentage; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public int getExperienceYears() { return experienceYears; }
    public void setExperienceYears(int experienceYears) { this.experienceYears = experienceYears; }
    public List<String> getNotes() { return notes; }
    public void setNotes(List<String> notes) { this.notes = notes; }
    public List<TimelineEventDTO> getTimeline() { return timeline; }
    public void setTimeline(List<TimelineEventDTO> timeline) { this.timeline = timeline; }
}
