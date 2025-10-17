package com.proptech.commons.repository;

import com.proptech.commons.entity.Visit;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class VisitRepository implements PanacheRepository<Visit> {
} 