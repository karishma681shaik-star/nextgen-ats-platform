package com.aiats.dto.recruiter;

import java.util.List;

public class CompanyDTO {
    private String id;
    private String recruiterId;
    private String name;
    private String logo;
    private String tagline;
    private String industry;
    private String website;
    private String location;
    private String size;
    private String description;
    private String foundedYear;
    private String contactEmail;
    private String contactPhone;
    private boolean verified;
    private List<String> benefits;

    public String getId() { return id; } public void setId(String id) { this.id = id; }
    public String getRecruiterId() { return recruiterId; } public void setRecruiterId(String recruiterId) { this.recruiterId = recruiterId; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getLogo() { return logo; } public void setLogo(String logo) { this.logo = logo; }
    public String getTagline() { return tagline; } public void setTagline(String tagline) { this.tagline = tagline; }
    public String getIndustry() { return industry; } public void setIndustry(String industry) { this.industry = industry; }
    public String getWebsite() { return website; } public void setWebsite(String website) { this.website = website; }
    public String getLocation() { return location; } public void setLocation(String location) { this.location = location; }
    public String getSize() { return size; } public void setSize(String size) { this.size = size; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public String getFoundedYear() { return foundedYear; } public void setFoundedYear(String foundedYear) { this.foundedYear = foundedYear; }
    public String getContactEmail() { return contactEmail; } public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; } public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public boolean isVerified() { return verified; } public void setVerified(boolean verified) { this.verified = verified; }
    public List<String> getBenefits() { return benefits; } public void setBenefits(List<String> benefits) { this.benefits = benefits; }
}
