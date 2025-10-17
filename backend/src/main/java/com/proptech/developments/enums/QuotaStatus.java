package com.proptech.developments.enums;

public enum QuotaStatus {
    PENDING("Pendiente"),
    PAID("Pagado"),
    OVERDUE("Vencido"),
    CANCELLED("Cancelado"),
    PARTIAL("Pago Parcial"),
    REFUNDED("Reembolsado");
    
    private final String displayName;
    
    QuotaStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 