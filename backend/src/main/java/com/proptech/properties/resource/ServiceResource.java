package com.proptech.properties.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.proptech.properties.entity.Service;
import com.proptech.properties.service.ServiceService;

@Path("/api/services")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ServiceResource {

    @Inject
    ServiceService serviceService;

    public static class ServiceDTO {
        public Long id;
        public String name;
        public String description;
        public String type;
        public Boolean includedInRent;
        public Boolean includedInSale;
        public Boolean active;

        public ServiceDTO() {}

        public ServiceDTO(Long id, String name, String description, String type, Boolean includedInRent, Boolean includedInSale, Boolean active) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.type = type;
            this.includedInRent = includedInRent;
            this.includedInSale = includedInSale;
            this.active = active;
        }
    }

    public static class ServiceCreateDTO {
        public String name;
        public String description;
        public String type;
        public Boolean includedInRent;
        public Boolean includedInSale;
        public Boolean active;
    }

    @GET
    public List<ServiceDTO> listAll() {
        return serviceService.listAll().stream()
            .map(s -> new ServiceDTO(s.getId(), s.getName(), s.getDescription(), s.getType(), s.getIncludedInRent(), s.getIncludedInSale(), s.getActive()))
            .collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        Optional<Service> service = serviceService.findById(id);
        if (service.isPresent()) {
            Service s = service.get();
            ServiceDTO dto = new ServiceDTO(s.getId(), s.getName(), s.getDescription(), s.getType(), s.getIncludedInRent(), s.getIncludedInSale(), s.getActive());
            return Response.ok(dto).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @POST
    public Response create(ServiceCreateDTO dto) {
        Service service = new Service();
        service.setName(dto.name);
        service.setDescription(dto.description);
        service.setType(dto.type);
        service.setIncludedInRent(dto.includedInRent);
        service.setIncludedInSale(dto.includedInSale);
        service.setActive(dto.active != null ? dto.active : true);

        Service created = serviceService.create(service);
        ServiceDTO responseDto = new ServiceDTO(created.getId(), created.getName(), created.getDescription(), created.getType(), created.getIncludedInRent(), created.getIncludedInSale(), created.getActive());
        
        return Response.status(Response.Status.CREATED).entity(responseDto).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, ServiceCreateDTO dto) {
        try {
            Service service = new Service();
            service.setName(dto.name);
            service.setDescription(dto.description);
            service.setType(dto.type);
            service.setIncludedInRent(dto.includedInRent);
            service.setIncludedInSale(dto.includedInSale);
            service.setActive(dto.active);

            Service updated = serviceService.update(id, service);
            ServiceDTO responseDto = new ServiceDTO(updated.getId(), updated.getName(), updated.getDescription(), updated.getType(), updated.getIncludedInRent(), updated.getIncludedInSale(), updated.getActive());
            
            return Response.ok(responseDto).build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        try {
            serviceService.delete(id);
            return Response.noContent().build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        }
    }
} 