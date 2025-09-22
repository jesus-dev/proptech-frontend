import React from 'react';

interface PublicHeroProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function PublicHero({ title, subtitle, children }: PublicHeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl md:text-2xl mb-12 text-brand-100 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-300">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
} 