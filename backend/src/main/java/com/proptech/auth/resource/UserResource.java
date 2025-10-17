package com.proptech.auth.resource;

import com.proptech.auth.dto.UserDTO;
import com.proptech.auth.enums.UserStatus;
import com.proptech.auth.service.UserService;
import com.proptech.properties.repository.PropertyRepository;
import com.proptech.properties.entity.Property;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/api/auth/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {
    
    @Inject
    UserService userService;
    
    @Inject
    PropertyRepository propertyRepository;
    
    @GET
    public Response getAllUsers() {
        try {
            List<UserDTO> users = userService.getAllUsers();
            return Response.ok(users).build();
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
    public Response getActiveUsers() {
        try {
            List<UserDTO> users = userService.getActiveUsers();
            return Response.ok(users).build();
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
    public Response getUserById(@PathParam("id") Long id) {
        try {
            UserDTO user = userService.getUserById(id);
            return Response.ok(user).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(error)
                    .build();
        }
    }
    
    @GET
    @Path("/email/{email}")
    public Response getUserByEmail(@PathParam("email") String email) {
        try {
            UserDTO user = userService.getUserByEmail(email);
            return Response.ok(user).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(error)
                    .build();
        }
    }
    
    @POST
    public Response createUser(UserDTO userDTO) {
        try {
            UserDTO user = userService.createUser(userDTO);
            return Response.status(Response.Status.CREATED)
                    .entity(user)
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
    public Response updateUser(@PathParam("id") Long id, UserDTO userDTO) {
        try {
            // Logs para depuración
            System.out.println("UserDTO recibido: " + userDTO);
            System.out.println("Email: " + userDTO.getEmail());
            System.out.println("FirstName: " + userDTO.getFirstName());
            System.out.println("LastName: " + userDTO.getLastName());
            // Validación de campos obligatorios
            if (userDTO.getEmail() == null || userDTO.getEmail().trim().isEmpty()) {
                throw new RuntimeException("El email es obligatorio");
            }
            if (userDTO.getFirstName() == null || userDTO.getFirstName().trim().isEmpty()) {
                throw new RuntimeException("El nombre es obligatorio");
            }
            if (userDTO.getLastName() == null || userDTO.getLastName().trim().isEmpty()) {
                throw new RuntimeException("El apellido es obligatorio");
            }
            UserDTO user = userService.updateUser(id, userDTO);
            return Response.ok(user).build();
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
    public Response deleteUser(@PathParam("id") Long id) {
        try {
            userService.deleteUser(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Usuario eliminado exitosamente");
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
    public Response activateUser(@PathParam("id") Long id) {
        try {
            UserDTO user = userService.activateUser(id);
            return Response.ok(user).build();
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
    public Response deactivateUser(@PathParam("id") Long id) {
        try {
            UserDTO user = userService.deactivateUser(id);
            return Response.ok(user).build();
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
            List<UserDTO> allUsers = userService.getAllUsers();
            List<UserDTO> activeUsers = userService.getActiveUsers();
            List<UserDTO> inactiveUsers = userService.getUsersByStatus(UserStatus.INACTIVE);
            
            stats.put("totalUsers", allUsers.size());
            stats.put("activeUsers", activeUsers.size());
            stats.put("inactiveUsers", inactiveUsers.size());
            return Response.ok(stats).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(error)
                    .build();
        }
    }

    @GET
    @Path("/{id}/stats")
    public Response getUserStats(@PathParam("id") Long userId) {
        try {
            // Propiedades gestionadas por el usuario (como agente)
            List<Property> properties = propertyRepository.findByAgent(userId);
            int propertiesCount = properties.size();

            // Total de vistas de esas propiedades
            int views = properties.stream().mapToInt(p -> p.getViews() != null ? p.getViews() : 0).sum();

            // Favoritos del usuario
            int favorites = propertyRepository.findFavoritesByUserId(userId).size();

            Map<String, Object> stats = new HashMap<>();
            stats.put("properties", propertiesCount);
            stats.put("views", views);
            stats.put("favorites", favorites);

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