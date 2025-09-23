"use client";

import React from 'react';
import SearchHeroSection from '@/components/public/sections/SearchHeroSection';
import ProjectsSection from '@/components/public/sections/ProjectsSection';

export default function PublicProyectos() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Usando el mismo hero optimizado */}
      <SearchHeroSection />
      
      <ProjectsSection />
    </div>
  );
}
