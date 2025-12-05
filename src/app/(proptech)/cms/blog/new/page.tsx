"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BlogPostForm from '../components/BlogPostForm';
import { getEndpoint } from '@/lib/api-config';

export default function NewBlogPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getEndpoint('/api/cms/blog-posts'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/cms/blog');
      } else {
        setError('Error al crear el post');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Post de Blog</h2>
        <p className="text-gray-600 dark:text-gray-400">Crea un nuevo artículo para tu blog</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <BlogPostForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/cms/blog')}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

