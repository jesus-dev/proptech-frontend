package com.proptech.developments.enums;

public enum UnitStatus {
    AVAILABLE("Disponible"),
    RESERVED("Reservado"),
    SOLD("Vendido"),
    UNDER_CONSTRUCTION("En Construcción"),
    DELIVERED("Entregado"),
    RENTED("Alquilado"),
    MAINTENANCE("En Mantenimiento"),
    UNAVAILABLE("No Disponible");
    
    private final String displayName;
    
    UnitStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 