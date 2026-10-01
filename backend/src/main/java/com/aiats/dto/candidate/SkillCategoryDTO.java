package com.aiats.dto.candidate;

import java.util.List;

public class SkillCategoryDTO {
    private List<String> technical;
    private List<String> soft;
    private List<String> tools;
    private List<String> languages;

    public List<String> getTechnical() { return technical; }
    public void setTechnical(List<String> technical) { this.technical = technical; }
    public List<String> getSoft() { return soft; }
    public void setSoft(List<String> soft) { this.soft = soft; }
    public List<String> getTools() { return tools; }
    public void setTools(List<String> tools) { this.tools = tools; }
    public List<String> getLanguages() { return languages; }
    public void setLanguages(List<String> languages) { this.languages = languages; }
}
