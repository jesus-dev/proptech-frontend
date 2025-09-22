'use client';

import React, { useState, useEffect } from 'react';
import { Comment, commentService } from '@/services/commentService';
import { CommentItem } from './CommentItem';
import { useAuth } from '@/hooks/useAuth';
import { MessageCircle, Send, User } from 'lucide-react';

interface CommentListProps {
  postId: number;
  onCommentCountChange?: (count: number) => void;
}

export const CommentList: React.FC<CommentListProps> = ({ 
  postId, 
  onCommentCountChange 
}) => {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [autoShowComments, setAutoShowComments] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  // Mostrar comentarios automáticamente si existen
  useEffect(() => {
    if (comments.length > 0 && !autoShowComments) {
      setAutoShowComments(true);
    }
  }, [comments.length, autoShowComments]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 DEBUG: Cargando comentarios para postId:', postId, 'userId:', user?.id);
      
      const fetchedComments = await commentService.getTopLevelCommentsByPostId(
        postId, 
        user?.id
      );
      
      console.log('✅ DEBUG: Comentarios cargados:', fetchedComments);
      setComments(fetchedComments);
      
      // Notificar cambio en el conteo de comentarios
      if (onCommentCountChange) {
        const totalCount = fetchedComments.reduce((total, comment) => {
          return total + 1 + (comment.replies?.length || 0);
        }, 0);
        console.log('📊 DEBUG: Total de comentarios:', totalCount);
        onCommentCountChange(totalCount);
      }
    } catch (error) {
      console.error('❌ Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      alert('Debes iniciar sesión para comentar');
      return;
    }

    if (!newComment.trim()) {
      alert('El comentario no puede estar vacío');
      return;
    }

    console.log('🔍 DEBUG: Creando comentario:', {
      content: newComment.trim(),
      postId,
      userId: user.id,
      userName: user.fullName
    });

    setIsSubmitting(true);
    try {
      const createdComment = await commentService.createComment(
        {
          content: newComment.trim(),
          postId
        },
        user.id,
        user.fullName
      );

      console.log('✅ DEBUG: Comentario creado:', createdComment);

      if (createdComment) {
        setNewComment('');
        setShowCommentForm(false);
        
        // Agregar el nuevo comentario al estado local (evitando duplicados)
        setComments(prevComments => {
          // Verificar si el comentario ya existe para evitar duplicados
          const commentExists = prevComments.some(c => c.id === createdComment.id);
          
          if (commentExists) {
            return prevComments;
          }
          
          return [createdComment, ...prevComments];
        });
        
        // Notificar cambio en el conteo
        if (onCommentCountChange) {
          const newCount = comments.length + 1;
          onCommentCountChange(newCount);
        }
        
        // Limpiar el formulario y cerrar
        setShowCommentForm(false);
      }
    } catch (error) {
      console.error('❌ Error creating comment:', error);
      alert('Error al crear el comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentAdded = () => {
    // No recargar comentarios aquí porque ya se agregó en handleSubmitComment
    // Solo actualizar el contador si es necesario
    if (onCommentCountChange) {
      onCommentCountChange(comments.length);
    }
  };

  const handleCommentUpdated = () => {
    // Recargar comentarios solo si se actualizó uno existente
    loadComments();
  };

  const handleCommentDeleted = () => {
    // Recargar comentarios solo si se eliminó uno
    loadComments();
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Cargando comentarios</h3>
          <p className="text-gray-500">Preparando la conversación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-t border-gray-100">
      {/* Header minimalista */}
      <div className="flex items-center justify-between py-4 px-6">
        <div className="flex items-center space-x-3">
          <span className="text-lg font-medium text-gray-900">
            {comments.length} comentario{comments.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {isAuthenticated && (
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              showCommentForm 
                ? 'bg-gray-100 text-gray-700' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            {showCommentForm ? 'Cancelar' : 'Comentar'}
          </button>
        )}
      </div>

      {/* Formulario minimalista */}
      {showCommentForm && isAuthenticated && (
        <div className="border-t border-gray-100 px-6 py-4">

              <form onSubmit={handleSubmitComment} className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-400"
                  rows={3}
                  placeholder="Escribe un comentario..."
                  maxLength={1000}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {newComment.length}/1000
                  </span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCommentForm(false);
                        setNewComment('');
                      }}
                      className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm font-medium"
                    >
                      {isSubmitting ? 'Enviando...' : 'Comentar'}
                    </button>
                  </div>
                </div>
              </form>
        </div>
      )}

      {/* Estado vacío minimalista */}
      {comments.length === 0 ? (
        <div className="text-center py-8 px-6">
          <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">
            {!isAuthenticated ? 'Inicia sesión para comentar' : 'Sé el primero en comentar'}
          </p>
        </div>
      ) : autoShowComments ? (
        <div className="space-y-3 px-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onCommentAdded={handleCommentAdded}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 px-6">
          <button
            onClick={() => setAutoShowComments(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Ver {comments.length} comentario{comments.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Mensaje minimalista para usuarios no autenticados */}
      {!isAuthenticated && comments.length > 0 && (
        <div className="text-center py-4 px-6 border-t border-gray-100">
          <p className="text-gray-500 text-sm">
            Inicia sesión para comentar
          </p>
        </div>
      )}
    </div>
  );
};
