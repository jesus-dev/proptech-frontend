'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  User,
  Calendar,
  MapPin,
  DollarSign,
  MoreHorizontal,
  Link,
  Unlink
} from 'lucide-react';
import { OwnersPropertyService, OwnerProperty, Owner } from '@/services/ownersPropertyService';

export default function PropertiesManagementPage() {
  const [ownerProperties, setOwnerProperties] = useState<OwnerProperty[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [linkFormData, setLinkFormData] = useState({
    propertyId: '',
    ownershipType: 'FULL' as 'FULL' | 'PARTIAL' | 'JOINT',
    ownershipPercentage: 100
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos reales del backend
      const ownersData = await OwnersPropertyService.getOwners();
      setOwners(ownersData);
      
      // Cargar propiedades de todos los propietarios
      const allProperties: OwnerProperty[] = [];
      for (const owner of ownersData) {
        const properties = await OwnersPropertyService.getOwnerProperties(owner.id);
        allProperties.push(...properties);
      }
      setOwnerProperties(allProperties);
    } catch (error) {
      console.error('Error cargando datos:', error);
      // En producción, mostrar estado vacío
      setOwners([]);
      setOwnerProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkProperty = async () => {
    if (!selectedOwner || !linkFormData.propertyId) return;
    
    try {
      const newOwnerProperty = await OwnersPropertyService.addPropertyToOwner(
        selectedOwner.id,
        {
          propertyId: parseInt(linkFormData.propertyId),
          ownershipType: linkFormData.ownershipType,
          ownershipPercentage: linkFormData.ownershipPercentage
        }
      );
      
      setOwnerProperties(prev => [...prev, newOwnerProperty]);
      setShowLinkModal(false);
      resetLinkForm();
      alert('Propiedad vinculada exitosamente');
    } catch (error) {
      console.error('Error vinculando propiedad:', error);
      alert('Error vinculando propiedad');
    }
  };

  const handleUnlinkProperty = async (ownerId: number, propertyId: number) => {
    if (!confirm('¿Estás seguro de que quieres desvincular esta propiedad?')) return;
    
    try {
      await OwnersPropertyService.removePropertyFromOwner(ownerId, propertyId);
      setOwnerProperties(prev => prev.filter(op => 
        !(op.owner.id === ownerId && op.property.id === propertyId)
      ));
      alert('Propiedad desvinculada exitosamente');
    } catch (error) {
      console.error('Error desvinculando propiedad:', error);
      alert('Error desvinculando propiedad');
    }
  };

  const resetLinkForm = () => {
    setLinkFormData({
      propertyId: '',
      ownershipType: 'FULL',
      ownershipPercentage: 100
    });
    setSelectedOwner(null);
  };

  const filteredProperties = ownerProperties.filter(ownerProperty => {
    const matchesSearch = ownerProperty.property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ownerProperty.property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ownerProperty.owner.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOwner = filterOwner === 'all' || ownerProperty.owner.id.toString() === filterOwner;
    const matchesStatus = filterStatus === 'all' || ownerProperty.property.status === filterStatus;
    return matchesSearch && matchesOwner && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600 text-sm">Cargando propiedades...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header Moderno */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg shadow-sm">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Propiedades de Propietarios
                </h1>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base">
                Administra la relación entre propietarios y sus propiedades
              </p>
            </div>
          </div>
        </div>

        {/* Controles y Filtros Modernos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar propiedades o propietarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm"
                />
              </div>
              
              <select
                value={filterOwner}
                onChange={(e) => setFilterOwner(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm min-w-[180px]"
              >
                <option value="all">Todos los propietarios</option>
                {owners.map(owner => (
                  <option key={owner.id} value={owner.id.toString()}>
                    {owner.name}
                  </option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm min-w-[150px]"
              >
                <option value="all">Todos los estados</option>
                <option value="FOR_SALE">En Venta</option>
                <option value="FOR_RENT">En Alquiler</option>
                <option value="SOLD">Vendida</option>
                <option value="RENTED">Alquilada</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowLinkModal(true)}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center text-sm font-medium shadow-sm"
            >
              <Link className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Vincular Propiedad</span>
              <span className="sm:hidden">Vincular</span>
            </button>
          </div>
        </div>

        {/* Estadísticas Modernas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
                <Home className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Total Propiedades</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{ownerProperties.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Propietarios Activos</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                  {owners.filter(o => o.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                  {ownerProperties.reduce((sum, op) => sum + (op.property?.price || 0), 0).toLocaleString('es-ES')}€
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Vistas Totales</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                  {ownerProperties.length * 150}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Propiedades Moderna */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Propiedad
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Propietario
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Tipo de Propiedad
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">
                    Métricas
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProperties.map((ownerProperty) => (
                  <tr key={`${ownerProperty.owner.id}-${ownerProperty.property.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <Home className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{ownerProperty.property.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center truncate">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{ownerProperty.property.address}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{ownerProperty.owner.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{ownerProperty.owner.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {OwnersPropertyService.getOwnershipTypeDisplayName(ownerProperty.ownershipType)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {ownerProperty.ownershipPercentage}% de propiedad
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ownerProperty.property.status === 'FOR_SALE' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                        ownerProperty.property.status === 'FOR_RENT' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                        ownerProperty.property.status === 'SOLD' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {ownerProperty.property.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                      <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          150
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          12
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          5
                        </span>
                        <span className="flex items-center">
                          <Share2 className="w-4 h-4 mr-1" />
                          8
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleUnlinkProperty(ownerProperty.owner.id, ownerProperty.property.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1"
                          title="Desvincular"
                        >
                          <Unlink className="w-4 h-4" />
                        </button>
                        <button className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 p-1" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 p-1" title="Más opciones">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Vincular Propiedad */}
        {showLinkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Vincular Propiedad a Propietario
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Propietario *
                  </label>
                  <select
                    value={selectedOwner?.id || ''}
                    onChange={(e) => {
                      const owner = owners.find(o => o.id.toString() === e.target.value);
                      setSelectedOwner(owner || null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar propietario</option>
                    {owners.map(owner => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} - {owner.email}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de Propiedad *
                  </label>
                  <input
                    type="number"
                    value={linkFormData.propertyId}
                    onChange={(e) => setLinkFormData({...linkFormData, propertyId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Ingresa el ID de la propiedad"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Propiedad
                  </label>
                  <select
                    value={linkFormData.ownershipType}
                    onChange={(e) => setLinkFormData({...linkFormData, ownershipType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="FULL">Propietario Completo</option>
                    <option value="PARTIAL">Propietario Parcial</option>
                    <option value="JOINT">Propietario Conjunto</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porcentaje de Propiedad (%)
                  </label>
                  <input
                    type="number"
                    value={linkFormData.ownershipPercentage}
                    onChange={(e) => setLinkFormData({...linkFormData, ownershipPercentage: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="1"
                    max="100"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowLinkModal(false);
                    resetLinkForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLinkProperty}
                  disabled={!selectedOwner || !linkFormData.propertyId}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Vincular
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
