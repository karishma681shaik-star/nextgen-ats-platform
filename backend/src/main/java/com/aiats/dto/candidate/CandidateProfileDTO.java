package com.aiats.dto.candidate;

import java.util.List;

public class CandidateProfileDTO {
    private String id;
    private String userId;
    private String name;
    private String email;
    private String phone;
    private String location;
    private String title;
    private String bio;
    private String avatar;
    private String githubUrl;
    private String linkedinUrl;
    private String websiteUrl;
    private int profileCompletion;
    private SkillCategoryDTO skills;
    private List<EducationDTO> education;
    private List<ExperienceDTO> experience;
    private List<ProjectDTO> projects;
    private List<CertificationDTO> certifications;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }
    public int getProfileCompletion() { return profileCompletion; }
    public void setProfileCompletion(int profileCompletion) { this.profileCompletion = profileCompletion; }
    public SkillCategoryDTO getSkills() { return skills; }
    public void setSkills(SkillCategoryDTO skills) { this.skills = skills; }
    public List<EducationDTO> getEducation() { return education; }
    public void setEducation(List<EducationDTO> education) { this.education = education; }
    public List<ExperienceDTO> getExperience() { return experience; }
    public void setExperience(List<ExperienceDTO> experience) { this.experience = experience; }
    public List<ProjectDTO> getProjects() { return projects; }
    public void setProjects(List<ProjectDTO> projects) { this.projects = projects; }
    public List<CertificationDTO> getCertifications() { return certifications; }
    public void setCertifications(List<CertificationDTO> certifications) { this.certifications = certifications; }
}
