package com.proptech.developments.enums;

public enum DevelopmentType {
    LOTEAMIENTO("loteamiento", "Loteamiento"),
    EDIFICIO("edificio", "Edificio"),
    CONDOMINIO("condominio", "Condominio"),
    BARRIO_CERRADO("barrio_cerrado", "Barrio Cerrado");
    
    private final String code;
    private final String displayName;
    
    DevelopmentType(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static DevelopmentType fromCode(String code) {
        for (DevelopmentType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown development type: " + code);
    }
} 