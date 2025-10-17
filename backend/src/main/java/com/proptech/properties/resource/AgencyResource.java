package com.proptech.properties.resource;

import java.util.List;
import java.util.stream.Collectors;

import com.proptech.commons.entity.Agency;
import com.proptech.commons.repository.AgencyRepository;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/agencies")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AgencyResource {

    @Inject
    AgencyRepository agencyRepository;

    public static class AgencyDTO {
        public Long id;
        public String name;
        public String address;
        public String phone;
        public String email;
        public String website;
        public String logoUrl;
        public String description;
        public Boolean active;
        
        public AgencyDTO() {}
        
        public AgencyDTO(Long id, String name, String address, String phone, String email, String website, String logoUrl, String description, Boolean active) {
            this.id = id;
            this.name = name;
            this.address = address;
            this.phone = phone;
            this.email = email;
            this.website = website;
            this.logoUrl = logoUrl;
            this.description = description;
            this.active = active;
        }
    }

    @GET
    public List<AgencyDTO> listAll() {
        return agencyRepository.listAll().stream()
            .map(a -> new AgencyDTO(a.getId(), a.getName(), a.getAddress(), a.getPhone(), a.getEmail(), a.getWebsite(), a.getLogoUrl(), a.getDescription(), a.getActive()))
            .collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        Agency agency = agencyRepository.findById(id);
        if (agency == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        AgencyDTO dto = new AgencyDTO(agency.getId(), agency.getName(), agency.getAddress(), agency.getPhone(), agency.getEmail(), agency.getWebsite(), agency.getLogoUrl(), agency.getDescription(), agency.getActive());
        return Response.ok(dto).build();
    }

    @POST
    @Transactional
    public Response create(AgencyDTO dto) {
        Agency agency = new Agency();
        agency.setName(dto.name);
        agency.setAddress(dto.address);
        agency.setPhone(dto.phone);
        agency.setEmail(dto.email);
        agency.setWebsite(dto.website);
        agency.setLogoUrl(dto.logoUrl);
        agency.setDescription(dto.description);
        agency.setActive(dto.active != null ? dto.active : true);
        
        agencyRepository.persist(agency);
        
        AgencyDTO createdDto = new AgencyDTO(agency.getId(), agency.getName(), agency.getAddress(), agency.getPhone(), agency.getEmail(), agency.getWebsite(), agency.getLogoUrl(), agency.getDescription(), agency.getActive());
        return Response.status(Response.Status.CREATED).entity(createdDto).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, AgencyDTO dto) {
        Agency agency = agencyRepository.findById(id);
        if (agency == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        
        if (dto.name != null) agency.setName(dto.name);
        if (dto.address != null) agency.setAddress(dto.address);
        if (dto.phone != null) agency.setPhone(dto.phone);
        if (dto.email != null) agency.setEmail(dto.email);
        if (dto.website != null) agency.setWebsite(dto.website);
        if (dto.logoUrl != null) agency.setLogoUrl(dto.logoUrl);
        if (dto.description != null) agency.setDescription(dto.description);
        if (dto.active != null) agency.setActive(dto.active);
        
        AgencyDTO updatedDto = new AgencyDTO(agency.getId(), agency.getName(), agency.getAddress(), agency.getPhone(), agency.getEmail(), agency.getWebsite(), agency.getLogoUrl(), agency.getDescription(), agency.getActive());
        return Response.ok(updatedDto).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        Agency agency = agencyRepository.findById(id);
        if (agency == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        
        agencyRepository.delete(agency);
        return Response.status(Response.Status.NO_CONTENT).build();
    }
} 