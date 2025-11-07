'use client';

import React, { useState, useEffect } from 'react';
import { Comment } from '@/services/commentService';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
// Función simple para formatear fechas
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'hace un momento';
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minuto${Math.floor(diffInSeconds / 60) !== 1 ? 's' : ''}`;
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} hora${Math.floor(diffInSeconds / 3600) !== 1 ? 's' : ''}`;
  if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} día${Math.floor(diffInSeconds / 86400) !== 1 ? 's' : ''}`;
  if (diffInSeconds < 31536000) return `hace ${Math.floor(diffInSeconds / 2592000)} mes${Math.floor(diffInSeconds / 2592000) !== 1 ? 'es' : ''}`;
  return `hace ${Math.floor(diffInSeconds / 31536000)} año${Math.floor(diffInSeconds / 31536000) !== 1 ? 's' : ''}`;
};
import { 
  Heart, 
  MessageCircle, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Reply,
  User
} from 'lucide-react';

interface CommentItemProps {
  comment: Comment;
  postId: number;
  onCommentAdded: () => void;
  onCommentUpdated: () => void;
  onCommentDeleted: () => void;
  level?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted,
  level = 0
}) => {
  const { isAuthenticated, user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(level === 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.comment-menu')) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const isAuthor = isAuthenticated && user?.id === comment.authorId;
  const maxLevel = 3; // Máximo 3 niveles de anidación

  const handleReply = async () => {
    if (!isAuthenticated || !user) {
      alert('Debes iniciar sesión para comentar');
      return;
    }

    if (!replyContent.trim()) {
      alert('El comentario no puede estar vacío');
      return;
    }

    setIsSubmitting(true);
    try {
      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
      await apiClient.post(`/api/comments?userId=${user.id}&userName=${encodeURIComponent(userName)}`, {
        content: replyContent.trim(),
        postId,
        parentCommentId: comment.id
      });
      
      setReplyContent('');
      setIsReplying(false);
      onCommentAdded();
    } catch (error) {
      console.error('Error creating reply:', error);
      alert('Error al crear el comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      alert('El comentario no puede estar vacío');
      return;
    }

    if (!user) {
      alert('Debes iniciar sesión para editar comentarios');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.put(`/api/comments/${comment.id}?content=${encodeURIComponent(editContent.trim())}&userId=${user.id}`);
      
      setIsEditing(false);
      onCommentUpdated();
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Error al actualizar el comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    if (!user) {
      alert('Debes iniciar sesión para eliminar comentarios');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.delete(`/api/comments/${comment.id}?userId=${user.id}`);
      onCommentDeleted();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error al eliminar el comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || !user) {
      alert('Debes iniciar sesión para dar like');
      return;
    }

    try {
      if (comment.isLikedByCurrentUser) {
        await apiClient.delete(`/api/comments/${comment.id}/like?userId=${user.id}`);
      } else {
        await apiClient.post(`/api/comments/${comment.id}/like?userId=${user.id}`);
      }
      onCommentUpdated();
    } catch (error) {
      console.error('Error processing like:', error);
      alert('Error al procesar el like');
    }
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const canReply = level < maxLevel;

  return (
    <div className={`border-l-2 border-gray-200 pl-4 ${level > 0 ? 'ml-4' : ''}`}>
      <div className="bg-white rounded-lg p-4 mb-3 shadow-sm border">
        {/* Header del comentario */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {comment.authorAvatar ? (
                <img 
                  src={comment.authorAvatar} 
                  alt={comment.authorName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{comment.authorName}</div>
              <div className="text-sm text-gray-500">
                {formatTimeAgo(comment.createdAt)}
              </div>
            </div>
          </div>
          
          {isAuthor && (
            <div className="relative comment-menu">
              <button 
                onClick={() => setShowMenu(prev => !prev)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contenido del comentario */}
        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Escribe tu comentario..."
            />
            <div className="flex space-x-2 mt-2">
              <button
                onClick={handleEdit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-800 mb-3">
            {comment.content}
          </div>
        )}

        {/* Acciones del comentario */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={!isAuthenticated}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                comment.isLikedByCurrentUser
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className={`w-4 h-4 ${comment.isLikedByCurrentUser ? 'fill-current' : ''}`} />
              <span className="text-sm">{comment.likesCount}</span>
            </button>

            {canReply && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                disabled={!isAuthenticated}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                  isReplying
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Reply className="w-4 h-4" />
                <span className="text-sm">Responder</span>
              </button>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={toggleReplies}
                className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">
                  {showReplies ? 'Ocultar' : 'Mostrar'} {comment.replies.length} respuesta{comment.replies.length !== 1 ? 's' : ''}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Formulario de respuesta */}
        {isReplying && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder={`Responde a ${comment.authorName}...`}
            />
            <div className="flex space-x-2 mt-2">
              <button
                onClick={handleReply}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : 'Responder'}
              </button>
              <button
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Respuestas anidadas */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onCommentAdded={onCommentAdded}
              onCommentUpdated={onCommentUpdated}
              onCommentDeleted={onCommentDeleted}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
