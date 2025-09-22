import React from 'react';
import { getPropertyPageStats, getAboutPageStats } from '@/lib/statistics';

interface StatisticsDisplayProps {
  type: 'property-page' | 'about-page' | 'custom';
  propertiesCount?: number;
  customStats?: Array<{
    number: string;
    label: string;
    icon?: string;
  }>;
  className?: string;
  textColor?: string;
  iconColor?: string;
}

export default function StatisticsDisplay({ 
  type, 
  propertiesCount = 0, 
  customStats,
  className = "",
  textColor = "text-brand-200",
  iconColor = "text-brand-100"
}: StatisticsDisplayProps) {
  
  const getStats = () => {
    switch (type) {
      case 'property-page':
        const propertyStats = getPropertyPageStats(propertiesCount);
        return [
          {
            number: `${propertyStats.properties}+`,
            label: "Propiedades",
          },
          {
            number: `${propertyStats.locations}+`,
            label: "Ubicaciones",
          },
          {
            number: `${propertyStats.clients}+`,
            label: "Clientes",
          },
          {
            number: propertyStats.support,
            label: "Soporte",
          },
        ];
      
      case 'about-page':
        return getAboutPageStats();
      
      case 'custom':
        return customStats || [];
      
      default:
        return [];
    }
  };

  const stats = getStats();

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto ${className}`}>
      {stats.map((stat, index) => (
        <div 
          key={stat.label}
          className="text-center group hover:transform hover:scale-105 transition-all duration-300"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="text-3xl font-bold mb-2">
            <span className={textColor}>{stat.number}</span>
          </div>
          <div className={`text-sm ${iconColor}`}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
} 