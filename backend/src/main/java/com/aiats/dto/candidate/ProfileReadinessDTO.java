package com.aiats.dto.candidate;

import java.util.ArrayList;
import java.util.List;

public class ProfileReadinessDTO {
    private int completionPercentage;
    private int completedItems;
    private int totalItems;
    private List<String> missingItems = new ArrayList<>();
    private String guidance;
    private String nextActionLabel;
    private String nextActionRoute;
    private List<ProfileReadinessCriterionDTO> criteria = new ArrayList<>();

    public ProfileReadinessDTO() {}

    public int getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(int completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public int getCompletedItems() {
        return completedItems;
    }

    public void setCompletedItems(int completedItems) {
        this.completedItems = completedItems;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }

    public List<String> getMissingItems() {
        return missingItems;
    }

    public void setMissingItems(List<String> missingItems) {
        this.missingItems = missingItems;
    }

    public String getGuidance() {
        return guidance;
    }

    public void setGuidance(String guidance) {
        this.guidance = guidance;
    }

    public String getNextActionLabel() {
        return nextActionLabel;
    }

    public void setNextActionLabel(String nextActionLabel) {
        this.nextActionLabel = nextActionLabel;
    }

    public String getNextActionRoute() {
        return nextActionRoute;
    }

    public void setNextActionRoute(String nextActionRoute) {
        this.nextActionRoute = nextActionRoute;
    }

    public List<ProfileReadinessCriterionDTO> getCriteria() {
        return criteria;
    }

    public void setCriteria(List<ProfileReadinessCriterionDTO> criteria) {
        this.criteria = criteria;
    }
}
