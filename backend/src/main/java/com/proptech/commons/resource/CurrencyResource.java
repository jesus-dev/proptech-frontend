package com.proptech.commons.resource;

import com.proptech.commons.dto.CurrencyDTO;
import com.proptech.commons.service.CurrencyService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/currencies")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CurrencyResource {

    @Inject
    CurrencyService currencyService;

    @GET
    public List<CurrencyDTO> getAll() {
        return currencyService.getAll();
    }

    @GET
    @Path("/active")
    public List<CurrencyDTO> getActive() {
        return currencyService.getActive();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        CurrencyDTO dto = currencyService.getById(id);
        if (dto == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(dto).build();
    }

    @POST
    public Response create(CurrencyDTO dto) {
        CurrencyDTO created = currencyService.create(dto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, CurrencyDTO dto) {
        CurrencyDTO updated = currencyService.update(id, dto);
        if (updated == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(updated).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = currencyService.delete(id);
        if (!deleted) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.noContent().build();
    }
} 