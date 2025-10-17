package com.proptech.auth.resource;

import com.proptech.auth.dto.RoleDTO;
import com.proptech.auth.service.RoleService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/api/auth/roles")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RoleResource {
    
    @Inject
    RoleService roleService;
    
    @GET
    public Response getAllRoles() {
        try {
            List<RoleDTO> roles = roleService.getAllRoles();
            return Response.ok(roles).build();
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
    public Response getActiveRoles() {
        try {
            List<RoleDTO> roles = roleService.getActiveRoles();
            return Response.ok(roles).build();
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
    public Response getRoleById(@PathParam("id") Long id) {
        try {
            RoleDTO role = roleService.getRoleById(id);
            return Response.ok(role).build();
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
    public Response getRoleByName(@PathParam("name") String name) {
        try {
            RoleDTO role = roleService.getRoleByName(name);
            return Response.ok(role).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(error)
                    .build();
        }
    }
    
    @POST
    public Response createRole(RoleDTO roleDTO) {
        try {
            RoleDTO role = roleService.createRole(roleDTO);
            return Response.status(Response.Status.CREATED)
                    .entity(role)
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
    public Response updateRole(@PathParam("id") Long id, RoleDTO roleDTO) {
        try {
            RoleDTO role = roleService.updateRole(id, roleDTO);
            return Response.ok(role).build();
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
    public Response deleteRole(@PathParam("id") Long id) {
        try {
            roleService.deleteRole(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Rol eliminado exitosamente");
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
    public Response activateRole(@PathParam("id") Long id) {
        try {
            RoleDTO role = roleService.activateRole(id);
            return Response.ok(role).build();
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
    public Response deactivateRole(@PathParam("id") Long id) {
        try {
            RoleDTO role = roleService.deactivateRole(id);
            return Response.ok(role).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }
    }
    
    @POST
    @Path("/{id}/permissions")
    public Response assignPermissions(@PathParam("id") Long roleId, List<Long> permissionIds) {
        try {
            RoleDTO role = roleService.assignPermissions(roleId, permissionIds);
            return Response.ok(role).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }
    }
    
    @DELETE
    @Path("/{id}/permissions")
    public Response removePermissions(@PathParam("id") Long roleId, List<Long> permissionIds) {
        try {
            RoleDTO role = roleService.removePermissions(roleId, permissionIds);
            return Response.ok(role).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }
    }
    
    @GET
    @Path("/stats")
    public Response getStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            List<RoleDTO> allRoles = roleService.getAllRoles();
            List<RoleDTO> activeRoles = roleService.getActiveRoles();
            
            stats.put("totalRoles", allRoles.size());
            stats.put("activeRoles", activeRoles.size());
            stats.put("inactiveRoles", allRoles.size() - activeRoles.size());
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