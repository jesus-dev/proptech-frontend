"use client";

import React from "react";
import Link from "next/link";
import { publicPropertyService } from "@/services/publicPropertyService";

interface Property {
  id: number;
  slug: string;
}

interface PropertyLinkProps {
  property: Property;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function PropertyLink({ property, children, className, onClick }: PropertyLinkProps) {
  const handleClick = async () => {
    try {
      // Incrementar vistas cuando se hace clic en la propiedad
      await publicPropertyService.incrementViews(property.id.toString());
    } catch (error) {
      console.warn('Error al incrementar vistas:', error);
    }
    
    // Llamar al onClick original si existe
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link 
      href={`/public/propiedad/${property.slug}`}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
} 