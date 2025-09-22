import React from 'react';
import { City } from '../services/cityService';
import { Country } from '../../countries/services/countryService';

interface CityTableProps {
  cities: City[];
  countries: Country[];
  onEdit: (city: City) => void;
  onDelete: (city: City) => void;
  loading: boolean;
}

const CityTable: React.FC<CityTableProps> = ({ cities, countries, onEdit, onDelete, loading }) => {
  const getCountryName = (countryId?: number) => {
    if (!countryId) return "Sin país";
    const country = countries.find(c => c.id === countryId);
    return country ? country.name : "País no encontrado";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">Nombre</th>
            <th className="px-4 py-2 border-b">País</th>
            <th className="px-4 py-2 border-b">Estado</th>
            <th className="px-4 py-2 border-b text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4} className="text-center py-6">Cargando...</td></tr>
          ) : cities.length === 0 ? (
            <tr><td colSpan={4} className="text-center py-6 text-gray-400">No hay ciudades</td></tr>
          ) : (
            cities.map((city) => (
              <tr key={city.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{city.name}</td>
                <td className="px-4 py-2 border-b">{getCountryName(city.countryId)}</td>
                <td className="px-4 py-2 border-b">{city.state || "-"}</td>
                <td className="px-4 py-2 border-b text-center">
                  <button onClick={() => onEdit(city)} className="text-blue-600 hover:underline mr-4">Editar</button>
                  <button onClick={() => onDelete(city)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CityTable; 