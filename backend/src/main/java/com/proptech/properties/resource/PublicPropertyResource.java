package com.proptech.properties.resource;

import com.proptech.properties.dto.PropertyDTO;
import com.proptech.properties.service.PropertyService;
import com.proptech.properties.service.PropertyStatusHelper;
import com.proptech.properties.repository.PropertyRepository;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;

import java.util.HashMap;
import java.math.BigDecimal;
import jakarta.transaction.Transactional;

@Path("/api/public/properties")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PublicPropertyResource {

    @Inject
    PropertyService propertyService;

    @Inject
    PropertyRepository propertyRepository;

    @Inject
    PropertyStatusHelper statusHelper;

    @Inject
    com.proptech.notifications.service.NotificationService notificationService;
    
    @Inject
    com.proptech.notifications.service.NotificationEventService notificationEventService;

    @GET
    public Response getAllProperties(@QueryParam("agencyId") Long agencyId) {
        try {
            List<PropertyDTO> properties = propertyService.listAll();
            // Filtrar solo propiedades disponibles para el público usando códigos internos
            List<PropertyDTO> activeProperties = properties.stream()
                .filter(p -> statusHelper.isPubliclyAvailable(p.propertyStatusCode))
                .filter(p -> agencyId == null || (p.agencyId != null && p.agencyId.equals(agencyId)))
                .toList();
            
            return Response.ok(activeProperties).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Error al obtener propiedades: " + e.getMessage()))
                .build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getPropertyById(@PathParam("id") Long id) {
        try {
            PropertyDTO property = propertyService.findById(id);
            if (property == null) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Propiedad no encontrada"))
                    .build();
            }
            
            // Verificar que la propiedad esté disponible usando códigos internos
            if (!statusHelper.isPubliclyAvailable(property.propertyStatusCode)) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Propiedad no disponible"))
                    .build();
            }
            
            return Response.ok(property).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Error al obtener la propiedad: " + e.getMessage()))
                .build();
        }
    }

    @GET
    @Path("/slug/{slug}")
    public Response getPropertyBySlug(@PathParam("slug") String slug) {
        try {
            List<PropertyDTO> properties = propertyService.listAll();
            
            PropertyDTO property = properties.stream()
                .filter(p -> statusHelper.isPubliclyAvailable(p.propertyStatusCode))
                .filter(p -> slug.equals(p.slug))
                .findFirst()
                .orElse(null);
            
            if (property == null) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Propiedad no encontrada"))
                    .build();
            }
            
            return Response.ok(property).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Error al obtener la propiedad: " + e.getMessage()))
                .build();
        }
    }

    @GET
    @Path("/featured")
    public Response getFeaturedProperties(@QueryParam("agencyId") Long agencyId) {
        try {
            List<PropertyDTO> properties = propertyService.listAll();
            List<PropertyDTO> featuredProperties = properties.stream()
                .filter(p -> statusHelper.isPubliclyAvailable(p.propertyStatusCode))
                .filter(p -> Boolean.TRUE.equals(p.featured))
                .filter(p -> agencyId == null || (p.agencyId != null && p.agencyId.equals(agencyId)))
                .limit(6)
                .toList();
            
            return Response.ok(featuredProperties).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Error al obtener propiedades destacadas: " + e.getMessage()))
                .build();
        }
    }

    @GET
    @Path("/premium")
    public Response getPremiumProperties(@QueryParam("agencyId") Long agencyId) {
        try {
            List<PropertyDTO> properties = propertyService.listAll();
            List<PropertyDTO> premiumProperties = properties.stream()
                .filter(p -> statusHelper.isPubliclyAvailable(p.propertyStatusCode))
                .filter(p -> Boolean.TRUE.equals(p.premium))
                .filter(p -> agencyId == null || (p.agencyId != null && p.agencyId.equals(agencyId)))
                .limit(8)
                .toList();
            
            return Response.ok(premiumProperties).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Error al obtener propiedades premium: " + e.getMessage()))
                .build();
        }
    }

    @GET
    @Path("/type/{type}")
    public Response getPropertiesByType(@PathParam("type") String type, @QueryParam("agencyId") Long agencyId) {
        try {
            List<PropertyDTO> properties = propertyService.listAll();
            List<PropertyDTO> typeProperties = properties.stream()
                .filter(p -> statusHelper.isPubliclyAvailable(p.propertyStatusCode))
                .filter(p -> type.equalsIgnoreCase(p.propertyTypeName))
                .filter(p -> agencyId == null || (p.agencyId != null && p.agencyId.equals(agencyId)))
                .toList();
            
            return Response.ok(typeProperties).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Error al obtener propiedades por tipo: " + e.getMessage()))
                .build();
        }
    }

    @GET
    @Path("/city/{city}")
    public Response getPropertiesByCity(@PathParam("city") String city, @QueryParam("agencyId") Long agencyId) {
        try {
            List<PropertyDTO> properties = propertyService.listAll();
            List<PropertyDTO> cityProperties = properties.stream()
                .filter(p -> statusHelper.isPubliclyAvailable(p.propertyStatusCode))
                .filter(p -> city.equalsIgnoreCase(p.cityName))
                .filter(p -> agencyId == null || (p.agencyId != null && p.agencyId.equals(agencyId)))
                .toList();
            
            return Response.ok(cityProperties).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Error al obtener propiedades por ciudad: " + e.getMessage()))
                .build();
        }
    }

    @GET
    @Path("/search")
    public Response searchProperties(@QueryParam("q") String query, @QueryParam("agencyId") Long agencyId) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return Response.ok(List.of()).build();
            }
            
            List<PropertyDTO> properties = propertyService.listAll();
            String searchQuery = query.toLowerCase().trim();
            
            List<PropertyDTO> searchResults = properties.stream()
                .filter(p -> statusHelper.isPubliclyAvailable(p.propertyStatusCode))
                .filter(p -> 
                    (p.title != null && p.title.toLowerCase().contains(searchQuery)) ||
                    (p.address != null && p.address.toLowerCase().contains(searchQuery)) ||
                    (p.cityName != null && p.cityName.toLowerCase().contains(searchQuery)) ||
                    (p.propertyTypeName != null && p.propertyTypeName.toLowerCase().contains(searchQuery))
                )
                .filter(p -> agencyId == null || (p.agencyId != null && p.agencyId.equals(agencyId)))
                .toList();
            
            return Response.ok(searchResults).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Error al buscar propiedades: " + e.getMessage()))
                .build();
        }
    }

    @GET
    @Path("/paginated")
    public Response getPropertiesPaginated(
        @QueryParam("page") @DefaultValue("1") int page,
        @QueryParam("limit") @DefaultValue("12") int limit,
        @QueryParam("search") String search,
        @QueryParam("type") String type,
        @QueryParam("city") String city,
        @QueryParam("minPrice") Double minPrice,
        @QueryParam("maxPrice") Double maxPrice,
        @QueryParam("bedrooms") Integer bedrooms,
        @QueryParam("bathrooms") Integer bathrooms,
        @QueryParam("operacion") String operacion,
        @QueryParam("agencyId") Long agencyId
    ) {
        try {
            List<PropertyDTO> allProperties = propertyService.listAll();
            
            // Filtrar propiedades disponibles
            List<PropertyDTO> filteredProperties = allProperties.stream()
                .filter(p -> statusHelper.isPubliclyAvailable(p.propertyStatusCode))
                .filter(p -> search == null || search.trim().isEmpty() ||
                    (p.title != null && p.title.toLowerCase().contains(search.toLowerCase().trim())) ||
                    (p.address != null && p.address.toLowerCase().contains(search.toLowerCase().trim())) ||
                    (p.cityName != null && p.cityName.toLowerCase().contains(search.toLowerCase().trim()))
                )
                .filter(p -> type == null || isPropertyTypeMatch(p.propertyTypeName, type))
                .filter(p -> city == null || city.equalsIgnoreCase(p.cityName))
                .filter(p -> minPrice == null || (p.price != null && p.price.compareTo(BigDecimal.valueOf(minPrice)) >= 0))
                .filter(p -> maxPrice == null || (p.price != null && p.price.compareTo(BigDecimal.valueOf(maxPrice)) <= 0))
                .filter(p -> bedrooms == null || (p.bedrooms != null && p.bedrooms >= bedrooms))
                .filter(p -> bathrooms == null || (p.bathrooms != null && p.bathrooms >= bathrooms))
                .filter(p -> operacion == null || (p.operacion != null && p.operacion.toString().equalsIgnoreCase(operacion)))
                .filter(p -> agencyId == null || (p.agencyId != null && p.agencyId.equals(agencyId)))
                .toList();
            
            // Calcular paginación
            int totalProperties = filteredProperties.size();
            int totalPages = (int) Math.ceil((double) totalProperties / limit);
            int startIndex = (page - 1) * limit;
            
            List<PropertyDTO> paginatedProperties = filteredProperties.stream()
                .skip(startIndex)
                .limit(limit)
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("properties", paginatedProperties);
            response.put("pagination", Map.of(
                "currentPage", page,
                "totalPages", totalPages,
                "totalProperties", totalProperties,
                "propertiesPerPage", limit
            ));
            
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Error al obtener propiedades paginadas: " + e.getMessage()))
                .build();
        }
    }

    @GET
    @Path("/similar/{propertyId}")
    public Response getSimilarProperties(@PathParam("propertyId") Long propertyId, @QueryParam("limit") @DefaultValue("4") int limit, @QueryParam("agencyId") Long agencyId) {
        try {
            // Assuming findByIdEntity returns the entity, not the DTO
            // If findByIdEntity returns DTO, this line needs adjustment
            // For now, assuming it's the entity for filtering
            com.proptech.properties.entity.Property currentPropertyEntity = propertyService.findByIdEntity(propertyId);
            if (currentPropertyEntity == null) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Propiedad no encontrada"))
                    .build();
            }
            PropertyDTO currentProperty = com.proptech.properties.mapper.PropertyMapper.toDTO(currentPropertyEntity);

            List<PropertyDTO> allProperties = propertyService.listAll();
            List<PropertyDTO> similarProperties = allProperties.stream()
                .filter(p -> statusHelper.isPubliclyAvailable(p.propertyStatusCode))
                .filter(p -> !p.id.equals(propertyId))
                .filter(p -> 
                    currentProperty.propertyTypeName != null && currentProperty.propertyTypeName.equals(p.propertyTypeName) ||
                    currentProperty.cityName != null && currentProperty.cityName.equals(p.cityName)
                )
                .filter(p -> agencyId == null || (p.agencyId != null && p.agencyId.equals(agencyId)))
                .limit(limit)
                .toList();
            
            return Response.ok(similarProperties).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Error al obtener propiedades similares: " + e.getMessage()))
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

    @PATCH
    @Path("/{id}/view")
    @Transactional
    public Response incrementView(@PathParam("id") Long id) {
        try {
            com.proptech.properties.entity.Property property = propertyService.findByIdEntity(id);
            if (property == null) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Propiedad no encontrada"))
                    .build();
            }
            
            // Registrar la vista usando el nuevo sistema de tracking
            propertyRepository.recordPropertyView(id, "anonymous", null, "unknown", "unknown", "unknown", "unknown");
            
            // Enviar notificación al agente si la propiedad tiene uno asignado
            if (property.getAgent() != null && property.getAgent().getId() != null) {
                try {
                    notificationEventService.notifyPropertyView(id, null, "Un usuario");
                } catch (Exception e) {
                    System.err.println("Error creating property view notification: " + e.getMessage());
                }
            }
            
            return Response.ok(Map.of("success", true, "views", property.getViews())).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Error al incrementar vistas: " + e.getMessage()))
                .build();
        }
    }
    
    private boolean isPropertyTypeMatch(String propertyTypeName, String requestedType) {
        if (propertyTypeName == null || requestedType == null) {
            return false;
        }
        
        String typeLower = requestedType.toLowerCase();
        String propertyTypeLower = propertyTypeName.toLowerCase();
        
        // Mapeo de tipos genéricos a tipos específicos
        switch (typeLower) {
            case "casa":
                return propertyTypeLower.contains("casa") || 
                       propertyTypeLower.contains("house") ||
                       propertyTypeLower.contains("residencia") ||
                       propertyTypeLower.contains("quinta") ||
                       propertyTypeLower.contains("duplex") ||
                       propertyTypeLower.contains("dúplex") ||
                       propertyTypeLower.contains("townhouse") ||
                       propertyTypeLower.contains("penthouse");
            case "departamento":
            case "apartamento":
                return propertyTypeLower.contains("departamento") || 
                       propertyTypeLower.contains("apartamento") ||
                       propertyTypeLower.contains("apartment") ||
                       propertyTypeLower.contains("condominio");
            case "comercial":
                return propertyTypeLower.contains("comercial") || 
                       propertyTypeLower.contains("commercial") ||
                       propertyTypeLower.contains("local") ||
                       propertyTypeLower.contains("oficina") ||
                       propertyTypeLower.contains("office");
            case "terreno":
                return propertyTypeLower.contains("terreno") || 
                       propertyTypeLower.contains("lote") ||
                       propertyTypeLower.contains("land");
            default:
                return propertyTypeLower.contains(typeLower);
        }
    }
} 