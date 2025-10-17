package com.proptech.messaging.dto;

import com.proptech.messaging.entity.Conversation;
import java.time.LocalDateTime;
import java.util.List;

public class ConversationDTO {
    
    private Long id;
    private String conversationId;
    private Long agent1Id;
    private String agent1Name;
    private String agent1Image;
    private Long agent2Id;
    private String agent2Name;
    private String agent2Image;
    private String lastMessageContent;
    private LocalDateTime lastMessageAt;
    private Integer unreadCount;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<MessageDTO> recentMessages;

    // Constructors
    public ConversationDTO() {}

    public ConversationDTO(Conversation conversation) {
        this.id = conversation.getId();
        this.conversationId = conversation.getConversationId();
        this.agent1Id = conversation.getAgent1Id();
        this.agent2Id = conversation.getAgent2Id();
        this.lastMessageContent = conversation.getLastMessageContent();
        this.lastMessageAt = conversation.getLastMessageAt();
        this.isActive = conversation.getIsActive();
        this.createdAt = conversation.getCreatedAt();
        this.updatedAt = conversation.getUpdatedAt();
    }

    // Helper method to get the other agent's info
    public Long getOtherAgentId(Long currentAgentId) {
        if (currentAgentId.equals(agent1Id)) {
            return agent2Id;
        } else if (currentAgentId.equals(agent2Id)) {
            return agent1Id;
        }
        return null;
    }

    public String getOtherAgentName(Long currentAgentId) {
        if (currentAgentId.equals(agent1Id)) {
            return agent2Name;
        } else if (currentAgentId.equals(agent2Id)) {
            return agent1Name;
        }
        return null;
    }

    public String getOtherAgentImage(Long currentAgentId) {
        if (currentAgentId.equals(agent1Id)) {
            return agent2Image;
        } else if (currentAgentId.equals(agent2Id)) {
            return agent1Image;
        }
        return null;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }

    public Long getAgent1Id() { return agent1Id; }
    public void setAgent1Id(Long agent1Id) { this.agent1Id = agent1Id; }

    public String getAgent1Name() { return agent1Name; }
    public void setAgent1Name(String agent1Name) { this.agent1Name = agent1Name; }

    public String getAgent1Image() { return agent1Image; }
    public void setAgent1Image(String agent1Image) { this.agent1Image = agent1Image; }

    public Long getAgent2Id() { return agent2Id; }
    public void setAgent2Id(Long agent2Id) { this.agent2Id = agent2Id; }

    public String getAgent2Name() { return agent2Name; }
    public void setAgent2Name(String agent2Name) { this.agent2Name = agent2Name; }

    public String getAgent2Image() { return agent2Image; }
    public void setAgent2Image(String agent2Image) { this.agent2Image = agent2Image; }

    public String getLastMessageContent() { return lastMessageContent; }
    public void setLastMessageContent(String lastMessageContent) { this.lastMessageContent = lastMessageContent; }

    public LocalDateTime getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public Integer getUnreadCount() { return unreadCount; }
    public void setUnreadCount(Integer unreadCount) { this.unreadCount = unreadCount; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<MessageDTO> getRecentMessages() { return recentMessages; }
    public void setRecentMessages(List<MessageDTO> recentMessages) { this.recentMessages = recentMessages; }
}
