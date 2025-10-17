package com.proptech.auth.service;

import com.proptech.auth.entity.User;
import com.proptech.auth.entity.Role;
import com.proptech.auth.entity.Permission;
import com.proptech.auth.enums.UserStatus;
import com.proptech.auth.enums.UserType;
import com.proptech.auth.repository.UserRepository;
import com.proptech.auth.repository.RoleRepository;
import com.proptech.auth.repository.PermissionRepository;
import com.proptech.auth.security.PasswordEncoder;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import io.quarkus.runtime.StartupEvent;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@ApplicationScoped
public class InitialDataService {

    @Inject
    UserRepository userRepository;

    @Inject
    RoleRepository roleRepository;

    @Inject
    PermissionRepository permissionRepository;

    @Inject
    PasswordEncoder passwordEncoder;

    @Inject
    MenuPermissionScanner menuPermissionScanner;

    @Transactional
    void onStart(@Observes StartupEvent ev) {
        
        try {
            // 1. Crear permisos básicos
            createBasicPermissions();
            
            // 2. Escanear menús y crear permisos automáticamente
            menuPermissionScanner.scanAndCreatePermissions();
            
            // 3. Crear roles básicos
            createBasicRoles();
            
            // 4. Crear usuario de desarrollo
            createDevUser();
            
        } catch (Exception e) {
            System.err.println("❌ Error inicializando datos: " + e.getMessage());
        }
    }

    private void createBasicPermissions() {
        
        String[][] permissions = {
            // Usuarios
            {"USER_READ", "Ver usuarios", "USERS", "READ"},
            {"USER_CREATE", "Crear usuarios", "USERS", "CREATE"},
            {"USER_UPDATE", "Actualizar usuarios", "USERS", "UPDATE"},
            {"USER_DELETE", "Eliminar usuarios", "USERS", "DELETE"},
            {"USER_ACTIVATE", "Activar usuarios", "USERS", "ACTIVATE"},
            {"USER_DEACTIVATE", "Desactivar usuarios", "USERS", "DEACTIVATE"},
            
            // Roles
            {"ROLE_READ", "Ver roles", "ROLES", "READ"},
            {"ROLE_CREATE", "Crear roles", "ROLES", "CREATE"},
            {"ROLE_UPDATE", "Actualizar roles", "ROLES", "UPDATE"},
            {"ROLE_DELETE", "Eliminar roles", "ROLES", "DELETE"},
            {"ROLE_ASSIGN_PERMISSIONS", "Asignar permisos a roles", "ROLES", "ASSIGN_PERMISSIONS"},
            
            // Permisos
            {"PERMISSION_READ", "Ver permisos", "PERMISSIONS", "READ"},
            {"PERMISSION_CREATE", "Crear permisos", "PERMISSIONS", "CREATE"},
            {"PERMISSION_UPDATE", "Actualizar permisos", "PERMISSIONS", "UPDATE"},
            {"PERMISSION_DELETE", "Eliminar permisos", "PERMISSIONS", "DELETE"},
            
            // Propiedades
            {"PROPERTY_READ", "Ver propiedades", "PROPERTIES", "READ"},
            {"PROPERTY_CREATE", "Crear propiedades", "PROPERTIES", "CREATE"},
            {"PROPERTY_UPDATE", "Actualizar propiedades", "PROPERTIES", "UPDATE"},
            {"PROPERTY_DELETE", "Eliminar propiedades", "PROPERTIES", "DELETE"},
            
            // Desarrollos
            {"DEVELOPMENT_READ", "Ver desarrollos", "DEVELOPMENTS", "READ"},
            {"DEVELOPMENT_CREATE", "Crear desarrollos", "DEVELOPMENTS", "CREATE"},
            {"DEVELOPMENT_UPDATE", "Actualizar desarrollos", "DEVELOPMENTS", "UPDATE"},
            {"DEVELOPMENT_DELETE", "Eliminar desarrollos", "DEVELOPMENTS", "DELETE"},
            
            // Reportes
            {"REPORT_READ", "Ver reportes", "REPORTS", "READ"},
            {"REPORT_CREATE", "Crear reportes", "REPORTS", "CREATE"},
            {"REPORT_EXPORT", "Exportar reportes", "REPORTS", "EXPORT"},
            
            // Sistema
            {"SYSTEM_CONFIG", "Configurar sistema", "SYSTEM", "CONFIG"},
            {"SYSTEM_BACKUP", "Hacer backup", "SYSTEM", "BACKUP"},
            {"SYSTEM_RESTORE", "Restaurar sistema", "SYSTEM", "RESTORE"}
        };

        for (String[] permData : permissions) {
            Permission permission = permissionRepository.findByName(permData[0]);
            if (permission == null) {
                permission = new Permission();
                permission.setName(permData[0]);
                permission.setDescription(permData[1]);
                permission.setResource(permData[2]);
                permission.setAction(permData[3]);
                permission.setActive(true);
                permission.setCreatedAt(LocalDateTime.now());
                permissionRepository.persist(permission);
            }
        }
    }

    private void createBasicRoles() {
        
        // Crear rol ADMIN
        Role adminRole = roleRepository.findByName("ADMIN");
        if (adminRole == null) {
            adminRole = new Role();
            adminRole.setName("ADMIN");
            adminRole.setDescription("Administrador del sistema con acceso completo");
            adminRole.setActive(true);
            adminRole.setCreatedAt(LocalDateTime.now());
            roleRepository.persist(adminRole);
        }
        
        // Crear rol MANAGER
        Role managerRole = roleRepository.findByName("MANAGER");
        if (managerRole == null) {
            managerRole = new Role();
            managerRole.setName("MANAGER");
            managerRole.setDescription("Gerente con acceso limitado");
            managerRole.setActive(true);
            managerRole.setCreatedAt(LocalDateTime.now());
            roleRepository.persist(managerRole);
        }
        
        // Crear rol VIEWER
        Role viewerRole = roleRepository.findByName("VIEWER");
        if (viewerRole == null) {
            viewerRole = new Role();
            viewerRole.setName("VIEWER");
            viewerRole.setDescription("Usuario con acceso de solo lectura");
            viewerRole.setActive(true);
            viewerRole.setCreatedAt(LocalDateTime.now());
            roleRepository.persist(viewerRole);
        }
        
        // Asignar TODOS los permisos al rol ADMIN
        Set<Permission> allPermissions = new HashSet<>(permissionRepository.listAll());
        adminRole.setPermissions(allPermissions);
        roleRepository.persist(adminRole);
    }

    private void createDevUser() {
        
        User devUser = userRepository.findByEmail("dev@proptech.com").orElse(null);
        if (devUser == null) {
            devUser = new User();
            devUser.setEmail("dev@proptech.com");
            devUser.setPassword(passwordEncoder.encode("dev123"));
            devUser.setFirstName("Desarrollador");
            devUser.setLastName("Sistema");
            devUser.setStatus(UserStatus.ACTIVE);
            devUser.setUserType(UserType.ADMIN);
            devUser.setEmailVerified(true);
            devUser.setCreatedAt(LocalDateTime.now());
            userRepository.persist(devUser);
        }
        
        // Asignar rol ADMIN al usuario dev
        Role adminRole = roleRepository.findByName("ADMIN");
        if (adminRole != null) {
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            devUser.setRoles(roles);
            userRepository.persist(devUser);
        }
        
    }
} 