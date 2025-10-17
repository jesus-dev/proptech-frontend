package com.proptech.properties.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class CommentDTO {
    private Long id;
    private String content;
    private Long authorId;
    private String authorName;
    private String authorAvatar;
    private Long postId;
    private Long parentCommentId;
    private List<CommentDTO> replies;
    private Integer likesCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isLikedByCurrentUser;
    
    public CommentDTO() {}
    
    public CommentDTO(Long id, String content, Long authorId, String authorName, 
                     String authorAvatar, Long postId, Long parentCommentId, 
                     Integer likesCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.content = content;
        this.authorId = authorId;
        this.authorName = authorName;
        this.authorAvatar = authorAvatar;
        this.postId = postId;
        this.parentCommentId = parentCommentId;
        this.likesCount = likesCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public Long getAuthorId() {
        return authorId;
    }
    
    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }
    
    public String getAuthorName() {
        return authorName;
    }
    
    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }
    
    public String getAuthorAvatar() {
        return authorAvatar;
    }
    
    public void setAuthorAvatar(String authorAvatar) {
        this.authorAvatar = authorAvatar;
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
    
    public List<CommentDTO> getReplies() {
        return replies;
    }
    
    public void setReplies(List<CommentDTO> replies) {
        this.replies = replies;
    }
    
    public Integer getLikesCount() {
        return likesCount;
    }
    
    public void setLikesCount(Integer likesCount) {
        this.likesCount = likesCount;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Boolean getIsLikedByCurrentUser() {
        return isLikedByCurrentUser;
    }
    
    public void setIsLikedByCurrentUser(Boolean isLikedByCurrentUser) {
        this.isLikedByCurrentUser = isLikedByCurrentUser;
    }
    
    // Helper methods
    public boolean hasReplies() {
        return replies != null && !replies.isEmpty();
    }
    
    public boolean isReply() {
        return parentCommentId != null;
    }
    
    public boolean isTopLevel() {
        return parentCommentId == null;
    }
}
