package com.proptech.developments.enums;

public enum QuotaType {
    INITIAL("Cuota Inicial"),
    MONTHLY("Cuota Mensual"),
    QUARTERLY("Cuota Trimestral"),
    ANNUAL("Cuota Anual"),
    FINAL("Cuota Final"),
    SPECIAL("Cuota Especial"),
    MAINTENANCE("Mantenimiento"),
    INSURANCE("Seguro"),
    TAXES("Impuestos");
    
    private final String displayName;
    
    QuotaType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 