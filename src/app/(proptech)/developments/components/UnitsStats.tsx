"use client";

import React from "react";
import { Unit } from "./types";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, CurrencyDollarIcon, UserGroupIcon } from "@heroicons/react/24/outline";





interface UnitsStatsProps {
  units: Unit[];
}

export default function UnitsStats({ units }: UnitsStatsProps) {
  const totalUnits = units.length;
  const availableUnits = units.filter(unit => unit.status === "available").length;
  const soldUnits = units.filter(unit => unit.status === "sold").length;
  const reservedUnits = units.filter(unit => unit.status === "reserved").length;
  const rentedUnits = units.filter(unit => unit.status === "rented").length;

  const totalValue = units.reduce((sum, unit) => sum + unit.price, 0);
  const averagePrice = totalUnits > 0 ? totalValue / totalUnits : 0;
  const totalArea = units.reduce((sum, unit) => sum + unit.area, 0);
  const averageArea = totalUnits > 0 ? totalArea / totalUnits : 0;

  const occupancyRate = totalUnits > 0 ? ((totalUnits - availableUnits) / totalUnits) * 100 : 0;

  const stats = [
    {
      name: "Total de Unidades",
      value: totalUnits,
      icon: HomeIcon,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      name: "Disponibles",
      value: availableUnits,
      icon: HomeIcon,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      name: "Vendidas",
      value: soldUnits,
      icon: CurrencyDollarIcon,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
    {
      name: "Alquiladas",
      value: rentedUnits,
      icon: UserGroupIcon,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      name: "Reservadas",
      value: reservedUnits,
      icon: MapPinIcon,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      name: "Tasa de Ocupación",
      value: `${occupancyRate.toFixed(1)}%`,
      icon: UserGroupIcon,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    },
  ];

  const financialStats = [
    {
      name: "Valor Total",
      value: `$${totalValue.toLocaleString()}`,
      description: "Valor total de todas las unidades",
    },
    {
      name: "Precio Promedio",
      value: `$${averagePrice.toLocaleString()}`,
      description: "Precio promedio por unidad",
    },
    {
      name: "Área Total",
      value: `${totalArea.toLocaleString()} m²`,
      description: "Área total de todas las unidades",
    },
    {
      name: "Área Promedio",
      value: `${averageArea.toFixed(0)} m²`,
      description: "Área promedio por unidad",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Estadísticas de Unidades
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <div key={stat.name} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor} ${stat.color} mb-3`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Información Financiera
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {financialStats.map((stat) => (
            <div key={stat.name} className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{stat.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status Distribution */}
      {totalUnits > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Distribución por Estado
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Disponibles</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(availableUnits / totalUnits) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                  {availableUnits}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Vendidas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(soldUnits / totalUnits) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                  {soldUnits}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Alquiladas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${(rentedUnits / totalUnits) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                  {rentedUnits}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Reservadas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${(reservedUnits / totalUnits) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                  {reservedUnits}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 