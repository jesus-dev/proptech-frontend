import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number; // Distancia desde el final para cargar más (en píxeles)
  rootMargin?: string; // Margen del root para el intersection observer
}

interface UseInfiniteScrollReturn<T> {
  data: T[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  reset: () => void;
  setData: (data: T[]) => void;
  appendData: (newData: T[]) => void;
}

export function useInfiniteScroll<T>(
  fetchFunction: (page: number, limit: number) => Promise<{
    data: T[];
    hasMore: boolean;
    totalCount?: number;
  }>,
  limit: number = 20,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  
  const { threshold = 100, rootMargin = '0px' } = options;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction(currentPage, limit);
      
      if (isInitialLoad) {
        setData(result.data);
        setIsInitialLoad(false);
      } else {
        setData(prev => [...prev, ...result.data]);
      }
      
      setHasMore(result.hasMore);
      setCurrentPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, currentPage, limit, loading, hasMore, isInitialLoad]);

  const reset = useCallback(() => {
    setData([]);
    setCurrentPage(0);
    setHasMore(true);
    setError(null);
    setIsInitialLoad(true);
  }, []);

  const appendData = useCallback((newData: T[]) => {
    setData(prev => [...prev, ...newData]);
  }, []);

  // Configurar intersection observer
  useEffect(() => {
    if (!loadingRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(loadingRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, loading, threshold, rootMargin]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isInitialLoad) {
      loadMore();
    }
  }, [isInitialLoad, loadMore]);

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    setData,
    appendData,
  };
}

// Hook específico para notificaciones
export function useInfiniteNotifications(agentId: number, limit: number = 20) {
  const fetchNotifications = useCallback(async (page: number, pageLimit: number) => {
    const response = await fetch(`/api/notifications/agent/${agentId}/paginated?page=${page}&limit=${pageLimit}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar notificaciones');
    }
    
    const result = await response.json();
    
    return {
      data: result.notifications || [],
      hasMore: result.hasMore || false,
      totalCount: result.totalCount || 0,
    };
  }, [agentId]);

  return useInfiniteScroll(fetchNotifications, limit);
}
