package com.proptech.properties.service;

import jakarta.enterprise.context.ApplicationScoped;
import com.proptech.properties.entity.PropertyStatus;
import com.proptech.properties.repository.PropertyStatusRepository;
import jakarta.inject.Inject;
import java.util.List;

@ApplicationScoped
public class PropertyStatusHelper {

    @Inject
    PropertyStatusRepository propertyStatusRepository;

    // Códigos internos del sistema
    public static final String ACTIVE_CODE = "ACTIVE";
    public static final String PENDING_CODE = "PENDING";
    public static final String SOLD_CODE = "SOLD";
    public static final String RENTED_CODE = "RENTED";
    public static final String RESERVED_CODE = "RESERVED";
    public static final String INACTIVE_CODE = "INACTIVE";
    public static final String FOR_SALE_CODE = "FOR_SALE";
    public static final String FOR_RENT_CODE = "FOR_RENT";

    // Verificar si un status es activo usando código interno
    public boolean isActiveStatus(String statusCode) {
        return ACTIVE_CODE.equalsIgnoreCase(statusCode) || 
               FOR_SALE_CODE.equalsIgnoreCase(statusCode) || 
               FOR_RENT_CODE.equalsIgnoreCase(statusCode);
    }

    // Verificar si un status es pendiente usando código interno
    public boolean isPendingStatus(String statusCode) {
        return PENDING_CODE.equalsIgnoreCase(statusCode);
    }

    // Verificar si un status es vendido usando código interno
    public boolean isSoldStatus(String statusCode) {
        return SOLD_CODE.equalsIgnoreCase(statusCode);
    }

    // Verificar si un status es alquilado usando código interno
    public boolean isRentedStatus(String statusCode) {
        return RENTED_CODE.equalsIgnoreCase(statusCode);
    }

    // Verificar si un status está disponible para el público
    public boolean isPubliclyAvailable(String statusCode) {
        return isActiveStatus(statusCode);
    }

    // Obtener el código interno por nombre (para compatibilidad)
    public String getStatusCodeByName(String statusName) {
        if (statusName == null) return ACTIVE_CODE;
        
        switch (statusName.toLowerCase()) {
            case "activo":
            case "disponible":
                return ACTIVE_CODE;
            case "pendiente":
                return PENDING_CODE;
            case "vendida":
                return SOLD_CODE;
            case "alquilada":
                return RENTED_CODE;
            case "reservada":
                return RESERVED_CODE;
            case "inactiva":
            case "no disponible":
                return INACTIVE_CODE;
            case "en venta":
                return FOR_SALE_CODE;
            case "en alquiler":
                return FOR_RENT_CODE;
            default:
                return ACTIVE_CODE;
        }
    }

    // Obtener status del sistema por código
    public PropertyStatus getSystemStatusByCode(String code) {
        return propertyStatusRepository.find("code", code).firstResult();
    }

    // Obtener todos los status activos del sistema
    public List<PropertyStatus> getActiveSystemStatuses() {
        return propertyStatusRepository.find("isSystem = true and active = true").list();
    }
} 