import React from 'react';

export default function SimpleStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="text-3xl font-bold mb-2">
          <span className="text-brand-200">150+</span>
        </div>
        <div className="text-sm text-brand-100">
          Propiedades
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold mb-2">
          <span className="text-brand-200">5+</span>
        </div>
        <div className="text-sm text-brand-100">
          Agentes
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold mb-2">
          <span className="text-brand-200">75+</span>
        </div>
        <div className="text-sm text-brand-100">
          Clientes
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold mb-2">
          <span className="text-brand-200">7+</span>
        </div>
        <div className="text-sm text-brand-100">
          Años
        </div>
      </div>
    </div>
  );
} 