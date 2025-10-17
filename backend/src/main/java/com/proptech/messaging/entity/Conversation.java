package com.proptech.messaging.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversations", schema = "proptech")
public class Conversation extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false, unique = true)
    private String conversationId;

    @Column(name = "agent1_id", nullable = false)
    private Long agent1Id;

    @Column(name = "agent2_id", nullable = false)
    private Long agent2Id;

    @Column(name = "last_message_content")
    private String lastMessageContent;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "unread_count_agent1", nullable = false)
    private Integer unreadCountAgent1 = 0;

    @Column(name = "unread_count_agent2", nullable = false)
    private Integer unreadCountAgent2 = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Conversation() {}

    public Conversation(Long agent1Id, Long agent2Id) {
        this.agent1Id = agent1Id;
        this.agent2Id = agent2Id;
        this.conversationId = generateConversationId(agent1Id, agent2Id);
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper method to generate conversation ID
    private String generateConversationId(Long agent1Id, Long agent2Id) {
        // Sort IDs to ensure consistent conversation ID regardless of who initiates
        Long minId = Math.min(agent1Id, agent2Id);
        Long maxId = Math.max(agent1Id, agent2Id);
        return "conv_" + minId + "_" + maxId;
    }

    // Helper method to get unread count for a specific agent
    public Integer getUnreadCountForAgent(Long agentId) {
        if (agentId.equals(agent1Id)) {
            return unreadCountAgent1;
        } else if (agentId.equals(agent2Id)) {
            return unreadCountAgent2;
        }
        return 0;
    }

    // Helper method to increment unread count for a specific agent
    public void incrementUnreadCountForAgent(Long agentId) {
        if (agentId.equals(agent1Id)) {
            this.unreadCountAgent1++;
        } else if (agentId.equals(agent2Id)) {
            this.unreadCountAgent2++;
        }
    }

    // Helper method to reset unread count for a specific agent
    public void resetUnreadCountForAgent(Long agentId) {
        if (agentId.equals(agent1Id)) {
            this.unreadCountAgent1 = 0;
        } else if (agentId.equals(agent2Id)) {
            this.unreadCountAgent2 = 0;
        }
    }

    // Helper method to check if agent is part of conversation
    public Boolean isAgentInConversation(Long agentId) {
        return agentId.equals(agent1Id) || agentId.equals(agent2Id);
    }

    // Helper method to get the other agent ID
    public Long getOtherAgentId(Long agentId) {
        if (agentId.equals(agent1Id)) {
            return agent2Id;
        } else if (agentId.equals(agent2Id)) {
            return agent1Id;
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

    public Long getAgent2Id() { return agent2Id; }
    public void setAgent2Id(Long agent2Id) { this.agent2Id = agent2Id; }

    public String getLastMessageContent() { return lastMessageContent; }
    public void setLastMessageContent(String lastMessageContent) { this.lastMessageContent = lastMessageContent; }

    public LocalDateTime getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public Integer getUnreadCountAgent1() { return unreadCountAgent1; }
    public void setUnreadCountAgent1(Integer unreadCountAgent1) { this.unreadCountAgent1 = unreadCountAgent1; }

    public Integer getUnreadCountAgent2() { return unreadCountAgent2; }
    public void setUnreadCountAgent2(Integer unreadCountAgent2) { this.unreadCountAgent2 = unreadCountAgent2; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
