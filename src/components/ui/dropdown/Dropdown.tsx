"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  // Recibe el botón de referencia por contexto o prop (aquí lo buscamos por clase)
  useEffect(() => {
    if (isOpen) {
      // Buscar el botón con la clase .dropdown-toggle que está abierto
      const btn = document.querySelector('.dropdown-toggle[aria-expanded="true"]') as HTMLElement;
      if (btn) {
        buttonRef.current = btn;
        const rect = btn.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calcular posición horizontal
        let left = rect.left;
        const dropdownWidth = 384; // w-96 = 384px
        
        // Ajustar si se sale por la derecha
        if (left + dropdownWidth > viewportWidth) {
          left = viewportWidth - dropdownWidth - 16; // 16px de margen
        }
        
        // Asegurar que no se salga por la izquierda
        if (left < 16) {
          left = 16;
        }
        
        // Calcular posición vertical
        let top = rect.bottom + 8; // 8px de separación
        const dropdownHeight = 400; // Altura estimada del dropdown
        
        // Ajustar si se sale por abajo
        if (top + dropdownHeight > viewportHeight) {
          top = rect.top - dropdownHeight - 8; // Mostrar arriba del botón
        }
        
        setPosition({
          top: top,
          left: left,
        });
      }
    } else {
      setPosition(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.dropdown-toggle')
      ) {
        onClose();
      }
    };

    const handleScroll = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Recalcular posición
        let left = rect.left;
        const dropdownWidth = 384;
        
        if (left + dropdownWidth > viewportWidth) {
          left = viewportWidth - dropdownWidth - 16;
        }
        if (left < 16) {
          left = 16;
        }
        
        let top = rect.bottom + 8;
        const dropdownHeight = 400;
        
        if (top + dropdownHeight > viewportHeight) {
          top = rect.top - dropdownHeight - 8;
        }
        
        setPosition({ top, left });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [onClose, isOpen]);

  if (!isOpen || !position) return null;

  // Usar portal y posicionar el menú globalmente
  return createPortal(
    <div
      ref={dropdownRef}
      className={`fixed z-[9999] rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark ${className}`}
      style={{
        top: position.top,
        left: position.left,
        minWidth: 180,
        maxWidth: 320,
      }}
    >
      {children}
    </div>,
    document.body
  );
};
