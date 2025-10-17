package com.proptech.commons.repository;

import com.proptech.commons.entity.Country;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CountryRepository implements PanacheRepository<Country> {
}
 