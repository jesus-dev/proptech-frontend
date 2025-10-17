package com.proptech.partners.resource;

import com.proptech.partners.dto.PartnerPaymentDTO;
import com.proptech.partners.service.PartnerPaymentService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/partner-payments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PartnerPaymentResource {
    @Inject
    PartnerPaymentService partnerPaymentService;

    @GET
    public List<PartnerPaymentDTO> listAll() {
        return partnerPaymentService.listAll();
    }

    @GET
    @Path("/partner/{partnerId}")
    public List<PartnerPaymentDTO> findByPartnerId(@PathParam("partnerId") Long partnerId) {
        return partnerPaymentService.findByPartnerId(partnerId);
    }

    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id) {
        PartnerPaymentDTO payment = partnerPaymentService.findById(id);
        if (payment == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(payment).build();
    }

    @POST
    @Transactional
    public Response create(PartnerPaymentDTO dto) {
        PartnerPaymentDTO created = partnerPaymentService.create(dto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, PartnerPaymentDTO dto) {
        PartnerPaymentDTO updated = partnerPaymentService.update(id, dto);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(updated).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = partnerPaymentService.delete(id);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.noContent().build();
    }
} 