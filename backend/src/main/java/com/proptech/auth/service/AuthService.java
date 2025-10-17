package com.proptech.auth.service;

import java.time.LocalDateTime;
import java.util.Optional;

import com.proptech.auth.dto.LoginRequest;
import com.proptech.auth.dto.LoginResponse;
import com.proptech.auth.dto.UserDTO;
import com.proptech.auth.dto.ChangePasswordRequest;
import com.proptech.auth.entity.User;
import com.proptech.auth.enums.UserStatus;
import com.proptech.auth.repository.UserRepository;
import com.proptech.auth.security.PasswordEncoder;
import com.proptech.auth.security.JwtProvider;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class AuthService {
    
    @Inject
    UserRepository userRepository;
    
    @Inject
    PasswordEncoder passwordEncoder;
    
    @Inject
    UserService userService;
    
    @Inject
    JwtProvider jwtProvider;
    
    public LoginResponse login(LoginRequest request) {
        // Find user by email
        Optional<User> userOpt = userRepository.findByEmailAndStatus(request.getEmail(), UserStatus.ACTIVE);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Credenciales inválidas");
        }
        
        User user = userOpt.get();
        
        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Credenciales inválidas");
        }
        
        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.persist(user);
        
        // Generate JWT tokens
        String accessToken = jwtProvider.generateToken(user);
        String refreshToken = jwtProvider.generateRefreshToken(user);
        
        // Create response
        LoginResponse response = new LoginResponse(accessToken, refreshToken, userService.toDTO(user));
        response.setExpiresIn(3600L);
        response.setExpiresAt(jwtProvider.getExpirationDate(accessToken));
        
        // Set roles and permissions from JWT
        response.setRoles(jwtProvider.getRolesFromToken(accessToken));
        response.setPermissions(jwtProvider.getPermissionsFromToken(accessToken));
        
        return response;
    }
    
    public UserDTO getCurrentUser(String token) {
        try {
            // Validate JWT token
            if (jwtProvider.isTokenExpired(token)) {
                throw new RuntimeException("Token expirado");
            }
            
            Long userId = jwtProvider.getUserIdFromToken(token);
            User user = userRepository.findById(userId);
            
            if (user == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            return userService.toDTO(user);
        } catch (Exception e) {
            throw new RuntimeException("Token inválido: " + e.getMessage());
        }
    }
    
    public boolean validateToken(String token) {
        try {
            return !jwtProvider.isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
    
    public void logout(String token) {
        // In a real implementation, you would add the token to a blacklist
        // For now, we just validate it exists
        if (!validateToken(token)) {
            throw new RuntimeException("Token inválido");
        }
    }
    
    public void changePassword(String token, ChangePasswordRequest request) {
        try {
            // Validate JWT token
            if (jwtProvider.isTokenExpired(token)) {
                throw new RuntimeException("Token expirado");
            }
            
            // Validate request
            if (!request.isNewPasswordConfirmed()) {
                throw new RuntimeException("La nueva contraseña y su confirmación no coinciden");
            }
            
            if (!request.isNewPasswordDifferent()) {
                throw new RuntimeException("La nueva contraseña debe ser diferente a la actual");
            }
            
            // Get user from token
            Long userId = jwtProvider.getUserIdFromToken(token);
            User user = userRepository.findById(userId);
            
            if (user == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            // Verify old password
            if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                throw new RuntimeException("La contraseña actual es incorrecta");
            }
            
            // Encode and set new password
            String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());
            user.setPassword(encodedNewPassword);
            
            // Update user
            userRepository.persist(user);
            
        } catch (Exception e) {
            throw new RuntimeException("Error al cambiar contraseña: " + e.getMessage());
        }
    }
} 