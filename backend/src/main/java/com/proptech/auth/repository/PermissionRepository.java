package com.proptech.auth.repository;

import com.proptech.auth.entity.Permission;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class PermissionRepository implements PanacheRepository<Permission> {
    
    public Optional<Permission> findByNameOptional(String name) {
        return find("name", name).firstResultOptional();
    }
    
    public Permission findByName(String name) {
        return find("name", name).firstResult();
    }
    
    public List<Permission> findByActive(Boolean active) {
        return find("active", active).list();
    }
    
    public List<Permission> findByResource(String resource) {
        return find("resource", resource).list();
    }
    
    public List<Permission> findByAction(String action) {
        return find("action", action).list();
    }
    
    public List<Permission> findByResourceAndAction(String resource, String action) {
        return find("resource = ?1 and action = ?2", resource, action).list();
    }
    
    public List<Permission> findActivePermissions() {
        return find("active", true).list();
    }
    
    public boolean existsByName(String name) {
        return count("name", name) > 0;
    }
    
    public long countByActive(Boolean active) {
        return count("active", active);
    }
    
    public long countByResource(String resource) {
        return count("resource", resource);
    }
    
    public boolean isPermissionUsedByRoles(Long permissionId) {
        return count("SELECT COUNT(r) FROM Role r JOIN r.permissions p WHERE p.id = ?1", permissionId) > 0;
    }
    
    public List<Permission> findByCategory(String category) {
        return find("category", category).list();
    }
    
    public List<String> findDistinctCategories() {
        return find("SELECT DISTINCT p.category FROM Permission p WHERE p.category IS NOT NULL").project(String.class).list();
    }
} 