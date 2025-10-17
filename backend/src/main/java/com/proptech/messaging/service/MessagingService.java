package com.proptech.messaging.service;

import com.proptech.messaging.entity.Message;
import com.proptech.messaging.entity.Conversation;
import com.proptech.messaging.dto.MessageDTO;
import com.proptech.messaging.dto.ConversationDTO;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class MessagingService {

    @Inject
    com.proptech.commons.repository.AgentRepository agentRepository;

    /**
     * Enviar un mensaje entre dos agentes
     */
    @Transactional
    public MessageDTO sendMessage(Long senderId, Long receiverId, String content, Message.MessageType messageType) {
        // Verificar que ambos agentes existen
        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("No puedes enviarte un mensaje a ti mismo");
        }

        // Crear o obtener la conversación
        Conversation conversation = getOrCreateConversation(senderId, receiverId);
        
        // Crear el mensaje
        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setContent(content);
        message.setMessageType(messageType != null ? messageType : Message.MessageType.TEXT);
        message.setConversationId(conversation.getConversationId());
        
        // Persistir el mensaje
        message.persist();
        
        // Actualizar la conversación
        updateConversationLastMessage(conversation, content, message.getCreatedAt());
        
        // Incrementar contador de no leídos para el receptor
        conversation.incrementUnreadCountForAgent(receiverId);
        conversation.persist();
        
        return convertToDTO(message);
    }

    /**
     * Obtener todas las conversaciones de un agente
     */
    public List<ConversationDTO> getConversationsForAgent(Long agentId) {
        List<Conversation> conversations = Conversation.find(
            "agent1Id = ?1 OR agent2Id = ?1 ORDER BY lastMessageAt DESC NULLS LAST", 
            agentId
        ).list();
        
        return conversations.stream()
            .map(conv -> {
                ConversationDTO dto = new ConversationDTO(conv);
                
                // Obtener información del otro agente
                Long otherAgentId = conv.getOtherAgentId(agentId);
                if (otherAgentId != null) {
                    try {
                        // Obtener datos del otro agente
                        com.proptech.commons.entity.Agent otherAgent = agentRepository.findById(otherAgentId);
                        if (conv.getAgent1Id().equals(agentId)) {
                            dto.setAgent2Name(otherAgent != null ? otherAgent.getFirstName() + " " + otherAgent.getLastName() : "Agente");
                            dto.setAgent2Image(otherAgent != null ? otherAgent.getPhoto() : null);
                            dto.setUnreadCount(conv.getUnreadCountAgent1());
                        } else {
                            dto.setAgent1Name(otherAgent != null ? otherAgent.getFirstName() + " " + otherAgent.getLastName() : "Agente");
                            dto.setAgent1Image(otherAgent != null ? otherAgent.getPhoto() : null);
                            dto.setUnreadCount(conv.getUnreadCountAgent2());
                        }
                    } catch (Exception e) {
                        // Si no se puede obtener el agente, usar valores por defecto
                        dto.setAgent1Name("Agente no disponible");
                        dto.setAgent2Name("Agente no disponible");
                    }
                }
                
                return dto;
            })
            .collect(Collectors.toList());
    }

    /**
     * Obtener mensajes de una conversación específica
     */
    public List<MessageDTO> getMessagesForConversation(String conversationId, Long agentId, int page, int size) {
        // Verificar que el agente es parte de la conversación
        Conversation conversation = Conversation.find("conversationId", conversationId).firstResult();
        if (conversation == null || !conversation.isAgentInConversation(agentId)) {
            throw new IllegalArgumentException("Conversación no encontrada o acceso denegado");
        }
        
        // Marcar mensajes como leídos
        markMessagesAsRead(conversationId, agentId);
        
        // Obtener mensajes paginados
        List<Message> messages = Message.find(
            "conversationId = ?1 ORDER BY createdAt DESC", 
            conversationId
        ).page(page, size).list();
        
        return messages.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Marcar mensajes como leídos
     */
    @Transactional
    public void markMessagesAsRead(String conversationId, Long agentId) {
        List<Message> unreadMessages = Message.find(
            "conversationId = ?1 AND receiverId = ?2 AND isRead = false", 
            conversationId, agentId
        ).list();
        
        for (Message message : unreadMessages) {
            message.setIsRead(true);
        }
        
        // Resetear contador de no leídos en la conversación
        Conversation conversation = Conversation.find("conversationId", conversationId).firstResult();
        if (conversation != null) {
            conversation.resetUnreadCountForAgent(agentId);
            conversation.persist();
        }
    }

    /**
     * Obtener conversación entre dos agentes o crearla si no existe
     */
    private Conversation getOrCreateConversation(Long agent1Id, Long agent2Id) {
        // Ordenar IDs para consistencia
        Long minId = Math.min(agent1Id, agent2Id);
        Long maxId = Math.max(agent1Id, agent2Id);
        
        String conversationId = "conv_" + minId + "_" + maxId;
        
        Conversation conversation = Conversation.find("conversationId", conversationId).firstResult();
        
        if (conversation == null) {
            conversation = new Conversation(minId, maxId);
            conversation.persist();
        }
        
        return conversation;
    }

    /**
     * Actualizar información de último mensaje en la conversación
     */
    private void updateConversationLastMessage(Conversation conversation, String content, LocalDateTime messageTime) {
        conversation.setLastMessageContent(content);
        conversation.setLastMessageAt(messageTime);
        conversation.persist();
    }

    /**
     * Convertir entidad Message a DTO
     */
    private MessageDTO convertToDTO(Message message) {
        MessageDTO dto = new MessageDTO(message);
        
        try {
            // Obtener información del remitente
            com.proptech.commons.entity.Agent sender = agentRepository.findById(message.getSenderId());
            if (sender != null) {
                dto.setSenderName(sender.getFirstName() + " " + sender.getLastName());
                dto.setSenderImage(sender.getPhoto());
            }
            
            // Obtener información del receptor
            com.proptech.commons.entity.Agent receiver = agentRepository.findById(message.getReceiverId());
            if (receiver != null) {
                dto.setReceiverName(receiver.getFirstName() + " " + receiver.getLastName());
                dto.setReceiverImage(receiver.getPhoto());
            }
        } catch (Exception e) {
            // Si no se puede obtener la información del agente, usar valores por defecto
            dto.setSenderName("Agente no disponible");
            dto.setReceiverName("Agente no disponible");
        }
        
        return dto;
    }

    /**
     * Obtener contador de mensajes no leídos para un agente
     */
    public Integer getUnreadMessageCount(Long agentId) {
        List<Conversation> conversations = Conversation.find(
            "agent1Id = ?1 OR agent2Id = ?1", 
            agentId
        ).list();
        
        return conversations.stream()
            .mapToInt(conv -> conv.getUnreadCountForAgent(agentId))
            .sum();
    }

    /**
     * Eliminar una conversación (marcar como inactiva)
     */
    @Transactional
    public void deleteConversation(String conversationId, Long agentId) {
        Conversation conversation = Conversation.find("conversationId", conversationId).firstResult();
        if (conversation != null && conversation.isAgentInConversation(agentId)) {
            conversation.setIsActive(false);
            conversation.persist();
        }
    }

    /**
     * Buscar conversaciones por contenido de mensaje
     */
    public List<ConversationDTO> searchConversations(Long agentId, String searchTerm) {
        List<Message> matchingMessages = Message.find(
            "conversationId IN (SELECT conversationId FROM Conversation WHERE agent1Id = ?1 OR agent2Id = ?1) AND content LIKE ?2",
            agentId, "%" + searchTerm + "%"
        ).list();
        
        List<String> conversationIds = matchingMessages.stream()
            .map(Message::getConversationId)
            .distinct()
            .collect(Collectors.toList());
        
        if (conversationIds.isEmpty()) {
            return List.of();
        }
        
        List<Conversation> conversations = Conversation.find(
            "conversationId IN ?1", 
            conversationIds
        ).list();
        
        return conversations.stream()
            .map(conv -> new ConversationDTO(conv))
            .collect(Collectors.toList());
    }
}
