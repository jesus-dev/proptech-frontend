package com.proptech.properties;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.proptech.properties.dto.PropertyDTO;
import com.proptech.properties.service.PropertyRecommendationService;

@Path("/api/recommendations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PropertyRecommendationResource {

    @Inject
    PropertyRecommendationService recommendationService;

    /**
     * Obtiene recomendaciones inteligentes para un usuario
     */
    @GET
    @Path("/smart/{userId}")
    public Response getSmartRecommendations(
            @PathParam("userId") Long userId,
            @QueryParam("limit") @DefaultValue("12") int limit) {
        
        try {
            // Crear criterios por defecto
            PropertyRecommendationService.RecommendationCriteria criteria = 
                new PropertyRecommendationService.RecommendationCriteria();
            criteria.setMinPrice(new BigDecimal("0"));
            criteria.setMaxPrice(new BigDecimal("1000000"));

            List<PropertyRecommendationService.PropertyRecommendation> recommendations = 
                recommendationService.generateRecommendations(userId, criteria, limit);

            return Response.ok(Map.of(
                "success", true,
                "data", recommendations,
                "count", recommendations.size(),
                "userId", userId
            )).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of(
                        "success", false,
                        "error", "Error al generar recomendaciones: " + e.getMessage()
                    ))
                    .build();
        }
    }

    /**
     * Obtiene recomendaciones personalizadas basadas en criterios específicos
     */
    @POST
    @Path("/custom/{userId}")
    public Response getCustomRecommendations(
            @PathParam("userId") Long userId,
            @QueryParam("limit") @DefaultValue("12") int limit,
            RecommendationRequest request) {
        
        try {
            PropertyRecommendationService.RecommendationCriteria criteria = 
                new PropertyRecommendationService.RecommendationCriteria();
            
            // Mapear criterios desde la request
            if (request.getPriceRange() != null) {
                criteria.setMinPrice(request.getPriceRange().getMin());
                criteria.setMaxPrice(request.getPriceRange().getMax());
            }
            
            criteria.setPreferredLocations(request.getPreferredLocations());
            criteria.setPreferredTypes(request.getPreferredTypes());
            criteria.setPreferredAmenities(request.getPreferredAmenities());
            
            if (request.getBedrooms() != null) {
                criteria.setMinBedrooms(request.getBedrooms().getMin());
                criteria.setMaxBedrooms(request.getBedrooms().getMax());
            }
            
            if (request.getBathrooms() != null) {
                criteria.setMinBathrooms(request.getBathrooms().getMin());
                criteria.setMaxBathrooms(request.getBathrooms().getMax());
            }
            
            if (request.getArea() != null) {
                criteria.setMinArea(request.getArea().getMin());
                criteria.setMaxArea(request.getArea().getMax());
            }

            List<PropertyRecommendationService.PropertyRecommendation> recommendations = 
                recommendationService.generateRecommendations(userId, criteria, limit);

            return Response.ok(Map.of(
                "success", true,
                "data", recommendations,
                "count", recommendations.size(),
                "criteria", criteria
            )).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of(
                        "success", false,
                        "error", "Error al generar recomendaciones personalizadas: " + e.getMessage()
                    ))
                    .build();
        }
    }

    /**
     * Obtiene propiedades similares a una propiedad específica
     */
    @GET
    @Path("/similar/{propertyId}")
    public Response getSimilarProperties(
            @PathParam("propertyId") Long propertyId,
            @QueryParam("limit") @DefaultValue("6") int limit) {
        
        try {
            List<PropertyDTO> similarProperties = 
                recommendationService.getSimilarProperties(propertyId, limit);

            return Response.ok(Map.of(
                "success", true,
                "data", similarProperties,
                "count", similarProperties.size(),
                "propertyId", propertyId
            )).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of(
                        "success", false,
                        "error", "Error al obtener propiedades similares: " + e.getMessage()
                    ))
                    .build();
        }
    }

    /**
     * Registra comportamiento del usuario para mejorar recomendaciones
     */
    @POST
    @Path("/behavior")
    public Response recordUserBehavior(UserBehaviorRequest request) {
        
        try {
            recommendationService.recordUserBehavior(
                request.getUserId(), 
                request.getPropertyId(), 
                request.getAction()
            );

            return Response.ok(Map.of(
                "success", true,
                "message", "Comportamiento registrado exitosamente"
            )).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of(
                        "success", false,
                        "error", "Error al registrar comportamiento: " + e.getMessage()
                    ))
                    .build();
        }
    }

    /**
     * Obtiene estadísticas de recomendaciones
     */
    @GET
    @Path("/stats/{userId}")
    public Response getRecommendationStats(@PathParam("userId") Long userId) {
        
        try {
            // Simular estadísticas (en producción vendrían de analytics reales)
            Map<String, Object> stats = Map.of(
                "totalRecommendations", 45,
                "averageScore", 0.78,
                "topCategories", List.of("Casa", "Apartamento", "Quinta"),
                "topLocations", List.of("Villa Morra", "Centro", "San Bernardino"),
                "priceRange", Map.of("min", 50000, "max", 300000),
                "lastUpdated", System.currentTimeMillis()
            );

            return Response.ok(Map.of(
                "success", true,
                "data", stats
            )).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of(
                        "success", false,
                        "error", "Error al obtener estadísticas: " + e.getMessage()
                    ))
                    .build();
        }
    }

    /**
     * Obtiene recomendaciones de tendencias del mercado
     */
    @GET
    @Path("/trending")
    public Response getTrendingRecommendations(
            @QueryParam("limit") @DefaultValue("8") int limit) {
        
        try {
            // Simular recomendaciones de tendencias
            // En producción, esto vendría de análisis de datos de mercado
            PropertyRecommendationService.RecommendationCriteria criteria = 
                new PropertyRecommendationService.RecommendationCriteria();
            
            List<PropertyRecommendationService.PropertyRecommendation> recommendations = 
                recommendationService.generateRecommendations(1L, criteria, limit);

            return Response.ok(Map.of(
                "success", true,
                "data", recommendations,
                "count", recommendations.size(),
                "type", "trending"
            )).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of(
                        "success", false,
                        "error", "Error al obtener tendencias: " + e.getMessage()
                    ))
                    .build();
        }
    }

    // Clases de datos para las requests
    public static class RecommendationRequest {
        private PriceRange priceRange;
        private List<String> preferredLocations;
        private List<String> preferredTypes;
        private List<String> preferredAmenities;
        private Range bedrooms;
        private Range bathrooms;
        private AreaRange area;

        // Getters y Setters
        public PriceRange getPriceRange() { return priceRange; }
        public void setPriceRange(PriceRange priceRange) { this.priceRange = priceRange; }
        
        public List<String> getPreferredLocations() { return preferredLocations; }
        public void setPreferredLocations(List<String> preferredLocations) { this.preferredLocations = preferredLocations; }
        
        public List<String> getPreferredTypes() { return preferredTypes; }
        public void setPreferredTypes(List<String> preferredTypes) { this.preferredTypes = preferredTypes; }
        
        public List<String> getPreferredAmenities() { return preferredAmenities; }
        public void setPreferredAmenities(List<String> preferredAmenities) { this.preferredAmenities = preferredAmenities; }
        
        public Range getBedrooms() { return bedrooms; }
        public void setBedrooms(Range bedrooms) { this.bedrooms = bedrooms; }
        
        public Range getBathrooms() { return bathrooms; }
        public void setBathrooms(Range bathrooms) { this.bathrooms = bathrooms; }
        
        public AreaRange getArea() { return area; }
        public void setArea(AreaRange area) { this.area = area; }
    }

    public static class PriceRange {
        private BigDecimal min;
        private BigDecimal max;

        public BigDecimal getMin() { return min; }
        public void setMin(BigDecimal min) { this.min = min; }
        
        public BigDecimal getMax() { return max; }
        public void setMax(BigDecimal max) { this.max = max; }
    }

    public static class Range {
        private Integer min;
        private Integer max;

        public Integer getMin() { return min; }
        public void setMin(Integer min) { this.min = min; }
        
        public Integer getMax() { return max; }
        public void setMax(Integer max) { this.max = max; }
    }

    public static class AreaRange {
        private BigDecimal min;
        private BigDecimal max;

        public BigDecimal getMin() { return min; }
        public void setMin(BigDecimal min) { this.min = min; }
        
        public BigDecimal getMax() { return max; }
        public void setMax(BigDecimal max) { this.max = max; }
    }

    public static class UserBehaviorRequest {
        private Long userId;
        private String propertyId;
        private String action; // "view", "favorite", "contact", "search"

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public String getPropertyId() { return propertyId; }
        public void setPropertyId(String propertyId) { this.propertyId = propertyId; }
        
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
    }
} 