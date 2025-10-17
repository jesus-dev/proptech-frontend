package com.proptech.contracts.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

import com.proptech.contracts.entity.ContractTemplate;

@ApplicationScoped
public class ContractTemplateRepository implements PanacheRepository<ContractTemplate> {
    
    public List<ContractTemplate> findByType(ContractTemplate.TemplateType type) {
        return find("type", type).list();
    }
    
    public List<ContractTemplate> findByIsDefault(Boolean isDefault) {
        return find("isDefault", isDefault).list();
    }
    
    public List<ContractTemplate> findByIsActive(Boolean isActive) {
        return find("isActive", isActive).list();
    }
    
    public List<ContractTemplate> findByTypeAndIsDefault(ContractTemplate.TemplateType type, Boolean isDefault) {
        return find("type = ?1 and isDefault = ?2", type, isDefault).list();
    }
    
    public List<ContractTemplate> findByTypeAndIsActive(ContractTemplate.TemplateType type, Boolean isActive) {
        return find("type = ?1 and isActive = ?2", type, isActive).list();
    }
    
    public ContractTemplate findDefaultByType(ContractTemplate.TemplateType type) {
        return find("type = ?1 and isDefault = ?2", type, true).firstResult();
    }
    
    public List<ContractTemplate> searchByName(String searchTerm) {
        return find("name like ?1", "%" + searchTerm + "%").list();
    }
    
    public List<ContractTemplate> findAllActive() {
        return find("isActive", true).list();
    }
    
    public List<ContractTemplate> findAllDefaults() {
        return find("isDefault", true).list();
    }
    
    public List<ContractTemplate> findDefaultTemplates() {
        return find("isDefault", true).list();
    }
    
    public boolean existsByNameAndType(String name, ContractTemplate.TemplateType type) {
        return count("name = ?1 and type = ?2", name, type) > 0;
    }
    
    public boolean existsByNameAndTypeAndIdNot(String name, ContractTemplate.TemplateType type, Long id) {
        return count("name = ?1 and type = ?2 and id != ?3", name, type, id) > 0;
    }
} 