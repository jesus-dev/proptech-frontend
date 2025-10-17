package com.proptech.inquiries.resource;

import com.proptech.inquiries.dto.InquiryDTO;
import com.proptech.inquiries.service.InquiryService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/inquiries")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InquiryResource {
    @Inject
    InquiryService inquiryService;

    @GET
    public List<InquiryDTO> listAll() {
        return inquiryService.listAll();
    }

    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id) {
        InquiryDTO inquiry = inquiryService.findById(id);
        if (inquiry == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(inquiry).build();
    }

    @POST
    @Transactional
    public Response create(InquiryDTO dto) {
        InquiryDTO created = inquiryService.create(dto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, InquiryDTO dto) {
        InquiryDTO updated = inquiryService.update(id, dto);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(updated).build();
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    public Response updateReadStatus(@PathParam("id") Long id, InquiryDTO dto) {
        InquiryDTO updated = inquiryService.updateReadStatus(id, dto.read);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(updated).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = inquiryService.delete(id);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.noContent().build();
    }

    @POST
    @Path("/seed")
    @Transactional
    public Response seedData() {
        // Crear datos de prueba
        InquiryDTO[] testData = {
            createTestInquiry("Juan Pérez", "juan.perez@email.com", "+595 981 123 456",
                "Hola, estoy interesado en la propiedad del centro. ¿Podríamos agendar una visita? Me gustaría verla este fin de semana si es posible. También me interesa saber si hay opciones de financiamiento disponibles.",
                101L, "/uploads/properties/2/img_2_0.avif", false),
            
            createTestInquiry("María López", "maria.lopez@email.com", "+595 981 654 321",
                "¿Está disponible para alquiler? ¿Cuáles son los requisitos? Necesito mudarme pronto y me interesa mucho esta propiedad. ¿Aceptan mascotas?",
                102L, "/uploads/properties/21906/img_21906_0.avif", true),
            
            createTestInquiry("Carlos Gómez", "carlos.gomez@email.com", "+595 981 789 123",
                "Me gustaría saber si aceptan mascotas en la propiedad. Tengo dos perros pequeños y es muy importante para mí. También necesito saber si incluye servicios básicos.",
                103L, "/uploads/properties/22027/img_22027_0.avif", false),
            
            createTestInquiry("Ana Rodríguez", "ana.rodriguez@email.com", "+595 981 456 789",
                "¿Tienen propiedades similares en la zona? Me interesa algo con jardín y buena iluminación natural. Mi presupuesto es de $150,000 USD.",
                104L, "/uploads/properties/22065/img_22065_0.avif", false),
            
            createTestInquiry("Roberto Silva", "roberto.silva@email.com", "+595 981 321 654",
                "¿Cuál es el proceso para comprar esta propiedad? ¿Necesito algún documento específico? Es mi primera compra y necesito orientación completa.",
                105L, "/uploads/properties/22092/img_22092_0.avif", true)
        };

        for (InquiryDTO dto : testData) {
            inquiryService.create(dto);
        }

        return Response.ok("Datos de prueba creados exitosamente").build();
    }

    private InquiryDTO createTestInquiry(String name, String email, String phone, String message, 
                                       Long propertyId, String propertyImage, Boolean read) {
        InquiryDTO dto = new InquiryDTO();
        dto.name = name;
        dto.email = email;
        dto.phone = phone;
        dto.message = message;
        dto.propertyId = propertyId;
        dto.propertyImage = propertyImage;
        dto.read = read;
        return dto;
    }
} 