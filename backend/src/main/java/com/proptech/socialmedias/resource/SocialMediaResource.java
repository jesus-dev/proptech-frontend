package com.proptech.socialmedias.resource;

import java.util.List;

import com.proptech.properties.dto.PropertyDTO;
import com.proptech.properties.service.PropertyService;
import com.proptech.socialmedias.dto.SocialMediaPostDTO;
import com.proptech.socialmedias.service.SocialMediaService;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/social-media")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SocialMediaResource {

    @Inject
    SocialMediaService socialMediaService;

    @Inject
    PropertyService propertyService;

    @POST
    @Path("/publish-property/{propertyId}")
    public Response publishPropertyToSocialMedia(@PathParam("propertyId") Long propertyId, 
                                                List<String> platforms) {
        try {
            PropertyDTO property = propertyService.findById(propertyId);
            if (property == null) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\": \"Property not found\"}")
                    .build();
            }

            SocialMediaPostDTO result = socialMediaService.publishPropertyToSocialMedia(property, platforms);
            
            return Response.ok(result).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error publishing to social media: " + e.getMessage() + "\"}")
                .build();
        }
    }

    @GET
    @Path("/platforms")
    public Response getAvailablePlatforms() {
        try {
            List<String> platforms = socialMediaService.getAvailablePlatforms();
            return Response.ok(platforms).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error getting platforms: " + e.getMessage() + "\"}")
                .build();
        }
    }

    @GET
    @Path("/facebook/status")
    public Response getFacebookStatus() {
        try {
            String status = socialMediaService.getFacebookAccountInfo();
            return Response.ok("{\"status\": \"" + status + "\"}").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error getting Facebook status: " + e.getMessage() + "\"}")
                .build();
        }
    }

    @GET
    @Path("/instagram/status")
    public Response getInstagramStatus() {
        try {
            String status = socialMediaService.getInstagramAccountInfo();
            return Response.ok("{\"status\": \"" + status + "\"}").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error getting Instagram status: " + e.getMessage() + "\"}")
                .build();
        }
    }
} 