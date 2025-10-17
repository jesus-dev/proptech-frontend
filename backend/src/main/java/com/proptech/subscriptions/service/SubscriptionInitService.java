package com.proptech.subscriptions.service;

import com.proptech.auth.entity.User;
import com.proptech.auth.enums.UserStatus;
import com.proptech.auth.enums.UserType;
import com.proptech.auth.repository.UserRepository;
import com.proptech.subscriptions.entity.SubscriptionPlan;
import com.proptech.subscriptions.entity.SalesAgent;
import com.proptech.subscriptions.enums.SubscriptionTier;
import com.proptech.subscriptions.enums.SubscriptionType;
import com.proptech.subscriptions.enums.SalesAgentStatus;
import com.proptech.subscriptions.repository.SubscriptionPlanRepository;
import com.proptech.subscriptions.repository.SalesAgentRepository;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Servicio para inicializar planes de suscripción predefinidos
 */
@ApplicationScoped
public class SubscriptionInitService {
    
    @Inject
    SubscriptionPlanRepository subscriptionPlanRepository;
    
    @Inject
    SalesAgentRepository salesAgentRepository;
    
    @Inject
    UserRepository userRepository;
    
    /**
     * Inicializar planes de suscripción al arrancar la aplicación
     */
    @Transactional
    public void initializeSubscriptionPlans(@Observes StartupEvent ev) {
        createPropTechPlans();
        createNetworkPlan();
        
        try {
            createSampleSalesAgents();
        } catch (Exception e) {
            System.err.println("⚠️ Error creando agentes de muestra. Ejecutar fix-sales-agent-schema.sql manualmente: " + e.getMessage());
        }
    }
    
    /**
     * Crear planes de PropTech
     */
    private void createPropTechPlans() {
        // Plan Gratuito
        createPlanIfNotExists(
            "PropTech Gratuito",
            "Plan gratuito con acceso básico a la plataforma",
            SubscriptionType.PROPTECH,
            SubscriptionTier.FREE,
            new BigDecimal("0"), // Gratis
            30, // 30 días
            3,  // 3 propiedades
            1,  // 1 agente
            false, // Sin analytics
            false, // Sin CRM
            false, // Sin acceso a network
            false  // Sin soporte prioritario
        );
        
        // Plan Inicial
        createPlanIfNotExists(
            "PropTech Inicial",
            "Plan inicial para pequeñas inmobiliarias y agentes independientes",
            SubscriptionType.PROPTECH,
            SubscriptionTier.INICIAL,
            new BigDecimal("150000"), // 150,000 PYG mensual
            30, // 30 días
            5,  // 5 propiedades
            2,  // 2 agentes
            false, // Sin analytics
            true,  // Con CRM básico
            true,  // Con acceso a network
            false  // Sin soporte prioritario
        );
        
        // Plan Intermedio
        createPlanIfNotExists(
            "PropTech Intermedio",
            "Plan intermedio para inmobiliarias medianas con más funcionalidades",
            SubscriptionType.PROPTECH,
            SubscriptionTier.INTERMEDIO,
            new BigDecimal("350000"), // 350,000 PYG mensual
            30, // 30 días
            25, // 25 propiedades
            5,  // 5 agentes
            true,  // Con analytics
            true,  // Con CRM avanzado
            true,  // Con acceso a network
            false  // Sin soporte prioritario
        );
        
        // Plan Premium
        createPlanIfNotExists(
            "PropTech Premium",
            "Plan premium para grandes inmobiliarias con todas las funcionalidades",
            SubscriptionType.PROPTECH,
            SubscriptionTier.PREMIUM,
            new BigDecimal("750000"), // 750,000 PYG mensual
            30, // 30 días
            -1, // Propiedades ilimitadas
            -1, // Agentes ilimitados
            true,  // Con analytics completo
            true,  // Con CRM completo
            true,  // Con acceso a network
            true   // Con soporte prioritario
        );
        
        // Plan Anual Inicial (con descuento)
        createPlanIfNotExists(
            "PropTech Inicial - Anual",
            "Plan inicial anual con descuento del 15%",
            SubscriptionType.PROPTECH,
            SubscriptionTier.INICIAL,
            new BigDecimal("1530000"), // 150,000 * 12 * 0.85 = 1,530,000 PYG anual
            365, // 365 días
            5,  // 5 propiedades
            2,  // 2 agentes
            false, // Sin analytics
            true,  // Con CRM básico
            true,  // Con acceso a network
            false  // Sin soporte prioritario
        );
        
        // Plan Anual Intermedio (con descuento)
        createPlanIfNotExists(
            "PropTech Intermedio - Anual",
            "Plan intermedio anual con descuento del 15%",
            SubscriptionType.PROPTECH,
            SubscriptionTier.INTERMEDIO,
            new BigDecimal("3570000"), // 350,000 * 12 * 0.85 = 3,570,000 PYG anual
            365, // 365 días
            25, // 25 propiedades
            5,  // 5 agentes
            true,  // Con analytics
            true,  // Con CRM avanzado
            true,  // Con acceso a network
            false  // Sin soporte prioritario
        );
        
        // Plan Anual Premium (con descuento)
        createPlanIfNotExists(
            "PropTech Premium - Anual",
            "Plan premium anual con descuento del 15%",
            SubscriptionType.PROPTECH,
            SubscriptionTier.PREMIUM,
            new BigDecimal("7650000"), // 750,000 * 12 * 0.85 = 7,650,000 PYG anual
            365, // 365 días
            -1, // Propiedades ilimitadas
            -1, // Agentes ilimitados
            true,  // Con analytics completo
            true,  // Con CRM completo
            true,  // Con acceso a network
            true   // Con soporte prioritario
        );
    }
    
    /**
     * Crear plan de Network
     */
    private void createNetworkPlan() {
        createPlanIfNotExists(
            "Red Social PropTech",
            "Acceso exclusivo a la red social para conectar con otros profesionales del sector inmobiliario",
            SubscriptionType.NETWORK,
            SubscriptionTier.INICIAL,
            new BigDecimal("50000"), // 50,000 PYG mensual
            30, // 30 días
            null, // No aplica para network
            null, // No aplica para network
            false, // Sin analytics
            false, // Sin CRM
            true,  // Acceso completo a network
            false  // Sin soporte prioritario
        );
        
        // Plan anual de Network (con descuento)
        createPlanIfNotExists(
            "Red Social PropTech - Anual",
            "Acceso anual a la red social con descuento del 20%",
            SubscriptionType.NETWORK,
            SubscriptionTier.INICIAL,
            new BigDecimal("480000"), // 50,000 * 12 * 0.8 = 480,000 PYG anual
            365, // 365 días
            null, // No aplica para network
            null, // No aplica para network
            false, // Sin analytics
            false, // Sin CRM
            true,  // Acceso completo a network
            false  // Sin soporte prioritario
        );
    }
    
    /**
     * Crear plan si no existe
     */
    private void createPlanIfNotExists(String name, String description, SubscriptionType type, 
                                     SubscriptionTier tier, BigDecimal price, Integer billingCycleDays,
                                     Integer maxProperties, Integer maxAgents, Boolean hasAnalytics,
                                     Boolean hasCrm, Boolean hasNetworkAccess, Boolean hasPrioritySupport) {
        
        Optional<SubscriptionPlan> existingPlan = subscriptionPlanRepository.findByName(name);
        
        if (existingPlan.isEmpty()) {
            SubscriptionPlan plan = new SubscriptionPlan();
            plan.setName(name);
            plan.setDescription(description);
            plan.setType(type);
            plan.setTier(tier);
            plan.setPrice(price);
            plan.setBillingCycleDays(billingCycleDays);
            plan.setMaxProperties(maxProperties);
            plan.setMaxAgents(maxAgents);
            plan.setHasAnalytics(hasAnalytics);
            plan.setHasCrm(hasCrm);
            plan.setHasNetworkAccess(hasNetworkAccess);
            plan.setHasPrioritySupport(hasPrioritySupport);
            plan.setIsActive(true);
            
            subscriptionPlanRepository.persist(plan);
            System.out.println("✅ Plan de suscripción creado: " + name);
        } else {
            System.out.println("📋 Plan de suscripción ya existe: " + name);
        }
    }
    
    /**
     * Crear agentes de ventas de ejemplo
     */
    private void createSampleSalesAgents() {
        // Crear agente de ventas principal
        createSalesAgentIfNotExists(
            "AGENT001",
            "María González",
            "maria.gonzalez@proptech.com",
            "+595 981 123456",
            new BigDecimal("15.00") // 15% de comisión
        );
        
        // Crear agente de ventas junior
        createSalesAgentIfNotExists(
            "AGENT002", 
            "Carlos Mendoza",
            "carlos.mendoza@proptech.com",
            "+595 981 654321",
            new BigDecimal("10.00") // 10% de comisión
        );
        
        // Crear agente de ventas senior
        createSalesAgentIfNotExists(
            "AGENT003",
            "Ana Patricia Silva",
            "ana.silva@proptech.com", 
            "+595 981 789012",
            new BigDecimal("20.00") // 20% de comisión
        );
    }
    
    /**
     * Crear agente de ventas si no existe
     */
    private void createSalesAgentIfNotExists(String agentCode, String fullName, String email, 
                                           String phone, BigDecimal commissionPercentage) {
        
        if (!salesAgentRepository.existsByAgentCode(agentCode)) {
            // Crear usuario para el agente
            User agentUser = createUserForAgent(fullName, email, agentCode);
            
            SalesAgent agent = new SalesAgent();
            agent.setAgentCode(agentCode);
            agent.setFullName(fullName);
            agent.setEmail(email);
            agent.setPhone(phone);
            agent.setCommissionPercentage(commissionPercentage);
            agent.setStatus(SalesAgentStatus.ACTIVE);
            agent.setHireDate(LocalDateTime.now());
            agent.setNotes("Agente de ventas de suscripciones - Creado automáticamente");
            agent.setCreatedBy("SYSTEM");
            agent.setUser(agentUser); // Asignar el usuario creado
            
            salesAgentRepository.persist(agent);
            System.out.println("✅ Agente de ventas creado: " + fullName + " (" + agentCode + ") con usuario: " + agentUser.getEmail());
        } else {
            System.out.println("📋 Agente de ventas ya existe: " + agentCode);
        }
    }
    
    /**
     * Crear usuario para el agente de ventas
     */
    private User createUserForAgent(String fullName, String email, String agentCode) {
        // Verificar si ya existe un usuario con este email
        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        if (existingUserOpt.isPresent()) {
            return existingUserOpt.get();
        }
        
        // Crear nuevo usuario para el agente
        User user = new User();
        user.setEmail(email);
        user.setFirstName(fullName.split(" ")[0]);
        user.setLastName(fullName.split(" ").length > 1 ? fullName.split(" ")[1] : "");
        user.setUserType(UserType.AGENT);
        user.setStatus(UserStatus.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setCreatedBy("SYSTEM");
        user.setUpdatedBy("SYSTEM");
        
        // Generar contraseña temporal (el agente deberá cambiarla en el primer login)
        String tempPassword = "TempPass" + agentCode + "123!";
        user.setPassword(tempPassword); // Esto debería ser hasheado en producción
        
        userRepository.persist(user);
        System.out.println("✅ Usuario creado para agente: " + email);
        
        return user;
    }
}
