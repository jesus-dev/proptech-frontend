package com.proptech.properties.service;

import com.proptech.properties.dto.CommentDTO;
import com.proptech.properties.dto.CreateCommentRequest;
import com.proptech.properties.entity.Comment;
import com.proptech.properties.repository.CommentRepository;
import com.proptech.notifications.service.NotificationEventService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class CommentService {
    
    @Inject
    CommentRepository commentRepository;
    
    @Inject
    NotificationEventService notificationEventService;
    
    // Crear un nuevo comentario
    @Transactional
    public CommentDTO createComment(CreateCommentRequest request, Long currentUserId, String currentUserName) {
        // Validar request
        String validationError = request.getValidationError();
        if (validationError != null) {
            throw new RuntimeException(validationError);
        }
        
        // Crear el comentario
        Comment comment = new Comment();
        comment.setContent(request.getContent().trim());
        comment.setAuthorId(currentUserId);
        comment.setAuthorName(currentUserName);
        comment.setPostId(request.getPostId());
        comment.setParentCommentId(request.getParentCommentId());
        comment.setLikesCount(0);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        comment.setIsDeleted(false);
        
        // Persistir
        commentRepository.persist(comment);
        
        // Crear notificación para el agente propietario de la propiedad
        try {
            notificationEventService.notifyCommentCreated(
                request.getPostId(), // postId es el propertyId en este contexto
                currentUserId,
                currentUserName,
                request.getContent().trim()
            );
        } catch (Exception e) {
            System.err.println("Error creating notification for comment: " + e.getMessage());
            // No lanzar excepción para no afectar la creación del comentario
        }
        
        return convertToDTO(comment);
    }
    
    // Obtener comentarios de un post con respuestas anidadas
    public List<CommentDTO> getCommentsByPostId(Long postId, Long currentUserId) {
        List<Comment> comments = commentRepository.findCommentsWithRepliesByPostId(postId);
        return comments.stream()
                .map(comment -> convertToDTOWithUserLike(comment, currentUserId))
                .collect(Collectors.toList());
    }
    
    // Obtener comentarios principales de un post
    public List<CommentDTO> getTopLevelCommentsByPostId(Long postId, Long currentUserId) {
        List<Comment> comments = commentRepository.findTopLevelCommentsByPostId(postId);
        return comments.stream()
                .map(comment -> convertToDTOWithUserLike(comment, currentUserId))
                .collect(Collectors.toList());
    }
    
    // Obtener respuestas de un comentario
    public List<CommentDTO> getRepliesByCommentId(Long commentId, Long currentUserId) {
        List<Comment> replies = commentRepository.findRepliesByCommentId(commentId);
        return replies.stream()
                .map(reply -> convertToDTOWithUserLike(reply, currentUserId))
                .collect(Collectors.toList());
    }
    
    // Dar like a un comentario
    @Transactional
    public void likeComment(Long commentId, Long currentUserId) {
        Comment comment = commentRepository.findById(commentId);
        if (comment == null || comment.getIsDeleted()) {
            throw new RuntimeException("Comentario no encontrado");
        }
        
        // Aquí podrías implementar un sistema de likes más sofisticado
        // Por ahora solo incrementamos el contador
        commentRepository.incrementLikes(commentId);
    }
    
    // Quitar like de un comentario
    @Transactional
    public void unlikeComment(Long commentId, Long currentUserId) {
        Comment comment = commentRepository.findById(commentId);
        if (comment == null || comment.getIsDeleted()) {
            throw new RuntimeException("Comentario no encontrado");
        }
        
        commentRepository.decrementLikes(commentId);
    }
    
    // Eliminar comentario (soft delete)
    @Transactional
    public void deleteComment(Long commentId, Long currentUserId) {
        Comment comment = commentRepository.findById(commentId);
        if (comment == null) {
            throw new RuntimeException("Comentario no encontrado");
        }
        
        // Solo el autor puede eliminar su comentario
        if (!comment.getAuthorId().equals(currentUserId)) {
            throw new RuntimeException("No tienes permisos para eliminar este comentario");
        }
        
        commentRepository.softDeleteComment(commentId);
    }
    
    // Actualizar comentario
    @Transactional
    public CommentDTO updateComment(Long commentId, String newContent, Long currentUserId) {
        Comment comment = commentRepository.findById(commentId);
        if (comment == null || comment.getIsDeleted()) {
            throw new RuntimeException("Comentario no encontrado");
        }
        
        // Solo el autor puede editar su comentario
        if (!comment.getAuthorId().equals(currentUserId)) {
            throw new RuntimeException("No tienes permisos para editar este comentario");
        }
        
        // Validar nuevo contenido
        if (newContent == null || newContent.trim().isEmpty()) {
            throw new RuntimeException("El contenido del comentario no puede estar vacío");
        }
        if (newContent.trim().length() < 3) {
            throw new RuntimeException("El comentario debe tener al menos 3 caracteres");
        }
        if (newContent.trim().length() > 1000) {
            throw new RuntimeException("El comentario no puede exceder 1000 caracteres");
        }
        
        comment.setContent(newContent.trim());
        comment.setUpdatedAt(LocalDateTime.now());
        
        return convertToDTO(comment);
    }
    
    // Obtener comentarios recientes
    public List<CommentDTO> getRecentComments(int limit, Long currentUserId) {
        List<Comment> comments = commentRepository.findRecentComments(limit);
        return comments.stream()
                .map(comment -> convertToDTOWithUserLike(comment, currentUserId))
                .collect(Collectors.toList());
    }
    
    // Contar comentarios de un post
    public Long getCommentCountByPostId(Long postId) {
        return commentRepository.countCommentsByPostId(postId);
    }
    
    // Convertir entidad a DTO
    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setAuthorId(comment.getAuthorId());
        dto.setAuthorName(comment.getAuthorName());
        dto.setAuthorAvatar(comment.getAuthorAvatar());
        dto.setPostId(comment.getPostId());
        dto.setParentCommentId(comment.getParentCommentId());
        dto.setLikesCount(comment.getLikesCount());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        
        // Convertir respuestas si existen
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            List<CommentDTO> replyDTOs = comment.getReplies().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            dto.setReplies(replyDTOs);
        }
        
        return dto;
    }
    
    // Convertir entidad a DTO con información de like del usuario actual
    private CommentDTO convertToDTOWithUserLike(Comment comment, Long currentUserId) {
        CommentDTO dto = convertToDTO(comment);
        
        // Aquí podrías implementar lógica para verificar si el usuario actual dio like
        // Por ahora lo dejamos como false
        dto.setIsLikedByCurrentUser(false);
        
        return dto;
    }
}
