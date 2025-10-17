package com.proptech.developments.enums;

public enum ConstructionStatus {
    NOT_STARTED("not_started", "No Iniciado"),
    IN_PROGRESS("in_progress", "En Progreso"),
    COMPLETED("completed", "Completado"),
    DELAYED("delayed", "Retrasado"),
    ON_HOLD("on_hold", "En Pausa"),
    CANCELLED("cancelled", "Cancelado");
    
    private final String code;
    private final String displayName;
    
    ConstructionStatus(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static ConstructionStatus fromCode(String code) {
        for (ConstructionStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown construction status: " + code);
    }
} 