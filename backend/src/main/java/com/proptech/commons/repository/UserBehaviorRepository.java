package com.proptech.commons.repository;

import com.proptech.commons.entity.UserBehavior;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UserBehaviorRepository implements PanacheRepository<UserBehavior> {
    // Basic CRUD operations are provided by PanacheRepository
} 