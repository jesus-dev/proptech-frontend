package com.proptech.commons.resource;

import java.io.InputStream;
import java.util.List;

import org.jboss.resteasy.reactive.RestForm;

import com.proptech.properties.dto.GalleryImageDTO;
import com.proptech.properties.service.GalleryImageService;

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

@Path("/api/gallery-images")
@Produces(MediaType.APPLICATION_JSON)
public class GalleryImageResource {

    @Inject
    GalleryImageService galleryImageService;

    @GET
    @Path("/property/{propertyId}")
    public List<GalleryImageDTO> getImagesByPropertyId(@PathParam("propertyId") Long propertyId) {
        return galleryImageService.findByPropertyId(propertyId);
    }

    @POST
    @Path("/property/{propertyId}")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public GalleryImageDTO uploadImage(
            @PathParam("propertyId") Long propertyId,
            @RestForm InputStream file,
            @RestForm String fileName) {
        return galleryImageService.saveImage(propertyId, file, fileName);
    }

    @PUT
    @Path("/{imageId}/order")
    public GalleryImageDTO updateOrder(
            @PathParam("imageId") Long imageId,
            @QueryParam("orderIndex") Integer orderIndex) {
        return galleryImageService.updateOrder(imageId, orderIndex);
    }

    @DELETE
    @Path("/{imageId}")
    public Response deleteImage(@PathParam("imageId") Long imageId) {
        try {
            galleryImageService.deleteImage(imageId);
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        }
    }
} 