"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSector } from '@/context/SectorContext';
import { Post, SocialService } from '@/services/socialService';

export const useSectorPosts = () => {
  const { currentSector, currentAgency } = useSector();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los posts
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allPosts = await SocialService.getPosts(0, 50);
      setPosts(allPosts);
      
    } catch (err) {
      setError('Error al cargar los posts');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrar posts por sector/agencia
  const filterPostsBySector = useCallback(() => {
    if (!currentSector) {
      setFilteredPosts(posts);
      return;
    }

    // Por ahora, simulamos filtrado por sector
    // En producción, esto vendría del backend con filtros reales
    let filtered = posts;

    // Filtrar por sector (simulado)
    if (currentSector.id === 1) { // Residencial
      filtered = posts.filter(post => 
        post.content?.toLowerCase().includes('casa') ||
        post.content?.toLowerCase().includes('apartamento') ||
        post.content?.toLowerCase().includes('residencial') ||
        post.content?.toLowerCase().includes('hogar')
      );
    } else if (currentSector.id === 2) { // Comercial
      filtered = posts.filter(post => 
        post.content?.toLowerCase().includes('comercial') ||
        post.content?.toLowerCase().includes('negocio') ||
        post.content?.toLowerCase().includes('oficina') ||
        post.content?.toLowerCase().includes('local')
      );
    } else if (currentSector.id === 3) { // Industrial
      filtered = posts.filter(post => 
        post.content?.toLowerCase().includes('industrial') ||
        post.content?.toLowerCase().includes('fabrica') ||
        post.content?.toLowerCase().includes('almacen') ||
        post.content?.toLowerCase().includes('bodega')
      );
    } else if (currentSector.id === 4) { // Terrenos
      filtered = posts.filter(post => 
        post.content?.toLowerCase().includes('terreno') ||
        post.content?.toLowerCase().includes('lote') ||
        post.content?.toLowerCase().includes('parcela') ||
        post.content?.toLowerCase().includes('suelo')
      );
    }

    // Si no hay posts filtrados, mostrar todos
    if (filtered.length === 0) {
      filtered = posts;
    }

    setFilteredPosts(filtered);
  }, [posts, currentSector]);

  // Cargar posts iniciales
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Filtrar posts cuando cambie el sector
  useEffect(() => {
    filterPostsBySector();
  }, [filterPostsBySector]);

  // Refrescar posts
  const refreshPosts = useCallback(async () => {
    await loadPosts();
  }, [loadPosts]);

  return {
    posts: filteredPosts,
    allPosts: posts,
    loading,
    error,
    currentSector,
    currentAgency,
    refreshPosts,
    loadPosts,
  };
};

