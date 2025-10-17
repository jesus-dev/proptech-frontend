package com.proptech.properties.dto;

public class ServiceDTO {
    public Long id;
    public String name;
    public String description;
    public String type;
    public Boolean includedInRent;
    public Boolean includedInSale;
    public Boolean active;

    public ServiceDTO() {}

    public ServiceDTO(Long id, String name, String description, String type, Boolean includedInRent, Boolean includedInSale, Boolean active) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.includedInRent = includedInRent;
        this.includedInSale = includedInSale;
        this.active = active;
    }
} 