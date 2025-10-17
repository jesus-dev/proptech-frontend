package com.proptech.properties.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;

import com.proptech.properties.repository.PropertyStatusRepository;
import com.proptech.properties.entity.PropertyStatus;
import com.proptech.properties.service.PropertyService;

@Path("/api/property-status")
@Produces(MediaType.APPLICATION_JSON)
public class PropertyStatusResource {

    @Inject
    PropertyStatusRepository propertyStatusRepository;

    @Inject
    PropertyService propertyService;

    public static class PropertyStatusDTO {
        public Long id;
        public String name;
        public String code; // Código interno que nunca cambia
        public String description;
        public Boolean isSystem; // Protege registros del sistema
        public PropertyStatusDTO(Long id, String name, String code, String description, Boolean isSystem) {
            this.id = id;
            this.name = name;
            this.code = code;
            this.description = description;
            this.isSystem = isSystem;
        }
    }

    @GET
    public List<PropertyStatusDTO> listAll() {
        return propertyStatusRepository.listAll().stream()
            .map(ps -> new PropertyStatusDTO(ps.getId(), ps.getName(), ps.getCode(), ps.getDescription(), ps.getIsSystem()))
            .collect(Collectors.toList());
    }

    @GET
    @Path("/system")
    public List<PropertyStatusDTO> listSystemStatuses() {
        return propertyStatusRepository.find("isSystem", true).stream()
            .map(ps -> new PropertyStatusDTO(ps.getId(), ps.getName(), ps.getCode(), ps.getDescription(), ps.getIsSystem()))
            .collect(Collectors.toList());
    }

    @GET
    @Path("/custom")
    public List<PropertyStatusDTO> listCustomStatuses() {
        return propertyStatusRepository.find("isSystem", false).stream()
            .map(ps -> new PropertyStatusDTO(ps.getId(), ps.getName(), ps.getCode(), ps.getDescription(), ps.getIsSystem()))
            .collect(Collectors.toList());
    }

    @DELETE
    @Path("/{id}")
    public Response deleteStatus(@PathParam("id") Long id) {
        try {
            boolean deleted = propertyService.deletePropertyStatus(id);
            if (deleted) {
                return Response.noContent().build();
            } else {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
        } catch (RuntimeException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(e.getMessage())
                .build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response updateStatus(@PathParam("id") Long id, PropertyStatus updatedStatus) {
        try {
            PropertyStatus updated = propertyService.updatePropertyStatus(id, updatedStatus);
            return Response.ok(updated).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(e.getMessage())
                .build();
        }
    }
} 