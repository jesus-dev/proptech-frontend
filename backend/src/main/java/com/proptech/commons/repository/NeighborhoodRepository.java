package com.proptech.commons.repository;

import com.proptech.commons.entity.Neighborhood;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class NeighborhoodRepository implements PanacheRepository<Neighborhood> {
} 