package com.proptech.auth.service;

import com.proptech.auth.entity.Permission;
import com.proptech.auth.repository.PermissionRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@ApplicationScoped
public class MenuPermissionScanner {
    
    @Inject
    PermissionRepository permissionRepository;

    public int existingCount;
    
    // Definir la estructura de menús con sus permisos correspondientes
    private static final Map<String, MenuConfig> MENU_CONFIG = new HashMap<>();
    
    static {
        // Dashboard
        MENU_CONFIG.put("/", new MenuConfig("DASHBOARD", "Dashboard", Arrays.asList("READ")));
        
        // Propiedades
        MENU_CONFIG.put("/properties", new MenuConfig("PROPERTIES", "Propiedades", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE")));
        MENU_CONFIG.put("/properties/recommendations", new MenuConfig("PROPERTIES", "Recomendaciones", Arrays.asList("READ")));
        MENU_CONFIG.put("/properties/statistics", new MenuConfig("PROPERTIES", "Estadísticas", Arrays.asList("READ")));
        MENU_CONFIG.put("/properties/favorites", new MenuConfig("PROPERTIES", "Favoritos", Arrays.asList("READ", "CREATE", "DELETE")));
        
        // Ventas
        MENU_CONFIG.put("/sales", new MenuConfig("SALES", "Ventas", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE")));
        MENU_CONFIG.put("/sales-pipeline", new MenuConfig("SALES", "Pipeline de Ventas", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE")));
        MENU_CONFIG.put("/sales-analytics", new MenuConfig("SALES", "Analytics de Ventas", Arrays.asList("READ")));
        MENU_CONFIG.put("/sales-analytics/heatmap", new MenuConfig("SALES", "Mapa de Calor", Arrays.asList("READ")));
        
        // Visitas
        MENU_CONFIG.put("/visits", new MenuConfig("VISITS", "Visitas", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE")));
        
        // Contactos
        MENU_CONFIG.put("/contacts", new MenuConfig("CONTACTS", "Contactos", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE")));
        
        // Socios
        MENU_CONFIG.put("/partners", new MenuConfig("PARTNERS", "Socios", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE")));
        MENU_CONFIG.put("/partners/dashboard", new MenuConfig("PARTNERS", "Dashboard de Socios", Arrays.asList("READ")));
        MENU_CONFIG.put("/partners/payments", new MenuConfig("PARTNERS", "Pagos de Socios", Arrays.asList("READ", "CREATE", "UPDATE")));
        
        // Bandeja de entrada
        MENU_CONFIG.put("/inbox", new MenuConfig("INBOX", "Bandeja de Entrada", Arrays.asList("READ", "UPDATE")));
        
        // Desarrollos
        MENU_CONFIG.put("/developments", new MenuConfig("DEVELOPMENTS", "Desarrollos", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE")));
        MENU_CONFIG.put("/developments/dashboard", new MenuConfig("DEVELOPMENTS", "Dashboard de Desarrollos", Arrays.asList("READ")));
        MENU_CONFIG.put("/developments/units", new MenuConfig("DEVELOPMENTS", "Unidades", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE")));
        MENU_CONFIG.put("/developments/quotas", new MenuConfig("DEVELOPMENTS", "Cuotas", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE")));
        MENU_CONFIG.put("/developments/reservations", new MenuConfig("DEVELOPMENTS", "Reservas", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE")));
        
        // Contratos
        MENU_CONFIG.put("/contracts", new MenuConfig("CONTRACTS", "Contratos", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE")));
        MENU_CONFIG.put("/contracts/templates", new MenuConfig("CONTRACTS", "Plantillas", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE")));
        
        // Calendario
        MENU_CONFIG.put("/calendar", new MenuConfig("CALENDAR", "Calendario", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE")));
        
        // Autenticación
        MENU_CONFIG.put("/auth/users", new MenuConfig("USERS", "Usuarios", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE", "ACTIVATE", "DEACTIVATE")));
        MENU_CONFIG.put("/auth/roles", new MenuConfig("ROLES", "Roles", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE", "ASSIGN_PERMISSIONS")));
        MENU_CONFIG.put("/auth/permissions", new MenuConfig("PERMISSIONS", "Permisos", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE")));
    }
    
    @Transactional
    public void scanAndCreatePermissions() {
        for (Map.Entry<String, MenuConfig> entry : MENU_CONFIG.entrySet()) {
            MenuConfig config = entry.getValue();
            
            for (String action : config.actions) {
                String permissionName = config.resource + "_" + action;
                String description = action + " " + config.description;
                
                Permission existingPermission = permissionRepository.findByName(permissionName);
                if (existingPermission == null) {
                    // Crear nuevo permiso
                    Permission permission = new Permission();
                    permission.setName(permissionName);
                    permission.setDescription(description);
                    permission.setResource(config.resource);
                    permission.setAction(action);
                    permission.setCategory(config.resource);
                    permission.setActive(true);
                    permission.setCreatedAt(LocalDateTime.now());
                    
                    permissionRepository.persist(permission);
                } else {
                    existingCount++;
                }
            }
        }
        
    }
    
    @Transactional
    public void addMenuPermission(String path, String resource, String description, List<String> actions) {
        
        for (String action : actions) {
            String permissionName = resource + "_" + action;
            String fullDescription = action + " " + description;
            
            Permission existingPermission = permissionRepository.findByName(permissionName);
            if (existingPermission == null) {
                Permission permission = new Permission();
                permission.setName(permissionName);
                permission.setDescription(fullDescription);
                permission.setResource(resource);
                permission.setAction(action);
                permission.setCategory(resource);
                permission.setActive(true);
                permission.setCreatedAt(LocalDateTime.now());
                
                permissionRepository.persist(permission);
            }
        }
    }
    
    // Clase interna para configurar menús
    private static class MenuConfig {
        private final String resource;
        private final String description;
        private final List<String> actions;
        
        public MenuConfig(String resource, String description, List<String> actions) {
            this.resource = resource;
            this.description = description;
            this.actions = actions;
        }
    }
} 