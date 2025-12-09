"use client";

import React from 'react';
import Link from 'next/link';

/**
 * Componente de enlace "Saltar al contenido" para accesibilidad
 * Permite a los usuarios de lectores de pantalla saltar la navegación
 */
const SkipToContent: React.FC = () => {
  return (
    <Link
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Saltar al contenido principal
    </Link>
  );
};

export default SkipToContent;

