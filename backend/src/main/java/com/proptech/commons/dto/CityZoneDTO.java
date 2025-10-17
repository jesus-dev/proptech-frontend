package com.proptech.commons.dto;

import java.time.LocalDateTime;

public class CityZoneDTO {
    private Long id;
    private String name;
    private String description;
    private Boolean active;
    private Long cityId;
    private String cityName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public CityZoneDTO() {}

    public CityZoneDTO(Long id, String name, String description, Boolean active, Long cityId, String cityName) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.active = active;
        this.cityId = cityId;
        this.cityName = cityName;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Long getCityId() { return cityId; }
    public void setCityId(Long cityId) { this.cityId = cityId; }

    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
