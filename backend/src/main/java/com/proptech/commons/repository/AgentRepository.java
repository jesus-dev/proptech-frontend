package com.proptech.commons.repository;

import com.proptech.commons.entity.Agent;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class AgentRepository implements PanacheRepository<Agent> {
    
    public Agent findByEmail(String email) {
        return find("email", email).firstResult();
    }
    
    public Agent findByUserId(Long userId) {
        return find("user.id", userId).firstResult();
    }
    
    public boolean existsByEmail(String email) {
        return count("email", email) > 0;
    }
} 