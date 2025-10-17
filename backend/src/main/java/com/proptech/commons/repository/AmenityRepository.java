package com.proptech.commons.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

import com.proptech.properties.entity.Amenity;

@ApplicationScoped
public class AmenityRepository implements PanacheRepository<Amenity> {
    
    public List<Amenity> findByName(String name) {
        return find("name", name).list();
    }
} 