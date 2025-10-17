package com.proptech.properties.dto;

import java.time.LocalTime;

public class TimeSlotDTO {
    private String time;
    private boolean available;
    private Long agentId;
    private String agentName;

    public TimeSlotDTO() {}

    public TimeSlotDTO(String time, boolean available, Long agentId, String agentName) {
        this.time = time;
        this.available = available;
        this.agentId = agentId;
        this.agentName = agentName;
    }

    // Getters y Setters
    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public Long getAgentId() {
        return agentId;
    }

    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }

    public String getAgentName() {
        return agentName;
    }

    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }
}
