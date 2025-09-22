"use client";

import React from 'react';
import { useContactInfo } from '@/hooks/useContactInfo';

interface QuickContactButtonsProps {
  showPhone?: boolean;
  showEmail?: boolean;
  showWhatsApp?: boolean;
  showWebsite?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function QuickContactButtons({
  showPhone = true,
  showEmail = true,
  showWhatsApp = true,
  showWebsite = true,
  className = "",
  size = 'md'
}: QuickContactButtonsProps) {
  const { getContactByType, getWhatsAppLink, getEmailLink, getPhoneLink, isLoading } = useContactInfo();

  if (isLoading) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded-full w-10 h-10"></div>
        <div className="animate-pulse bg-gray-200 rounded-full w-10 h-10"></div>
        <div className="animate-pulse bg-gray-200 rounded-full w-10 h-10"></div>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (action: 'phone' | 'email' | 'whatsapp' | 'website') => {
    switch (action) {
      case 'phone':
        const phoneLink = getPhoneLink();
        if (phoneLink) window.open(phoneLink, '_self');
        break;
      case 'email':
        const emailLink = getEmailLink();
        if (emailLink) window.open(emailLink, '_self');
        break;
      case 'whatsapp':
        const whatsappLink = getWhatsAppLink();
        if (whatsappLink) window.open(whatsappLink, '_blank');
        break;
      case 'website':
        const website = getContactByType('website');
        if (website) window.open(website, '_blank');
        break;
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {showPhone && getContactByType('phone') && (
        <button
          onClick={() => handleClick('phone')}
          className={`${sizeClasses[size]} bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors duration-200`}
          title="Llamar"
        >
          <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.135a11.042 11.042 0 005.516 5.516l1.135-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
      )}

      {showEmail && getContactByType('email') && (
        <button
          onClick={() => handleClick('email')}
          className={`${sizeClasses[size]} bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors duration-200`}
          title="Enviar email"
        >
          <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 4v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7m-4 0h18a2 2 0 002-2V6a2 2 0 00-2-2H3a2 2 0 00-2 2v4a2 2 0 002 2z" />
          </svg>
        </button>
      )}

      {showWhatsApp && getContactByType('whatsapp') && (
        <button
          onClick={() => handleClick('whatsapp')}
          className={`${sizeClasses[size]} bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors duration-200`}
          title="Enviar WhatsApp"
        >
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </button>
      )}

      {showWebsite && getContactByType('website') && (
        <button
          onClick={() => handleClick('website')}
          className={`${sizeClasses[size]} bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-200`}
          title="Visitar sitio web"
        >
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </button>
      )}
    </div>
  );
} 