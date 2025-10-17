package com.proptech.commons.resource;

import com.proptech.commons.dto.CityDTO;
import com.proptech.commons.service.CityService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/cities")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CityResource {
    @Inject
    CityService cityService;

    @GET
    public List<CityDTO> getAll() {
        return cityService.listAll();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        try {
            CityDTO city = cityService.findById(id);
            return Response.ok(city).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }
} 