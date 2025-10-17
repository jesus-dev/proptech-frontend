package com.proptech.properties.repository;

import com.proptech.properties.entity.GalleryImage;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GalleryImageRepository implements PanacheRepository<GalleryImage> {
    
    public GalleryImage findById(Long id) {
        return find("id", id).firstResult();
    }
} 