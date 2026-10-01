package com.aiats.dto.job;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class JobRequest {
    @NotBlank
    private String title;

    private String department;

    @NotBlank
    private String location;

    private String type;
    private String experienceLevel;
    private String salaryMin;
    private String salaryMax;
    private String currency;

    @NotBlank
    private String description;

    private List<String> requirements;
    private List<String> responsibilities;
    private List<String> skills;
    private String educationRequired;
    private String deadline;
    private String status;

    // ── Getters & Setters ─────────────────────────────────────────────────

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

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

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getRequirements() { return requirements; }
    public void setRequirements(List<String> requirements) { this.requirements = requirements; }

    public List<String> getResponsibilities() { return responsibilities; }
    public void setResponsibilities(List<String> responsibilities) { this.responsibilities = responsibilities; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public String getEducationRequired() { return educationRequired; }
    public void setEducationRequired(String educationRequired) { this.educationRequired = educationRequired; }

    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
