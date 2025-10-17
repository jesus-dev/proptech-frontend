package com.proptech.properties.resource;

import java.util.List;
import java.util.Map;

import com.proptech.properties.dto.PropertyDTO;
import com.proptech.properties.repository.PropertyRepository;
import com.proptech.properties.service.PropertyService;
import com.proptech.properties.entity.PropertyStatus;
import com.proptech.properties.entity.Property.OperacionType;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.persistence.EntityManager;

@Path("/api/properties")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PropertyResource {

    @Inject
    PropertyService propertyService;

    @Inject
    PropertyRepository propertyRepository;

    @Inject
    EntityManager entityManager;

    @GET
    public Response listAll(
        @QueryParam("operacion") String operacion,
        @QueryParam("type") String type,
        @QueryParam("city") String city,
        @QueryParam("minPrice") Double minPrice,
        @QueryParam("maxPrice") Double maxPrice,
        @QueryParam("bedrooms") Integer bedrooms,
        @QueryParam("bathrooms") Integer bathrooms,
        @QueryParam("status") String status,
        @QueryParam("page") Integer page,
        @QueryParam("limit") Integer limit,
        @QueryParam("search") String search
    ) {
        try {
            // Si se proporcionan parámetros de paginación, usar endpoint paginado
            if (page != null || limit != null) {
                if (page == null) page = 1;
                if (limit == null) limit = 10;
                
                Map<String, Object> result = propertyService.findPaginated(
                    page, limit, search, operacion, type, city, 
                    minPrice, maxPrice, bedrooms, bathrooms, status
                );
                return Response.ok(result).build();
            }
            
            // Comportamiento original para compatibilidad
            if (operacion == null && type == null && city == null && minPrice == null && maxPrice == null && bedrooms == null && bathrooms == null && status == null) {
                List<PropertyDTO> properties = propertyService.listAll();
                return Response.ok(properties).build();
            }
            List<PropertyDTO> properties = propertyService.findByFilters(operacion, type, city, minPrice, maxPrice, bedrooms, bathrooms, status);
            return Response.ok(properties).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving properties: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id) {
        try {
            PropertyDTO property = propertyService.findById(id);
            if (property == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Property not found")
                        .build();
            }
            return Response.ok(property).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving property: " + e.getMessage())
                    .build();
        }
    }

    @POST
    @Transactional
    public Response create(PropertyDTO propertyDTO) {
        try {
            System.out.println("DEBUG: Received PropertyDTO - currencyId: " + propertyDTO.currencyId + ", currencyCode: " + propertyDTO.currencyCode + ", currency object: " + propertyDTO.currency);
            System.out.println("DEBUG: Full PropertyDTO: " + propertyDTO.toString());
            PropertyDTO createdProperty = propertyService.create(propertyDTO);
            return Response.status(Response.Status.CREATED)
                    .entity(createdProperty)
                    .build();
        } catch (Exception e) {
            System.out.println("DEBUG: Exception in create: " + e.getMessage());
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error creating property: " + e.getMessage())
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, PropertyDTO propertyDTO) {
        try {
            PropertyDTO updatedProperty = propertyService.update(id, propertyDTO);
            if (updatedProperty == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Property not found")
                        .build();
            }
            return Response.ok(updatedProperty).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error updating property: " + e.getMessage())
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        try {
            boolean deleted = propertyService.delete(id);
            if (!deleted) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Property not found")
                        .build();
            }
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error deleting property: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/type/{propertyTypeId}")
    public Response findByPropertyType(@PathParam("propertyTypeId") Long propertyTypeId) {
        try {
            List<PropertyDTO> properties = propertyService.findByPropertyType(propertyTypeId);
            return Response.ok(properties).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving properties by type: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/city/{cityId}")
    public Response findByCity(@PathParam("cityId") Long cityId) {
        try {
            List<PropertyDTO> properties = propertyService.findByCity(cityId);
            return Response.ok(properties).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving properties by city: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/search")
    public Response searchByPriceRange(
            @QueryParam("minPrice") Double minPrice,
            @QueryParam("maxPrice") Double maxPrice) {
        try {
            List<PropertyDTO> properties = propertyService.findByPriceRange(minPrice, maxPrice);
            return Response.ok(properties).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error searching properties: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/favorites/{userId}")
    public Response findFavoritesByUserId(@PathParam("userId") Long userId) {
        try {
            List<PropertyDTO> properties = propertyService.findFavoritesByUserId(userId);
            return Response.ok(properties).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving favorites: " + e.getMessage())
                    .build();
        }
    }

    @POST
    @Path("/{propertyId}/favorites/{userId}")
    @Transactional
    public Response addToFavorites(
            @PathParam("propertyId") Long propertyId,
            @PathParam("userId") Long userId) {
        try {
            propertyService.addToFavorites(propertyId, userId);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error adding to favorites: " + e.getMessage())
                    .build();
        }
    }

    @DELETE
    @Path("/{propertyId}/favorites/{userId}")
    @Transactional
    public Response removeFromFavorites(
            @PathParam("propertyId") Long propertyId,
            @PathParam("userId") Long userId) {
        try {
            propertyService.removeFromFavorites(propertyId, userId);
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error removing from favorites: " + e.getMessage())
                    .build();
        }
    }

    // Temporary migration endpoint to fix property_favorites table
    @POST
    @Path("/migrate-favorites-table")
    @Transactional
    public Response migrateFavoritesTable() {
        try {
            // Drop existing table if it exists
            entityManager.createNativeQuery("DROP TABLE IF EXISTS proptech.property_favorites CASCADE").executeUpdate();
            
            // Create the corrected table
            String createTableSQL = """
                CREATE TABLE proptech.property_favorites (
                    id BIGSERIAL PRIMARY KEY,
                    visitor_id VARCHAR(255) NOT NULL,
                    property_id BIGINT NOT NULL,
                    user_id BIGINT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    removed_at TIMESTAMP NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    CONSTRAINT uk_visitor_property UNIQUE (visitor_id, property_id),
                    CONSTRAINT uk_user_property UNIQUE (user_id, property_id),
                    CONSTRAINT fk_property_favorites_property FOREIGN KEY (property_id) REFERENCES proptech.properties(id) ON DELETE CASCADE,
                    CONSTRAINT fk_property_favorites_user FOREIGN KEY (user_id) REFERENCES proptech.users(id) ON DELETE CASCADE
                )
                """;
            
            entityManager.createNativeQuery(createTableSQL).executeUpdate();
            
            // Create indexes
            entityManager.createNativeQuery("CREATE INDEX IF NOT EXISTS idx_property_favorites_visitor_id ON proptech.property_favorites(visitor_id)").executeUpdate();
            entityManager.createNativeQuery("CREATE INDEX IF NOT EXISTS idx_property_favorites_user_id ON proptech.property_favorites(user_id)").executeUpdate();
            entityManager.createNativeQuery("CREATE INDEX IF NOT EXISTS idx_property_favorites_property_id ON proptech.property_favorites(property_id)").executeUpdate();
            entityManager.createNativeQuery("CREATE INDEX IF NOT EXISTS idx_property_favorites_active ON proptech.property_favorites(is_active)").executeUpdate();
            
            return Response.ok("Property favorites table migrated successfully").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error migrating favorites table: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/statistics/summary")
    public Response getStatisticsSummary() {
        try {
            Map<String, Object> stats = propertyService.getStatisticsSummary();
            return Response.ok(stats).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving statistics: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/{id}/stats")
    public Response getPropertyStats(@PathParam("id") Long id) {
        try {
            Map<String, Object> stats = propertyService.getPropertyStats(id);
            return Response.ok(stats).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving property statistics: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/{id}/statistics")
    public Response getPropertyStatistics(@PathParam("id") Long id, @QueryParam("days") String days) {
        try {
            int daysParam = days != null ? Integer.parseInt(days) : 30;
            Map<String, Object> stats = propertyService.getPropertyStatistics(id, daysParam);
            return Response.ok(stats).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving property statistics: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/category-summary")
    public Response getCategorySummary() {
        try {
            List<Map<String, Object>> summary = propertyRepository.getCategorySummary();
            return Response.ok(summary).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving category summary: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/property-types-summary")
    public Response getPropertyTypesSummary() {
        try {
            List<Map<String, Object>> summary = propertyRepository.getPropertyTypesSummary();
            return Response.ok(summary).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving property types summary: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/property-status")
    public Response listAllStatus() {
        List<PropertyStatus> statuses = propertyService.getAllStatuses();
        return Response.ok(statuses).build();
    }

    @GET
    @Path("/operations")
    @Produces(MediaType.APPLICATION_JSON)
    public List<Map<String, String>> listAllOperations() {
        List<Map<String, String>> ops = new java.util.ArrayList<>();
        for (OperacionType op : OperacionType.values()) {
            Map<String, String> map = new java.util.HashMap<>();
            map.put("value", op.name());
            map.put("label", op == OperacionType.SALE ? "Venta" : op == OperacionType.RENT ? "Alquiler" : "Ambos");
            ops.add(map);
        }
        return ops;
    }
} 