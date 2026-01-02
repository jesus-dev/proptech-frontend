'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PropShot, PropShotService } from '@/services/propShotService';
import PropShotReelViewer from '@/components/social/PropShotReelViewer';
import { useAuth } from '@/hooks/useAuth';
import Head from 'next/head';
import { getEndpoint } from '@/lib/api-config';

/**
 * Página para ver PropShots en formato reel - FULLSCREEN
 * URL: /propshots/[id]
 * Esta página NO usa el layout de social para tener control total de la pantalla
 */
export default function PropShotReelPage() {
  const params = useParams();
  const propShotId = params?.id ? parseInt(params.id as string) : null;
  const { isAuthenticated } = useAuth();
  
  const [propShots, setPropShots] = useState<PropShot[]>([]);
  const [currentPropShot, setCurrentPropShot] = useState<PropShot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar todos los PropShots
        const allPropShots = await PropShotService.getPropShots();
        setPropShots(allPropShots);
        
        // Encontrar el PropShot actual
        if (propShotId) {
          const found = allPropShots.find(shot => shot.id === propShotId);
          if (found) {
            setCurrentPropShot(found);
          } else {
            setError('PropShot no encontrado');
          }
        } else {
          // Si no hay ID, usar el primero
          if (allPropShots.length > 0) {
            setCurrentPropShot(allPropShots[0]);
          } else {
            setError('No hay PropShots disponibles');
          }
        }
      } catch (err) {
        console.error('Error loading PropShots:', err);
        setError('Error al cargar los PropShots');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [propShotId]);

  // Función para obtener URL completa - usando la misma solución del CRM
  const getFullUrl = (url: string): string => {
    if (!url) return '';
    
    // Si ya es una URL completa, retornarla
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    
    // Si es una URL relativa del backend (como /uploads/social/propshots/...), usar getEndpoint
    if (url.startsWith('/uploads/')) {
      return getEndpoint(url);
    }
    
    // Si es una URL de API, usar getEndpoint
    if (url.startsWith('/api/')) {
      return getEndpoint(url);
    }
    
    // Si solo es el nombre del archivo (sin ruta), agregar la ruta completa
    if (!url.startsWith('/') && !url.includes('/')) {
      return getEndpoint(`/uploads/social/propshots/${url}`);
    }
    
    // Para cualquier otra ruta relativa, usar getEndpoint
    return getEndpoint(url.startsWith('/') ? url : `/${url}`);
  };

  // Función para dar like
  const handleLike = async (id: number) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para dar like');
      return;
    }
    
    try {
      await PropShotService.likePropShot(id);
      
      // Actualizar el PropShot en la lista
      setPropShots(prev => prev.map(shot =>
        shot.id === id
          ? { ...shot, likes: shot.likes + 1 }
          : shot
      ));
      
      // Actualizar el PropShot actual si es el mismo
      if (currentPropShot?.id === id) {
        setCurrentPropShot(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
    } catch (error) {
      console.error('Error liking PropShot:', error);
    }
  };

  // Función para registrar vista
  const handleView = async (id: number) => {
    try {
      await PropShotService.incrementViews(id);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  // Optimizaciones para móvil
  useEffect(() => {
    // Prevenir comportamientos no deseados en móvil
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center touch-none">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Cargando PropShot...</p>
        </div>
      </div>
    );
  }

  if (error || !currentPropShot) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white max-w-md px-4">
          <h2 className="text-2xl font-bold mb-4">😕 Oops!</h2>
          <p className="text-gray-300 mb-6">{error || 'PropShot no encontrado'}</p>
          <a 
            href="/aureo/propshots"
            className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium transition-colors"
          >
            Volver a PropShots
          </a>
        </div>
      </div>
    );
  }

  return (
    <PropShotReelViewer
      initialPropShot={currentPropShot}
      allPropShots={propShots}
      onLike={handleLike}
      onView={handleView}
      getFullUrl={getFullUrl}
    />
  );
}

