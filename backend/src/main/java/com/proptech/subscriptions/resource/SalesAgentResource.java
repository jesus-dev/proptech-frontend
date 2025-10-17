package com.proptech.subscriptions.resource;

import com.proptech.subscriptions.entity.SalesAgent;
import com.proptech.subscriptions.entity.Commission;
import com.proptech.subscriptions.service.SubscriptionService;
import com.proptech.subscriptions.repository.SalesAgentRepository;
import com.proptech.subscriptions.repository.CommissionRepository;
import com.proptech.subscriptions.enums.SalesAgentStatus;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.math.BigDecimal;

@Path("/api/sales-agents")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SalesAgentResource {

    @Inject
    SalesAgentRepository salesAgentRepository;

    @Inject
    CommissionRepository commissionRepository;

    @Inject
    SubscriptionService subscriptionService;

    /**
     * Obtener todos los agentes de ventas
     */
    @GET
    @RolesAllowed({"ADMIN", "MANAGER"})
    public Response getAllSalesAgents() {
        try {
            List<SalesAgent> agents = salesAgentRepository.listAll();
            return Response.ok(agents).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener agentes de ventas: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }

    /**
     * Obtener agente de ventas por ID
     */
    @GET
    @Path("/{agentId}")
    @RolesAllowed({"ADMIN", "MANAGER"})
    public Response getSalesAgent(@PathParam("agentId") Long agentId) {
        try {
            Optional<SalesAgent> agent = salesAgentRepository.findByIdOptional(agentId);
            if (agent.isPresent()) {
                return Response.ok(agent.get()).build();
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Agente de ventas no encontrado");
                return Response.status(Response.Status.NOT_FOUND).entity(error).build();
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener agente de ventas: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }

    /**
     * Crear nuevo agente de ventas
     */
    @POST
    @Transactional
    @RolesAllowed({"ADMIN", "MANAGER"})
    public Response createSalesAgent(Map<String, Object> requestData) {
        try {
            SalesAgent agent = new SalesAgent();
            agent.setAgentCode((String) requestData.get("agentCode"));
            agent.setFullName((String) requestData.get("fullName"));
            agent.setEmail((String) requestData.get("email"));
            agent.setPhone((String) requestData.get("phone"));
            
            // Convertir el porcentaje de comisión
            Object commissionObj = requestData.get("commissionPercentage");
            BigDecimal commissionPercentage;
            if (commissionObj instanceof Number) {
                commissionPercentage = new BigDecimal(commissionObj.toString());
            } else {
                commissionPercentage = new BigDecimal((String) commissionObj);
            }
            agent.setCommissionPercentage(commissionPercentage);
            
            agent.setNotes((String) requestData.get("notes"));
            agent.setCreatedBy((String) requestData.get("createdBy"));
            agent.setStatus(SalesAgentStatus.ACTIVE);

            salesAgentRepository.persist(agent);
            return Response.status(Response.Status.CREATED).entity(agent).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear agente de ventas: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }

    /**
     * Actualizar agente de ventas
     */
    @PUT
    @Path("/{agentId}")
    @Transactional
    @RolesAllowed({"ADMIN", "MANAGER"})
    public Response updateSalesAgent(@PathParam("agentId") Long agentId, Map<String, Object> requestData) {
        try {
            Optional<SalesAgent> agentOpt = salesAgentRepository.findByIdOptional(agentId);
            if (!agentOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Agente de ventas no encontrado");
                return Response.status(Response.Status.NOT_FOUND).entity(error).build();
            }

            SalesAgent agent = agentOpt.get();
            
            if (requestData.containsKey("fullName")) {
                agent.setFullName((String) requestData.get("fullName"));
            }
            if (requestData.containsKey("email")) {
                agent.setEmail((String) requestData.get("email"));
            }
            if (requestData.containsKey("phone")) {
                agent.setPhone((String) requestData.get("phone"));
            }
            if (requestData.containsKey("commissionPercentage")) {
                Object commissionObj = requestData.get("commissionPercentage");
                BigDecimal commissionPercentage;
                if (commissionObj instanceof Number) {
                    commissionPercentage = new BigDecimal(commissionObj.toString());
                } else {
                    commissionPercentage = new BigDecimal((String) commissionObj);
                }
                agent.setCommissionPercentage(commissionPercentage);
            }
            if (requestData.containsKey("notes")) {
                agent.setNotes((String) requestData.get("notes"));
            }
            if (requestData.containsKey("status")) {
                String statusStr = (String) requestData.get("status");
                agent.setStatus(SalesAgentStatus.valueOf(statusStr.toUpperCase()));
            }

            salesAgentRepository.persist(agent);
            return Response.ok(agent).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al actualizar agente de ventas: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }

    /**
     * Eliminar agente de ventas (desactivar)
     */
    @DELETE
    @Path("/{agentId}")
    @Transactional
    @RolesAllowed({"ADMIN", "MANAGER"})
    public Response deleteSalesAgent(@PathParam("agentId") Long agentId) {
        try {
            Optional<SalesAgent> agentOpt = salesAgentRepository.findByIdOptional(agentId);
            if (!agentOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Agente de ventas no encontrado");
                return Response.status(Response.Status.NOT_FOUND).entity(error).build();
            }

            // Cambiar estado a INACTIVE en lugar de eliminar
            SalesAgent agent = agentOpt.get();
            agent.setStatus(SalesAgentStatus.INACTIVE);
            salesAgentRepository.persist(agent);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Agente de ventas desactivado exitosamente");
            return Response.ok(response).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar agente de ventas: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }

    /**
     * Obtener comisiones de un agente
     */
    @GET
    @Path("/{agentId}/commissions")
    @RolesAllowed({"ADMIN", "MANAGER"})
    public Response getAgentCommissions(@PathParam("agentId") Long agentId) {
        try {
            List<Commission> commissions = commissionRepository.findBySalesAgentId(agentId);
            return Response.ok(commissions).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener comisiones: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }

    /**
     * Marcar comisión como pagada
     */
    @PUT
    @Path("/commissions/{commissionId}/pay")
    @Transactional
    @RolesAllowed({"ADMIN", "MANAGER"})
    public Response payCommission(@PathParam("commissionId") Long commissionId, Map<String, String> requestData) {
        try {
            String paymentReference = requestData.get("paymentReference");
            if (paymentReference == null || paymentReference.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Referencia de pago es obligatoria");
                return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
            }

            subscriptionService.payCommission(commissionId, paymentReference);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Comisión marcada como pagada exitosamente");
            return Response.ok(response).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al marcar comisión como pagada: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
}
