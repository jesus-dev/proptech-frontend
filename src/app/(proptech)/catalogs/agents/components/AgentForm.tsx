"use client";

import React from 'react';
import { AgentFormData } from '../types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { paraguayUtils } from '@/lib/paraguay-config';

interface AgentFormProps {
  formData: AgentFormData;
  setFormData: (data: AgentFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
  agencies: Array<{id: string, name: string, active: boolean}>;
}

export default function AgentForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing = false,
  isLoading = false,
  agencies,
}: AgentFormProps) {
  const handleInputChange = (field: keyof AgentFormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePhoneChange = (value: string) => {
    const formattedPhone = paraguayUtils.formatPhone(value);
    handleInputChange('phone', formattedPhone);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            name="firstName"
            required
            value={formData.firstName ?? ''}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Nombre del agente"
          />
        </div>

        {/* Apellido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Apellido *
          </label>
          <input
            type="text"
            name="lastName"
            required
            value={formData.lastName ?? ''}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Apellido del agente"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email ?? ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="email@ejemplo.com"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Teléfono *
          </label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone ?? ''}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="+595 981 123-456"
            pattern="^\+595\s?\d{2,3}\s?\d{3}\s?\d{3}$"
            title="Formato: +595 981 123-456"
          />
          <p className="text-xs text-gray-500 mt-1">Formato paraguayo: +595 981 123-456</p>
        </div>

        {/* Usuario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Usuario *
          </label>
          <input
            type="text"
            name="username"
            required
            value={formData.username ?? ''}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="usuario.agente"
          />
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contraseña {isEditing ? '(dejar vacío para mantener)' : '*'}
          </label>
          <input
            type="password"
            name="password"
            required={!isEditing}
            value={formData.password ?? ''}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder={isEditing ? "••••••••" : "Contraseña"}
          />
        </div>

        {/* Documento de Identidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Documento de Identidad
          </label>
          <input
            type="text"
            name="dni"
            value={formData.dni ?? ''}
            onChange={(e) => handleInputChange('dni', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="12345678"
          />
        </div>

        {/* Licencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Licencia
          </label>
          <input
            type="text"
            name="license"
            value={formData.license ?? ''}
            onChange={(e) => handleInputChange('license', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="AG-001"
          />
        </div>

        {/* Posición */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Posición
          </label>
          <input
            type="text"
            name="position"
            value={formData.position ?? ''}
            onChange={(e) => handleInputChange('position', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Agente Principal"
          />
        </div>

        {/* Agencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Agencia
          </label>
          <select
            name="agencyId"
            value={formData.agencyId ?? ''}
            onChange={(e) => handleInputChange('agencyId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Seleccionar agencia</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name}
              </option>
            ))}
          </select>
        </div>

        {/* Foto URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Foto URL
          </label>
          <input
            type="url"
            name="photo"
            value={formData.photo ?? ''}
            onChange={(e) => handleInputChange('photo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://ejemplo.com/foto.jpg"
          />
        </div>

        {/* Biografía */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Biografía
          </label>
          <textarea
            name="bio"
            rows={3}
            value={formData.bio ?? ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Descripción del agente..."
          />
        </div>

        {/* Estado Activo */}
        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={formData.active ?? true}
              onChange={(e) => handleInputChange('active', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Agente activo
            </span>
          </label>
        </div>

        {/* Estado de Autenticación */}
        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive ?? true}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Puede iniciar sesión
            </span>
          </label>
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rol
          </label>
          <select
            value={formData.role ?? 'agente'}
            onChange={(e) => handleInputChange('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="agente">Agente</option>
            <option value="admin">Administrador</option>
            <option value="supervisor">Supervisor</option>
          </select>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner />
              {isEditing ? 'Actualizando...' : 'Creando...'}
            </div>
          ) : (
            isEditing ? 'Actualizar' : 'Crear'
          )}
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center">
          <LoadingSpinner />
        </div>
      )}
    </form>
  );
} 