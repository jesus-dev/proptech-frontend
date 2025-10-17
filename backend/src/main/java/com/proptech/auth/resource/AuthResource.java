package com.proptech.auth.resource;

import com.proptech.auth.dto.LoginRequest;
import com.proptech.auth.dto.LoginResponse;
import com.proptech.auth.dto.UserDTO;
import com.proptech.auth.dto.ChangePasswordRequest;
import com.proptech.auth.service.AuthService;
import com.proptech.auth.service.PermissionService;
import com.proptech.auth.service.RoleService;
import com.proptech.auth.service.UserService;
import com.proptech.auth.service.MenuPermissionScanner;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.proptech.auth.dto.PermissionDTO;
import com.proptech.auth.dto.RoleDTO;
import com.proptech.auth.enums.UserStatus;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {
    
    @Inject
    AuthService authService;
    
    @Inject
    UserService userService;
    
    @Inject
    RoleService roleService;
    
    @Inject
    PermissionService permissionService;
    
    @Inject
    MenuPermissionScanner menuPermissionScanner;
    
    @POST
    @Path("/login")
    public Response login(LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return Response.ok(response).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(error)
                    .build();
        }
    }
    

    
    @POST
    @Path("/logout")
    public Response logout(@HeaderParam("Authorization") String authorization) {
        try {
            String token = extractToken(authorization);
            authService.logout(token);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Logout exitoso");
            return Response.ok(response).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }
    }
    
    @GET
    @Path("/me")
    public Response getCurrentUser(@HeaderParam("Authorization") String authorization) {
        try {
            String token = extractToken(authorization);
            UserDTO user = authService.getCurrentUser(token);
            return Response.ok(user).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(error)
                    .build();
        }
    }
    
    @GET
    @Path("/validate")
    public Response validateToken(@HeaderParam("Authorization") String authorization) {
        try {
            String token = extractToken(authorization);
            boolean isValid = authService.validateToken(token);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", isValid);
            
            if (isValid) {
                UserDTO user = authService.getCurrentUser(token);
                response.put("user", user);
            }
            
            return Response.ok(response).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(error)
                    .build();
        }
    }
    
    @POST
    @Path("/change-password")
    public Response changePassword(@HeaderParam("Authorization") String authorization, ChangePasswordRequest request) {
        try {
            String token = extractToken(authorization);
            authService.changePassword(token, request);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Contraseña cambiada exitosamente");
            return Response.ok(response).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }
    }
    
    private String extractToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header inválido");
        }
        return authorization.substring(7);
    }
    
    @GET
    @Path("/stats")
    public Response getAuthStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // User stats
            List<UserDTO> allUsers = userService.getAllUsers();
            List<UserDTO> activeUsers = userService.getActiveUsers();
            List<UserDTO> inactiveUsers = userService.getUsersByStatus(UserStatus.INACTIVE);
            
            stats.put("totalUsers", allUsers.size());
            stats.put("activeUsers", activeUsers.size());
            stats.put("inactiveUsers", inactiveUsers.size());
            
            // Role stats
            List<RoleDTO> allRoles = roleService.getAllRoles();
            List<RoleDTO> activeRoles = roleService.getActiveRoles();
            
            stats.put("totalRoles", allRoles.size());
            stats.put("activeRoles", activeRoles.size());
            stats.put("inactiveRoles", allRoles.size() - activeRoles.size());
            
            // Permission stats
            List<PermissionDTO> allPermissions = permissionService.getAllPermissions();
            List<PermissionDTO> activePermissions = permissionService.getActivePermissions();
            
            stats.put("totalPermissions", allPermissions.size());
            stats.put("activePermissions", activePermissions.size());
            stats.put("inactivePermissions", allPermissions.size() - activePermissions.size());
            stats.put("permissionCategories", permissionService.getPermissionCategories());
            
            return Response.ok(stats).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(error)
                    .build();
        }
    }
    
    @POST
    @Path("/menu-permissions")
    public Response addMenuPermission(Map<String, Object> request) {
        try {
            String path = (String) request.get("path");
            String resource = (String) request.get("resource");
            String description = (String) request.get("description");
            @SuppressWarnings("unchecked")
            List<String> actions = (List<String>) request.get("actions");
            
            if (path == null || resource == null || description == null || actions == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Todos los campos son requeridos: path, resource, description, actions");
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(error)
                        .build();
            }
            
            menuPermissionScanner.addMenuPermission(path, resource, description, actions);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Permisos agregados exitosamente para: " + path);
            return Response.ok(response).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(error)
                    .build();
        }
    }
    
    @POST
    @Path("/scan-permissions")
    public Response scanPermissions() {
        try {
            menuPermissionScanner.scanAndCreatePermissions();
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Escaneo de permisos completado");
            return Response.ok(response).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(error)
                    .build();
        }
    }
} 