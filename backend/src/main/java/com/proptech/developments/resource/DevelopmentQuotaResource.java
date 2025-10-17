package com.proptech.developments.resource;

import java.util.List;
import java.util.Map;

import com.proptech.developments.dto.DevelopmentQuotaDTO;
import com.proptech.developments.enums.QuotaStatus;
import com.proptech.developments.enums.QuotaType;
import com.proptech.developments.service.DevelopmentQuotaService;

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

@Path("/api/developments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DevelopmentQuotaResource {

    @Inject
    DevelopmentQuotaService developmentQuotaService;

    @GET
    @Path("/quotas")
    public Response getAllQuotas() {
        try {
            List<DevelopmentQuotaDTO> quotas = developmentQuotaService.getAllQuotas();
            return Response.ok(quotas).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/{developmentId}/quotas")
    public Response getQuotasByDevelopmentId(@PathParam("developmentId") Long developmentId) {
        try {
            List<DevelopmentQuotaDTO> quotas = developmentQuotaService.getQuotasByDevelopmentId(developmentId);
            return Response.ok(quotas).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/quotas/{id}")
    public Response getQuotaById(@PathParam("id") Long id) {
        try {
            DevelopmentQuotaDTO quota = developmentQuotaService.getQuotaById(id);
            return Response.ok(quota).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/{developmentId}/quotas")
    public Response createQuota(@PathParam("developmentId") Long developmentId, DevelopmentQuotaDTO quotaDTO) {
        try {
            quotaDTO.setDevelopmentId(developmentId);
            DevelopmentQuotaDTO createdQuota = developmentQuotaService.createQuota(quotaDTO);
            return Response.status(Response.Status.CREATED).entity(createdQuota).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @PUT
    @Path("/quotas/{id}")
    public Response updateQuota(@PathParam("id") Long id, DevelopmentQuotaDTO quotaDTO) {
        try {
            DevelopmentQuotaDTO updatedQuota = developmentQuotaService.updateQuota(id, quotaDTO);
            return Response.ok(updatedQuota).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @DELETE
    @Path("/quotas/{id}")
    public Response deleteQuota(@PathParam("id") Long id) {
        try {
            developmentQuotaService.deleteQuota(id);
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/quotas/status/{status}")
    public Response getQuotasByStatus(@PathParam("status") String status) {
        try {
            QuotaStatus quotaStatus = QuotaStatus.valueOf(status.toUpperCase());
            List<DevelopmentQuotaDTO> quotas = developmentQuotaService.getQuotasByStatus(quotaStatus);
            return Response.ok(quotas).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/quotas/type/{type}")
    public Response getQuotasByType(@PathParam("type") String type) {
        try {
            QuotaType quotaType = QuotaType.valueOf(type.toUpperCase());
            List<DevelopmentQuotaDTO> quotas = developmentQuotaService.getQuotasByType(quotaType);
            return Response.ok(quotas).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/units/{unitId}/quotas")
    public Response getQuotasByUnitId(@PathParam("unitId") Long unitId) {
        try {
            List<DevelopmentQuotaDTO> quotas = developmentQuotaService.getQuotasByUnitId(unitId);
            return Response.ok(quotas).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/quotas/overdue")
    public Response getOverdueQuotas() {
        try {
            List<DevelopmentQuotaDTO> quotas = developmentQuotaService.getOverdueQuotas();
            return Response.ok(quotas).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/quotas/due-soon")
    public Response getDueSoonQuotas(@QueryParam("days") Integer days) {
        try {
            int daysAhead = days != null ? days : 7;
            List<DevelopmentQuotaDTO> quotas = developmentQuotaService.getDueSoonQuotas(daysAhead);
            return Response.ok(quotas).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/quotas/pending")
    public Response getPendingQuotas() {
        try {
            List<DevelopmentQuotaDTO> quotas = developmentQuotaService.getPendingQuotas();
            return Response.ok(quotas).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/quotas/{id}/payment")
    public Response recordPayment(@PathParam("id") Long id, Map<String, Object> paymentData) {
        try {
            DevelopmentQuotaDTO updatedQuota = developmentQuotaService.recordPayment(id, paymentData);
            return Response.ok(updatedQuota).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/quotas/stats")
    public Response getStats() {
        try {
            Map<String, Object> stats = developmentQuotaService.getStats();
            return Response.ok(stats).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }
} 