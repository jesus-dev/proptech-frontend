"use client";

import React, { useEffect, useState, useCallback } from 'react';

interface MobileOptimizerProps {
  children: React.ReactNode;
}

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isPWA: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
}

export default function MobileOptimizer({ children }: MobileOptimizerProps) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isIOS: false,
    isAndroid: false,
    isPWA: false,
    screenWidth: 0,
    screenHeight: 0,
    pixelRatio: 1,
  });

  // Detectar información del dispositivo
  const detectDevice = useCallback(() => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent;
    const screen = window.screen;
    const viewport = window.visualViewport;

    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;

    const screenWidth = viewport?.width || screen.width;
    const screenHeight = viewport?.height || screen.height;
    const pixelRatio = window.devicePixelRatio || 1;

    let isMobile = false;
    let isTablet = false;
    let isDesktop = false;

    if (screenWidth < 768) {
      isMobile = true;
    } else if (screenWidth >= 768 && screenWidth < 1024) {
      isTablet = true;
    } else {
      isDesktop = true;
    }

    setDeviceInfo({
      isMobile,
      isTablet,
      isDesktop,
      isIOS,
      isAndroid,
      isPWA,
      screenWidth,
      screenHeight,
      pixelRatio,
    });
  }, []);

  // Optimizaciones específicas para móviles
  const applyMobileOptimizations = useCallback(() => {
    if (typeof window === 'undefined' || !deviceInfo.isMobile) return;

    // Prevenir zoom en inputs
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('spellcheck', 'false');
    });

    // Agregar clases CSS específicas para móviles
    document.body.classList.add('mobile-device');
    if (deviceInfo.isIOS) {
      document.body.classList.add('ios-device');
    }
    if (deviceInfo.isAndroid) {
      document.body.classList.add('android-device');
    }
    if (deviceInfo.isPWA) {
      document.body.classList.add('pwa-mode');
    }
  }, [deviceInfo]);

  useEffect(() => {
    // Inicializar inmediatamente
    detectDevice();

    // Event listeners
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', () => {
      setTimeout(detectDevice, 100);
    });

    return () => {
      window.removeEventListener('resize', detectDevice);
    };
  }, [detectDevice]);

  useEffect(() => {
    applyMobileOptimizations();
  }, [applyMobileOptimizations]);

  return (
    <>
      {/* Contenido principal */}
      <div className={`mobile-optimized ${deviceInfo.isMobile ? 'mobile' : ''} ${deviceInfo.isTablet ? 'tablet' : ''} ${deviceInfo.isDesktop ? 'desktop' : ''}`}>
        {children}
      </div>

      {/* Estilos específicos para móviles */}
      <style jsx global>{`
        .mobile-device {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .mobile-device input,
        .mobile-device textarea,
        .mobile-device select {
          -webkit-user-select: text;
          -khtml-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
          font-size: 16px !important; /* Prevenir zoom en iOS */
        }

        .ios-device {
          /* Optimizaciones específicas para iOS */
        }

        .android-device {
          /* Optimizaciones específicas para Android */
        }

        .pwa-mode {
          /* Optimizaciones para modo PWA */
        }

        .mobile-optimized.mobile {
          /* Optimizaciones generales para móviles */
        }

        .mobile-optimized.mobile img {
          max-width: 100%;
          height: auto;
        }

        /* Optimizaciones de rendimiento para móviles */
        @media (max-width: 768px) {
          * {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
          }
          
          .mobile-optimized {
            will-change: auto;
          }
        }
      `}</style>
    </>
  );
} 