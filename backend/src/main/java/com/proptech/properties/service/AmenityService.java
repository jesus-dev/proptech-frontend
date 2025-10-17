package com.proptech.properties.service;

import java.util.List;
import java.util.Optional;

import com.proptech.commons.repository.AmenityRepository;
import com.proptech.properties.entity.Amenity;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
public class AmenityService {

    @Inject
    AmenityRepository amenityRepository;

    public List<Amenity> listAll() {
        return amenityRepository.listAll();
    }

    public Optional<Amenity> findById(Long id) {
        Amenity amenity = amenityRepository.findById(id);
        return Optional.ofNullable(amenity);
    }

    public List<Amenity> findByName(String name) {
        return amenityRepository.findByName(name);
    }

    @Transactional
    public Amenity create(Amenity amenity) {
        if (amenity.getActive() == null) {
            amenity.setActive(true);
        }
        amenityRepository.persist(amenity);
        return amenity;
    }

    @Transactional
    public Amenity update(Long id, Amenity amenityData) {
        Amenity amenity = amenityRepository.findById(id);
        if (amenity == null) {
            throw new NotFoundException("Amenity not found");
        }

        amenity.setName(amenityData.getName());
        amenity.setDescription(amenityData.getDescription());
        amenity.setIcon(amenityData.getIcon());
        amenity.setCategory(amenityData.getCategory());
        amenity.setActive(amenityData.getActive());

        return amenity;
    }

    @Transactional
    public void delete(Long id) {
        Amenity amenity = amenityRepository.findById(id);
        if (amenity == null) {
            throw new NotFoundException("Amenity not found");
        }
        amenityRepository.delete(amenity);
    }
} 