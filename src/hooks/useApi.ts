import { useState, useCallback } from 'react';
import { ApiResponse, handleApiError } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (apiCall: () => Promise<ApiResponse<T>>) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

export function useApi<T = any>(): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<T>>): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setState(prev => ({ ...prev, data: response.data!, loading: false }));
        return response.data;
      } else {
        const errorMessage = (response as any).error || 'Error en la operación';
        setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        return null;
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

// Hook específico para operaciones CRUD
export function useCrudApi<T = any>() {
  const api = useApi<T>();

  const create = useCallback(async (createCall: () => Promise<ApiResponse<T>>) => {
    const result = await api.execute(createCall);
    if (result) {
      api.setData(result);
    }
    return result;
  }, [api]);

  const update = useCallback(async (updateCall: () => Promise<ApiResponse<T>>) => {
    const result = await api.execute(updateCall);
    if (result) {
      api.setData(result);
    }
    return result;
  }, [api]);

  const remove = useCallback(async (deleteCall: () => Promise<ApiResponse<T>>) => {
    const result = await api.execute(deleteCall);
    if (result) {
      api.setData(null);
    }
    return result;
  }, [api]);

  return {
    ...api,
    create,
    update,
    remove,
  };
}

// Hook para listas paginadas
export function usePaginatedApi<T = any>() {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<any>>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        const { content, ...paginationData } = response.data;
        setData(content);
        setPagination(paginationData);
        return response.data;
      } else {
        const errorMessage = (response as any).error || 'Error al cargar los datos';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData([]);
    setPagination({
      page: 0,
      size: 12,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });
    setLoading(false);
    setError(null);
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setSize = useCallback((size: number) => {
    setPagination(prev => ({ ...prev, size, page: 0 }));
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    execute,
    reset,
    setPage,
    setSize,
  };
} 