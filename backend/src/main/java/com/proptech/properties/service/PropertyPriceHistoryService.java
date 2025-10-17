package com.proptech.properties.service;

import com.proptech.properties.dto.PropertyPriceHistoryDTO;
import com.proptech.properties.entity.Property;
import com.proptech.properties.entity.PropertyPriceHistory;
import com.proptech.properties.repository.PropertyRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ApplicationScoped
public class PropertyPriceHistoryService {
    
    private static final Logger LOG = Logger.getLogger(PropertyPriceHistoryService.class);
    
    @Inject
    PropertyRepository propertyRepository;
    
    /**
     * Obtener historial de precios de una propiedad
     */
    public List<PropertyPriceHistoryDTO> getPriceHistory(Long propertyId) {
        LOG.info("Obteniendo historial de precios para propiedad: " + propertyId);
        
        List<PropertyPriceHistory> history = PropertyPriceHistory.find(
            "property.id = ?1 AND isActive = true ORDER BY date DESC", 
            propertyId
        ).list();
        
        return history.stream()
            .map(PropertyPriceHistoryDTO::new)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtener historial de precios con filtros
     */
    public List<PropertyPriceHistoryDTO> getPriceHistoryWithFilters(
            Long propertyId, 
            LocalDate startDate, 
            LocalDate endDate,
            PropertyPriceHistory.PriceChangeReason reason,
            String source) {
        
        LOG.info("Obteniendo historial de precios con filtros para propiedad: " + propertyId);
        
        StringBuilder query = new StringBuilder("property.id = ?1 AND isActive = true");
        List<Object> params = List.of(propertyId);
        
        if (startDate != null) {
            query.append(" AND date >= ?").append(params.size() + 1);
            params = List.of(propertyId, startDate);
        }
        
        if (endDate != null) {
            query.append(" AND date <= ?").append(params.size() + 1);
            params = List.of(propertyId, startDate, endDate);
        }
        
        if (reason != null) {
            query.append(" AND reason = ?").append(params.size() + 1);
            params = List.of(propertyId, startDate, endDate, reason);
        }
        
        if (source != null && !source.trim().isEmpty()) {
            query.append(" AND source LIKE ?").append(params.size() + 1);
            params = List.of(propertyId, startDate, endDate, reason, "%" + source + "%");
        }
        
        query.append(" ORDER BY date DESC");
        
        List<PropertyPriceHistory> history = PropertyPriceHistory.find(query.toString(), params.toArray()).list();
        
        return history.stream()
            .map(PropertyPriceHistoryDTO::new)
            .collect(Collectors.toList());
    }
    
    /**
     * Crear nuevo registro de historial de precios
     */
    @Transactional
    public PropertyPriceHistoryDTO createPriceHistory(Long propertyId, BigDecimal price, 
            PropertyPriceHistory.PriceChangeReason reason, String source, String notes, String createdBy) {
        
        LOG.info("Creando nuevo registro de historial para propiedad: " + propertyId);
        
        Property property = propertyRepository.findById(propertyId);
        if (property == null) {
            throw new IllegalArgumentException("Propiedad no encontrada: " + propertyId);
        }
        
        // Obtener el último precio registrado
        PropertyPriceHistory lastRecord = PropertyPriceHistory.find(
            "property.id = ?1 AND isActive = true ORDER BY date DESC", 
            propertyId
        ).firstResult();
        
        BigDecimal previousPrice = lastRecord != null ? lastRecord.getPrice() : property.getPrice();
        BigDecimal changeAmount = price.subtract(previousPrice);
        BigDecimal changePercent = previousPrice.compareTo(BigDecimal.ZERO) > 0 
            ? changeAmount.divide(previousPrice, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
            : BigDecimal.ZERO;
        
        PropertyPriceHistory newRecord = new PropertyPriceHistory();
        newRecord.setProperty(property);
        newRecord.setDate(LocalDate.now());
        newRecord.setPrice(price);
        newRecord.setPreviousPrice(previousPrice);
        newRecord.setChangeAmount(changeAmount);
        newRecord.setChangePercent(changePercent);
        newRecord.setReason(reason);
        newRecord.setSource(source);
        newRecord.setNotes(notes);
        newRecord.setCreatedBy(createdBy);
        newRecord.setIsActive(true);
        
        newRecord.persist();
        
        LOG.info("Registro de historial creado exitosamente: " + newRecord.getId());
        
        return new PropertyPriceHistoryDTO(newRecord);
    }
    
    /**
     * Actualizar precio de una propiedad y crear registro de historial
     */
    @Transactional
    public PropertyPriceHistoryDTO updatePropertyPrice(Long propertyId, BigDecimal newPrice, 
            PropertyPriceHistory.PriceChangeReason reason, String source, String notes, String updatedBy) {
        
        LOG.info("Actualizando precio de propiedad: " + propertyId + " a: " + newPrice);
        
        Property property = propertyRepository.findById(propertyId);
        if (property == null) {
            throw new IllegalArgumentException("Propiedad no encontrada: " + propertyId);
        }
        
        BigDecimal oldPrice = property.getPrice();
        
        // Actualizar precio de la propiedad
        property.setPrice(newPrice);
        property.persist();
        
        // Crear registro de historial
        PropertyPriceHistoryDTO historyRecord = createPriceHistory(
            propertyId, newPrice, reason, source, notes, updatedBy
        );
        
        LOG.info("Precio actualizado y historial creado exitosamente");
        
        return historyRecord;
    }
    
    /**
     * Obtener estadísticas de precios
     */
    public Map<String, Object> getPriceStatistics(Long propertyId) {
        LOG.info("Obteniendo estadísticas de precios para propiedad: " + propertyId);
        
        List<PropertyPriceHistory> history = PropertyPriceHistory.find(
            "property.id = ?1 AND isActive = true ORDER BY date DESC", 
            propertyId
        ).list();
        
        if (history.isEmpty()) {
            return Map.of(
                "averagePrice", BigDecimal.ZERO,
                "maxPrice", BigDecimal.ZERO,
                "minPrice", BigDecimal.ZERO,
                "totalRecords", 0,
                "priceTrend", "stable"
            );
        }
        
        BigDecimal averagePrice = history.stream()
            .map(PropertyPriceHistory::getPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .divide(BigDecimal.valueOf(history.size()), 2, RoundingMode.HALF_UP);
        
        BigDecimal maxPrice = history.stream()
            .map(PropertyPriceHistory::getPrice)
            .max(BigDecimal::compareTo)
            .orElse(BigDecimal.ZERO);
        
        BigDecimal minPrice = history.stream()
            .map(PropertyPriceHistory::getPrice)
            .min(BigDecimal::compareTo)
            .orElse(BigDecimal.ZERO);
        
        // Calcular tendencia basada en los últimos 3 registros
        String priceTrend = "stable";
        if (history.size() >= 2) {
            BigDecimal recentChange = history.get(0).getChangeAmount();
            if (recentChange.compareTo(BigDecimal.valueOf(1000000)) > 0) {
                priceTrend = "up";
            } else if (recentChange.compareTo(BigDecimal.valueOf(-1000000)) < 0) {
                priceTrend = "down";
            }
        }
        
        return Map.of(
            "averagePrice", averagePrice,
            "maxPrice", maxPrice,
            "minPrice", minPrice,
            "totalRecords", history.size(),
            "priceTrend", priceTrend
        );
    }
    
    /**
     * Eliminar registro de historial (soft delete)
     */
    @Transactional
    public void deletePriceHistory(Long historyId, String deletedBy) {
        LOG.info("Eliminando registro de historial: " + historyId);
        
        PropertyPriceHistory record = PropertyPriceHistory.findById(historyId);
        if (record != null) {
            record.setIsActive(false);
            record.setUpdatedBy(deletedBy);
            record.persist();
            
            LOG.info("Registro de historial eliminado exitosamente");
        }
    }
}
