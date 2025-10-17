package com.proptech.commons.resource;

import java.io.InputStream;
import java.util.List;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.RestForm;

import com.proptech.properties.dto.PrivateFileDTO;
import com.proptech.properties.service.PrivateFileService;

@Path("/api/private-files")
@Produces(MediaType.APPLICATION_JSON)
public class PrivateFileResource {

    @Inject
    PrivateFileService privateFileService;

    @GET
    @Path("/property/{propertyId}")
    public List<PrivateFileDTO> getFilesByPropertyId(@PathParam("propertyId") Long propertyId) {
        return privateFileService.findByPropertyId(propertyId);
    }

    @POST
    @Path("/property/{propertyId}")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public PrivateFileDTO uploadFile(
            @PathParam("propertyId") Long propertyId,
            @RestForm InputStream file,
            @RestForm String fileName) {
        return privateFileService.saveFile(propertyId, file, fileName);
    }

    @DELETE
    @Path("/{fileId}")
    public Response deleteFile(@PathParam("fileId") Long fileId) {
        try {
            privateFileService.deleteFile(fileId);
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        }
    }
} 