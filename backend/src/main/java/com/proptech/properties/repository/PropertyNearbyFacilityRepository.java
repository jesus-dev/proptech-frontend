package com.proptech.properties.repository;

import com.proptech.properties.entity.PropertyNearbyFacility;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class PropertyNearbyFacilityRepository implements PanacheRepository<PropertyNearbyFacility> {
    
    public List<PropertyNearbyFacility> findByPropertyId(Long propertyId) {
        return find("property.id", propertyId).list();
    }
    
    public List<PropertyNearbyFacility> findByNearbyFacilityId(Long nearbyFacilityId) {
        return find("nearbyFacility.id", nearbyFacilityId).list();
    }
    
    public List<PropertyNearbyFacility> findFeaturedByPropertyId(Long propertyId) {
        return find("property.id = ?1 and isFeatured = true", propertyId).list();
    }
    
    public PropertyNearbyFacility findByPropertyAndFacility(Long propertyId, Long nearbyFacilityId) {
        return find("property.id = ?1 and nearbyFacility.id = ?2", propertyId, nearbyFacilityId).firstResult();
    }
    
    public List<PropertyNearbyFacility> findByPropertyIdAndType(Long propertyId, String facilityType) {
        return find("""
            SELECT pnf FROM PropertyNearbyFacility pnf 
            JOIN pnf.nearbyFacility nf 
            WHERE pnf.property.id = ?1 
            AND nf.type = ?2
            """, propertyId, facilityType).list();
    }
}
