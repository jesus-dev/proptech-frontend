import React from 'react';
import type { Metadata } from 'next';
import HeroSection from '@/components/public/sections/HeroSection';
import FeaturesSection from '@/components/public/sections/FeaturesSection';
import PricingSection from '@/components/public/sections/PricingSection';
import DemoSection from '@/components/public/sections/DemoSection';
import AuthSection from '@/components/public/sections/AuthSection';
import ContactSection from '@/components/public/sections/ContactSection';

export const metadata: Metadata = {
  title: 'PropTech CRM | Software inmobiliario todo en uno',
  description: 'Conoce PropTech CRM, la plataforma SaaS para agencias inmobiliarias de Paraguay: gestión de propiedades, CRM de clientes, agenda y analíticas.',
  keywords: ['crm inmobiliario paraguay', 'software inmobiliario', 'proptech crm', 'automatizacion inmobiliaria', 'gestion de propiedades'],
  alternates: {
    canonical: 'https://proptech.com.py/proptech',
  },
  openGraph: {
    title: 'PropTech CRM | Software inmobiliario todo en uno',
    description: 'Digitaliza tu agencia inmobiliaria con PropTech CRM: pipeline de ventas, agenda inteligente, reportes y marketing.',
    url: 'https://proptech.com.py/proptech',
  },
};

export const dynamic = 'force-dynamic';

export default function ConocerCRMPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <DemoSection />
      <AuthSection />
      <ContactSection />
    </div>
  );
}


