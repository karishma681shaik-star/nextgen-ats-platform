package com.aiats.dto.candidate;

public class ProfileReadinessCriterionDTO {
    private String key;
    private String label;
    private int weight;
    private boolean completed;
    private String helpText;
    private String actionRoute;
    private String actionLabel;

    public ProfileReadinessCriterionDTO() {}

    public ProfileReadinessCriterionDTO(String key, String label, int weight, boolean completed,
                                        String helpText, String actionRoute, String actionLabel) {
        this.key = key;
        this.label = label;
        this.weight = weight;
        this.completed = completed;
        this.helpText = helpText;
        this.actionRoute = actionRoute;
        this.actionLabel = actionLabel;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public int getWeight() {
        return weight;
    }

    public void setWeight(int weight) {
        this.weight = weight;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public String getHelpText() {
        return helpText;
    }

    public void setHelpText(String helpText) {
        this.helpText = helpText;
    }

    public String getActionRoute() {
        return actionRoute;
    }

    public void setActionRoute(String actionRoute) {
        this.actionRoute = actionRoute;
    }

    public String getActionLabel() {
        return actionLabel;
    }

    public void setActionLabel(String actionLabel) {
        this.actionLabel = actionLabel;
    }
}
