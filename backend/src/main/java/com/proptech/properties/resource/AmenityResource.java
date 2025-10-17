package com.proptech.properties.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.proptech.properties.entity.Amenity;
import com.proptech.properties.service.AmenityService;

@Path("/api/amenities")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AmenityResource {

    @Inject
    AmenityService amenityService;

    public static class AmenityDTO {
        public Long id;
        public String name;
        public String description;
        public String category;
        public String icon;
        public Boolean active;

        public AmenityDTO() {}

        public AmenityDTO(Long id, String name, String description, String category, String icon, Boolean active) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.category = category;
            this.icon = icon;
            this.active = active;
        }
    }

    public static class AmenityCreateDTO {
        public String name;
        public String description;
        public String category;
        public String icon;
        public Boolean active;
    }

    @GET
    public List<AmenityDTO> listAll(@QueryParam("name") String name) {
        List<Amenity> amenities;
        if (name != null && !name.trim().isEmpty()) {
            amenities = amenityService.findByName(name);
        } else {
            amenities = amenityService.listAll();
        }
        return amenities.stream()
            .map(a -> new AmenityDTO(a.getId(), a.getName(), a.getDescription(), a.getCategory(), a.getIcon(), a.getActive()))
            .collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        Optional<Amenity> amenity = amenityService.findById(id);
        if (amenity.isPresent()) {
            Amenity a = amenity.get();
            AmenityDTO dto = new AmenityDTO(a.getId(), a.getName(), a.getDescription(), a.getCategory(), a.getIcon(), a.getActive());
            return Response.ok(dto).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @POST
    public Response create(AmenityCreateDTO dto) {
        Amenity amenity = new Amenity();
        amenity.setName(dto.name);
        amenity.setDescription(dto.description);
        amenity.setIcon(dto.icon);
        amenity.setCategory(dto.category);
        amenity.setActive(dto.active != null ? dto.active : true);

        Amenity created = amenityService.create(amenity);
        AmenityDTO responseDto = new AmenityDTO(created.getId(), created.getName(), created.getDescription(), created.getCategory(), created.getIcon(), created.getActive());
        
        return Response.status(Response.Status.CREATED).entity(responseDto).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, AmenityCreateDTO dto) {
        try {
            Amenity amenity = new Amenity();
            amenity.setName(dto.name);
            amenity.setDescription(dto.description);
            amenity.setIcon(dto.icon);
            amenity.setCategory(dto.category);
            amenity.setActive(dto.active);

            Amenity updated = amenityService.update(id, amenity);
            AmenityDTO responseDto = new AmenityDTO(updated.getId(), updated.getName(), updated.getDescription(), updated.getCategory(), updated.getIcon(), updated.getActive());
            
            return Response.ok(responseDto).build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        try {
            amenityService.delete(id);
            return Response.noContent().build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        }
    }
} 