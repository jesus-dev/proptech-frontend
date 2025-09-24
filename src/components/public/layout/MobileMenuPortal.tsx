"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';

interface MobileMenuPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenuPortal: React.FC<MobileMenuPortalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Crear el menú directamente en el body - SOLO CON CLASES CSS
      const menuOverlay = document.createElement('div');
      menuOverlay.className = 'lg:hidden mobile-menu';
      menuOverlay.onclick = onClose;
      
      const menuPanel = document.createElement('div');
      menuPanel.className = 'mobile-menu-panel';
      menuPanel.onclick = (e) => e.stopPropagation();
      
      // Crear los enlaces
      const links = [
        { href: '/', text: '🏠 Inicio' },
        { href: '/propiedades', text: '🏘️ Propiedades' },
        { href: '/asesores', text: '👥 Asesores' },
        { href: '/contact', text: '📞 Contacto' },
        { href: '/login', text: '🔐 Iniciar Sesión' },
        { href: '/register', text: '✨ Registrarse' },
        { href: '/proptech', text: '🚀 Descubrir PropTech', special: true }
      ];
      
      links.forEach(linkData => {
        const link = document.createElement('a');
        link.href = linkData.href;
        link.className = 'mobile-menu-link';
        link.textContent = linkData.text;
        link.onclick = () => {
          onClose();
          return true;
        };
        
        if (linkData.special) {
          link.style.backgroundColor = '#2563eb';
          link.style.color = '#f1f1f1';
          link.style.margin = '10px 15px';
          link.style.borderRadius = '5px';
        }
        
        menuPanel.appendChild(link);
      });
      
      menuOverlay.appendChild(menuPanel);
      document.body.appendChild(menuOverlay);
      
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Limpiar cuando se cierre
        if (document.body.contains(menuOverlay)) {
          document.body.removeChild(menuOverlay);
        }
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  return null; // Este componente no renderiza nada en el DOM normal
};

export default MobileMenuPortal;
