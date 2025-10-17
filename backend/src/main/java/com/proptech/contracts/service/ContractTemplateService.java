package com.proptech.contracts.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.proptech.contracts.entity.ContractTemplate;
import com.proptech.contracts.repository.ContractTemplateRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
public class ContractTemplateService {
    
    @Inject
    ContractTemplateRepository templateRepository;
    
    public List<ContractTemplate> listAll() {
        return templateRepository.listAll();
    }
    
    public List<ContractTemplate> listActive() {
        return templateRepository.findByIsActive(true);
    }
    
    public List<ContractTemplate> findByType(ContractTemplate.TemplateType type) {
        return templateRepository.findByTypeAndIsActive(type, true);
    }
    
    public List<ContractTemplate> findDefaultTemplates() {
        return templateRepository.findDefaultTemplates();
    }
    
    public Optional<ContractTemplate> findDefaultByType(ContractTemplate.TemplateType type) {
        return Optional.ofNullable(templateRepository.findDefaultByType(type));
    }
    
    public ContractTemplate findById(Long id) {
        return templateRepository.findByIdOptional(id)
                .orElseThrow(() -> new NotFoundException("Template not found with id: " + id));
    }
    
    @Transactional
    public ContractTemplate create(ContractTemplate template) {
        // Validate unique name and type combination
        if (templateRepository.existsByNameAndType(template.getName(), template.getType())) {
            throw new IllegalArgumentException("Template with name '" + template.getName() + 
                                             "' and type '" + template.getType() + "' already exists");
        }
        
        // If this is set as default, unset other defaults of the same type
        if (Boolean.TRUE.equals(template.getIsDefault())) {
            unsetOtherDefaults(template.getType());
        }
        
        template.setCreatedAt(LocalDateTime.now());
        templateRepository.persist(template);
        return template;
    }
    
    @Transactional
    public ContractTemplate update(Long id, ContractTemplate template) {
        ContractTemplate existing = findById(id);
        
        // Validate unique name and type combination (excluding current template)
        if (templateRepository.existsByNameAndTypeAndIdNot(template.getName(), template.getType(), id)) {
            throw new IllegalArgumentException("Template with name '" + template.getName() + 
                                             "' and type '" + template.getType() + "' already exists");
        }
        
        // If this is set as default, unset other defaults of the same type
        if (Boolean.TRUE.equals(template.getIsDefault())) {
            unsetOtherDefaults(template.getType());
        }
        
        // Update fields
        existing.setName(template.getName());
        existing.setDescription(template.getDescription());
        existing.setType(template.getType());
        existing.setContent(template.getContent());
        existing.setIsDefault(template.getIsDefault());
        existing.setIsActive(template.getIsActive());
        existing.setVersion(existing.getVersion() + 1);
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(template.getUpdatedBy());
        
        return existing;
    }
    
    @Transactional
    public boolean delete(Long id) {
        return templateRepository.deleteById(id);
    }
    
    @Transactional
    public ContractTemplate duplicate(Long id, String newName) {
        ContractTemplate original = findById(id);
        
        ContractTemplate duplicate = new ContractTemplate();
        duplicate.setName(newName);
        duplicate.setDescription(original.getDescription() + " (Copia)");
        duplicate.setType(original.getType());
        duplicate.setContent(original.getContent());
        duplicate.setIsDefault(false); // Duplicates are never default
        duplicate.setIsActive(true);
        duplicate.setVersion(1);
        duplicate.setCreatedBy(original.getCreatedBy());
        
        return create(duplicate);
    }
    
    public String generateContract(Long templateId, java.util.Map<String, Object> data) {
        ContractTemplate template = findById(templateId);
        String content = template.getContent();
        
        // Simple variable replacement
        for (java.util.Map.Entry<String, Object> entry : data.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String value = entry.getValue() != null ? entry.getValue().toString() : "";
            content = content.replace(placeholder, value);
        }
        
        return content;
    }
    
    private void unsetOtherDefaults(ContractTemplate.TemplateType type) {
        List<ContractTemplate> existingDefaults = templateRepository.findByTypeAndIsActive(type, true);
        for (ContractTemplate existing : existingDefaults) {
            if (Boolean.TRUE.equals(existing.getIsDefault())) {
                existing.setIsDefault(false);
                existing.setUpdatedAt(LocalDateTime.now());
            }
        }
    }
} 