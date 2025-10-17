package com.proptech.subscriptions.resource;

import com.proptech.auth.security.Secured;
import com.proptech.subscriptions.dto.SubscriptionPlanDTO;
import com.proptech.subscriptions.dto.UserSubscriptionDTO;
import com.proptech.subscriptions.enums.SubscriptionType;
import com.proptech.subscriptions.service.SubscriptionService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Resource para gestión de suscripciones
 */
@Path("/api/subscriptions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Secured
public class SubscriptionResource {
    
    @Inject
    SubscriptionService subscriptionService;
    
    /**
     * Obtener todos los planes disponibles
     */
    @GET
    @Path("/plans")
    public Response getAllPlans() {
        try {
            List<SubscriptionPlanDTO> plans = subscriptionService.getAllActivePlans();
            return Response.ok(plans).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    /**
     * Obtener planes de PropTech
     */
    @GET
    @Path("/plans/proptech")
    public Response getPropTechPlans() {
        try {
            List<SubscriptionPlanDTO> plans = subscriptionService.getPropTechPlans();
            return Response.ok(plans).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    /**
     * Obtener plan de Network
     */
    @GET
    @Path("/plans/network")
    public Response getNetworkPlan() {
        try {
            Optional<SubscriptionPlanDTO> plan = subscriptionService.getNetworkPlan();
            if (plan.isPresent()) {
                return Response.ok(plan.get()).build();
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Plan de Network no encontrado");
                return Response.status(Response.Status.NOT_FOUND).entity(error).build();
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    /**
     * Obtener plan por ID
     */
    @GET
    @Path("/plans/{planId}")
    public Response getPlanById(@PathParam("planId") Long planId) {
        try {
            Optional<SubscriptionPlanDTO> plan = subscriptionService.getPlanById(planId);
            if (plan.isPresent()) {
                return Response.ok(plan.get()).build();
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Plan no encontrado");
                return Response.status(Response.Status.NOT_FOUND).entity(error).build();
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    /**
     * Obtener suscripciones activas del usuario
     */
    @GET
    @Path("/user/{userId}")
    public Response getUserSubscriptions(@PathParam("userId") Long userId) {
        try {
            List<UserSubscriptionDTO> subscriptions = subscriptionService.getUserActiveSubscriptions(userId);
            return Response.ok(subscriptions).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    /**
     * Obtener suscripción activa del usuario por tipo
     */
    @GET
    @Path("/user/{userId}/type/{type}")
    public Response getUserSubscriptionByType(@PathParam("userId") Long userId, 
                                            @PathParam("type") String typeStr) {
        try {
            SubscriptionType type = SubscriptionType.valueOf(typeStr.toUpperCase());
            Optional<UserSubscriptionDTO> subscription = subscriptionService
                    .getUserActiveSubscriptionByType(userId, type);
            
            if (subscription.isPresent()) {
                return Response.ok(subscription.get()).build();
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Suscripción no encontrada");
                return Response.status(Response.Status.NOT_FOUND).entity(error).build();
            }
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Tipo de suscripción inválido: " + typeStr);
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    /**
     * Verificar acceso del usuario
     */
    @GET
    @Path("/user/{userId}/access")
    public Response getUserAccess(@PathParam("userId") Long userId) {
        try {
            Map<String, Object> access = new HashMap<>();
            access.put("hasPropTechAccess", subscriptionService.hasProptechAccess(userId));
            access.put("hasNetworkAccess", subscriptionService.hasNetworkAccess(userId));
            access.put("propTechTier", subscriptionService.getUserPropTechTier(userId).name());
            
            return Response.ok(access).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    /**
     * Suscribir usuario a un plan
     */
    @POST
    @Path("/subscribe")
    public Response subscribeUser(Map<String, Object> requestData) {
        try {
            Long userId = Long.valueOf(requestData.get("userId").toString());
            Long planId = Long.valueOf(requestData.get("planId").toString());
            String paymentReference = (String) requestData.get("paymentReference");
            String salesAgentCode = (String) requestData.get("salesAgentCode"); // Opcional
            
            if (paymentReference == null || paymentReference.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Referencia de pago es obligatoria");
                return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
            }
            
            UserSubscriptionDTO subscription = subscriptionService.subscribeUser(userId, planId, paymentReference, salesAgentCode);
            return Response.ok(subscription).build();
            
        } catch (NumberFormatException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "IDs inválidos");
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }
    }
    
    /**
     * Cancelar suscripción
     */
    @PUT
    @Path("/{subscriptionId}/cancel")
    public Response cancelSubscription(@PathParam("subscriptionId") Long subscriptionId,
                                     Map<String, String> requestData) {
        try {
            String reason = requestData.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                reason = "Cancelación solicitada por el usuario";
            }
            
            UserSubscriptionDTO subscription = subscriptionService.cancelSubscription(subscriptionId, reason);
            return Response.ok(subscription).build();
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }
    }
    
    /**
     * Cambiar plan de suscripción (inmediato, sin datos de pago - solo para planes mensuales)
     */
    @PUT
    @Path("/change-plan")
    public Response changePlan(Map<String, Object> requestData) {
        try {
            Long userId = Long.valueOf(requestData.get("userId").toString());
            Long newPlanId = Long.valueOf(requestData.get("newPlanId").toString());
            
            UserSubscriptionDTO subscription = subscriptionService.changePlan(userId, newPlanId);
            return Response.ok(subscription).build();
            
        } catch (NumberFormatException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "IDs inválidos");
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }
    }
    
    /**
     * Cambiar plan de suscripción con pago inmediato (para planes anuales)
     */
    @PUT
    @Path("/change-plan-with-payment")
    public Response changePlanWithPayment(Map<String, Object> requestData) {
        try {
            Long userId = Long.valueOf(requestData.get("userId").toString());
            Long newPlanId = Long.valueOf(requestData.get("newPlanId").toString());
            String paymentReference = (String) requestData.get("paymentReference");
            String salesAgentCode = (String) requestData.get("salesAgentCode"); // Opcional
            
            if (paymentReference == null || paymentReference.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Referencia de pago es obligatoria para planes anuales");
                return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
            }
            
            UserSubscriptionDTO subscription = subscriptionService.changePlanWithPayment(userId, newPlanId, paymentReference, salesAgentCode);
            return Response.ok(subscription).build();
            
        } catch (NumberFormatException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "IDs inválidos");
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }
    }
    
    /**
     * Renovar suscripción
     */
    @PUT
    @Path("/{subscriptionId}/renew")
    public Response renewSubscription(@PathParam("subscriptionId") Long subscriptionId,
                                    Map<String, String> requestData) {
        try {
            String paymentReference = requestData.get("paymentReference");
            if (paymentReference == null || paymentReference.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Referencia de pago es obligatoria");
                return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
            }
            
            UserSubscriptionDTO subscription = subscriptionService.renewSubscription(subscriptionId, paymentReference);
            return Response.ok(subscription).build();
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }
    }
    
    /**
     * Obtener suscripciones que expiran pronto (solo para administradores)
     */
    @GET
    @Path("/expiring/{days}")
    public Response getExpiringSubscriptions(@PathParam("days") int days) {
        try {
            List<UserSubscriptionDTO> subscriptions = subscriptionService.getExpiringSubscriptions(days);
            return Response.ok(subscriptions).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }

    // ===================== ADMIN ENDPOINTS =====================

    /**
     * Obtener todas las suscripciones (ADMIN)
     */
    @GET
    @Path("/admin/all")
    public Response getAllUserSubscriptions(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size,
            @QueryParam("status") String status,
            @QueryParam("planType") String planType) {
        try {
            List<UserSubscriptionDTO> subscriptions = subscriptionService.getAllUserSubscriptions(page, size, status, planType);
            return Response.ok(subscriptions).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener todas las suscripciones: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }

    /**
     * Crear plan de suscripción (ADMIN)
     */
    @POST
    @Path("/admin/plans")
    public Response createPlan(SubscriptionPlanDTO planDTO) {
        try {
            SubscriptionPlanDTO createdPlan = subscriptionService.createPlan(planDTO);
            return Response.status(Response.Status.CREATED).entity(createdPlan).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear plan: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }

    /**
     * Actualizar plan de suscripción (ADMIN)
     */
    @PUT
    @Path("/admin/plans/{planId}")
    public Response updatePlan(@PathParam("planId") Long planId, SubscriptionPlanDTO planDTO) {
        try {
            SubscriptionPlanDTO updatedPlan = subscriptionService.updatePlan(planId, planDTO);
            return Response.ok(updatedPlan).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al actualizar plan: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }

    /**
     * Eliminar plan de suscripción (ADMIN)
     */
    @DELETE
    @Path("/admin/plans/{planId}")
    public Response deletePlan(@PathParam("planId") Long planId) {
        try {
            subscriptionService.deletePlan(planId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Plan eliminado exitosamente");
            return Response.ok(response).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar plan: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }

    /**
     * Obtener estadísticas de suscripciones (ADMIN)
     */
    @GET
    @Path("/admin/stats")
    @RolesAllowed({"ADMIN", "MANAGER"})
    public Response getSubscriptionStats() {
        try {
            Map<String, Object> stats = subscriptionService.getSubscriptionStats();
            return Response.ok(stats).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener estadísticas: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
}
