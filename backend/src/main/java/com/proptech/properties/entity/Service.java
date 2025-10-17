package com.proptech.properties.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "services", schema = "proptech")
public class Service extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
    private String description;
    private String type; // Basic, Premium, Included, Optional
    private Boolean includedInRent;
    private Boolean includedInSale;
    private Boolean active;

    public Service() {}
    public Service(Long id) { this.id = id; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Boolean getIncludedInRent() { return includedInRent; }
    public void setIncludedInRent(Boolean includedInRent) { this.includedInRent = includedInRent; }

    public Boolean getIncludedInSale() { return includedInSale; }
    public void setIncludedInSale(Boolean includedInSale) { this.includedInSale = includedInSale; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
} 