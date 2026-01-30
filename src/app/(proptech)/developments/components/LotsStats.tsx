"use client";

import React from 'react';
import {
  Squares2X2Icon,
  CheckCircleIcon,
  BanknotesIcon,
  ClockIcon,
  ArrowsPointingOutIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Lot } from './types';

interface LotsStatsProps {
  lots?: Lot[];
  className?: string;
}

export default function LotsStats({ lots = [], className = "" }: LotsStatsProps) {
  const totalLots = lots?.length || 0;
  const availableLots = lots?.filter(lot => lot.status === 'available').length || 0;
  const soldLots = lots?.filter(lot => lot.status === 'sold').length || 0;
  const reservedLots = lots?.filter(lot => lot.status === 'reserved').length || 0;
  
  const totalArea = lots?.reduce((sum, lot) => sum + lot.area, 0) || 0;
  const totalValue = lots?.reduce((sum, lot) => sum + lot.price, 0) || 0;
  const averagePrice = totalLots > 0 ? totalValue / totalLots : 0;
  const averageArea = totalLots > 0 ? totalArea / totalLots : 0;
  const percent = (value: number) => (totalLots > 0 ? (value / totalLots) * 100 : 0);
  const formatMoney = (value: number) => `$${Math.round(value).toLocaleString()}`;
  const formatArea = (value: number) => `${Math.round(value).toLocaleString()} m²`;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm ${className}`}>
      <div className="p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Estadísticas de lotes
          </h3>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Total: <span className="font-semibold text-gray-900 dark:text-white">{totalLots}</span>
          </div>
        </div>

        {/* KPIs principales */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border border-gray-200/60 dark:border-gray-700/60 bg-gray-50/60 dark:bg-gray-900/20 p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
              <Squares2X2Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white tabular-nums">{totalLots}</div>
          </div>
          <div className="rounded-lg border border-gray-200/60 dark:border-gray-700/60 bg-gray-50/60 dark:bg-gray-900/20 p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">Disponibles</div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <CheckCircleIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white tabular-nums">{availableLots}</div>
          </div>
          <div className="rounded-lg border border-gray-200/60 dark:border-gray-700/60 bg-gray-50/60 dark:bg-gray-900/20 p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">Vendidos</div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <BanknotesIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white tabular-nums">{soldLots}</div>
          </div>
          <div className="rounded-lg border border-gray-200/60 dark:border-gray-700/60 bg-gray-50/60 dark:bg-gray-900/20 p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">Reservados</div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <ClockIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white tabular-nums">{reservedLots}</div>
          </div>
        </div>

        {/* Métricas secundarias */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-gray-200/60 dark:border-gray-700/60 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <ArrowsPointingOutIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                Área total
              </span>
              <span className="font-semibold text-gray-900 dark:text-white tabular-nums">{formatArea(totalArea)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <ArrowsPointingOutIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                Área promedio
              </span>
              <span className="font-semibold text-gray-900 dark:text-white tabular-nums">{formatArea(averageArea)}</span>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200/60 dark:border-gray-700/60 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <BanknotesIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                Valor total
              </span>
              <span className="font-semibold text-gray-900 dark:text-white tabular-nums">{formatMoney(totalValue)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <ChartBarIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                Precio promedio
              </span>
              <span className="font-semibold text-gray-900 dark:text-white tabular-nums">{formatMoney(averagePrice)}</span>
            </div>
          </div>
        </div>

        {/* Progreso */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Progreso</h4>
            <div className="text-xs text-gray-500 dark:text-gray-400">%</div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Disponibles</span>
                <span className="font-medium text-gray-900 dark:text-white tabular-nums">
                  {availableLots} ({percent(availableLots).toFixed(1)}%)
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${percent(availableLots)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Vendidos</span>
                <span className="font-medium text-gray-900 dark:text-white tabular-nums">
                  {soldLots} ({percent(soldLots).toFixed(1)}%)
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-2 rounded-full bg-rose-500" style={{ width: `${percent(soldLots)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Reservados</span>
                <span className="font-medium text-gray-900 dark:text-white tabular-nums">
                  {reservedLots} ({percent(reservedLots).toFixed(1)}%)
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-2 rounded-full bg-amber-500" style={{ width: `${percent(reservedLots)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 