package com.proptech.commons.service;

import com.proptech.commons.entity.Country;
import com.proptech.commons.repository.CountryRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
public class CountryService {

    @Inject
    CountryRepository countryRepository;

    public List<Country> findAll() {
        return countryRepository.listAll();
    }

    public Country findById(Long id) {
        Country country = countryRepository.findById(id);
        if (country == null) {
            throw new NotFoundException("Country not found with id: " + id);
        }
        return country;
    }

    @Transactional
    public Country create(Country country) {
        countryRepository.persist(country);
        return country;
    }

    @Transactional
    public Country update(Long id, Country countryData) {
        Country country = findById(id);
        country.setName(countryData.getName());
        country.setCode(countryData.getCode());
        return country;
    }

    @Transactional
    public boolean delete(Long id) {
        return countryRepository.deleteById(id);
    }
} 