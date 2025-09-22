import React from "react";

interface PublicHeroProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  bgClass?: string;
}

export default function PublicHero({ title, subtitle, icon, bgClass }: PublicHeroProps) {
  return (
    <section className={`relative py-20 md:py-28 ${bgClass || "bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800"} text-white overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
        {icon && (
          <div className="mx-auto mb-8 flex justify-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-white/30">
              {icon}
            </div>
          </div>
        )}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl text-brand-100 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
} 