package com.proptech.auth.enums;

public enum UserStatus {
    ACTIVE("Activo"),
    INACTIVE("Inactivo"),
    SUSPENDED("Suspendido"),
    PENDING_ACTIVATION("Pendiente de Activación"),
    LOCKED("Bloqueado");

    private final String displayName;

    UserStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 