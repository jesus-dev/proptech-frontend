"use client";
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  onClick?: () => void;
}

const colorClasses = {
  primary: {
    bg: 'bg-brand-50 dark:bg-brand-900/20',
    border: 'border-brand-200 dark:border-brand-800',
    text: 'text-brand-700 dark:text-brand-300',
    icon: 'text-brand-500'
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-300',
    icon: 'text-green-500'
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-700 dark:text-yellow-300',
    icon: 'text-yellow-500'
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    icon: 'text-red-500'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'text-blue-500'
  }
};

const sizeClasses = {
  sm: {
    padding: 'p-4',
    title: 'text-sm',
    value: 'text-lg',
    subtitle: 'text-xs',
    icon: 'h-8 w-8'
  },
  md: {
    padding: 'p-6',
    title: 'text-sm',
    value: 'text-2xl',
    subtitle: 'text-sm',
    icon: 'h-10 w-10'
  },
  lg: {
    padding: 'p-8',
    title: 'text-base',
    value: 'text-3xl',
    subtitle: 'text-sm',
    icon: 'h-12 w-12'
  }
};

export default function StatsCard({
  title,
  value,
  subtitle,
  change,
  icon,
  color = 'primary',
  size = 'md',
  loading = false,
  onClick
}: StatsCardProps) {
  const colors = colorClasses[color];
  const sizes = sizeClasses[size];

  const getChangeIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getChangeTextColor = () => {
    if (!change) return '';
    
    switch (change.type) {
      case 'increase':
        return 'text-green-600 dark:text-green-400';
      case 'decrease':
        return 'text-red-600 dark:text-red-400';
      case 'neutral':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return '';
    }
  };

  const formatChangeValue = (val: number) => {
    const absVal = Math.abs(val);
    return val >= 0 ? `+${absVal}%` : `-${absVal}%`;
  };

  return (
    <div
      className={`
        ${colors.bg} ${colors.border} ${colors.text}
        border rounded-lg ${sizes.padding} transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
        ${loading ? 'animate-pulse' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            {icon && (
              <div className={`${sizes.icon} ${colors.icon} flex-shrink-0`}>
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`${sizes.title} font-medium truncate`}>
                {title}
              </p>
              {loading ? (
                <div className={`${sizes.value} font-bold mt-1`}>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ) : (
                <p className={`${sizes.value} font-bold mt-1`}>
                  {value}
                </p>
              )}
              {subtitle && (
                <p className={`${sizes.subtitle} opacity-75 mt-1`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {change && !loading && (
          <div className="flex items-center space-x-1 ml-4">
            {getChangeIcon()}
            <span className={`text-sm font-medium ${getChangeTextColor()}`}>
              {formatChangeValue(change.value)}
            </span>
            <span className="text-xs opacity-75">
              {change.period}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de grid de estadísticas
interface StatsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatsGrid({ 
  children, 
  columns = 4, 
  gap = 'md',
  className = '' 
}: StatsGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

// Componente de estadísticas con comparación
interface ComparisonStatsProps {
  current: {
    value: number;
    label: string;
  };
  previous: {
    value: number;
    label: string;
  };
  title: string;
  formatValue?: (value: number) => string;
}

export function ComparisonStats({
  current,
  previous,
  title,
  formatValue = (value) => value.toString()
}: ComparisonStatsProps) {
  const change = ((current.value - previous.value) / previous.value) * 100;
  const changeType = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral';

  return (
    <StatsCard
      title={title}
      value={formatValue(current.value)}
      subtitle={`vs ${previous.label}: ${formatValue(previous.value)}`}
      change={{
        value: Math.abs(change),
        type: changeType,
        period: 'vs anterior'
      }}
      color={changeType === 'increase' ? 'success' : changeType === 'decrease' ? 'danger' : 'info'}
    />
  );
} 