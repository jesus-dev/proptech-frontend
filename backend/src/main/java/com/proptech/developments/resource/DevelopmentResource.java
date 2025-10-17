package com.proptech.developments.resource;

import java.math.BigDecimal;
import java.util.List;

import com.proptech.developments.dto.DevelopmentDTO;
import com.proptech.developments.enums.DevelopmentStatus;
import com.proptech.developments.enums.DevelopmentType;
import com.proptech.developments.service.DevelopmentService;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/developments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DevelopmentResource {

    @Inject
    DevelopmentService developmentService;

    // CRUD Operations
    @GET
    public Response getAllDevelopments() {
        try {
            List<DevelopmentDTO> developments = developmentService.getAllDevelopments();
            return Response.ok(developments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener desarrollos: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getDevelopmentById(@PathParam("id") Long id) {
        try {
            DevelopmentDTO development = developmentService.getDevelopmentById(id);
            if (development != null) {
                return Response.ok(development).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Desarrollo no encontrado")
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener desarrollo: " + e.getMessage())
                    .build();
        }
    }

    @POST
    public Response createDevelopment(DevelopmentDTO developmentDTO) {
        try {
            DevelopmentDTO created = developmentService.createDevelopment(developmentDTO);
            return Response.status(Response.Status.CREATED).entity(created).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Error al crear desarrollo: " + e.getMessage())
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response updateDevelopment(@PathParam("id") Long id, DevelopmentDTO developmentDTO) {
        try {
            DevelopmentDTO updated = developmentService.updateDevelopment(id, developmentDTO);
            return Response.ok(updated).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Error al actualizar desarrollo: " + e.getMessage())
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deleteDevelopment(@PathParam("id") Long id) {
        try {
            developmentService.deleteDevelopment(id);
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al eliminar desarrollo: " + e.getMessage())
                    .build();
        }
    }

    // Filtering and Search Operations
    @GET
    @Path("/type/{type}")
    public Response getDevelopmentsByType(@PathParam("type") DevelopmentType type) {
        try {
            List<DevelopmentDTO> developments = developmentService.getDevelopmentsByType(type);
            return Response.ok(developments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener desarrollos por tipo: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/status/{status}")
    public Response getDevelopmentsByStatus(@PathParam("status") DevelopmentStatus status) {
        try {
            List<DevelopmentDTO> developments = developmentService.getDevelopmentsByStatus(status);
            return Response.ok(developments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener desarrollos por estado: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/city/{city}")
    public Response getDevelopmentsByCity(@PathParam("city") String city) {
        try {
            List<DevelopmentDTO> developments = developmentService.getDevelopmentsByCity(city);
            return Response.ok(developments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener desarrollos por ciudad: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/price-range")
    public Response getDevelopmentsByPriceRange(
            @QueryParam("minPrice") BigDecimal minPrice,
            @QueryParam("maxPrice") BigDecimal maxPrice) {
        try {
            List<DevelopmentDTO> developments = developmentService.getDevelopmentsByPriceRange(minPrice, maxPrice);
            return Response.ok(developments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener desarrollos por rango de precio: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/search")
    public Response searchDevelopments(@QueryParam("q") String searchTerm) {
        try {
            List<DevelopmentDTO> developments = developmentService.searchDevelopments(searchTerm);
            return Response.ok(developments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al buscar desarrollos: " + e.getMessage())
                    .build();
        }
    }

    // Special Collections
    @GET
    @Path("/featured")
    public Response getFeaturedDevelopments() {
        try {
            List<DevelopmentDTO> developments = developmentService.getFeaturedDevelopments();
            return Response.ok(developments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener desarrollos destacados: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/premium")
    public Response getPremiumDevelopments() {
        try {
            List<DevelopmentDTO> developments = developmentService.getPremiumDevelopments();
            return Response.ok(developments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener desarrollos premium: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/available")
    public Response getAvailableDevelopments() {
        try {
            List<DevelopmentDTO> developments = developmentService.getAvailableDevelopments();
            return Response.ok(developments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener desarrollos disponibles: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/sold")
    public Response getSoldDevelopments() {
        try {
            List<DevelopmentDTO> developments = developmentService.getSoldDevelopments();
            return Response.ok(developments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener desarrollos vendidos: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/reserved")
    public Response getReservedDevelopments() {
        try {
            List<DevelopmentDTO> developments = developmentService.getReservedDevelopments();
            return Response.ok(developments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener desarrollos reservados: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/developer/{developer}")
    public Response getDevelopmentsByDeveloper(@PathParam("developer") String developer) {
        try {
            List<DevelopmentDTO> developments = developmentService.getDevelopmentsByDeveloper(developer);
            return Response.ok(developments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener desarrollos por desarrollador: " + e.getMessage())
                    .build();
        }
    }

    // Analytics and Statistics
    @GET
    @Path("/most-viewed")
    public Response getMostViewedDevelopments(@QueryParam("limit") @DefaultValue("10") int limit) {
        try {
            List<DevelopmentDTO> developments = developmentService.getMostViewedDevelopments(limit);
            return Response.ok(developments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener desarrollos más vistos: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/most-favorited")
    public Response getMostFavoritedDevelopments(@QueryParam("limit") @DefaultValue("10") int limit) {
        try {
            List<DevelopmentDTO> developments = developmentService.getMostFavoritedDevelopments(limit);
            return Response.ok(developments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener desarrollos más favoritos: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/recent")
    public Response getRecentDevelopments(@QueryParam("limit") @DefaultValue("10") int limit) {
        try {
            List<DevelopmentDTO> developments = developmentService.getRecentDevelopments(limit);
            return Response.ok(developments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener desarrollos recientes: " + e.getMessage())
                    .build();
        }
    }

    // Statistics
    @GET
    @Path("/stats/counts")
    public Response getDevelopmentCounts() {
        try {
            return Response.ok(new DevelopmentCounts(
                developmentService.getTotalCount(),
                developmentService.getActiveCount(),
                developmentService.getPublishedCount(),
                developmentService.getAvailableCount(),
                developmentService.getSoldCount(),
                developmentService.getReservedCount()
            )).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener estadísticas: " + e.getMessage())
                    .build();
        }
    }

    // Action Operations
    @POST
    @Path("/{id}/increment-views")
    public Response incrementViews(@PathParam("id") Long id) {
        try {
            developmentService.incrementViews(id);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al incrementar vistas: " + e.getMessage())
                    .build();
        }
    }

    @POST
    @Path("/{id}/increment-favorites")
    public Response incrementFavorites(@PathParam("id") Long id) {
        try {
            developmentService.incrementFavorites(id);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al incrementar favoritos: " + e.getMessage())
                    .build();
        }
    }

    @POST
    @Path("/{id}/decrement-favorites")
    public Response decrementFavorites(@PathParam("id") Long id) {
        try {
            developmentService.decrementFavorites(id);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al decrementar favoritos: " + e.getMessage())
                    .build();
        }
    }

    @POST
    @Path("/{id}/increment-shares")
    public Response incrementShares(@PathParam("id") Long id) {
        try {
            developmentService.incrementShares(id);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al incrementar compartidos: " + e.getMessage())
                    .build();
        }
    }

    @POST
    @Path("/{id}/increment-inquiries")
    public Response incrementInquiries(@PathParam("id") Long id) {
        try {
            developmentService.incrementInquiries(id);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al incrementar consultas: " + e.getMessage())
                    .build();
        }
    }

    // Toggle Operations
    @PUT
    @Path("/{id}/featured")
    public Response setFeatured(@PathParam("id") Long id, @QueryParam("featured") boolean featured) {
        try {
            developmentService.setFeatured(id, featured);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al cambiar estado destacado: " + e.getMessage())
                    .build();
        }
    }

    @PUT
    @Path("/{id}/premium")
    public Response setPremium(@PathParam("id") Long id, @QueryParam("premium") boolean premium) {
        try {
            developmentService.setPremium(id, premium);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al cambiar estado premium: " + e.getMessage())
                    .build();
        }
    }

    @PUT
    @Path("/{id}/published")
    public Response setPublished(@PathParam("id") Long id, @QueryParam("published") boolean published) {
        try {
            developmentService.setPublished(id, published);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al cambiar estado publicado: " + e.getMessage())
                    .build();
        }
    }

    @PUT
    @Path("/{id}/active")
    public Response setActive(@PathParam("id") Long id, @QueryParam("active") boolean active) {
        try {
            developmentService.setActive(id, active);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al cambiar estado activo: " + e.getMessage())
                    .build();
        }
    }

    // Advanced Search with multiple criteria
    @GET
    @Path("/advanced-search")
    public Response advancedSearch(
            @QueryParam("type") DevelopmentType type,
            @QueryParam("status") DevelopmentStatus status,
            @QueryParam("city") String city,
            @QueryParam("minPrice") BigDecimal minPrice,
            @QueryParam("maxPrice") BigDecimal maxPrice,
            @QueryParam("featured") Boolean featured,
            @QueryParam("premium") Boolean premium) {
        try {
            List<DevelopmentDTO> developments = developmentService.getDevelopmentsByCriteria(
                type, status, city, minPrice, maxPrice, featured, premium);
            return Response.ok(developments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error en búsqueda avanzada: " + e.getMessage())
                    .build();
        }
    }

    // Inner class for statistics response
    public static class DevelopmentCounts {
        private long total;
        private long active;
        private long published;
        private long available;
        private long sold;
        private long reserved;

        public DevelopmentCounts(long total, long active, long published, long available, long sold, long reserved) {
            this.total = total;
            this.active = active;
            this.published = published;
            this.available = available;
            this.sold = sold;
            this.reserved = reserved;
        }

        // Getters
        public long getTotal() { return total; }
        public long getActive() { return active; }
        public long getPublished() { return published; }
        public long getAvailable() { return available; }
        public long getSold() { return sold; }
        public long getReserved() { return reserved; }
    }
} 