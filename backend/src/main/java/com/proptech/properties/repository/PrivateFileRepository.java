package com.proptech.properties.repository;

import com.proptech.properties.entity.PrivateFile;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PrivateFileRepository implements PanacheRepository<PrivateFile> {
    
    public PrivateFile findById(Long id) {
        return find("id", id).firstResult();
    }
} 