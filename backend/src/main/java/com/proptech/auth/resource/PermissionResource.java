package com.proptech.auth.resource;

import com.proptech.auth.dto.PermissionDTO;
import com.proptech.auth.service.PermissionService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/api/auth/permissions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PermissionResource {
    
    @Inject
    PermissionService permissionService;
    
    @GET
    public Response getAllPermissions() {
        try {
            List<PermissionDTO> permissions = permissionService.getAllPermissions();
            return Response.ok(permissions).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(error)
                    .build();
        }
    }
    
    @GET
    @Path("/active")
    public Response getActivePermissions() {
        try {
            List<PermissionDTO> permissions = permissionService.getActivePermissions();
            return Response.ok(permissions).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(error)
                    .build();
        }
    }
    
    @GET
    @Path("/{id}")
    public Response getPermissionById(@PathParam("id") Long id) {
        try {
            PermissionDTO permission = permissionService.getPermissionById(id);
            return Response.ok(permission).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(error)
                    .build();
        }
    }
    
    @GET
    @Path("/name/{name}")
    public Response getPermissionByName(@PathParam("name") String name) {
        try {
            PermissionDTO permission = permissionService.getPermissionByName(name);
            return Response.ok(permission).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(error)
                    .build();
        }
    }
    
    @POST
    public Response createPermission(PermissionDTO permissionDTO) {
        try {
            PermissionDTO permission = permissionService.createPermission(permissionDTO);
            return Response.status(Response.Status.CREATED)
                    .entity(permission)
                    .build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}")
    public Response updatePermission(@PathParam("id") Long id, PermissionDTO permissionDTO) {
        try {
            PermissionDTO permission = permissionService.updatePermission(id, permissionDTO);
            return Response.ok(permission).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }
    }
    
    @DELETE
    @Path("/{id}")
    public Response deletePermission(@PathParam("id") Long id) {
        try {
            permissionService.deletePermission(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Permiso eliminado exitosamente");
            return Response.ok(response).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}/activate")
    public Response activatePermission(@PathParam("id") Long id) {
        try {
            PermissionDTO permission = permissionService.activatePermission(id);
            return Response.ok(permission).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}/deactivate")
    public Response deactivatePermission(@PathParam("id") Long id) {
        try {
            PermissionDTO permission = permissionService.deactivatePermission(id);
            return Response.ok(permission).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }
    }
    
    @GET
    @Path("/category/{category}")
    public Response getPermissionsByCategory(@PathParam("category") String category) {
        try {
            List<PermissionDTO> permissions = permissionService.getPermissionsByCategory(category);
            return Response.ok(permissions).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(error)
                    .build();
        }
    }
    
    @GET
    @Path("/categories")
    public Response getPermissionCategories() {
        try {
            List<String> categories = permissionService.getPermissionCategories();
            return Response.ok(categories).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(error)
                    .build();
        }
    }
    
    @GET
    @Path("/stats")
    public Response getStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            List<PermissionDTO> allPermissions = permissionService.getAllPermissions();
            List<PermissionDTO> activePermissions = permissionService.getActivePermissions();
            
            stats.put("totalPermissions", allPermissions.size());
            stats.put("activePermissions", activePermissions.size());
            stats.put("inactivePermissions", allPermissions.size() - activePermissions.size());
            stats.put("categories", permissionService.getPermissionCategories());
            return Response.ok(stats).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(error)
                    .build();
        }
    }
} 