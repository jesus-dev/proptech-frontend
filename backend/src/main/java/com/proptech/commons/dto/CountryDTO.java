package com.proptech.commons.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public class CountryDTO {
    public String name;
    public String code;

    public CountryDTO() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
} 