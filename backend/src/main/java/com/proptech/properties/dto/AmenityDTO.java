package com.proptech.properties.dto;

public class AmenityDTO {
    public Long id;
    public String name;
    public String description;
    public String category;
    public String icon;
    public Boolean active;

    public AmenityDTO() {}

    public AmenityDTO(Long id, String name, String description, String category, String icon, Boolean active) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.icon = icon;
        this.active = active;
    }
} 