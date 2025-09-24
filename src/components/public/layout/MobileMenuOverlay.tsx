"use client";

import React from 'react';

interface MobileMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenuOverlay: React.FC<MobileMenuOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div 
        className="fixed top-0 left-0 w-80 h-full bg-white shadow-xl z-50 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Menú</h2>
          <button onClick={onClose} className="text-2xl">✕</button>
        </div>
        
        <div className="space-y-3">
          <a href="/" onClick={onClose} className="block p-3 bg-gray-100 rounded">🏠 Inicio</a>
          <a href="/propiedades" onClick={onClose} className="block p-3 bg-gray-100 rounded">🏘️ Propiedades</a>
          <a href="/asesores" onClick={onClose} className="block p-3 bg-gray-100 rounded">👥 Asesores</a>
          <a href="/contact" onClick={onClose} className="block p-3 bg-gray-100 rounded">📞 Contacto</a>
          <a href="/login" onClick={onClose} className="block p-3 bg-gray-100 rounded">🔐 Login</a>
          <a href="/register" onClick={onClose} className="block p-3 bg-gray-100 rounded">✨ Registro</a>
          <a href="/proptech" onClick={onClose} className="block p-3 bg-blue-600 text-white rounded text-center">🚀 PropTech</a>
        </div>
      </div>
    </div>
  );
};

export default MobileMenuOverlay;