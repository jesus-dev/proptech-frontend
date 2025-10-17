package com.proptech.commons.dto;

import java.time.LocalDateTime;

import com.proptech.commons.entity.CalendarEvent.EventStatus;
import com.proptech.commons.entity.CalendarEvent.EventType;

public class CalendarEventDTO {
    public Long id;
    public String title;
    public EventType type;
    public LocalDateTime start;
    public LocalDateTime end;
    public Long propertyId;
    public Long clientId;
    public String notes;
    public String color;
    public EventStatus status;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    
    @Override
    public String toString() {
        return "CalendarEventDTO{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", type=" + type +
                ", start=" + start +
                ", end=" + end +
                ", propertyId=" + propertyId +
                ", clientId=" + clientId +
                ", notes='" + notes + '\'' +
                ", color='" + color + '\'' +
                ", status=" + status +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
} 