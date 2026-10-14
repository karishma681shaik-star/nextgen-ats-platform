package com.aiats.dto.notification;

import com.aiats.entity.Notification;
import java.util.UUID;

public class NotificationDTO {
    private UUID id;
    private UUID userId;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private String link;
    private String createdAt;

    public NotificationDTO() {}

    public NotificationDTO(Notification notif) {
        this.id = notif.getId();
        if (notif.getUser() != null) {
            this.userId = notif.getUser().getId();
        }
        this.title = notif.getTitle();
        this.message = notif.getMessage();
        this.type = notif.getType();
        this.read = notif.isRead();
        this.link = notif.getLink();
        this.createdAt = notif.getCreatedAt() != null ? notif.getCreatedAt().toString() : null;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
