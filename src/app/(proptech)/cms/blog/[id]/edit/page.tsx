"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BlogPostForm from '../../components/BlogPostForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { apiClient } from '@/lib/api';

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;
  
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      const response = await apiClient.get(`/api/cms/blog-posts/${postId}`);
      setPost(response.data);
    } catch (error: any) {
      console.error('Error loading post:', error);
      // 401 es manejado automáticamente por el interceptor de apiClient
      if (error?.response?.status === 404) {
        setError('Post no encontrado');
      } else if (error?.response?.status !== 401) {
        setError('Error al cargar el post');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.put(`/api/cms/blog-posts/${postId}`, formData);
      router.push('/cms/blog');
    } catch (error: any) {
      console.error('Error:', error);
      // 401 es manejado automáticamente por el interceptor de apiClient
      if (error?.response?.status !== 401) {
        const errorMessage = error?.response?.data?.error || 
                            error?.response?.data || 
                            error?.message || 
                            'Error al actualizar el post';
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Post de Blog</h2>
        <p className="text-gray-600 dark:text-gray-400">Modifica el contenido de tu artículo</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <BlogPostForm
        initialData={post}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/cms/blog')}
        isSubmitting={isSubmitting}
        isEditing={true}
      />
    </div>
  );
}

