import React from 'react';
import { PropertyType } from '../services/propertyTypeService';

interface PropertyTypeTableProps {
  propertyTypes: PropertyType[];
  onEdit: (propertyType: PropertyType) => void;
  onDelete: (propertyType: PropertyType) => void;
  loading: boolean;
}

const PropertyTypeTable: React.FC<PropertyTypeTableProps> = ({ propertyTypes, onEdit, onDelete, loading }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">Nombre</th>
            <th className="px-4 py-2 border-b">Descripción</th>
            <th className="px-4 py-2 border-b">Activo</th>
            <th className="px-4 py-2 border-b text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4} className="text-center py-6">Cargando...</td></tr>
          ) : propertyTypes.length === 0 ? (
            <tr><td colSpan={4} className="text-center py-6 text-gray-400">No hay tipos de propiedad</td></tr>
          ) : (
            propertyTypes.map((type) => (
              <tr key={type.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{type.name}</td>
                <td className="px-4 py-2 border-b">{type.description}</td>
                <td className="px-4 py-2 border-b text-center">
                  {type.active ? (
                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Sí</span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-700 rounded">No</span>
                  )}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <button onClick={() => onEdit(type)} className="text-blue-600 hover:underline mr-4">Editar</button>
                  <button onClick={() => onDelete(type)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PropertyTypeTable; 