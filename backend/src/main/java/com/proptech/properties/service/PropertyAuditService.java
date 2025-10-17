package com.proptech.properties.service;

import java.time.LocalDateTime;
import java.util.List;

import com.proptech.auth.entity.User;
import com.proptech.properties.entity.Property;
import com.proptech.properties.entity.PropertyAuditLog;
import com.proptech.properties.entity.PropertyAuditLog.AuditAction;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class PropertyAuditService {

    @Inject
    EntityManager entityManager;

    /**
     * Registra la creación de una nueva propiedad
     */
    @Transactional
    public void logPropertyCreation(Property property, User createdBy) {
        PropertyAuditLog log = new PropertyAuditLog(property, AuditAction.CREATE, createdBy);
        log.setAdditionalInfo("Propiedad creada: " + property.getTitle());
        entityManager.persist(log);
    }

    /**
     * Registra la actualización de una propiedad
     */
    @Transactional
    public void logPropertyUpdate(Property property, User modifiedBy, String fieldName, String oldValue, String newValue) {
        PropertyAuditLog log = new PropertyAuditLog(property, AuditAction.UPDATE, modifiedBy, fieldName, oldValue, newValue);
        entityManager.persist(log);
    }

    /**
     * Registra la eliminación de una propiedad
     */
    @Transactional
    public void logPropertyDeletion(Property property, User deletedBy) {
        PropertyAuditLog log = new PropertyAuditLog(property, AuditAction.DELETE, deletedBy);
        log.setAdditionalInfo("Propiedad eliminada: " + property.getTitle());
        entityManager.persist(log);
    }

    /**
     * Registra cambios de estado (publicar/despublicar)
     */
    @Transactional
    public void logPropertyStatusChange(Property property, User changedBy, String oldStatus, String newStatus) {
        PropertyAuditLog log = new PropertyAuditLog(property, AuditAction.UPDATE, changedBy, "status", oldStatus, newStatus);
        log.setAdditionalInfo("Estado cambiado de " + oldStatus + " a " + newStatus);
        entityManager.persist(log);
    }

    /**
     * Registra cambios de featured
     */
    @Transactional
    public void logFeaturedChange(Property property, User changedBy, boolean oldFeatured, boolean newFeatured) {
        AuditAction action = newFeatured ? AuditAction.FEATURE : AuditAction.UNFEATURE;
        PropertyAuditLog log = new PropertyAuditLog(property, action, changedBy);
        log.setFieldName("featured");
        log.setOldValue(String.valueOf(oldFeatured));
        log.setNewValue(String.valueOf(newFeatured));
        entityManager.persist(log);
    }

    /**
     * Obtiene el historial completo de una propiedad
     */
    public List<PropertyAuditLog> getPropertyAuditHistory(Long propertyId) {
        return PropertyAuditLog.find("property.id = ?1 ORDER BY changedAt DESC", propertyId).list();
    }

    /**
     * Obtiene el historial de auditoría por usuario
     */
    public List<PropertyAuditLog> getAuditHistoryByUser(Long userId) {
        return PropertyAuditLog.find("changedBy.id = ?1 ORDER BY changedAt DESC", userId).list();
    }

    /**
     * Obtiene el historial de auditoría por rango de fechas
     */
    public List<PropertyAuditLog> getAuditHistoryByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return PropertyAuditLog.find("changedAt BETWEEN ?1 AND ?2 ORDER BY changedAt DESC", startDate, endDate).list();
    }

    /**
     * Obtiene el historial de auditoría por tipo de acción
     */
    public List<PropertyAuditLog> getAuditHistoryByAction(AuditAction action) {
        return PropertyAuditLog.find("action = ?1 ORDER BY changedAt DESC", action).list();
    }

    /**
     * Obtiene el último cambio realizado en una propiedad
     */
    public PropertyAuditLog getLastPropertyChange(Long propertyId) {
        return PropertyAuditLog.find("property.id = ?1 ORDER BY changedAt DESC", propertyId).firstResult();
    }

    /**
     * Obtiene quién creó la propiedad
     */
    public PropertyAuditLog getPropertyCreator(Long propertyId) {
        return PropertyAuditLog.find("property.id = ?1 AND action = ?2 ORDER BY changedAt ASC", propertyId, AuditAction.CREATE).firstResult();
    }

    /**
     * Obtiene quién modificó la propiedad por última vez
     */
    public PropertyAuditLog getLastPropertyModifier(Long propertyId) {
        return PropertyAuditLog.find("property.id = ?1 AND action = ?2 ORDER BY changedAt DESC", propertyId, AuditAction.UPDATE).firstResult();
    }
} 