package com.proptech.commons.resource;

import com.proptech.commons.entity.NearbyFacility;
import com.proptech.commons.service.NearbyFacilityService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Path("/api/nearby-facilities")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NearbyFacilityResource {
    
    @Inject
    NearbyFacilityService nearbyFacilityService;
    
    @GET
    public Response getAll(@QueryParam("active") Boolean active) {
        try {
            List<NearbyFacility> facilities;
            if (active != null) {
                facilities = active ? nearbyFacilityService.getActive() : nearbyFacilityService.getAll();
            } else {
                facilities = nearbyFacilityService.getAll();
            }
            return Response.ok(facilities).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al obtener facilidades cercanas: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        try {
            Optional<NearbyFacility> facility = nearbyFacilityService.getById(id);
            if (facility.isPresent()) {
                return Response.ok(facility.get()).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Facilidad cercana no encontrada"))
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al obtener facilidad cercana: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/type/{type}")
    public Response getByType(@PathParam("type") String type) {
        try {
            NearbyFacility.FacilityType facilityType = NearbyFacility.FacilityType.valueOf(type.toUpperCase());
            List<NearbyFacility> facilities = nearbyFacilityService.getByType(facilityType);
            return Response.ok(facilities).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Tipo de facilidad no válido: " + type))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al obtener facilidades por tipo: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/search")
    public Response searchByName(@QueryParam("name") String name) {
        try {
            if (name == null || name.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "El parámetro 'name' es requerido"))
                        .build();
            }
            List<NearbyFacility> facilities = nearbyFacilityService.searchByName(name);
            return Response.ok(facilities).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al buscar facilidades: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/nearby")
    public Response getNearbyFacilities(
            @QueryParam("latitude") BigDecimal latitude,
            @QueryParam("longitude") BigDecimal longitude,
            @QueryParam("radius") @DefaultValue("5") BigDecimal radiusKm) {
        try {
            if (latitude == null || longitude == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Los parámetros 'latitude' y 'longitude' son requeridos"))
                        .build();
            }
            List<NearbyFacility> facilities = nearbyFacilityService.getNearbyFacilities(latitude, longitude, radiusKm);
            return Response.ok(facilities).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al obtener facilidades cercanas: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/types")
    public Response getTypes() {
        try {
            List<NearbyFacility.FacilityType> types = nearbyFacilityService.getAllTypes();
            return Response.ok(types).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al obtener tipos de facilidades: " + e.getMessage()))
                    .build();
        }
    }
    
    @POST
    public Response create(NearbyFacility nearbyFacility) {
        try {
            if (nearbyFacility.getName() == null || nearbyFacility.getName().trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "El nombre es requerido"))
                        .build();
            }
            if (nearbyFacility.getType() == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "El tipo es requerido"))
                        .build();
            }
            if (nearbyFacility.getAddress() == null || nearbyFacility.getAddress().trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "La dirección es requerida"))
                        .build();
            }
            
            NearbyFacility createdFacility = nearbyFacilityService.create(nearbyFacility);
            return Response.status(Response.Status.CREATED).entity(createdFacility).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al crear facilidad cercana: " + e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, NearbyFacility nearbyFacility) {
        try {
            if (nearbyFacility.getName() == null || nearbyFacility.getName().trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "El nombre es requerido"))
                        .build();
            }
            if (nearbyFacility.getType() == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "El tipo es requerido"))
                        .build();
            }
            if (nearbyFacility.getAddress() == null || nearbyFacility.getAddress().trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "La dirección es requerida"))
                        .build();
            }
            
            NearbyFacility updatedFacility = nearbyFacilityService.update(id, nearbyFacility);
            return Response.ok(updatedFacility).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al actualizar facilidad cercana: " + e.getMessage()))
                    .build();
        }
    }
    
    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        try {
            boolean deleted = nearbyFacilityService.delete(id);
            if (deleted) {
                return Response.noContent().build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Facilidad cercana no encontrada"))
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al eliminar facilidad cercana: " + e.getMessage()))
                    .build();
        }
    }
    
    @PATCH
    @Path("/{id}/toggle-active")
    public Response toggleActive(@PathParam("id") Long id) {
        try {
            boolean toggled = nearbyFacilityService.toggleActive(id);
            if (toggled) {
                return Response.ok(Map.of("message", "Estado actualizado correctamente")).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Facilidad cercana no encontrada"))
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error al cambiar estado: " + e.getMessage()))
                    .build();
        }
    }
}
