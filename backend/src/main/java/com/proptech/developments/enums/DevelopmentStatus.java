package com.proptech.developments.enums;

public enum DevelopmentStatus {
    AVAILABLE("available", "Disponible"),
    SOLD("sold", "Vendido"),
    RESERVED("reserved", "Reservado"),
    UNDER_CONSTRUCTION("under_construction", "En Construcción"),
    PLANNING("planning", "En Planificación"),
    COMPLETED("completed", "Completado"),
    CANCELLED("cancelled", "Cancelado");
    
    private final String code;
    private final String displayName;
    
    DevelopmentStatus(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static DevelopmentStatus fromCode(String code) {
        for (DevelopmentStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown development status: " + code);
    }
} 