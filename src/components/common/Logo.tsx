import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  href?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '', href = '/dash' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg'
  };

  const logoContent = (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} bg-blue-600 rounded-lg flex items-center justify-center`}>
        <span className={`text-white font-bold ${textSizes[size]}`}>ON</span>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 dark:text-white ${textSizes[size]}`}>
            ON PropTech
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">CRM</span>
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="hover:opacity-80 transition-opacity">
      {logoContent}
    </Link>
  ) : logoContent;
};

export default Logo; 