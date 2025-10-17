package com.proptech.auth.enums;

public enum UserType {
    ADMIN("Administrador"),
    MANAGER("Gerente"),
    AGENT("Agente"),
    VIEWER("Visualizador"),
    CUSTOMER("Cliente");

    private final String displayName;

    UserType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 