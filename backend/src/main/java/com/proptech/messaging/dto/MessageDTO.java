package com.proptech.messaging.dto;

import com.proptech.messaging.entity.Message;
import java.time.LocalDateTime;

public class MessageDTO {
    
    private Long id;
    private Long senderId;
    private String senderName;
    private String senderImage;
    private Long receiverId;
    private String receiverName;
    private String receiverImage;
    private String content;
    private Message.MessageType messageType;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long parentMessageId;
    private String conversationId;

    // Constructors
    public MessageDTO() {}

    public MessageDTO(Message message) {
        this.id = message.getId();
        this.senderId = message.getSenderId();
        this.receiverId = message.getReceiverId();
        this.content = message.getContent();
        this.messageType = message.getMessageType();
        this.isRead = message.getIsRead();
        this.createdAt = message.getCreatedAt();
        this.updatedAt = message.getUpdatedAt();
        this.parentMessageId = message.getParentMessageId();
        this.conversationId = message.getConversationId();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderImage() { return senderImage; }
    public void setSenderImage(String senderImage) { this.senderImage = senderImage; }

    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

    public String getReceiverImage() { return receiverImage; }
    public void setReceiverImage(String receiverImage) { this.receiverImage = receiverImage; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Message.MessageType getMessageType() { return messageType; }
    public void setMessageType(Message.MessageType messageType) { this.messageType = messageType; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getParentMessageId() { return parentMessageId; }
    public void setParentMessageId(Long parentMessageId) { this.parentMessageId = parentMessageId; }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }
}
