import { Department, DepartmentFormData, DepartmentStats } from '../types';
import { getEndpoint } from '@/lib/api-config';

// Get all departments
export const getAllDepartments = async (): Promise<Department[]> => {
  const res = await fetch(getEndpoint('/api/departments'));
  if (!res.ok) throw new Error('Error al obtener departamentos');
  return res.json();
};

// Get department by ID
export const getDepartmentById = async (id: number): Promise<Department | null> => {
  const res = await fetch(getEndpoint(`/api/departments/${id}`));
  if (!res.ok) return null;
  return res.json();
};

// Create new department
export const createDepartment = async (data: DepartmentFormData): Promise<Department> => {
  const res = await fetch(getEndpoint('/api/departments'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear departamento');
  return res.json();
};

// Update department
export const updateDepartment = async (id: number, data: Partial<DepartmentFormData>): Promise<Department> => {
  const res = await fetch(getEndpoint(`/api/departments/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar departamento');
  return res.json();
};

// Delete department
export const deleteDepartment = async (id: number): Promise<void> => {
  const res = await fetch(getEndpoint(`/api/departments/${id}`), { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar departamento');
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
      department.code.toLowerCase().includes(term) ||
      (department.description && department.description.toLowerCase().includes(term)) ||
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

// Initialize sample departments
export const initializeSampleDepartments = async (): Promise<void> => {
  try {
    const departments = await getAllDepartments();
    if (departments.length > 0) return; // Already has data
    
    const sampleDepartments: DepartmentFormData[] = [
      {
        name: "Central",
        code: "CENTRAL",
        countryId: "1", // Paraguay
        description: "Departamento Central de Paraguay",
        active: true,
      },
      {
        name: "Alto Paraná",
        code: "ALTO_PARANA",
        countryId: "1",
        description: "Departamento Alto Paraná de Paraguay",
        active: true,
      },
      {
        name: "Itapúa",
        code: "ITAPUA",
        countryId: "1",
        description: "Departamento Itapúa de Paraguay",
        active: true,
      },
      {
        name: "Caaguazú",
        code: "CAAGUAZU",
        countryId: "1",
        description: "Departamento Caaguazú de Paraguay",
        active: true,
      },
      {
        name: "San Pedro",
        code: "SAN_PEDRO",
        countryId: "1",
        description: "Departamento San Pedro de Paraguay",
        active: false,
      },
    ];
    
    for (const departmentData of sampleDepartments) {
      await createDepartment(departmentData);
    }
  } catch (error) {
    console.error('Error initializing sample departments:', error);
    throw new Error('Failed to initialize sample departments');
  }
};

// Clear all departments (for testing purposes)
export const clearAllDepartments = async (): Promise<void> => {
  try {
    const departments = await getAllDepartments();
    for (const department of departments) {
      await deleteDepartment(department.id);
    }
  } catch (error) {
    console.error('Error clearing departments:', error);
    throw new Error('Failed to clear departments');
  }
};
