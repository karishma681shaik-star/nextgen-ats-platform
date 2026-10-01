package com.aiats.dto.application;

public class TimelineEventDTO {
    private String status;
    private String date;
    private String note;

    public TimelineEventDTO() {}
    public TimelineEventDTO(String status, String date, String note) {
        this.status = status;
        this.date = date;
        this.note = note;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
