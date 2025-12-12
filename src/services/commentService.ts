import { apiClient } from '@/lib/api';

export interface Comment {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  authorAvatar?: string;
  postId: number;
  parentCommentId?: number;
  replies?: Comment[];
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  isLikedByCurrentUser?: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  moderatedBy?: number;
  moderatedAt?: string;
}

export interface CreateCommentRequest {
  content: string;
  postId: number;
  parentCommentId?: number;
}

export interface CommentResponse {
  message: string;
}

class CommentService {
  // Obtener comentarios de un post
  async getCommentsByPostId(postId: number, userId?: number): Promise<Comment[]> {
    try {
      const params = userId ? `?userId=${userId}` : '';
      const response = await apiClient.get(`/api/comments/post/${postId}${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  // Obtener comentarios principales de un post
  async getTopLevelCommentsByPostId(postId: number, userId?: number): Promise<Comment[]> {
    try {
      const params = userId ? `?userId=${userId}` : '';
      const response = await apiClient.get(`/api/comments/post/${postId}/top-level${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top level comments:', error);
      return [];
    }
  }

  // Obtener respuestas de un comentario
  async getRepliesByCommentId(commentId: number, userId?: number): Promise<Comment[]> {
    try {
      const params = userId ? `?userId=${userId}` : '';
      const response = await apiClient.get(`/api/comments/${commentId}/replies${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching replies:', error);
      return [];
    }
  }

  // Crear un nuevo comentario
  async createComment(request: CreateCommentRequest, userId: number, userName: string): Promise<Comment | null> {
    try {
      const response = await apiClient.post(`/api/comments?userId=${userId}&userName=${encodeURIComponent(userName)}`, request);
      return response.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      return null;
    }
  }

  // Dar like a un comentario
  async likeComment(commentId: number, userId: number): Promise<boolean> {
    try {
      await apiClient.post(`/api/comments/${commentId}/like?userId=${userId}`);
      return true;
    } catch (error) {
      console.error('Error liking comment:', error);
      return false;
    }
  }

  // Quitar like de un comentario
  async unlikeComment(commentId: number, userId: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/comments/${commentId}/like?userId=${userId}`);
      return true;
    } catch (error) {
      console.error('Error unliking comment:', error);
      return false;
    }
  }

  // Actualizar comentario
  async updateComment(commentId: number, content: string, userId: number): Promise<Comment | null> {
    try {
      const response = await apiClient.put(`/api/comments/${commentId}?content=${encodeURIComponent(content)}&userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      return null;
    }
  }

  // Eliminar comentario
  async deleteComment(commentId: number, userId: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/comments/${commentId}?userId=${userId}`);
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }

  // Obtener comentarios recientes
  async getRecentComments(limit: number = 10, userId?: number): Promise<Comment[]> {
    try {
      const params = userId ? `?limit=${limit}&userId=${userId}` : `?limit=${limit}`;
      const response = await apiClient.get(`/api/comments/recent${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent comments:', error);
      return [];
    }
  }

  // Contar comentarios de un post
  async getCommentCountByPostId(postId: number): Promise<number> {
    try {
      const response = await apiClient.get(`/api/comments/post/${postId}/count`);
      return response.data.count || 0;
    } catch (error) {
      console.error('Error fetching comment count:', error);
      return 0;
    }
  }
}

export const commentService = new CommentService();
