package com.proptech.commons.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class VisitDTO {
    public Long id;
    public String title;
    public String description;
    public String visitType;
    public String status;
    public Long propertyId;
    public LocalDate scheduledDate;
    public String startTime;
    public String endTime;
    public String location;
    public String visitorName;
    public String assignedTo;
    public String visitorPhone;
    public String visitorEmail;
    public String clientId;
    public String clientName;
    public String clientEmail;
    public String clientPhone;
    public List<String> reminders;
    public String notes;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
} 