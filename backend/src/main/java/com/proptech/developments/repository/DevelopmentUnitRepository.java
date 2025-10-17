package com.proptech.developments.repository;

import java.util.List;

import com.proptech.developments.entity.DevelopmentUnit;
import com.proptech.developments.enums.UnitStatus;
import com.proptech.developments.enums.UnitType;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DevelopmentUnitRepository implements PanacheRepository<DevelopmentUnit> {
    
    public List<DevelopmentUnit> findByDevelopmentId(Long developmentId) {
        return find("developmentId", developmentId).list();
    }
    
    public List<DevelopmentUnit> findByDevelopmentIdAndStatus(Long developmentId, UnitStatus status) {
        return find("developmentId = ?1 and status = ?2", developmentId, status).list();
    }
    
    public List<DevelopmentUnit> findByDevelopmentIdAndType(Long developmentId, UnitType type) {
        return find("developmentId = ?1 and type = ?2", developmentId, type).list();
    }
    
    public List<DevelopmentUnit> findByStatus(UnitStatus status) {
        return find("status", status).list();
    }
    
    public List<DevelopmentUnit> findByType(UnitType type) {
        return find("type", type).list();
    }
    
    public List<DevelopmentUnit> findAvailableUnits() {
        return find("status", UnitStatus.AVAILABLE).list();
    }
    
    public List<DevelopmentUnit> findFeaturedUnits() {
        return find("featured = true and active = true").list();
    }
    
    public List<DevelopmentUnit> findPremiumUnits() {
        return find("premium = true and active = true").list();
    }
    
    public long countByDevelopmentId(Long developmentId) {
        return count("developmentId", developmentId);
    }
    
    public long countByDevelopmentIdAndStatus(Long developmentId, UnitStatus status) {
        return count("developmentId = ?1 and status = ?2", developmentId, status);
    }
    
    public long countAvailableByDevelopmentId(Long developmentId) {
        return count("developmentId = ?1 and status = ?2", developmentId, UnitStatus.AVAILABLE);
    }
    
    public long countByStatus(UnitStatus status) {
        return count("status", status);
    }
} 