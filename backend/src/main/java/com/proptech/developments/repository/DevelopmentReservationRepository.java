package com.proptech.developments.repository;

import java.time.LocalDate;
import java.util.List;

import com.proptech.developments.entity.DevelopmentReservation;
import com.proptech.developments.enums.ReservationStatus;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DevelopmentReservationRepository implements PanacheRepository<DevelopmentReservation> {
    
    public List<DevelopmentReservation> findByDevelopmentId(Long developmentId) {
        return find("developmentId", developmentId).list();
    }
    
    public List<DevelopmentReservation> findByDevelopmentIdAndStatus(Long developmentId, ReservationStatus status) {
        return find("developmentId = ?1 and status = ?2", developmentId, status).list();
    }
    
    public List<DevelopmentReservation> findByUnitId(Long unitId) {
        return find("unitId", unitId).list();
    }
    
    public List<DevelopmentReservation> findByStatus(ReservationStatus status) {
        return find("status", status).list();
    }
    
    public List<DevelopmentReservation> findByClientEmail(String clientEmail) {
        return find("clientEmail", clientEmail).list();
    }
    
    public List<DevelopmentReservation> findByClientDocument(String clientDocument) {
        return find("clientDocument", clientDocument).list();
    }
    
    public List<DevelopmentReservation> findExpiredReservations() {
        return find("status = ?1 and expirationDate < ?2", ReservationStatus.PENDING, LocalDate.now()).list();
    }
    
    public List<DevelopmentReservation> findExpiringSoonReservations(int daysAhead) {
        LocalDate expirationDate = LocalDate.now().plusDays(daysAhead);
        return find("status = ?1 and expirationDate <= ?2", ReservationStatus.PENDING, expirationDate).list();
    }
    
    public List<DevelopmentReservation> findPendingReservations() {
        return find("status", ReservationStatus.PENDING).list();
    }
    
    public List<DevelopmentReservation> findByAgentId(String agentId) {
        return find("agentId", agentId).list();
    }
    
    public long countByDevelopmentId(Long developmentId) {
        return count("developmentId", developmentId);
    }
    
    public long countByDevelopmentIdAndStatus(Long developmentId, ReservationStatus status) {
        return count("developmentId = ?1 and status = ?2", developmentId, status);
    }
    
    public long countExpiredByDevelopmentId(Long developmentId) {
        return count("developmentId = ?1 and status = ?2 and expirationDate < ?3", 
                    developmentId, ReservationStatus.PENDING, LocalDate.now());
    }
    
    public long countPendingByDevelopmentId(Long developmentId) {
        return count("developmentId = ?1 and status = ?2", developmentId, ReservationStatus.PENDING);
    }
} 