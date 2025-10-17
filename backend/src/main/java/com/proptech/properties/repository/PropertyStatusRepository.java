package com.proptech.properties.repository;

import com.proptech.properties.entity.PropertyStatus;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PropertyStatusRepository implements PanacheRepository<PropertyStatus> {
    
    public PropertyStatus findById(Long id) {
        return find("id", id).firstResult();
    }
    
    public PropertyStatus findByName(String name) {
        return find("name", name).firstResult();
    }
}
