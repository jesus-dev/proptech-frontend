package com.proptech.developments.enums;

public enum ReservationStatus {
    PENDING("Pendiente"),
    CONFIRMED("Confirmada"),
    CANCELLED("Cancelada"),
    EXPIRED("Vencida"),
    CONVERTED("Convertida a Venta"),
    REFUNDED("Reembolsada");
    
    private final String displayName;
    
    ReservationStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 