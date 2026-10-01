package com.aiats.dto.resume;

import java.util.List;

public class ParsedDataDTO {
    private List<String> extractedSkills;
    private List<String> extractedEducation;
    private List<String> extractedExperience;
    private List<String> extractedProjects;
    private List<String> extractedCertifications;

    public List<String> getExtractedSkills() { return extractedSkills; }
    public void setExtractedSkills(List<String> extractedSkills) { this.extractedSkills = extractedSkills; }
    public List<String> getExtractedEducation() { return extractedEducation; }
    public void setExtractedEducation(List<String> extractedEducation) { this.extractedEducation = extractedEducation; }
    public List<String> getExtractedExperience() { return extractedExperience; }
    public void setExtractedExperience(List<String> extractedExperience) { this.extractedExperience = extractedExperience; }
    public List<String> getExtractedProjects() { return extractedProjects; }
    public void setExtractedProjects(List<String> extractedProjects) { this.extractedProjects = extractedProjects; }
    public List<String> getExtractedCertifications() { return extractedCertifications; }
    public void setExtractedCertifications(List<String> extractedCertifications) { this.extractedCertifications = extractedCertifications; }
}
