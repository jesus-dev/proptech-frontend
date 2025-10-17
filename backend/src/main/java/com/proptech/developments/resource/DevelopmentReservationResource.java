package com.proptech.developments.resource;

import java.util.List;
import java.util.Map;

import com.proptech.developments.dto.DevelopmentReservationDTO;
import com.proptech.developments.enums.ReservationStatus;
import com.proptech.developments.service.DevelopmentReservationService;

import jakarta.inject.Inject;
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

@Path("/api/developments/reservations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DevelopmentReservationResource {

    @Inject
    DevelopmentReservationService developmentReservationService;

    @GET
    public Response getAllReservations() {
        try {
            List<DevelopmentReservationDTO> reservations = developmentReservationService.getAllReservations();
            return Response.ok(reservations).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/development/{developmentId}")
    public Response getReservationsByDevelopmentId(@PathParam("developmentId") Long developmentId) {
        try {
            List<DevelopmentReservationDTO> reservations = developmentReservationService.getReservationsByDevelopmentId(developmentId);
            return Response.ok(reservations).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getReservationById(@PathParam("id") Long id) {
        try {
            DevelopmentReservationDTO reservation = developmentReservationService.getReservationById(id);
            return Response.ok(reservation).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/development/{developmentId}")
    public Response createReservation(@PathParam("developmentId") Long developmentId, DevelopmentReservationDTO reservationDTO) {
        try {
            reservationDTO.setDevelopmentId(developmentId);
            DevelopmentReservationDTO createdReservation = developmentReservationService.createReservation(reservationDTO);
            return Response.status(Response.Status.CREATED).entity(createdReservation).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response updateReservation(@PathParam("id") Long id, DevelopmentReservationDTO reservationDTO) {
        try {
            DevelopmentReservationDTO updatedReservation = developmentReservationService.updateReservation(id, reservationDTO);
            return Response.ok(updatedReservation).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deleteReservation(@PathParam("id") Long id) {
        try {
            developmentReservationService.deleteReservation(id);
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/status/{status}")
    public Response getReservationsByStatus(@PathParam("status") String status) {
        try {
            ReservationStatus reservationStatus = ReservationStatus.valueOf(status.toUpperCase());
            List<DevelopmentReservationDTO> reservations = developmentReservationService.getReservationsByStatus(reservationStatus);
            return Response.ok(reservations).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/unit/{unitId}")
    public Response getReservationsByUnitId(@PathParam("unitId") Long unitId) {
        try {
            List<DevelopmentReservationDTO> reservations = developmentReservationService.getReservationsByUnitId(unitId);
            return Response.ok(reservations).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/client/{email}")
    public Response getReservationsByClientEmail(@PathParam("email") String email) {
        try {
            List<DevelopmentReservationDTO> reservations = developmentReservationService.getReservationsByClientEmail(email);
            return Response.ok(reservations).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/document/{document}")
    public Response getReservationsByClientDocument(@PathParam("document") String document) {
        try {
            List<DevelopmentReservationDTO> reservations = developmentReservationService.getReservationsByClientDocument(document);
            return Response.ok(reservations).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/expired")
    public Response getExpiredReservations() {
        try {
            List<DevelopmentReservationDTO> reservations = developmentReservationService.getExpiredReservations();
            return Response.ok(reservations).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/expiring-soon")
    public Response getExpiringSoonReservations(@QueryParam("days") Integer days) {
        try {
            int daysAhead = days != null ? days : 7;
            List<DevelopmentReservationDTO> reservations = developmentReservationService.getExpiringSoonReservations(daysAhead);
            return Response.ok(reservations).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/pending")
    public Response getPendingReservations() {
        try {
            List<DevelopmentReservationDTO> reservations = developmentReservationService.getPendingReservations();
            return Response.ok(reservations).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/agent/{agentId}")
    public Response getReservationsByAgentId(@PathParam("agentId") String agentId) {
        try {
            List<DevelopmentReservationDTO> reservations = developmentReservationService.getReservationsByAgentId(agentId);
            return Response.ok(reservations).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/{id}/confirm")
    public Response confirmReservation(@PathParam("id") Long id) {
        try {
            DevelopmentReservationDTO updatedReservation = developmentReservationService.confirmReservation(id);
            return Response.ok(updatedReservation).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/{id}/cancel")
    public Response cancelReservation(@PathParam("id") Long id, Map<String, Object> cancelData) {
        try {
            String reason = (String) cancelData.get("reason");
            DevelopmentReservationDTO updatedReservation = developmentReservationService.cancelReservation(id, reason);
            return Response.ok(updatedReservation).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/{id}/convert")
    public Response convertToSale(@PathParam("id") Long id) {
        try {
            DevelopmentReservationDTO updatedReservation = developmentReservationService.convertToSale(id);
            return Response.ok(updatedReservation).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/stats")
    public Response getStats() {
        try {
            Map<String, Object> stats = developmentReservationService.getStats();
            return Response.ok(stats).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }
} 