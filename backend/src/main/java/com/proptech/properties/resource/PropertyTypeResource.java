package com.proptech.properties.resource;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.stream.Collectors;

import com.proptech.properties.entity.PropertyType;
import com.proptech.properties.repository.PropertyTypeRepository;

@Path("/api/property-types")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PropertyTypeResource {

    @Inject
    PropertyTypeRepository propertyTypeRepository;

    // DTO simple para exponer solo los campos necesarios
    public static class PropertyTypeDTO {
        public Long id;
        public String name;
        public String description;
        public Boolean active;
        public Long parentId;
        public String parentName;
    }

    @GET
    public List<PropertyTypeDTO> listAll() {
        return propertyTypeRepository.findAllWithParent().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    @GET
    @Path("/parents")
    public List<PropertyTypeDTO> listParentTypes() {
        return propertyTypeRepository.findParentTypes().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    @GET
    @Path("/{id}/children")
    public List<PropertyTypeDTO> listChildTypes(@PathParam("id") Long parentId) {
        return propertyTypeRepository.findChildTypes(parentId).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        PropertyType propertyType = propertyTypeRepository.findById(id);
        if (propertyType == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(toDTO(propertyType)).build();
    }

    @POST
    @Transactional
    public Response create(PropertyTypeDTO dto) {
        try {
            PropertyType propertyType = new PropertyType();
            propertyType.setName(dto.name);
            propertyType.setDescription(dto.description);
            propertyType.setActive(dto.active != null ? dto.active : true);
            
            // Establecer parent si se proporciona
            if (dto.parentId != null) {
                PropertyType parent = propertyTypeRepository.findById(dto.parentId);
                if (parent != null) {
                    propertyType.setParent(parent);
                }
            }
            
            propertyTypeRepository.persist(propertyType);
            
            PropertyTypeDTO createdDto = toDTO(propertyType);
            return Response.status(Response.Status.CREATED).entity(createdDto).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error creating property type: " + e.getMessage())
                .build();
        }
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, PropertyTypeDTO dto) {
        try {
            PropertyType propertyType = propertyTypeRepository.findById(id);
            if (propertyType == null) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
            
            propertyType.setName(dto.name);
            propertyType.setDescription(dto.description);
            if (dto.active != null) {
                propertyType.setActive(dto.active);
            }
            
            // Actualizar parent si se proporciona
            if (dto.parentId != null) {
                PropertyType parent = propertyTypeRepository.findById(dto.parentId);
                propertyType.setParent(parent);
            } else {
                propertyType.setParent(null);
            }
            
            PropertyTypeDTO updatedDto = toDTO(propertyType);
            return Response.ok(updatedDto).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error updating property type: " + e.getMessage())
                .build();
        }
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        try {
            PropertyType propertyType = propertyTypeRepository.findById(id);
            if (propertyType == null) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
            
            propertyTypeRepository.delete(propertyType);
            return Response.status(Response.Status.NO_CONTENT).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error deleting property type: " + e.getMessage())
                .build();
        }
    }

    private PropertyTypeDTO toDTO(PropertyType propertyType) {
        PropertyTypeDTO dto = new PropertyTypeDTO();
        dto.id = propertyType.getId();
        dto.name = propertyType.getName();
        dto.description = propertyType.getDescription();
        dto.active = propertyType.getActive();
        
        if (propertyType.getParent() != null) {
            dto.parentId = propertyType.getParent().getId();
            dto.parentName = propertyType.getParent().getName();
        }
        
        return dto;
    }
} 