import { useState, useEffect } from 'react';
import { Department, DepartmentFormData } from '../types';
import { 
  getAllDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment 
} from '../services/departmentService';

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar departamentos');
    } finally {
      setLoading(false);
    }
  };

  const createNewDepartment = async (departmentData: DepartmentFormData) => {
    try {
      setError(null);
      const newDepartment = await createDepartment(departmentData);
      setDepartments(prev => [...prev, newDepartment]);
      return newDepartment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear departamento');
      throw err;
    }
  };

  const updateExistingDepartment = async (id: number, departmentData: Partial<DepartmentFormData>) => {
    try {
      setError(null);
      const updatedDepartment = await updateDepartment(id, departmentData);
      setDepartments(prev => prev.map(dept => dept.id === id ? updatedDepartment : dept));
      return updatedDepartment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar departamento');
      throw err;
    }
  };

  const deleteExistingDepartment = async (id: number) => {
    try {
      setError(null);
      await deleteDepartment(id);
      setDepartments(prev => prev.filter(dept => dept.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar departamento');
      throw err;
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  return {
    departments,
    loading,
    error,
    createNewDepartment,
    updateExistingDepartment,
    deleteExistingDepartment,
    setError,
    loadDepartments,
  };
};
