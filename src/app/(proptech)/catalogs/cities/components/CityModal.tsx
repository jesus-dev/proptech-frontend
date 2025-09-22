import React, { useState, useEffect } from 'react';
import { City } from '../services/cityService';
import { Country } from '../../countries/services/countryService';

interface CityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; countryId: string; state?: string }) => Promise<boolean>;
  city: City | null;
  countries: Country[];
  loading: boolean;
}

const CityModal: React.FC<CityModalProps> = ({ open, onClose, onSubmit, city, countries, loading }) => {
  const [form, setForm] = useState<{ name: string; countryId: string; state: string }>({ 
    name: '', 
    countryId: '', 
    state: '' 
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (city) {
      setForm({
        name: city.name || '',
        countryId: city.countryId?.toString() || '',
        state: city.state || '',
      });
    } else {
      setForm({ name: '', countryId: '', state: '' });
    }
    setError(null);
  }, [city, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!form.countryId) {
      setError('El país es obligatorio');
      return;
    }
    const success = await onSubmit(form);
    if (success) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">×</button>
        <h2 className="text-xl font-bold mb-4">{city ? 'Editar' : 'Nueva'} Ciudad</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">País *</label>
            <select
              name="countryId"
              value={form.countryId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
              disabled={loading}
            >
              <option value="">Seleccionar país</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado/Provincia</label>
            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CityModal; 