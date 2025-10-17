package com.proptech.properties.service;

import java.util.List;
import java.util.Optional;

import com.proptech.commons.repository.ServiceRepository;
import com.proptech.properties.entity.Service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
public class ServiceService {

    @Inject
    ServiceRepository serviceRepository;

    public List<Service> listAll() {
        return serviceRepository.listAll();
    }

    public Optional<Service> findById(Long id) {
        Service service = serviceRepository.findById(id);
        return Optional.ofNullable(service);
    }

    @Transactional
    public Service create(Service service) {
        if (service.getActive() == null) {
            service.setActive(true);
        }
        serviceRepository.persist(service);
        return service;
    }

    @Transactional
    public Service update(Long id, Service serviceData) {
        Service service = serviceRepository.findById(id);
        if (service == null) {
            throw new NotFoundException("Service not found");
        }

        service.setName(serviceData.getName());
        service.setDescription(serviceData.getDescription());
        service.setType(serviceData.getType());
        service.setIncludedInRent(serviceData.getIncludedInRent());
        service.setIncludedInSale(serviceData.getIncludedInSale());
        service.setActive(serviceData.getActive());

        return service;
    }

    @Transactional
    public void delete(Long id) {
        Service service = serviceRepository.findById(id);
        if (service == null) {
            throw new NotFoundException("Service not found");
        }
        serviceRepository.delete(service);
    }
} 