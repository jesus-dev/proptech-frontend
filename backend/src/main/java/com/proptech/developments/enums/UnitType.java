package com.proptech.developments.enums;

public enum UnitType {
    LOT("Lote"),
    DEPARTAMENTO("Departamento"),
    HOUSE("Casa"),
    TOWNHOUSE("Casa Adosada"),
    DUPLEX("Dúplex"),
    PENTHOUSE("Penthouse"),
    STUDIO("Estudio"),
    OFFICE("Oficina"),
    COMMERCIAL("Local Comercial"),
    WAREHOUSE("Depósito"),
    PARKING("Estacionamiento"),
    STORAGE("Almacén");
    
    private final String displayName;
    
    UnitType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 