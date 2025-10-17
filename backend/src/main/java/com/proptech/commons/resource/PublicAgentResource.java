package com.proptech.commons.resource;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.proptech.commons.entity.Agent;
import com.proptech.commons.repository.AgentRepository;
import com.proptech.properties.dto.PropertyDTO;
import com.proptech.properties.entity.Property;
import com.proptech.properties.mapper.PropertyMapper;
import com.proptech.properties.repository.PropertyRepository;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/public/agents")
@Produces(MediaType.APPLICATION_JSON)
public class PublicAgentResource {

    @Inject
    AgentRepository agentRepository;

    @Inject
    PropertyRepository propertyRepository;

    public static class PublicAgentDTO {
        public Long id;
        public String name;
        public String email;
        public String phone;
        public String photo;
        public String bio;
        public Long agencyId;
        public String agencyName;

        public PublicAgentDTO() {}

        public PublicAgentDTO(Agent agent) {
            this.id = agent.getId();
            String firstName = agent.getFirstName() != null ? agent.getFirstName() : "";
            String lastName = agent.getLastName() != null ? agent.getLastName() : "";
            String fullName = (firstName + " " + lastName).trim();
            this.name = fullName.isEmpty() && agent.getUser() != null
                ? ((agent.getUser().getFirstName() != null ? agent.getUser().getFirstName() : "") + " " + (agent.getUser().getLastName() != null ? agent.getUser().getLastName() : "")).trim()
                : fullName;
            this.email = agent.getEmail();
            this.phone = agent.getUser() != null ? agent.getUser().getPhone() : null;
            this.photo = agent.getPhoto();
            this.bio = agent.getBio();
            this.agencyId = agent.getAgency() != null ? agent.getAgency().getId() : null;
            this.agencyName = agent.getAgency() != null ? agent.getAgency().getName() : null;
        }
    }

    @GET
    public Response listAgents(@QueryParam("agencyId") Long agencyId) {
        try {
            List<Agent> agents = agentRepository.listAll();
            if (agencyId != null) {
                agents = agents.stream()
                    .filter(a -> a.getAgency() != null && agencyId.equals(a.getAgency().getId()))
                    .collect(Collectors.toList());
            }
            List<PublicAgentDTO> dtos = agents.stream().map(PublicAgentDTO::new).collect(Collectors.toList());
            return Response.ok(dtos).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Error al obtener agentes: " + e.getMessage()))
                .build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getAgent(@PathParam("id") Long id, @QueryParam("agencyId") Long agencyId) {
        try {
            Agent agent = agentRepository.findById(id);
            if (agent == null) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Agente no encontrado"))
                    .build();
            }
            if (agencyId != null && (agent.getAgency() == null || !agencyId.equals(agent.getAgency().getId()))) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Agente no encontrado"))
                    .build();
            }
            return Response.ok(new PublicAgentDTO(agent)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Error al obtener agente: " + e.getMessage()))
                .build();
        }
    }

    @GET
    @Path("/{id}/properties")
    public Response getAgentProperties(@PathParam("id") Long agentId, @QueryParam("agencyId") Long agencyId) {
        try {
            // Validate agent belongs to agency when agencyId provided
            Agent agent = agentRepository.findById(agentId);
            if (agent == null) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Agente no encontrado"))
                    .build();
            }
            if (agencyId != null && (agent.getAgency() == null || !agencyId.equals(agent.getAgency().getId()))) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Agente no encontrado"))
                    .build();
            }

            List<Property> properties = propertyRepository.findByAgent(agentId);
            List<PropertyDTO> dtos = PropertyMapper.toDTOList(properties);
            if (agencyId != null) {
                dtos = dtos.stream()
                    .filter(p -> p.agencyId != null && p.agencyId.equals(agencyId))
                    .collect(Collectors.toList());
            }
            return Response.ok(dtos).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Error al obtener propiedades de agente: " + e.getMessage()))
                .build();
        }
    }

    @GET
    @Path("/top")
    public Response getTopAgents(@QueryParam("limit") Integer limit, @QueryParam("agencyId") Long agencyId) {
        try {
            int effectiveLimit = (limit == null || limit <= 0) ? 10 : limit;
            List<Agent> agents = agentRepository.listAll();
            if (agencyId != null) {
                agents = agents.stream()
                    .filter(a -> a.getAgency() != null && agencyId.equals(a.getAgency().getId()))
                    .collect(Collectors.toList());
            }

            // Simple heuristic: active agents first, then by id desc
            List<PublicAgentDTO> top = agents.stream()
                .sorted((a1, a2) -> {
                    int activeCompare = Boolean.compare(a2.getIsActive() != null && a2.getIsActive(), a1.getIsActive() != null && a1.getIsActive());
                    if (activeCompare != 0) return activeCompare;
                    return Long.compare(a2.getId(), a1.getId());
                })
                .limit(effectiveLimit)
                .map(PublicAgentDTO::new)
                .collect(Collectors.toList());

            return Response.ok(top).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", "Error al obtener agentes destacados: " + e.getMessage()))
                .build();
        }
    }
}


