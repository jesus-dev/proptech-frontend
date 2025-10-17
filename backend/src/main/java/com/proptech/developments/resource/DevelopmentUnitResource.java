package com.proptech.developments.resource;

import java.util.List;
import java.util.Map;

import com.proptech.developments.dto.DevelopmentUnitDTO;
import com.proptech.developments.enums.UnitStatus;
import com.proptech.developments.enums.UnitType;
import com.proptech.developments.service.DevelopmentUnitService;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/developments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DevelopmentUnitResource {

    @Inject
    DevelopmentUnitService developmentUnitService;

    @GET
    @Path("/units")
    public Response getAllUnits() {
        try {
            List<DevelopmentUnitDTO> units = developmentUnitService.getAllUnits();
            return Response.ok(units).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/{developmentId}/units")
    public Response getUnitsByDevelopmentId(@PathParam("developmentId") Long developmentId) {
        try {
            List<DevelopmentUnitDTO> units = developmentUnitService.getUnitsByDevelopmentId(developmentId);
            return Response.ok(units).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/units/{id}")
    public Response getUnitById(@PathParam("id") Long id) {
        try {
            DevelopmentUnitDTO unit = developmentUnitService.getUnitById(id);
            return Response.ok(unit).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/{developmentId}/units")
    public Response createUnit(@PathParam("developmentId") Long developmentId, DevelopmentUnitDTO unitDTO) {
        try {
            unitDTO.setDevelopmentId(developmentId);
            DevelopmentUnitDTO createdUnit = developmentUnitService.createUnit(unitDTO);
            return Response.status(Response.Status.CREATED).entity(createdUnit).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @PUT
    @Path("/units/{id}")
    public Response updateUnit(@PathParam("id") Long id, DevelopmentUnitDTO unitDTO) {
        try {
            DevelopmentUnitDTO updatedUnit = developmentUnitService.updateUnit(id, unitDTO);
            return Response.ok(updatedUnit).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @DELETE
    @Path("/units/{id}")
    public Response deleteUnit(@PathParam("id") Long id) {
        try {
            developmentUnitService.deleteUnit(id);
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/units/status/{status}")
    public Response getUnitsByStatus(@PathParam("status") String status) {
        try {
            UnitStatus unitStatus = UnitStatus.valueOf(status.toUpperCase());
            List<DevelopmentUnitDTO> units = developmentUnitService.getUnitsByStatus(unitStatus);
            return Response.ok(units).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/units/type/{type}")
    public Response getUnitsByType(@PathParam("type") String type) {
        try {
            UnitType unitType = UnitType.valueOf(type.toUpperCase());
            List<DevelopmentUnitDTO> units = developmentUnitService.getUnitsByType(unitType);
            return Response.ok(units).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/units/available")
    public Response getAvailableUnits() {
        try {
            List<DevelopmentUnitDTO> units = developmentUnitService.getAvailableUnits();
            return Response.ok(units).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/units/featured")
    public Response getFeaturedUnits() {
        try {
            List<DevelopmentUnitDTO> units = developmentUnitService.getFeaturedUnits();
            return Response.ok(units).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/units/premium")
    public Response getPremiumUnits() {
        try {
            List<DevelopmentUnitDTO> units = developmentUnitService.getPremiumUnits();
            return Response.ok(units).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/units/{id}/views")
    public Response incrementViews(@PathParam("id") Long id) {
        try {
            developmentUnitService.incrementViews(id);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/units/{id}/favorites")
    public Response incrementFavorites(@PathParam("id") Long id) {
        try {
            developmentUnitService.incrementFavorites(id);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @DELETE
    @Path("/units/{id}/favorites")
    public Response decrementFavorites(@PathParam("id") Long id) {
        try {
            developmentUnitService.decrementFavorites(id);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/units/{id}/inquiries")
    public Response incrementInquiries(@PathParam("id") Long id) {
        try {
            developmentUnitService.incrementInquiries(id);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/units/stats")
    public Response getStats() {
        try {
            Map<String, Object> stats = Map.of(
                "total", developmentUnitService.getTotalCount(),
                "available", developmentUnitService.getAvailableCount()
            );
            return Response.ok(stats).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }
} 