"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  HomeIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  TrophyIcon,
  StarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { getEndpoint } from '@/lib/api-config';
import Link from "next/link";

export default function PropertyStatisticsPage() {
  const params = useParams();
  const propertyId = params?.id as string;
  
  const [stats, setStats] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar datos de la propiedad
        const propertyResponse = await fetch(getEndpoint(`/api/properties/${propertyId}`));
        const propertyData = await propertyResponse.json();
        setProperty(propertyData);

        // Cargar estadísticas de la propiedad
        const params = new URLSearchParams({ days: dateRange });
        const statsResponse = await fetch(`${getEndpoint(`/api/properties/${propertyId}/statistics`)}?${params}`);
        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (err) {
        setError("No se pudieron cargar las estadísticas de la propiedad");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchData();
    }
  }, [propertyId, dateRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando estadísticas de la propiedad...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="text-center">
            <ChartBarIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar estadísticas</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalViews = stats.totalViews || 0;
  const totalFavorites = stats.totalFavorites || 0;
  const totalShares = stats.totalShares || 0;
  const totalContacts = stats.totalContacts || 0;
  const averageViewsPerDay = stats.averageViewsPerDay || 0;
  const viewsTrend = stats.viewsTrend || [];
  const contactsTrend = stats.contactsTrend || [];
  const engagementRate = totalViews > 0 ? ((totalFavorites / totalViews) * 100) : 0;
  const conversionRate = totalViews > 0 ? ((totalContacts / totalViews) * 100) : 0;
  const daysListed = stats.daysListed || 0;
  const priceHistory = stats.priceHistory || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header con navegación */}
        <div className="mb-8">
          <Link 
            href={`/properties/${propertyId}`}
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver a la propiedad
          </Link>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <p className="text-gray-600 mb-4">{property.address}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    {property.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    {property.operation}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    {property.city}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${property.price?.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500">Precio actual</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtro de tiempo */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-500" />
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 90 días</option>
                <option value="365">Último año</option>
              </select>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <EyeIcon className="w-8 h-8 text-blue-500" />
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {totalViews.toLocaleString()}
            </h3>
            <p className="text-gray-600 text-sm">Total de Vistas</p>
            <p className="text-xs text-gray-500 mt-1">
              {averageViewsPerDay.toFixed(1)} vistas/día
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <HeartIcon className="w-8 h-8 text-red-500" />
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {totalFavorites}
            </h3>
            <p className="text-gray-600 text-sm">Favoritos</p>
            <p className="text-xs text-gray-500 mt-1">
              {engagementRate.toFixed(1)}% engagement
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <PhoneIcon className="w-8 h-8 text-purple-500" />
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {totalContacts}
            </h3>
            <p className="text-gray-600 text-sm">Contactos</p>
            <p className="text-xs text-gray-500 mt-1">
              {conversionRate.toFixed(1)}% conversión
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <ClockIcon className="w-8 h-8 text-orange-500" />
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {daysListed}
            </h3>
            <p className="text-gray-600 text-sm">Días Publicada</p>
            <p className="text-xs text-gray-500 mt-1">
              Desde {new Date(property.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Análisis de rendimiento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
              Tendencias de Vistas
            </h2>
            <div className="space-y-3">
              {viewsTrend.length > 0 ? (
                viewsTrend.slice(-7).map((day: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{day.date}</span>
                    <span className="font-medium text-gray-900">{day.views} vistas</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No hay datos de tendencias</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500" />
              Tendencias de Contactos
            </h2>
            <div className="space-y-3">
              {contactsTrend.length > 0 ? (
                contactsTrend.slice(-7).map((day: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{day.date}</span>
                    <span className="font-medium text-gray-900">{day.contacts} contactos</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <UsersIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No hay datos de contactos</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Historial de precios */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
            Historial de Precios
          </h2>
          <div className="space-y-3">
            {priceHistory.length > 0 ? (
              priceHistory.map((price: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm text-gray-600">{price.date}</span>
                    <p className="text-xs text-gray-500">{price.reason || 'Cambio de precio'}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-gray-900">
                      ${price.price.toLocaleString()}
                    </span>
                    {idx > 0 && (
                      <span className={`text-xs ml-2 ${
                        price.price > priceHistory[idx - 1].price 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {price.price > priceHistory[idx - 1].price ? '↗' : '↘'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No hay historial de precios</p>
              </div>
            )}
          </div>
        </div>

        {/* Comparación con el mercado */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GlobeAltIcon className="w-5 h-5 text-blue-500" />
            Comparación con el Mercado
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {stats.marketComparison?.viewsRank || 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Ranking de Vistas</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {stats.marketComparison?.priceRank || 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Ranking de Precio</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {stats.marketComparison?.engagementRank || 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Ranking de Engagement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
