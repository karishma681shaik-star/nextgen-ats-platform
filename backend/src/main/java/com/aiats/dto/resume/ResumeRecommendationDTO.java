package com.aiats.dto.resume;

public class ResumeRecommendationDTO {

    private String id;
    private String category;
    private String severity; // "error", "warning", "info"
    private String status;   // "PENDING", "COMPLETED", "DELETED"
    private String title;
    private String completedTitle;
    private String pendingTitle;
    private String reason;
    private String completedDescription;
    private double weight;
    private boolean passing;
    private boolean dismissed;
    private String navigateTo;
    private String detailedReason;
    private String recruiterImpact;
    private String proTip;

    public ResumeRecommendationDTO() {}

    public ResumeRecommendationDTO(String id, String category, String severity, String status,
                                  String pendingTitle, String completedTitle,
                                  String reason, String completedDescription,
                                  double weight, boolean passing, boolean dismissed,
                                  String navigateTo, String detailedReason,
                                  String recruiterImpact, String proTip) {
        this.id = id;
        this.category = category;
        this.severity = severity;
        this.status = status;
        this.pendingTitle = pendingTitle;
        this.completedTitle = completedTitle;
        this.title = "COMPLETED".equals(status) ? completedTitle : pendingTitle;
        this.reason = "COMPLETED".equals(status) ? completedDescription : reason;
        this.completedDescription = completedDescription;
        this.weight = weight;
        this.passing = passing;
        this.dismissed = dismissed;
        this.navigateTo = navigateTo;
        this.detailedReason = detailedReason;
        this.recruiterImpact = recruiterImpact;
        this.proTip = proTip;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompletedTitle() { return completedTitle; }
    public void setCompletedTitle(String completedTitle) { this.completedTitle = completedTitle; }

    public String getPendingTitle() { return pendingTitle; }
    public void setPendingTitle(String pendingTitle) { this.pendingTitle = pendingTitle; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getCompletedDescription() { return completedDescription; }
    public void setCompletedDescription(String completedDescription) { this.completedDescription = completedDescription; }

    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }

    public boolean isPassing() { return passing; }
    public void setPassing(boolean passing) { this.passing = passing; }

    public boolean isDismissed() { return dismissed; }
    public void setDismissed(boolean dismissed) { this.dismissed = dismissed; }

    public String getNavigateTo() { return navigateTo; }
    public void setNavigateTo(String navigateTo) { this.navigateTo = navigateTo; }

    public String getDetailedReason() { return detailedReason; }
    public void setDetailedReason(String detailedReason) { this.detailedReason = detailedReason; }

    public String getRecruiterImpact() { return recruiterImpact; }
    public void setRecruiterImpact(String recruiterImpact) { this.recruiterImpact = recruiterImpact; }

    public String getProTip() { return proTip; }
    public void setProTip(String proTip) { this.proTip = proTip; }
}
