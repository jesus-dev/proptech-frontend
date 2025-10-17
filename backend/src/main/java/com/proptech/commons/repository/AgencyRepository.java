package com.proptech.commons.repository;

import com.proptech.commons.entity.Agency;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class AgencyRepository implements PanacheRepository<Agency> {
    
    public java.util.List<Agency> findActive() {
        return find("active", true).list();
    }
} 