package com.aiats.dto.candidate;
import java.util.List;
public class ProjectDTO {
    private String id; private String title; private String description; private List<String> technologies; private String link; private String githubUrl;
    public String getId() { return id; } public void setId(String id) { this.id = id; }
    public String getTitle() { return title; } public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public List<String> getTechnologies() { return technologies; } public void setTechnologies(List<String> technologies) { this.technologies = technologies; }
    public String getLink() { return link; } public void setLink(String link) { this.link = link; }
    public String getGithubUrl() { return githubUrl; } public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
}
