/**
 * Servicio de Mensajería
 * Usa apiClient que YA TIENE reintentos automáticos
 */

import { apiClient } from '@/lib/api';

export interface Conversation {
  id: string;
  participantId: number;
  participantName: string;
  participantEmail?: string;
  participantPhoto?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  createdAt: string;
}

export interface Message {
  id: number;
  conversationId: string;
  senderId: number;
  senderName: string;
  receiverId: number;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  read: boolean;
  createdAt: string;
}

export class MessagingService {
  static async getConversations(): Promise<Conversation[]> {
    try {
      const response = await apiClient.get('/api/messaging/conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  static async getMessages(conversationId: string, page: number = 0, size: number = 50): Promise<Message[]> {
    try {
      const response = await apiClient.get(`/api/messaging/conversations/${conversationId}/messages?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching messages for conversation ${conversationId}:`, error);
      return [];
    }
  }

  static async sendMessage(receiverId: number, content: string, messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'): Promise<Message | null> {
    try {
      const response = await apiClient.post(`/api/messaging/send?receiverId=${receiverId}&content=${encodeURIComponent(content)}&messageType=${messageType}`);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async markAsRead(conversationId: string): Promise<void> {
    try {
      await apiClient.put(`/api/messaging/conversations/${conversationId}/read`);
    } catch (error) {
      console.error(`Error marking conversation ${conversationId} as read:`, error);
    }
  }

  static async deleteConversation(conversationId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/messaging/conversations/${conversationId}`);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
}
