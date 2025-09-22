"use client";

import React from 'react';
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, PhoneIcon, GlobeAltIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { NearbyFacility, FacilityTypeLabels } from '../types';

interface NearbyFacilityTableProps {
  facilities: NearbyFacility[];
  onEdit: (facility: NearbyFacility) => void;
  onDelete: (facility: NearbyFacility) => void;
  onToggleActive: (facility: NearbyFacility) => void;
}

export default function NearbyFacilityTable({
  facilities,
  onEdit,
  onDelete,
  onToggleActive
}: NearbyFacilityTableProps) {
  const getTypeIcon = (type: string) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case 'HOSPITAL':
        return <span className="text-red-500">🏥</span>;
      case 'SCHOOL':
      case 'UNIVERSITY':
        return <span className="text-blue-500">🎓</span>;
      case 'SHOPPING_CENTER':
      case 'SUPERMARKET':
        return <span className="text-green-500">🛒</span>;
      case 'RESTAURANT':
        return <span className="text-orange-500">🍽️</span>;
      case 'BANK':
        return <span className="text-gray-500">🏦</span>;
      case 'PHARMACY':
        return <span className="text-green-600">💊</span>;
      case 'GYM':
        return <span className="text-purple-500">💪</span>;
      case 'PARK':
        return <span className="text-green-400">🌳</span>;
      case 'TRANSPORT_STATION':
        return <span className="text-blue-600">🚇</span>;
      case 'GAS_STATION':
        return <span className="text-yellow-500">⛽</span>;
      case 'POLICE_STATION':
        return <span className="text-blue-700">👮</span>;
      case 'FIRE_STATION':
        return <span className="text-red-600">🚒</span>;
      case 'POST_OFFICE':
        return <span className="text-blue-500">📮</span>;
      case 'LIBRARY':
        return <span className="text-brown-500">📚</span>;
      case 'CINEMA':
        return <span className="text-purple-600">🎬</span>;
      case 'THEATER':
        return <span className="text-red-700">🎭</span>;
      case 'MUSEUM':
        return <span className="text-indigo-500">🏛️</span>;
      case 'SPORTS_CENTER':
        return <span className="text-orange-600">⚽</span>;
      case 'CHURCH':
        return <span className="text-gray-600">⛪</span>;
      default:
        return <span className="text-gray-400">📍</span>;
    }
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '-';
    return `${distance} km`;
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  if (facilities.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay facilidades cercanas</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza agregando una nueva facilidad cercana.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Facilidad
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dirección
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Distancia
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tiempo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {facilities.map((facility) => (
            <tr key={facility.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center">
                    {getTypeIcon(facility.type)}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {facility.name}
                    </div>
                    {facility.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {facility.description}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {FacilityTypeLabels[facility.type]}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 max-w-xs truncate">
                  {facility.address}
                </div>
                <div className="flex items-center mt-1 space-x-2">
                  {facility.phone && (
                    <div className="flex items-center text-xs text-gray-500">
                      <PhoneIcon className="h-3 w-3 mr-1" />
                      {facility.phone}
                    </div>
                  )}
                  {facility.website && (
                    <div className="flex items-center text-xs text-gray-500">
                      <GlobeAltIcon className="h-3 w-3 mr-1" />
                      <span className="truncate max-w-20">Sitio web</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDistance(facility.distanceKm)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="space-y-1">
                  {facility.walkingTimeMinutes && (
                    <div className="text-xs">
                      🚶 {formatTime(facility.walkingTimeMinutes)}
                    </div>
                  )}
                  {facility.drivingTimeMinutes && (
                    <div className="text-xs">
                      🚗 {formatTime(facility.drivingTimeMinutes)}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onToggleActive(facility)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    facility.active
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {facility.active ? 'Activo' : 'Inactivo'}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onEdit(facility)}
                    className="text-orange-600 hover:text-orange-900"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(facility)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
