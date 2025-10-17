package com.proptech.messaging.resource;

import com.proptech.messaging.dto.MessageDTO;
import com.proptech.messaging.dto.ConversationDTO;
import com.proptech.messaging.entity.Message;
import com.proptech.messaging.service.MessagingService;
import com.proptech.auth.service.UserService;
import com.proptech.auth.service.SecurityContextService;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/messaging")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MessagingResource {

    @Inject
    MessagingService messagingService;

    @Inject
    UserService userService;

    @Context
    SecurityContext securityContext;

    @Inject
    SecurityContextService securityContextService;

    /**
     * Enviar un mensaje
     */
    @POST
    @Path("/send")
    @RolesAllowed({"AGENT", "ADMIN"})
    public Response sendMessage(@QueryParam("receiverId") Long receiverId, 
                               @QueryParam("content") String content,
                               @QueryParam("messageType") String messageType) {
        try {
            Long currentUserId = securityContextService.getCurrentUserId();
            if (currentUserId == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("Usuario no autenticado").build();
            }

            if (content == null || content.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("El contenido del mensaje no puede estar vacío").build();
            }

            Message.MessageType type = Message.MessageType.TEXT;
            if (messageType != null) {
                try {
                    type = Message.MessageType.valueOf(messageType.toUpperCase());
                } catch (IllegalArgumentException e) {
                    // Usar tipo por defecto si el tipo no es válido
                }
            }

            MessageDTO message = messagingService.sendMessage(currentUserId, receiverId, content, type);
            return Response.ok(message).build();

        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(e.getMessage()).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error al enviar mensaje: " + e.getMessage()).build();
        }
    }

    /**
     * Obtener conversaciones del usuario actual
     */
    @GET
    @Path("/conversations")
    @RolesAllowed({"AGENT", "ADMIN"})
    public Response getConversations() {
        try {
            Long currentUserId = securityContextService.getCurrentUserId();
            if (currentUserId == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("Usuario no autenticado").build();
            }

            List<ConversationDTO> conversations = messagingService.getConversationsForAgent(currentUserId);
            return Response.ok(conversations).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error al obtener conversaciones: " + e.getMessage()).build();
        }
    }

    /**
     * Obtener mensajes de una conversación específica
     */
    @GET
    @Path("/conversations/{conversationId}/messages")
    @RolesAllowed({"AGENT", "ADMIN"})
    public Response getMessages(@PathParam("conversationId") String conversationId,
                               @QueryParam("page") @DefaultValue("0") int page,
                               @QueryParam("size") @DefaultValue("50") int size) {
        try {
            Long currentUserId = securityContextService.getCurrentUserId();
            if (currentUserId == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("Usuario no autenticado").build();
            }

            List<MessageDTO> messages = messagingService.getMessagesForConversation(conversationId, currentUserId, page, size);
            return Response.ok(messages).build();

        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(e.getMessage()).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error al obtener mensajes: " + e.getMessage()).build();
        }
    }

    /**
     * Marcar mensajes como leídos
     */
    @PUT
    @Path("/conversations/{conversationId}/read")
    @RolesAllowed({"AGENT", "ADMIN"})
    public Response markAsRead(@PathParam("conversationId") String conversationId) {
        try {
            Long currentUserId = securityContextService.getCurrentUserId();
            if (currentUserId == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("Usuario no autenticado").build();
            }

            messagingService.markMessagesAsRead(conversationId, currentUserId);
            return Response.ok("Mensajes marcados como leídos").build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error al marcar mensajes como leídos: " + e.getMessage()).build();
        }
    }

    /**
     * Obtener contador de mensajes no leídos
     */
    @GET
    @Path("/unread-count")
    @RolesAllowed({"AGENT", "ADMIN"})
    public Response getUnreadCount() {
        try {
            Long currentUserId = securityContextService.getCurrentUserId();
            if (currentUserId == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("Usuario no autenticado").build();
            }

            Integer unreadCount = messagingService.getUnreadMessageCount(currentUserId);
            return Response.ok(unreadCount).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error al obtener contador de mensajes no leídos: " + e.getMessage()).build();
        }
    }

    /**
     * Buscar conversaciones
     */
    @GET
    @Path("/search")
    @RolesAllowed({"AGENT", "ADMIN"})
    public Response searchConversations(@QueryParam("q") String searchTerm) {
        try {
            Long currentUserId = securityContextService.getCurrentUserId();
            if (currentUserId == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("Usuario no autenticado").build();
            }

            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Término de búsqueda requerido").build();
            }

            List<ConversationDTO> conversations = messagingService.searchConversations(currentUserId, searchTerm);
            return Response.ok(conversations).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error al buscar conversaciones: " + e.getMessage()).build();
        }
    }

    /**
     * Eliminar conversación
     */
    @DELETE
    @Path("/conversations/{conversationId}")
    @RolesAllowed({"AGENT", "ADMIN"})
    public Response deleteConversation(@PathParam("conversationId") String conversationId) {
        try {
            Long currentUserId = securityContextService.getCurrentUserId();
            if (currentUserId == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("Usuario no autenticado").build();
            }

            messagingService.deleteConversation(conversationId, currentUserId);
            return Response.ok("Conversación eliminada").build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error al eliminar conversación: " + e.getMessage()).build();
        }
    }

    /**
     * Obtener conversación específica
     */
    @GET
    @Path("/conversations/{conversationId}")
    @RolesAllowed({"AGENT", "ADMIN"})
    public Response getConversation(@PathParam("conversationId") String conversationId) {
        try {
            Long currentUserId = securityContextService.getCurrentUserId();
            if (currentUserId == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("Usuario no autenticado").build();
            }

            // Buscar la conversación en la lista del usuario
            List<ConversationDTO> conversations = messagingService.getConversationsForAgent(currentUserId);
            ConversationDTO conversation = conversations.stream()
                .filter(conv -> conv.getConversationId().equals(conversationId))
                .findFirst()
                .orElse(null);

            if (conversation == null) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity("Conversación no encontrada").build();
            }

            return Response.ok(conversation).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error al obtener conversación: " + e.getMessage()).build();
        }
    }
}
