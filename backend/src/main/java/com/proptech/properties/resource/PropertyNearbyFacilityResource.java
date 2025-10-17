package com.proptech.properties.resource;

import com.proptech.properties.entity.PropertyNearbyFacility;
import com.proptech.properties.repository.PropertyNearbyFacilityRepository;
import com.proptech.properties.repository.PropertyRepository;
import com.proptech.commons.repository.NearbyFacilityRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Path("/api/properties/{propertyId}/nearby-facilities")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PropertyNearbyFacilityResource {
    
    @Inject
    PropertyNearbyFacilityRepository propertyNearbyFacilityRepository;
    
    @Inject
    PropertyRepository propertyRepository;
    
    @Inject
    NearbyFacilityRepository nearbyFacilityRepository;
    
    @GET
    public Response getPropertyNearbyFacilities(@PathParam("propertyId") Long propertyId) {
        try {
            List<PropertyNearbyFacility> facilities = propertyNearbyFacilityRepository.findByPropertyId(propertyId);
            return Response.ok(facilities).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al obtener facilidades cercanas de la propiedad: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/featured")
    public Response getFeaturedPropertyNearbyFacilities(@PathParam("propertyId") Long propertyId) {
        try {
            List<PropertyNearbyFacility> facilities = propertyNearbyFacilityRepository.findFeaturedByPropertyId(propertyId);
            return Response.ok(facilities).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al obtener facilidades destacadas: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/type/{type}")
    public Response getPropertyNearbyFacilitiesByType(
            @PathParam("propertyId") Long propertyId,
            @PathParam("type") String type) {
        try {
            List<PropertyNearbyFacility> facilities = propertyNearbyFacilityRepository.findByPropertyIdAndType(propertyId, type);
            return Response.ok(facilities).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al obtener facilidades por tipo: " + e.getMessage()))
                    .build();
        }
    }
    
    @POST
    @Transactional
    public Response addNearbyFacilityToProperty(
            @PathParam("propertyId") Long propertyId,
            PropertyNearbyFacilityRequest request) {
        try {
            // Verificar que la propiedad existe
            if (propertyRepository.findById(propertyId) == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Propiedad no encontrada"))
                        .build();
            }
            
            // Verificar que la facilidad existe
            if (nearbyFacilityRepository.findById(request.getNearbyFacilityId()) == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Facilidad cercana no encontrada"))
                        .build();
            }
            
            // Verificar que no existe ya la relación
            PropertyNearbyFacility existing = propertyNearbyFacilityRepository
                    .findByPropertyAndFacility(propertyId, request.getNearbyFacilityId());
            if (existing != null) {
                return Response.status(Response.Status.CONFLICT)
                        .entity(Map.of("error", "La facilidad ya está asociada a esta propiedad"))
                        .build();
            }
            
            // Crear nueva relación
            PropertyNearbyFacility propertyNearbyFacility = new PropertyNearbyFacility();
            propertyNearbyFacility.setProperty(propertyRepository.findById(propertyId));
            propertyNearbyFacility.setNearbyFacility(nearbyFacilityRepository.findById(request.getNearbyFacilityId()));
            propertyNearbyFacility.setDistanceKm(request.getDistanceKm());
            propertyNearbyFacility.setWalkingTimeMinutes(request.getWalkingTimeMinutes());
            propertyNearbyFacility.setDrivingTimeMinutes(request.getDrivingTimeMinutes());
            propertyNearbyFacility.setIsFeatured(request.getIsFeatured());
            propertyNearbyFacility.setNotes(request.getNotes());
            
            propertyNearbyFacilityRepository.persist(propertyNearbyFacility);
            
            return Response.status(Response.Status.CREATED).entity(propertyNearbyFacility).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al agregar facilidad a la propiedad: " + e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/{facilityId}")
    @Transactional
    public Response updatePropertyNearbyFacility(
            @PathParam("propertyId") Long propertyId,
            @PathParam("facilityId") Long facilityId,
            PropertyNearbyFacilityRequest request) {
        try {
            PropertyNearbyFacility propertyNearbyFacility = propertyNearbyFacilityRepository
                    .findByPropertyAndFacility(propertyId, facilityId);
            
            if (propertyNearbyFacility == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Relación no encontrada"))
                        .build();
            }
            
            // Actualizar campos
            propertyNearbyFacility.setDistanceKm(request.getDistanceKm());
            propertyNearbyFacility.setWalkingTimeMinutes(request.getWalkingTimeMinutes());
            propertyNearbyFacility.setDrivingTimeMinutes(request.getDrivingTimeMinutes());
            propertyNearbyFacility.setIsFeatured(request.getIsFeatured());
            propertyNearbyFacility.setNotes(request.getNotes());
            
            propertyNearbyFacilityRepository.persist(propertyNearbyFacility);
            
            return Response.ok(propertyNearbyFacility).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al actualizar relación: " + e.getMessage()))
                    .build();
        }
    }
    
    @DELETE
    @Path("/{facilityId}")
    @Transactional
    public Response removeNearbyFacilityFromProperty(
            @PathParam("propertyId") Long propertyId,
            @PathParam("facilityId") Long facilityId) {
        try {
            PropertyNearbyFacility propertyNearbyFacility = propertyNearbyFacilityRepository
                    .findByPropertyAndFacility(propertyId, facilityId);
            
            if (propertyNearbyFacility == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Relación no encontrada"))
                        .build();
            }
            
            propertyNearbyFacilityRepository.delete(propertyNearbyFacility);
            
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al eliminar relación: " + e.getMessage()))
                    .build();
        }
    }
    
    // Clase interna para el request
    public static class PropertyNearbyFacilityRequest {
        private Long nearbyFacilityId;
        private BigDecimal distanceKm;
        private Integer walkingTimeMinutes;
        private Integer drivingTimeMinutes;
        private Boolean isFeatured = false;
        private String notes;
        
        // Getters y Setters
        public Long getNearbyFacilityId() { return nearbyFacilityId; }
        public void setNearbyFacilityId(Long nearbyFacilityId) { this.nearbyFacilityId = nearbyFacilityId; }
        
        public BigDecimal getDistanceKm() { return distanceKm; }
        public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }
        
        public Integer getWalkingTimeMinutes() { return walkingTimeMinutes; }
        public void setWalkingTimeMinutes(Integer walkingTimeMinutes) { this.walkingTimeMinutes = walkingTimeMinutes; }
        
        public Integer getDrivingTimeMinutes() { return drivingTimeMinutes; }
        public void setDrivingTimeMinutes(Integer drivingTimeMinutes) { this.drivingTimeMinutes = drivingTimeMinutes; }
        
        public Boolean getIsFeatured() { return isFeatured; }
        public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
