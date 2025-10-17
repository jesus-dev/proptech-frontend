package com.proptech.commons.repository;

import com.proptech.properties.entity.Service;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ServiceRepository implements PanacheRepository<Service> {
} 