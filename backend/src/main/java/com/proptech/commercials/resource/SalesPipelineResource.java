package com.proptech.commercials.resource;

import java.util.List;
import java.util.Map;

import com.proptech.commercials.entity.SalesPipeline;
import com.proptech.commercials.service.SalesPipelineService;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/sales-pipeline")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SalesPipelineResource {

    @Inject
    SalesPipelineService salesPipelineService;

    @GET
    public Response getAllPipelines() {
        try {
            List<SalesPipeline> pipelines = salesPipelineService.getAllPipelines();
            return Response.ok(pipelines).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving pipelines: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getPipelineById(@PathParam("id") Long id) {
        try {
            SalesPipeline pipeline = salesPipelineService.getPipelineById(id);
            if (pipeline == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Pipeline not found")
                        .build();
            }
            return Response.ok(pipeline).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving pipeline: " + e.getMessage())
                    .build();
        }
    }

    @POST
    @Transactional
    public Response createPipeline(SalesPipeline pipeline) {
        try {
            SalesPipeline createdPipeline = salesPipelineService.createPipeline(pipeline);
            return Response.status(Response.Status.CREATED)
                    .entity(createdPipeline)
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error creating pipeline: " + e.getMessage())
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response updatePipeline(@PathParam("id") Long id, SalesPipeline pipeline) {
        try {
            SalesPipeline updatedPipeline = salesPipelineService.updatePipeline(id, pipeline);
            if (updatedPipeline == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Pipeline not found")
                        .build();
            }
            return Response.ok(updatedPipeline).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error updating pipeline: " + e.getMessage())
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deletePipeline(@PathParam("id") Long id) {
        try {
            SalesPipeline pipeline = salesPipelineService.getPipelineById(id);
            if (pipeline == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Pipeline not found")
                        .build();
            }
            salesPipelineService.deletePipeline(id);
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error deleting pipeline: " + e.getMessage())
                    .build();
        }
    }

    @PATCH
    @Path("/{id}/stage")
    @Transactional
    public Response moveToStage(
            @PathParam("id") Long id,
            @QueryParam("stage") String stage,
            @QueryParam("notes") String notes) {
        try {
            SalesPipeline updatedPipeline = salesPipelineService.moveToStage(id, stage, notes);
            if (updatedPipeline == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Pipeline not found")
                        .build();
            }
            return Response.ok(updatedPipeline).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error moving pipeline to stage: " + e.getMessage())
                    .build();
        }
    }

    @PATCH
    @Path("/{id}/contact")
    @Transactional
    public Response updateContact(
            @PathParam("id") Long id,
            @QueryParam("notes") String notes) {
        try {
            SalesPipeline updatedPipeline = salesPipelineService.updateContact(id, notes);
            if (updatedPipeline == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Pipeline not found")
                        .build();
            }
            return Response.ok(updatedPipeline).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error updating contact: " + e.getMessage())
                    .build();
        }
    }

    @PATCH
    @Path("/{id}/close")
    @Transactional
    public Response closeDeal(
            @PathParam("id") Long id,
            @QueryParam("closeReason") String closeReason,
            @QueryParam("actualValue") String actualValue,
            @QueryParam("commissionEarned") String commissionEarned) {
        try {
            java.math.BigDecimal actualValueBD = new java.math.BigDecimal(actualValue);
            java.math.BigDecimal commissionEarnedBD = new java.math.BigDecimal(commissionEarned);
            
            SalesPipeline updatedPipeline = salesPipelineService.closeDeal(id, closeReason, actualValueBD, commissionEarnedBD);
            if (updatedPipeline == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Pipeline not found")
                        .build();
            }
            return Response.ok(updatedPipeline).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error closing deal: " + e.getMessage())
                    .build();
        }
    }

    @PATCH
    @Path("/{id}/lose")
    @Transactional
    public Response loseDeal(
            @PathParam("id") Long id,
            @QueryParam("closeReason") String closeReason) {
        try {
            SalesPipeline updatedPipeline = salesPipelineService.loseDeal(id, closeReason);
            if (updatedPipeline == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Pipeline not found")
                        .build();
            }
            return Response.ok(updatedPipeline).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error losing deal: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/agent/{agentId}")
    public Response getPipelinesByAgent(@PathParam("agentId") Long agentId) {
        try {
            List<SalesPipeline> pipelines = salesPipelineService.getPipelinesByAgent(agentId);
            return Response.ok(pipelines).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving pipelines by agent: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/stage/{stage}")
    public Response getPipelinesByStage(@PathParam("stage") String stage) {
        try {
            List<SalesPipeline> pipelines = salesPipelineService.getPipelinesByStage(stage);
            return Response.ok(pipelines).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving pipelines by stage: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/active")
    public Response getActivePipelines() {
        try {
            List<SalesPipeline> pipelines = salesPipelineService.getActivePipelines();
            return Response.ok(pipelines).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving active pipelines: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/follow-up")
    public Response getLeadsNeedingFollowUp(@QueryParam("days") Integer daysThreshold) {
        try {
            int threshold = daysThreshold != null ? daysThreshold : 7;
            List<SalesPipeline> pipelines = salesPipelineService.getLeadsNeedingFollowUp(threshold);
            return Response.ok(pipelines).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving follow-up leads: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/upcoming-actions")
    public Response getUpcomingActions() {
        try {
            List<SalesPipeline> pipelines = salesPipelineService.getUpcomingActions();
            return Response.ok(pipelines).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving upcoming actions: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/high-probability")
    public Response getHighProbabilityLeads(@QueryParam("minProbability") Integer minProbability) {
        try {
            int threshold = minProbability != null ? minProbability : 70;
            List<SalesPipeline> pipelines = salesPipelineService.getHighProbabilityLeads(threshold);
            return Response.ok(pipelines).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving high probability leads: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/urgent")
    public Response getUrgentLeads() {
        try {
            List<SalesPipeline> pipelines = salesPipelineService.getUrgentLeads();
            return Response.ok(pipelines).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving urgent leads: " + e.getMessage())
                    .build();
        }
    }

    // Analytics endpoints
    @GET
    @Path("/analytics/overview")
    public Response getPipelineOverview() {
        try {
            Map<String, Object> overview = salesPipelineService.getPipelineOverview();
            return Response.ok(overview).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving pipeline overview: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/analytics/stages")
    public Response getStageBreakdown() {
        try {
            Map<String, Object> breakdown = salesPipelineService.getStageBreakdown();
            return Response.ok(breakdown).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving stage breakdown: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/analytics/agents")
    public Response getAgentPerformance() {
        try {
            Map<String, Object> performance = salesPipelineService.getAgentPerformance();
            return Response.ok(performance).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving agent performance: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/analytics/sources")
    public Response getSourceAnalysis() {
        try {
            Map<String, Object> analysis = salesPipelineService.getSourceAnalysis();
            return Response.ok(analysis).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving source analysis: " + e.getMessage())
                    .build();
        }
    }

    @POST
    @Path("/analytics/generate")
    public Response generateAnalytics() {
        try {
            salesPipelineService.generateDailyAnalytics();
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error generating analytics: " + e.getMessage())
                    .build();
        }
    }
} 