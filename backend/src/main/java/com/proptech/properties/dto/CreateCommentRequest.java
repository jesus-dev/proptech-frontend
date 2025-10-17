package com.proptech.properties.dto;

public class CreateCommentRequest {
    private String content;
    private Long postId;
    private Long parentCommentId;
    
    public CreateCommentRequest() {}
    
    public CreateCommentRequest(String content, Long postId) {
        this.content = content;
        this.postId = postId;
    }
    
    public CreateCommentRequest(String content, Long postId, Long parentCommentId) {
        this.content = content;
        this.postId = postId;
        this.parentCommentId = parentCommentId;
    }
    
    // Getters and Setters
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public Long getPostId() {
        return postId;
    }
    
    public void setPostId(Long postId) {
        this.postId = postId;
    }
    
    public Long getParentCommentId() {
        return parentCommentId;
    }
    
    public void setParentCommentId(Long parentCommentId) {
        this.parentCommentId = parentCommentId;
    }
    
    // Validation
    public String getValidationError() {
        if (content == null || content.trim().isEmpty()) {
            return "El contenido del comentario no puede estar vacío";
        }
        if (content.trim().length() < 3) {
            return "El comentario debe tener al menos 3 caracteres";
        }
        if (content.trim().length() > 1000) {
            return "El comentario no puede exceder 1000 caracteres";
        }
        if (postId == null) {
            return "El ID del post es requerido";
        }
        return null; // No hay errores
    }
}
