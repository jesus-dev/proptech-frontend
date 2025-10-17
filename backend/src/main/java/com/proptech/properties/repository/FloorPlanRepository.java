package com.proptech.properties.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

import com.proptech.properties.entity.FloorPlan;

@ApplicationScoped
public class FloorPlanRepository implements PanacheRepository<FloorPlan> {

    public List<FloorPlan> findByPropertyId(Long propertyId) {
        return find("property.id", propertyId).list();
    }

    public void deleteByPropertyId(Long propertyId) {
        delete("property.id", propertyId);
    }
} 