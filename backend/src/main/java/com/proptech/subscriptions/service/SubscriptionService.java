package com.proptech.subscriptions.service;

import com.proptech.auth.entity.User;
import com.proptech.auth.repository.UserRepository;
import com.proptech.subscriptions.dto.SubscriptionPlanDTO;
import com.proptech.subscriptions.dto.UserSubscriptionDTO;
import com.proptech.subscriptions.entity.SubscriptionPlan;
import com.proptech.subscriptions.entity.UserSubscription;
import com.proptech.subscriptions.enums.SubscriptionStatus;
import com.proptech.subscriptions.enums.SubscriptionTier;
import com.proptech.subscriptions.enums.SubscriptionType;
import com.proptech.subscriptions.repository.SubscriptionPlanRepository;
import com.proptech.subscriptions.repository.UserSubscriptionRepository;
import com.proptech.subscriptions.repository.SalesAgentRepository;
import com.proptech.subscriptions.repository.CommissionRepository;
import com.proptech.subscriptions.entity.SalesAgent;
import com.proptech.subscriptions.entity.Commission;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Servicio para gestión de suscripciones
 */
@ApplicationScoped
public class SubscriptionService {
    
    @Inject
    SubscriptionPlanRepository subscriptionPlanRepository;
    
    @Inject
    UserSubscriptionRepository userSubscriptionRepository;
    
    @Inject
    UserRepository userRepository;
    
    @Inject
    SalesAgentRepository salesAgentRepository;
    
    @Inject
    CommissionRepository commissionRepository;
    
    /**
     * Obtener todos los planes de suscripción activos
     */
    public List<SubscriptionPlanDTO> getAllActivePlans() {
        return subscriptionPlanRepository.findActivePlans()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener planes de PropTech
     */
    public List<SubscriptionPlanDTO> getPropTechPlans() {
        return subscriptionPlanRepository.findPropTechPlansOrderByPrice()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener plan de Network
     */
    public Optional<SubscriptionPlanDTO> getNetworkPlan() {
        return subscriptionPlanRepository.findNetworkPlan()
                .map(this::toDTO);
    }
    
    /**
     * Obtener plan por ID
     */
    public Optional<SubscriptionPlanDTO> getPlanById(Long planId) {
        return subscriptionPlanRepository.findByIdOptional(planId)
                .map(this::toDTO);
    }
    
    /**
     * Obtener suscripciones activas del usuario
     */
    public List<UserSubscriptionDTO> getUserActiveSubscriptions(Long userId) {
        return userSubscriptionRepository.findActiveSubscriptionsByUserId(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener suscripción activa del usuario por tipo
     */
    public Optional<UserSubscriptionDTO> getUserActiveSubscriptionByType(Long userId, SubscriptionType type) {
        return userSubscriptionRepository.findActiveSubscriptionByUserIdAndType(userId, type)
                .map(this::toDTO);
    }
    
    /**
     * Verificar si el usuario tiene acceso a PropTech
     */
    public boolean hasProptechAccess(Long userId) {
        return userSubscriptionRepository.hasActiveSubscriptionOfType(userId, SubscriptionType.PROPTECH);
    }
    
    /**
     * Verificar si el usuario tiene acceso a Network
     */
    public boolean hasNetworkAccess(Long userId) {
        return userSubscriptionRepository.hasActiveSubscriptionOfType(userId, SubscriptionType.NETWORK) ||
               hasProptechAccess(userId); // PropTech incluye acceso a Network
    }
    
    /**
     * Obtener el tier actual del usuario en PropTech
     */
    public SubscriptionTier getUserPropTechTier(Long userId) {
        Optional<UserSubscription> subscription = userSubscriptionRepository
                .findActiveSubscriptionByUserIdAndType(userId, SubscriptionType.PROPTECH);
        
        if (subscription.isPresent()) {
            return subscription.get().getSubscriptionPlan().getTier();
        }
        
        return SubscriptionTier.FREE; // Por defecto es FREE
    }
    
    /**
     * Suscribir usuario a un plan
     */
    @Transactional
    public UserSubscriptionDTO subscribeUser(Long userId, Long planId, String paymentReference) {
        return subscribeUser(userId, planId, paymentReference, null);
    }
    
    /**
     * Suscribir usuario a un plan con agente de ventas
     */
    @Transactional
    public UserSubscriptionDTO subscribeUser(Long userId, Long planId, String paymentReference, String salesAgentCode) {
        User user = userRepository.findById(userId);
        if (user == null) {
            throw new RuntimeException("Usuario no encontrado con ID: " + userId);
        }
        
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId);
        if (plan == null) {
            throw new RuntimeException("Plan de suscripción no encontrado con ID: " + planId);
        }
        
        // Verificar si ya tiene una suscripción activa del mismo tipo
        Optional<UserSubscription> existingSubscription = userSubscriptionRepository
                .findActiveSubscriptionByUserIdAndType(userId, plan.getType());
        
        if (existingSubscription.isPresent()) {
            throw new RuntimeException("El usuario ya tiene una suscripción activa de tipo: " + plan.getType());
        }
        
        // Buscar agente de ventas si se proporciona código
        SalesAgent salesAgent = null;
        if (salesAgentCode != null && !salesAgentCode.trim().isEmpty()) {
            Optional<SalesAgent> agentOpt = salesAgentRepository.findByAgentCode(salesAgentCode.trim());
            if (agentOpt.isPresent() && agentOpt.get().isActive()) {
                salesAgent = agentOpt.get();
            }
        }
        
        // Crear nueva suscripción
        UserSubscription subscription = new UserSubscription();
        subscription.setUser(user);
        subscription.setSubscriptionPlan(plan);
        subscription.setSalesAgent(salesAgent);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(LocalDateTime.now().plusDays(plan.getBillingCycleDays()));
        subscription.setNextBillingDate(LocalDateTime.now().plusDays(plan.getBillingCycleDays()));
        subscription.setAmountPaid(plan.getPrice());
        subscription.setPaymentReference(paymentReference);
        subscription.setAutoRenew(true);
        
        userSubscriptionRepository.persist(subscription);
        
        // Crear comisión si hay agente de ventas
        if (salesAgent != null) {
            createCommission(salesAgent, subscription);
        }
        
        return toDTO(subscription);
    }
    
    /**
     * Cancelar suscripción
     */
    @Transactional
    public UserSubscriptionDTO cancelSubscription(Long subscriptionId, String reason) {
        UserSubscription subscription = userSubscriptionRepository.findById(subscriptionId);
        if (subscription == null) {
            throw new RuntimeException("Suscripción no encontrada con ID: " + subscriptionId);
        }
        
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setCancelledAt(LocalDateTime.now());
        subscription.setCancellationReason(reason);
        subscription.setAutoRenew(false);
        
        return toDTO(subscription);
    }
    
    /**
     * Renovar suscripción
     */
    @Transactional
    public UserSubscriptionDTO renewSubscription(Long subscriptionId, String paymentReference) {
        UserSubscription subscription = userSubscriptionRepository.findById(subscriptionId);
        if (subscription == null) {
            throw new RuntimeException("Suscripción no encontrada con ID: " + subscriptionId);
        }
        
        SubscriptionPlan plan = subscription.getSubscriptionPlan();
        
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setEndDate(subscription.getEndDate().plusDays(plan.getBillingCycleDays()));
        subscription.setNextBillingDate(subscription.getNextBillingDate().plusDays(plan.getBillingCycleDays()));
        subscription.setAmountPaid(plan.getPrice());
        subscription.setPaymentReference(paymentReference);
        
        return toDTO(subscription);
    }
    
    /**
     * Cambiar plan de suscripción existente (para planes mensuales - cambio inmediato)
     */
    @Transactional
    public UserSubscriptionDTO changePlan(Long userId, Long newPlanId) {
        // Buscar suscripción activa actual del usuario por tipo
        SubscriptionPlan newPlan = subscriptionPlanRepository.findById(newPlanId);
        if (newPlan == null) {
            throw new RuntimeException("Plan de suscripción no encontrado con ID: " + newPlanId);
        }
        
        Optional<UserSubscription> existingSubscription = userSubscriptionRepository
                .findActiveSubscriptionByUserIdAndType(userId, newPlan.getType());
        
        if (existingSubscription.isEmpty()) {
            throw new RuntimeException("No se encontró una suscripción activa del tipo: " + newPlan.getType());
        }
        
        UserSubscription currentSubscription = existingSubscription.get();
        SubscriptionPlan currentPlan = currentSubscription.getSubscriptionPlan();
        
        // Si es el mismo plan, no hay cambio
        if (currentPlan.getId().equals(newPlanId)) {
            throw new RuntimeException("Ya tienes el plan seleccionado activo");
        }
        
        // Verificar si es plan anual (365 días o más) - estos requieren pago inmediato
        if (newPlan.getBillingCycleDays() >= 365) {
            throw new RuntimeException("Los planes anuales requieren confirmación de pago. Use changePlanWithPayment().");
        }
        
        // Para planes mensuales: cambio inmediato, cobro en el próximo ciclo
        currentSubscription.setSubscriptionPlan(newPlan);
        currentSubscription.setUpdatedAt(LocalDateTime.now());
        
        // Mantener las fechas actuales - el cambio de precio se aplicará en el próximo ciclo
        
        return toDTO(currentSubscription);
    }
    
    /**
     * Cambiar plan de suscripción con pago inmediato (para planes anuales)
     */
    @Transactional
    public UserSubscriptionDTO changePlanWithPayment(Long userId, Long newPlanId, String paymentReference, String salesAgentCode) {
        // Buscar suscripción activa actual del usuario por tipo
        SubscriptionPlan newPlan = subscriptionPlanRepository.findById(newPlanId);
        if (newPlan == null) {
            throw new RuntimeException("Plan de suscripción no encontrado con ID: " + newPlanId);
        }
        
        Optional<UserSubscription> existingSubscription = userSubscriptionRepository
                .findActiveSubscriptionByUserIdAndType(userId, newPlan.getType());
        
        if (existingSubscription.isEmpty()) {
            throw new RuntimeException("No se encontró una suscripción activa del tipo: " + newPlan.getType());
        }
        
        UserSubscription currentSubscription = existingSubscription.get();
        SubscriptionPlan currentPlan = currentSubscription.getSubscriptionPlan();
        
        // Si es el mismo plan, no hay cambio
        if (currentPlan.getId().equals(newPlanId)) {
            throw new RuntimeException("Ya tienes el plan seleccionado activo");
        }
        
        // Buscar agente de ventas si se proporciona código
        SalesAgent salesAgent = null;
        if (salesAgentCode != null && !salesAgentCode.trim().isEmpty()) {
            Optional<SalesAgent> agentOpt = salesAgentRepository.findByAgentCode(salesAgentCode.trim());
            if (agentOpt.isPresent() && agentOpt.get().isActive()) {
                salesAgent = agentOpt.get();
            }
        }
        
        // Calcular diferencia de precio
        LocalDateTime now = LocalDateTime.now();
        long daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(now, currentSubscription.getEndDate());
        BigDecimal totalAmount = newPlan.getPrice();
        
        // Para planes anuales, calcular prorrateo si hay días restantes
        if (daysRemaining > 0 && currentPlan.getBillingCycleDays() >= 365) {
            BigDecimal dailyRate = currentPlan.getPrice().divide(
                BigDecimal.valueOf(currentPlan.getBillingCycleDays()), 
                new java.math.MathContext(2)
            );
            BigDecimal proratedRefund = dailyRate.multiply(BigDecimal.valueOf(daysRemaining));
            
            // Ajustar el monto total (diferencia a pagar)
            totalAmount = newPlan.getPrice().subtract(proratedRefund);
            if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
                totalAmount = BigDecimal.ZERO; // No reembolsos negativos
            }
        }
        
        // Cambiar el plan y actualizar información de pago
        currentSubscription.setSubscriptionPlan(newPlan);
        currentSubscription.setSalesAgent(salesAgent);
        currentSubscription.setAmountPaid(totalAmount);
        currentSubscription.setPaymentReference(paymentReference);
        currentSubscription.setUpdatedAt(now);
        
        // Para planes anuales, extender las fechas
        if (newPlan.getBillingCycleDays() >= 365) {
            currentSubscription.setNextBillingDate(now.plusDays(newPlan.getBillingCycleDays()));
            currentSubscription.setEndDate(now.plusDays(newPlan.getBillingCycleDays()));
        }
        
        // Crear comisión si hay agente de ventas
        if (salesAgent != null) {
            createCommission(salesAgent, currentSubscription);
        }
        
        return toDTO(currentSubscription);
    }
    
    /**
     * Obtener suscripciones que expiran pronto
     */
    public List<UserSubscriptionDTO> getExpiringSubscriptions(int daysAhead) {
        LocalDateTime futureDate = LocalDateTime.now().plusDays(daysAhead);
        return userSubscriptionRepository.findExpiringSubscriptions(futureDate)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Marcar suscripciones expiradas
     */
    @Transactional
    public void markExpiredSubscriptions() {
        List<UserSubscription> expiredSubscriptions = userSubscriptionRepository.findExpiredSubscriptions();
        for (UserSubscription subscription : expiredSubscriptions) {
            subscription.setStatus(SubscriptionStatus.EXPIRED);
        }
    }
    
    /**
     * Convertir entidad a DTO
     */
    private SubscriptionPlanDTO toDTO(SubscriptionPlan plan) {
        SubscriptionPlanDTO dto = new SubscriptionPlanDTO();
        dto.setId(plan.getId());
        dto.setName(plan.getName());
        dto.setDescription(plan.getDescription());
        dto.setType(plan.getType());
        dto.setTier(plan.getTier());
        dto.setPrice(plan.getPrice());
        dto.setBillingCycleDays(plan.getBillingCycleDays());
        dto.setMaxProperties(plan.getMaxProperties());
        dto.setMaxAgents(plan.getMaxAgents());
        dto.setHasAnalytics(plan.getHasAnalytics());
        dto.setHasCrm(plan.getHasCrm());
        dto.setHasNetworkAccess(plan.getHasNetworkAccess());
        dto.setHasPrioritySupport(plan.getHasPrioritySupport());
        dto.setIsActive(plan.getIsActive());
        dto.setCreatedAt(plan.getCreatedAt());
        dto.setUpdatedAt(plan.getUpdatedAt());
        
        // Generar lista de características
        List<String> features = new ArrayList<>();
        if (plan.getMaxProperties() != null) {
            features.add("Hasta " + (plan.getMaxProperties() == -1 ? "ilimitadas" : plan.getMaxProperties()) + " propiedades");
        }
        if (plan.getMaxAgents() != null) {
            features.add("Hasta " + (plan.getMaxAgents() == -1 ? "ilimitados" : plan.getMaxAgents()) + " agentes");
        }
        if (Boolean.TRUE.equals(plan.getHasAnalytics())) {
            features.add("Análisis y reportes avanzados");
        }
        if (Boolean.TRUE.equals(plan.getHasCrm())) {
            features.add("CRM integrado");
        }
        if (Boolean.TRUE.equals(plan.getHasNetworkAccess())) {
            features.add("Acceso a red social");
        }
        if (Boolean.TRUE.equals(plan.getHasPrioritySupport())) {
            features.add("Soporte prioritario");
        }
        dto.setFeatures(features);
        
        return dto;
    }
    
    /**
     * Convertir entidad a DTO
     */
    private UserSubscriptionDTO toDTO(UserSubscription subscription) {
        UserSubscriptionDTO dto = new UserSubscriptionDTO();
        dto.setId(subscription.getId());
        dto.setUserId(subscription.getUser().getId());
        dto.setUserName(subscription.getUser().getFirstName() + " " + subscription.getUser().getLastName());
        dto.setSubscriptionPlanId(subscription.getSubscriptionPlan().getId());
        dto.setSubscriptionPlan(toDTO(subscription.getSubscriptionPlan()));
        dto.setStatus(subscription.getStatus());
        dto.setStartDate(subscription.getStartDate());
        dto.setEndDate(subscription.getEndDate());
        dto.setNextBillingDate(subscription.getNextBillingDate());
        dto.setAmountPaid(subscription.getAmountPaid());
        dto.setPaymentReference(subscription.getPaymentReference());
        dto.setAutoRenew(subscription.getAutoRenew());
        dto.setCancelledAt(subscription.getCancelledAt());
        dto.setCancellationReason(subscription.getCancellationReason());
        dto.setCreatedAt(subscription.getCreatedAt());
        dto.setUpdatedAt(subscription.getUpdatedAt());
        
        // Campos calculados
        dto.setIsActive(subscription.isActive());
        dto.setIsExpired(subscription.isExpired());
        
        if (subscription.getEndDate() != null) {
            long daysRemaining = ChronoUnit.DAYS.between(LocalDateTime.now(), subscription.getEndDate());
            dto.setDaysRemaining((int) Math.max(0, daysRemaining));
        }
        
        return dto;
    }
    
    /**
     * Crear comisión para el agente de ventas
     */
    private void createCommission(SalesAgent salesAgent, UserSubscription subscription) {
        BigDecimal saleAmount = subscription.getAmountPaid();
        BigDecimal commissionPercentage = salesAgent.getCommissionPercentage();
        BigDecimal commissionAmount = saleAmount.multiply(commissionPercentage).divide(new BigDecimal("100"));
        
        Commission commission = new Commission();
        commission.setSalesAgent(salesAgent);
        commission.setUserSubscription(subscription);
        commission.setSaleAmount(saleAmount);
        commission.setCommissionPercentage(commissionPercentage);
        commission.setCommissionAmount(commissionAmount);
        commission.setSaleDate(LocalDateTime.now());
        
        commissionRepository.persist(commission);
        
        // Actualizar estadísticas del agente
        salesAgent.addSale(saleAmount);
        salesAgent.addCommission(commissionAmount);
    }
    
    /**
     * Obtener agentes de ventas activos
     */
    public List<SalesAgent> getActiveSalesAgents() {
        return salesAgentRepository.findActiveAgents();
    }
    
    /**
     * Buscar agente por código
     */
    public Optional<SalesAgent> findSalesAgentByCode(String agentCode) {
        return salesAgentRepository.findByAgentCode(agentCode);
    }
    
    /**
     * Obtener comisiones pendientes de un agente
     */
    public List<Commission> getPendingCommissions(Long salesAgentId) {
        return commissionRepository.findPendingBySalesAgentId(salesAgentId);
    }
    
    /**
     * Marcar comisión como pagada
     */
    @Transactional
    public void payCommission(Long commissionId, String paymentReference) {
        Commission commission = commissionRepository.findById(commissionId);
        if (commission == null) {
            throw new RuntimeException("Comisión no encontrada con ID: " + commissionId);
        }
        
        commission.markAsPaid(paymentReference);
        
        // Actualizar estadísticas del agente
        SalesAgent agent = commission.getSalesAgent();
        agent.payCommission(commission.getCommissionAmount());
    }

    // ===================== ADMIN METHODS =====================

    /**
     * Obtener todas las suscripciones con filtros (ADMIN)
     */
    public List<UserSubscriptionDTO> getAllUserSubscriptions(int page, int size, String status, String planType) {
        List<UserSubscription> subscriptions = userSubscriptionRepository.listAll();
        return subscriptions.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * Crear plan de suscripción (ADMIN)
     */
    @Transactional
    public SubscriptionPlanDTO createPlan(SubscriptionPlanDTO planDTO) {
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setName(planDTO.getName());
        plan.setDescription(planDTO.getDescription());
        plan.setPrice(planDTO.getPrice());
        plan.setBillingCycleDays(planDTO.getBillingCycleDays());
        plan.setType(planDTO.getType());
        plan.setTier(planDTO.getTier());
        plan.setIsActive(planDTO.getIsActive());

        subscriptionPlanRepository.persist(plan);
        return toDTO(plan);
    }

    /**
     * Actualizar plan de suscripción (ADMIN)
     */
    @Transactional
    public SubscriptionPlanDTO updatePlan(Long planId, SubscriptionPlanDTO planDTO) {
        Optional<SubscriptionPlan> planOpt = subscriptionPlanRepository.findByIdOptional(planId);
        if (!planOpt.isPresent()) {
            throw new RuntimeException("Plan de suscripción no encontrado");
        }

        SubscriptionPlan plan = planOpt.get();
        plan.setName(planDTO.getName());
        plan.setDescription(planDTO.getDescription());
        plan.setPrice(planDTO.getPrice());
        plan.setBillingCycleDays(planDTO.getBillingCycleDays());
        plan.setType(planDTO.getType());
        plan.setTier(planDTO.getTier());
        plan.setIsActive(planDTO.getIsActive());

        subscriptionPlanRepository.persist(plan);
        return toDTO(plan);
    }

    /**
     * Eliminar plan de suscripción (ADMIN)
     */
    @Transactional
    public void deletePlan(Long planId) {
        Optional<SubscriptionPlan> planOpt = subscriptionPlanRepository.findByIdOptional(planId);
        if (!planOpt.isPresent()) {
            throw new RuntimeException("Plan de suscripción no encontrado");
        }

        SubscriptionPlan plan = planOpt.get();
        plan.setIsActive(false);
        subscriptionPlanRepository.persist(plan);
    }

    /**
     * Obtener estadísticas de suscripciones (ADMIN)
     */
    public Map<String, Object> getSubscriptionStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Estadísticas básicas
        long totalSubscriptions = userSubscriptionRepository.count();
        long totalPlans = subscriptionPlanRepository.count();
        long totalAgents = salesAgentRepository.count();
        long totalCommissions = commissionRepository.count();
        
        stats.put("totalSubscriptions", totalSubscriptions);
        stats.put("totalPlans", totalPlans);
        stats.put("totalSalesAgents", totalAgents);
        stats.put("totalCommissions", totalCommissions);
        
        return stats;
    }
}
