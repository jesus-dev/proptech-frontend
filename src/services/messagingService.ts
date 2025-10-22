import { config } from '@/config/environment';

const API_BASE_URL = config.API_BASE_URL;

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
  // Obtener conversaciones del usuario actual SIEMPRE desde BD
  static async getConversations(): Promise<Conversation[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No autenticado');
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/api/messaging/conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('⚠️ No autenticado, devolviendo lista vacía');
          return [];
        }
        throw new Error(`Error al obtener conversaciones: ${response.status}`);
      }

      const conversations = await response.json();
      console.log(`✅ ${conversations.length} conversaciones obtenidas desde BD`);
      return conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  // Obtener mensajes de una conversación SIEMPRE desde BD
  static async getMessages(conversationId: string, page: number = 0, size: number = 50): Promise<Message[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No autenticado');
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/api/messaging/conversations/${conversationId}/messages?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`Error al obtener mensajes: ${response.status}`);
      }

      const messages = await response.json();
      console.log(`✅ ${messages.length} mensajes obtenidos de conversación ${conversationId}`);
      return messages;
    } catch (error) {
      console.error(`Error fetching messages for conversation ${conversationId}:`, error);
      return [];
    }
  }

  // Enviar un mensaje
  static async sendMessage(receiverId: number, content: string, messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'): Promise<Message | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${API_BASE_URL}/api/messaging/send?receiverId=${receiverId}&content=${encodeURIComponent(content)}&messageType=${messageType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`Error al enviar mensaje: ${response.status}`);
      }

      const message = await response.json();
      console.log('✅ Mensaje enviado correctamente');
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Marcar conversación como leída
  static async markAsRead(conversationId: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/messaging/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        console.log(`✅ Conversación ${conversationId} marcada como leída`);
      }
    } catch (error) {
      console.error(`Error marking conversation ${conversationId} as read:`, error);
    }
  }

  // Eliminar conversación
  static async deleteConversation(conversationId: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${API_BASE_URL}/api/messaging/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar conversación: ${response.status}`);
      }

      console.log(`✅ Conversación ${conversationId} eliminada`);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
}

