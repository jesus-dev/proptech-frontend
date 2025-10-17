package com.proptech.commons.resource;

import com.proptech.commons.entity.Neighborhood;
import com.proptech.commons.repository.NeighborhoodRepository;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/neighborhoods")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NeighborhoodResource {
    @Inject
    NeighborhoodRepository neighborhoodRepository;

    @GET
    public List<Neighborhood> getAll() {
        return neighborhoodRepository.listAll();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        Neighborhood neighborhood = neighborhoodRepository.findById(id);
        if (neighborhood == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(neighborhood).build();
    }
} 