package com.proptech.auth.repository;

import com.proptech.auth.entity.Role;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class RoleRepository implements PanacheRepository<Role> {
    
    public Optional<Role> findByNameOptional(String name) {
        return find("name", name).firstResultOptional();
    }
    
    public Role findByName(String name) {
        return find("name", name).firstResult();
    }
    
    public List<Role> findActiveRoles() {
        return find("active", true).list();
    }
    
    public List<Role> findByActive(Boolean active) {
        return find("active", active).list();
    }
    
    public List<Role> findByPermissionName(String permissionName) {
        return find("SELECT DISTINCT r FROM Role r JOIN r.permissions p WHERE p.name = ?1", permissionName).list();
    }
    
    public boolean existsByName(String name) {
        return count("name", name) > 0;
    }
    
    public long countActiveRoles() {
        return count("active", true);
    }
    
    public boolean isRoleUsedByUsers(Long roleId) {
        return count("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.id = ?1", roleId) > 0;
    }
} 