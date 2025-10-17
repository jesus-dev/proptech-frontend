package com.proptech.partners.resource;

import com.proptech.partners.dto.PartnerDTO;
import com.proptech.partners.service.PartnerService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/partners")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PartnerResource {
    @Inject
    PartnerService partnerService;

    @GET
    public List<PartnerDTO> listAll() {
        return partnerService.listAll();
    }

    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id) {
        PartnerDTO partner = partnerService.findById(id);
        if (partner == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(partner).build();
    }

    @POST
    @Transactional
    public Response create(PartnerDTO dto) {
        PartnerDTO created = partnerService.create(dto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, PartnerDTO dto) {
        PartnerDTO updated = partnerService.update(id, dto);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(updated).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = partnerService.delete(id);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.noContent().build();
    }
} 