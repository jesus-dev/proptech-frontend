package com.proptech.developments.enums;

public enum Currency {
    PYG("PYG", "Guaraníes", "₲"),
    USD("USD", "Dólares", "$"),
    EUR("EUR", "Euros", "€"),
    ARS("ARS", "Pesos Argentinos", "$"),
    BRL("BRL", "Reales Brasileños", "R$");
    
    private final String code;
    private final String displayName;
    private final String symbol;
    
    Currency(String code, String displayName, String symbol) {
        this.code = code;
        this.displayName = displayName;
        this.symbol = symbol;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getSymbol() {
        return symbol;
    }
    
    public static Currency fromCode(String code) {
        for (Currency currency : values()) {
            if (currency.code.equals(code)) {
                return currency;
            }
        }
        throw new IllegalArgumentException("Unknown currency: " + code);
    }
} 