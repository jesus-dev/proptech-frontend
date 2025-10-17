package com.proptech.commons.repository;

import com.proptech.commons.entity.NearbyFacility;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.math.BigDecimal;
import java.util.List;

@ApplicationScoped
public class NearbyFacilityRepository implements PanacheRepository<NearbyFacility> {
    
    public List<NearbyFacility> findByType(NearbyFacility.FacilityType type) {
        return find("type", type).list();
    }
    
    public List<NearbyFacility> findActive() {
        return find("active", true).list();
    }
    
    public List<NearbyFacility> findByNameContaining(String name) {
        return find("name like ?1", "%" + name + "%").list();
    }
    
    public List<NearbyFacility> findByTypeAndActive(NearbyFacility.FacilityType type, boolean active) {
        return find("type = ?1 and active = ?2", type, active).list();
    }
    
    public List<NearbyFacility> findNearbyFacilities(BigDecimal latitude, BigDecimal longitude, BigDecimal radiusKm) {
        // Esta consulta usa la fórmula de Haversine para calcular distancias
        // Nota: Esta es una implementación básica, para producción se recomienda usar PostGIS
        return find("""
            SELECT nf FROM NearbyFacility nf 
            WHERE nf.latitude IS NOT NULL 
            AND nf.longitude IS NOT NULL 
            AND nf.active = true
            AND (
                6371 * acos(
                    cos(radians(?1)) * cos(radians(nf.latitude)) * 
                    cos(radians(nf.longitude) - radians(?2)) + 
                    sin(radians(?1)) * sin(radians(nf.latitude))
                )
            ) <= ?3
            ORDER BY (
                6371 * acos(
                    cos(radians(?1)) * cos(radians(nf.latitude)) * 
                    cos(radians(nf.longitude) - radians(?2)) + 
                    sin(radians(?1)) * sin(radians(nf.latitude))
                )
            )
            """, latitude, longitude, radiusKm).list();
    }
}
