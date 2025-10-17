package com.proptech.auth.service;

import com.proptech.auth.entity.User;
import com.proptech.auth.repository.UserRepository;
import com.proptech.auth.security.JwtProvider;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;

@ApplicationScoped
public class SecurityContextService {

    @Inject
    JwtProvider jwtProvider;

    @Inject
    UserRepository userRepository;

    @Context
    HttpHeaders headers;

    /**
     * Obtiene el usuario actual del contexto de seguridad
     */
    public User getCurrentUser() {
        try {
            String authorization = headers.getHeaderString("Authorization");
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return null;
            }

            String token = authorization.substring(7);
            
            // Validar token
            if (jwtProvider.isTokenExpired(token)) {
                return null;
            }

            // Obtener ID del usuario del token
            Long userId = jwtProvider.getUserIdFromToken(token);
            if (userId == null) {
                return null;
            }

            // Buscar usuario en la base de datos
            return userRepository.findById(userId);
        } catch (Exception e) {
            // Log error pero no fallar
            System.err.println("Error getting current user: " + e.getMessage());
            return null;
        }
    }

    /**
     * Obtiene el ID del usuario actual
     */
    public Long getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    /**
     * Verifica si el usuario actual tiene un rol específico
     */
    public boolean hasRole(String roleName) {
        User user = getCurrentUser();
        return user != null && user.hasRole(roleName);
    }

    /**
     * Verifica si el usuario actual tiene un permiso específico
     */
    public boolean hasPermission(String permissionName) {
        User user = getCurrentUser();
        return user != null && user.hasPermission(permissionName);
    }
} 