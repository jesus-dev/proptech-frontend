"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import SuspenseBoundary from '../common/SuspenseBoundary';

// Importar ReactApexChart dinámicamente
const ReactApexChart = dynamic(
  () => import('react-apexcharts'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-xs text-gray-500">Cargando gráfico...</p>
        </div>
      </div>
    ),
  }
);

interface LazyChartProps {
  options: any;
  series: any;
  type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'boxPlot' | 'radar' | 'polarArea' | 'rangeBar' | 'rangeArea' | 'treemap';
  height?: number | string;
  width?: number | string;
  className?: string;
}

const LazyChart: React.FC<LazyChartProps> = ({ 
  options, 
  series, 
  type, 
  height = 350, 
  width = '100%',
  className = ""
}) => {
  return (
    <SuspenseBoundary className={className}>
      <div className="w-full">
        <ReactApexChart
          options={options}
          series={series}
          type={type}
          height={height}
          width={width}
        />
      </div>
    </SuspenseBoundary>
  );
};

export default React.memo(LazyChart); 