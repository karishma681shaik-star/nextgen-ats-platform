package com.aiats.dto.candidate;
import java.util.List;
public class ExperienceDTO {
    private String id; private String company; private String role; private String location; private String startDate; private String endDate; private boolean current; private String description; private List<String> technologies;
    public String getId() { return id; } public void setId(String id) { this.id = id; }
    public String getCompany() { return company; } public void setCompany(String company) { this.company = company; }
    public String getRole() { return role; } public void setRole(String role) { this.role = role; }
    public String getLocation() { return location; } public void setLocation(String location) { this.location = location; }
    public String getStartDate() { return startDate; } public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; } public void setEndDate(String endDate) { this.endDate = endDate; }
    public boolean isCurrent() { return current; } public void setCurrent(boolean current) { this.current = current; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public List<String> getTechnologies() { return technologies; } public void setTechnologies(List<String> technologies) { this.technologies = technologies; }
}
