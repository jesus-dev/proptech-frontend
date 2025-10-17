package com.proptech.developments.repository;

import java.time.LocalDate;
import java.util.List;

import com.proptech.developments.entity.DevelopmentQuota;
import com.proptech.developments.enums.QuotaStatus;
import com.proptech.developments.enums.QuotaType;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DevelopmentQuotaRepository implements PanacheRepository<DevelopmentQuota> {
    
    public List<DevelopmentQuota> findByDevelopmentId(Long developmentId) {
        return find("developmentId", developmentId).list();
    }
    
    public List<DevelopmentQuota> findByDevelopmentIdAndStatus(Long developmentId, QuotaStatus status) {
        return find("developmentId = ?1 and status = ?2", developmentId, status).list();
    }
    
    public List<DevelopmentQuota> findByDevelopmentIdAndType(Long developmentId, QuotaType type) {
        return find("developmentId = ?1 and type = ?2", developmentId, type).list();
    }
    
    public List<DevelopmentQuota> findByUnitId(Long unitId) {
        return find("unit.id", unitId).list();
    }
    
    public List<DevelopmentQuota> findByStatus(QuotaStatus status) {
        return find("status", status).list();
    }
    
    public List<DevelopmentQuota> findByType(QuotaType type) {
        return find("type", type).list();
    }
    
    public List<DevelopmentQuota> findOverdueQuotas() {
        return find("status = ?1 and dueDate < ?2", QuotaStatus.PENDING, LocalDate.now()).list();
    }
    
    public List<DevelopmentQuota> findDueSoonQuotas(int daysAhead) {
        LocalDate dueDate = LocalDate.now().plusDays(daysAhead);
        return find("status = ?1 and dueDate <= ?2", QuotaStatus.PENDING, dueDate).list();
    }
    
    public List<DevelopmentQuota> findPendingQuotas() {
        return find("status", QuotaStatus.PENDING).list();
    }
    
    public long countByDevelopmentId(Long developmentId) {
        return count("developmentId", developmentId);
    }
    
    public long countByDevelopmentIdAndStatus(Long developmentId, QuotaStatus status) {
        return count("developmentId = ?1 and status = ?2", developmentId, status);
    }
    
    public long countOverdueByDevelopmentId(Long developmentId) {
        return count("developmentId = ?1 and status = ?2 and dueDate < ?3", 
                    developmentId, QuotaStatus.PENDING, LocalDate.now());
    }
    
    public long countByStatus(QuotaStatus status) {
        return count("status", status);
    }
} 