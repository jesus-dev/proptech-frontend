import { Department, DepartmentFormData, DepartmentStats } from '../types';
import { apiClient } from '@/lib/api';

// Get all departments
export const getAllDepartments = async (): Promise<Department[]> => {
  try {
    const res = await apiClient.get('/api/departments');
    return res.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw new Error('Error al obtener departamentos');
  }
};

// Get department by ID
export const getDepartmentById = async (id: number): Promise<Department | null> => {
  try {
    const res = await apiClient.get(`/api/departments/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching department:', error);
    return null;
  }
};

// Create new department
export const createDepartment = async (data: DepartmentFormData): Promise<Department> => {
  try {
    const res = await apiClient.post('/api/departments', data);
    return res.data;
  } catch (error) {
    console.error('Error creating department:', error);
    throw new Error('Error al crear departamento');
  }
};

// Update department
export const updateDepartment = async (id: number, data: Partial<DepartmentFormData>): Promise<Department> => {
  try {
    const res = await apiClient.put(`/api/departments/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('Error updating department:', error);
    throw new Error('Error al actualizar departamento');
  }
};

// Delete department
export const deleteDepartment = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/departments/${id}`);
  } catch (error) {
    console.error('Error deleting department:', error);
    throw new Error('Error al eliminar departamento');
  }
};

// Get active departments only
export const getActiveDepartments = async (): Promise<Department[]> => {
  try {
    const departments = await getAllDepartments();
    return departments.filter(department => department.active);
  } catch (error) {
    console.error('Error getting active departments:', error);
    return [];
  }
};

// Search departments
export const searchDepartments = async (searchTerm: string): Promise<Department[]> => {
  try {
    const departments = await getAllDepartments();
    const term = searchTerm.toLowerCase();
    
    return departments.filter(department => 
      department.name.toLowerCase().includes(term) ||
      (department.countryName && department.countryName.toLowerCase().includes(term))
    );
  } catch (error) {
    console.error('Error searching departments:', error);
    return [];
  }
};

// Get department statistics
export const getDepartmentStats = async (): Promise<DepartmentStats> => {
  try {
    const departments = await getAllDepartments();
    const active = departments.filter(department => department.active).length;
    
    return {
      total: departments.length,
      active,
      inactive: departments.length - active,
    };
  } catch (error) {
    console.error('Error getting department stats:', error);
    return { total: 0, active: 0, inactive: 0 };
  }
};

// Get departments by country
export const getDepartmentsByCountry = async (countryId: number): Promise<Department[]> => {
  try {
    const departments = await getAllDepartments();
    return departments.filter(department => department.countryId === countryId);
  } catch (error) {
    console.error('Error getting departments by country:', error);
    return [];
  }
};