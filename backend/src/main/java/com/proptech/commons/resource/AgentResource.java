package com.proptech.commons.resource;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

import com.proptech.commons.entity.Agent;
import com.proptech.commons.repository.AgentRepository;
import com.proptech.auth.entity.User;

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

@Path("/api/agents")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AgentResource {

    @Inject
    AgentRepository agentRepository;

    public static class AgentDTO {
        public String id;
        public String firstName;
        public String lastName;
        public String email;
        public String phone;
        public String dni;
        public String license;
        public String position;
        public String bio;
        public String photo;
        public String agencyId;
        public String agencyName;
        public Boolean active;
        public Boolean isActive;
        public String role;
        public String createdAt;
        public String updatedAt;
        
        public AgentDTO() {}
        
        public AgentDTO(Agent agent) {
            this.id = agent.getId().toString();
            this.firstName = agent.getFirstName();
            this.lastName = agent.getLastName();
            this.email = agent.getEmail();
            this.phone = agent.getUser() != null ? agent.getUser().getPhone() : null;
            this.dni = agent.getDocumento();
            this.license = agent.getLicense();
            this.position = agent.getPosition();
            this.bio = agent.getBio();
            this.photo = agent.getPhoto();
            this.agencyId = agent.getAgency() != null ? agent.getAgency().getId().toString() : null;
            this.agencyName = agent.getAgency() != null ? agent.getAgency().getName() : null;
            this.active = agent.getIsActive();
            this.isActive = agent.getIsActive();
            this.role = agent.getRole() != null ? agent.getRole().toString() : null;
            this.createdAt = agent.getCreatedAt() != null ? agent.getCreatedAt().toString() : null;
            this.updatedAt = agent.getUpdatedAt() != null ? agent.getUpdatedAt().toString() : null;
        }
    }

    public static class AgentFormData {
        public String firstName;
        public String lastName;
        public String email;
        public String phone;
        public String dni;
        public String license;
        public String position;
        public String bio;
        public String photo;
        public String agencyId;
        public Boolean isActive;
        public Boolean active;
    }

    @GET
    public List<AgentDTO> getAllAgents() {
        return agentRepository.listAll().stream()
            .map(AgentDTO::new)
            .collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    public Response getAgentById(@PathParam("id") Long id) {
        Optional<Agent> agent = agentRepository.findByIdOptional(id);
        if (agent.isPresent()) {
            return Response.ok(new AgentDTO(agent.get())).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND)
                .entity("{\"error\": \"Agente no encontrado\"}")
                .build();
        }
    }

    @POST
    @Transactional
    public Response createAgent(AgentFormData formData) {
        try {
            // Crear o encontrar el usuario asociado
            User user = new User();
            user.setFirstName(formData.firstName);
            user.setLastName(formData.lastName);
            user.setEmail(formData.email);
            user.setPhone(formData.phone);
            user.persist();

            // Crear el agente
            Agent agent = new Agent();
            agent.setUser(user);
            agent.setDocumento(formData.dni);
            agent.setLicense(formData.license);
            agent.setPosition(formData.position);
            agent.setBio(formData.bio);
            agent.setPhoto(formData.photo);
            agent.setIsActive(formData.isActive != null ? formData.isActive : true);
            
            agent.persist();

            return Response.ok(new AgentDTO(agent)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error al crear agente: " + e.getMessage() + "\"}")
                .build();
        }
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response updateAgent(@PathParam("id") Long id, AgentFormData formData) {
        try {
            Optional<Agent> agentOpt = agentRepository.findByIdOptional(id);
            if (!agentOpt.isPresent()) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\": \"Agente no encontrado\"}")
                    .build();
            }

            Agent agent = agentOpt.get();
            User user = agent.getUser();
            
            if (user != null) {
                user.setFirstName(formData.firstName);
                user.setLastName(formData.lastName);
                user.setEmail(formData.email);
                user.setPhone(formData.phone);
            }

            agent.setDocumento(formData.dni);
            agent.setLicense(formData.license);
            agent.setPosition(formData.position);
            agent.setBio(formData.bio);
            agent.setPhoto(formData.photo);
            agent.setIsActive(formData.isActive != null ? formData.isActive : true);

            return Response.ok(new AgentDTO(agent)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error al actualizar agente: " + e.getMessage() + "\"}")
                .build();
        }
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deleteAgent(@PathParam("id") Long id) {
        try {
            Optional<Agent> agentOpt = agentRepository.findByIdOptional(id);
            if (!agentOpt.isPresent()) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\": \"Agente no encontrado\"}")
                    .build();
            }

            Agent agent = agentOpt.get();
            agent.delete();

            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error al eliminar agente: " + e.getMessage() + "\"}")
                .build();
        }
    }

    @GET
    @Path("/stats")
    public Response getAgentStats() {
        try {
            List<Agent> allAgents = agentRepository.listAll();
            
            long total = allAgents.size();
            long active = allAgents.stream().filter(Agent::getIsActive).count();
            long inactive = total - active;
            long withAgency = allAgents.stream().filter(a -> a.getAgency() != null).count();
            long withoutAgency = total - withAgency;

            String stats = String.format(
                "{\"total\": %d, \"active\": %d, \"inactive\": %d, \"withAgency\": %d, \"withoutAgency\": %d}",
                total, active, inactive, withAgency, withoutAgency
            );

            return Response.ok(stats).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error al obtener estadísticas: " + e.getMessage() + "\"}")
                .build();
        }
    }
}
