package com.proptech.contracts.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.proptech.contracts.entity.ContractTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ContractTemplateDTO {
    
    private Long id;
    private String name;
    private String description;
    private String type;
    private String content;
    private List<Map<String, Object>> variables;
    private Boolean isDefault;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private Integer version;

    // Constructors
    public ContractTemplateDTO() {}

    public ContractTemplateDTO(ContractTemplate entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.description = entity.getDescription();
        this.type = entity.getType() != null ? entity.getType().name() : null;
        this.content = entity.getContent();
        this.variables = List.of(); // Variables not implemented in entity yet
        this.isDefault = entity.getIsDefault();
        this.isActive = entity.getIsActive();
        this.createdAt = entity.getCreatedAt();
        this.updatedAt = entity.getUpdatedAt();
        this.createdBy = entity.getCreatedBy();
        this.version = entity.getVersion();
    }

    // Helper method to parse variables JSON string to List
    @SuppressWarnings("unused")
	private List<Map<String, Object>> parseVariables(String variablesJson) {
        if (variablesJson == null || variablesJson.trim().isEmpty()) {
            return List.of();
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(variablesJson, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            System.err.println("Error parsing variables JSON: " + e.getMessage());
            return List.of();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public List<Map<String, Object>> getVariables() { return variables; }
    public void setVariables(List<Map<String, Object>> variables) { this.variables = variables; }

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
} 