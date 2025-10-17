package com.proptech.properties.repository;

import com.proptech.properties.entity.Comment;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class CommentRepository implements PanacheRepository<Comment> {
    
    // Obtener comentarios principales de un post (sin respuestas)
    public List<Comment> findTopLevelCommentsByPostId(Long postId) {
        return find("postId = :postId AND parentCommentId IS NULL AND isDeleted = false ORDER BY createdAt DESC", 
                   Parameters.with("postId", postId)).list();
    }
    
    // Obtener todas las respuestas de un comentario
    public List<Comment> findRepliesByCommentId(Long commentId) {
        return find("parentCommentId = :commentId AND isDeleted = false ORDER BY createdAt ASC", 
                   Parameters.with("commentId", commentId)).list();
    }
    
    // Obtener comentarios de un post con respuestas anidadas
    public List<Comment> findCommentsWithRepliesByPostId(Long postId) {
        List<Comment> topLevelComments = findTopLevelCommentsByPostId(postId);
        
        // Cargar respuestas para cada comentario principal
        for (Comment comment : topLevelComments) {
            List<Comment> replies = findRepliesByCommentId(comment.getId());
            comment.setReplies(replies);
        }
        
        return topLevelComments;
    }
    
    // Obtener comentarios por autor
    public List<Comment> findByAuthorId(Long authorId) {
        return find("authorId = :authorId AND isDeleted = false ORDER BY createdAt DESC", 
                   Parameters.with("authorId", authorId)).list();
    }
    
    // Obtener comentarios recientes
    public List<Comment> findRecentComments(int limit) {
        return find("isDeleted = false ORDER BY createdAt DESC").range(0, limit - 1).list();
    }
    
    // Contar comentarios de un post
    public Long countCommentsByPostId(Long postId) {
        return count("postId = :postId AND isDeleted = false", 
                    Parameters.with("postId", postId));
    }
    
    // Contar respuestas de un comentario
    public Long countRepliesByCommentId(Long commentId) {
        return count("parentCommentId = :commentId AND isDeleted = false", 
                    Parameters.with("commentId", commentId));
    }
    
    // Buscar comentarios por contenido (para moderación)
    public List<Comment> findByContentContaining(String searchTerm) {
        return find("content LIKE :searchTerm AND isDeleted = false ORDER BY createdAt DESC", 
                   Parameters.with("searchTerm", "%" + searchTerm + "%")).list();
    }
    
    // Marcar comentario como eliminado (soft delete)
    public void softDeleteComment(Long commentId) {
        update("isDeleted = true WHERE id = :commentId", 
               Parameters.with("commentId", commentId));
    }
    
    // Incrementar contador de likes
    public void incrementLikes(Long commentId) {
        update("likesCount = likesCount + 1 WHERE id = :commentId", 
               Parameters.with("commentId", commentId));
    }
    
    // Decrementar contador de likes
    public void decrementLikes(Long commentId) {
        update("likesCount = GREATEST(likesCount - 1, 0) WHERE id = :commentId", 
               Parameters.with("commentId", commentId));
    }
}
