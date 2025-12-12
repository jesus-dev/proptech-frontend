"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Eye,
  User,
  Calendar,
  Loader2,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

interface Comment {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  authorAvatar?: string;
  postId: number;
  parentCommentId?: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  moderatedBy?: number;
  moderatedAt?: string;
}

export default function CommentsModerationPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [moderating, setModerating] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      loadComments();
    }
  }, [filterStatus, isAuthenticated, isLoading, user]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/comments/pending');
      setComments(response.data || []);
    } catch (error: any) {
      logger.error('Error cargando comentarios pendientes', error);
      
      const status = error?.response?.status;
      const errorMessage = error?.response?.data?.error || error?.message || 'Error desconocido';
      
      // Manejar diferentes tipos de errores sin cerrar sesión
      if (status === 404) {
        toast.error('El endpoint de moderación no está disponible');
        setComments([]);
      } else if (status === 403) {
        toast.error('No tienes permisos para moderar comentarios');
        setComments([]);
      } else if (status === 401) {
        // 401 - Sesión expirada (el interceptor ya maneja esto)
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente');
      } else if (status === 500) {
        // Error del servidor - puede ser que falten las columnas en la BD
        toast.error('Error del servidor. Verifica que la base de datos tenga las columnas de moderación.');
        logger.error('Error 500 al cargar comentarios:', errorMessage);
        setComments([]);
      } else {
        toast.error(`Error al cargar comentarios: ${errorMessage}`);
        setComments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (commentId: number) => {
    if (!user?.id) {
      toast.error('Debes estar autenticado para moderar');
      return;
    }

    try {
      setModerating(commentId);
      await apiClient.post(`/api/comments/${commentId}/approve?moderatorId=${user.id}`);
      toast.success('Comentario aprobado');
      await loadComments();
    } catch (error) {
      logger.error('Error aprobando comentario', error);
      toast.error('Error al aprobar comentario');
    } finally {
      setModerating(null);
    }
  };

  const handleReject = async (commentId: number) => {
    if (!user?.id) {
      toast.error('Debes estar autenticado para moderar');
      return;
    }

    try {
      setModerating(commentId);
      await apiClient.post(`/api/comments/${commentId}/reject?moderatorId=${user.id}`);
      toast.success('Comentario rechazado');
      await loadComments();
    } catch (error) {
      logger.error('Error rechazando comentario', error);
      toast.error('Error al rechazar comentario');
    } finally {
      setModerating(null);
    }
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = searchTerm === '' || 
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || comment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rechazado</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-cyan-600" />
          Moderación de Comentarios
        </h1>
        <p className="text-gray-600">
          Revisa y aprueba comentarios de propiedades antes de que sean visibles públicamente
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por contenido o autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'ALL' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('ALL')}
              size="sm"
            >
              Todos
            </Button>
            <Button
              variant={filterStatus === 'PENDING' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('PENDING')}
              size="sm"
              className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
            >
              Pendientes
            </Button>
            <Button
              variant={filterStatus === 'APPROVED' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('APPROVED')}
              size="sm"
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              Aprobados
            </Button>
            <Button
              variant={filterStatus === 'REJECTED' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('REJECTED')}
              size="sm"
              className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
            >
              Rechazados
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
          <span className="ml-3 text-gray-600">Verificando autenticación...</span>
        </div>
      ) : !isAuthenticated ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Acceso Restringido
          </h3>
          <p className="text-gray-600 mb-4">
            Debes iniciar sesión para moderar comentarios.
          </p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay comentarios {filterStatus !== 'ALL' ? filterStatus.toLowerCase() : ''}
          </h3>
          <p className="text-gray-600">
            {filterStatus === 'PENDING' 
              ? 'Todos los comentarios han sido moderados'
              : 'No se encontraron comentarios con los filtros seleccionados'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    {comment.authorAvatar ? (
                      <img
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5 text-cyan-600" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">{comment.authorName}</span>
                      {getStatusBadge(comment.status)}
                    </div>
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(comment.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        Propiedad #{comment.postId}
                      </div>
                      {comment.likesCount > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {comment.likesCount} likes
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {comment.status === 'PENDING' && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleApprove(comment.id)}
                      disabled={moderating === comment.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      {moderating === comment.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprobar
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleReject(comment.id)}
                      disabled={moderating === comment.id}
                      variant="destructive"
                      size="sm"
                    >
                      {moderating === comment.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Rechazar
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-2xl font-bold text-gray-900">{comments.length}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm p-4 border border-yellow-200">
          <div className="text-sm text-yellow-700 mb-1">Pendientes</div>
          <div className="text-2xl font-bold text-yellow-900">
            {comments.filter(c => c.status === 'PENDING').length}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-4 border border-green-200">
          <div className="text-sm text-green-700 mb-1">Aprobados</div>
          <div className="text-2xl font-bold text-green-900">
            {comments.filter(c => c.status === 'APPROVED').length}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm p-4 border border-red-200">
          <div className="text-sm text-red-700 mb-1">Rechazados</div>
          <div className="text-2xl font-bold text-red-900">
            {comments.filter(c => c.status === 'REJECTED').length}
          </div>
        </div>
      </div>
    </div>
  );
}

