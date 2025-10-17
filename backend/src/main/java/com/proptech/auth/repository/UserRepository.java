package com.proptech.auth.repository;

import com.proptech.auth.entity.User;
import com.proptech.auth.enums.UserStatus;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class UserRepository implements PanacheRepository<User> {
    
    public Optional<User> findByEmail(String email) {
        return find("email", email).firstResultOptional();
    }
    
    public Optional<User> findByEmailAndStatus(String email, UserStatus status) {
        return find("email = ?1 and status = ?2", email, status).firstResultOptional();
    }
    
    public List<User> findByStatus(UserStatus status) {
        return find("status", status).list();
    }
    
    public List<User> findByUserType(String userType) {
        return find("userType", userType).list();
    }
    
    public List<User> findActiveUsers() {
        return find("status", UserStatus.ACTIVE).list();
    }
    
    public long countByStatus(UserStatus status) {
        return count("status", status);
    }
    
    public long countActiveUsers() {
        return count("status", UserStatus.ACTIVE);
    }
    
    public boolean existsByEmail(String email) {
        return count("email", email) > 0;
    }
    
    public List<User> findByRoleName(String roleName) {
        return find("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.name = ?1", roleName).list();
    }
    
    public List<User> findByPermissionName(String permissionName) {
        return find("SELECT DISTINCT u FROM User u JOIN u.roles r JOIN r.permissions p WHERE p.name = ?1", permissionName).list();
    }
} 