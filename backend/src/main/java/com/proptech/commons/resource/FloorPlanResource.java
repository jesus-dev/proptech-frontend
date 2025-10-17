package com.proptech.commons.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

import com.proptech.properties.dto.FloorPlanDTO;
import com.proptech.properties.service.FloorPlanService;

@Path("/api/properties/{propertyId}/floor-plans")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FloorPlanResource {

    @Inject
    FloorPlanService floorPlanService;

    @GET
    public Response getFloorPlans(@PathParam("propertyId") Long propertyId) {
        try {
            List<FloorPlanDTO> floorPlans = floorPlanService.getFloorPlansByPropertyId(propertyId);
            return Response.ok(floorPlans).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving floor plans: " + e.getMessage())
                    .build();
        }
    }

    @POST
    public Response saveFloorPlans(@PathParam("propertyId") Long propertyId, List<FloorPlanDTO> floorPlans) {
        try {
            floorPlanService.saveFloorPlans(propertyId, floorPlans);
            return Response.ok().entity("Floor plans saved successfully").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error saving floor plans: " + e.getMessage())
                    .build();
        }
    }

    @DELETE
    public Response deleteFloorPlans(@PathParam("propertyId") Long propertyId) {
        try {
            floorPlanService.deleteFloorPlansByPropertyId(propertyId);
            return Response.ok().entity("Floor plans deleted successfully").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error deleting floor plans: " + e.getMessage())
                    .build();
        }
    }
} 