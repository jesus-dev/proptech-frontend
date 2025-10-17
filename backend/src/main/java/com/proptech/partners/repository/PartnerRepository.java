package com.proptech.partners.repository;

import com.proptech.partners.entity.Partner;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PartnerRepository implements PanacheRepository<Partner> {
} 