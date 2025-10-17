package com.proptech.properties.resource;

import com.proptech.properties.dto.CommentDTO;
import com.proptech.properties.dto.CreateCommentRequest;
import com.proptech.properties.dto.ErrorResponse;
import com.proptech.properties.service.CommentService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Path("/api/comments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CommentResource {
    
    @Inject
    CommentService commentService;
    
    // Obtener comentarios de un post
    @GET
    @Path("/post/{postId}")
    public Response getCommentsByPostId(@PathParam("postId") Long postId,
                                      @QueryParam("userId") Long currentUserId) {
        try {
            List<CommentDTO> comments = commentService.getCommentsByPostId(postId, currentUserId);
            return Response.ok(comments).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener comentarios: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    // Obtener comentarios principales de un post
    @GET
    @Path("/post/{postId}/top-level")
    public Response getTopLevelCommentsByPostId(@PathParam("postId") Long postId,
                                              @QueryParam("userId") Long currentUserId) {
        try {
            List<CommentDTO> comments = commentService.getTopLevelCommentsByPostId(postId, currentUserId);
            return Response.ok(comments).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener comentarios principales: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    // Obtener respuestas de un comentario
    @GET
    @Path("/{commentId}/replies")
    public Response getRepliesByCommentId(@PathParam("commentId") Long commentId,
                                        @QueryParam("userId") Long currentUserId) {
        try {
            List<CommentDTO> replies = commentService.getRepliesByCommentId(commentId, currentUserId);
            return Response.ok(replies).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener respuestas: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    // Crear un nuevo comentario
    @POST
    public Response createComment(CreateCommentRequest request,
                                @QueryParam("userId") Long currentUserId,
                                @QueryParam("userName") String currentUserName) {
        try {
            if (currentUserId == null || currentUserName == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Usuario no autenticado");
                return Response.status(Response.Status.UNAUTHORIZED).entity(error).build();
            }
            
            CommentDTO comment = commentService.createComment(request, currentUserId, currentUserName);
            return Response.status(Response.Status.CREATED).entity(comment).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear comentario: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }
    }
    
    // Dar like a un comentario
    @POST
    @Path("/{commentId}/like")
    public Response likeComment(@PathParam("commentId") Long commentId,
                              @QueryParam("userId") Long currentUserId) {
        try {
            if (currentUserId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Usuario no autenticado");
                return Response.status(Response.Status.UNAUTHORIZED).entity(error).build();
            }
            
            commentService.likeComment(commentId, currentUserId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Like agregado exitosamente");
            return Response.ok(response).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al dar like: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }
    }
    
    // Quitar like de un comentario
    @DELETE
    @Path("/{commentId}/like")
    public Response unlikeComment(@PathParam("commentId") Long commentId,
                                @QueryParam("userId") Long currentUserId) {
        try {
            if (currentUserId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Usuario no autenticado");
                return Response.status(Response.Status.UNAUTHORIZED).entity(error).build();
            }
            
            commentService.unlikeComment(commentId, currentUserId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Like removido exitosamente");
            return Response.ok(response).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al quitar like: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }
    }
    
    // Actualizar comentario
    @PUT
    @Path("/{commentId}")
    public Response updateComment(@PathParam("commentId") Long commentId,
                                @QueryParam("content") String newContent,
                                @QueryParam("userId") Long currentUserId) {
        try {
            if (currentUserId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Usuario no autenticado");
                return Response.status(Response.Status.UNAUTHORIZED).entity(error).build();
            }
            
            CommentDTO comment = commentService.updateComment(commentId, newContent, currentUserId);
            return Response.ok(comment).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al actualizar comentario: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }
    }
    
    // Eliminar comentario
    @DELETE
    @Path("/{commentId}")
    public Response deleteComment(@PathParam("commentId") Long commentId,
                                @QueryParam("userId") Long currentUserId) {
        try {
            if (currentUserId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Usuario no autenticado");
                return Response.status(Response.Status.UNAUTHORIZED).entity(error).build();
            }
            
            commentService.deleteComment(commentId, currentUserId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Comentario eliminado exitosamente");
            return Response.ok(response).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar comentario: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }
    }
    
    // Obtener comentarios recientes
    @GET
    @Path("/recent")
    public Response getRecentComments(@QueryParam("limit") Integer limit,
                                    @QueryParam("userId") Long currentUserId) {
        try {
            if (limit == null || limit <= 0) {
                limit = 10; // Default limit
            }
            
            List<CommentDTO> comments = commentService.getRecentComments(limit, currentUserId);
            return Response.ok(comments).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener comentarios recientes: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    // Contar comentarios de un post
    @GET
    @Path("/post/{postId}/count")
    public Response getCommentCountByPostId(@PathParam("postId") Long postId) {
        try {
            Long count = commentService.getCommentCountByPostId(postId);
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return Response.ok(response).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al contar comentarios: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
}
