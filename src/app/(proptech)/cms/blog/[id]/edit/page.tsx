"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BlogPostForm from '../../components/BlogPostForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getEndpoint } from '@/lib/api-config';

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
      const token = localStorage.getItem('token');
      const response = await fetch(getEndpoint(`/api/cms/blog-posts/${postId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        setError('Post no encontrado');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      setError('Error al cargar el post');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getEndpoint(`/api/cms/blog-posts/${postId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/cms/blog');
      } else {
        // Intentar obtener el mensaje de error del backend
        let errorMessage = 'Error al actualizar el post';
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch (e) {
          // Si no se puede parsear el error, usar el status text
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        setError(errorMessage);
        console.error('Error updating post:', response.status, errorMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Por favor, verifica tu conexión a internet.');
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

