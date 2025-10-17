package com.proptech.commons.repository;

import com.proptech.commons.entity.Currency;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CurrencyRepository implements PanacheRepository<Currency> {
} 