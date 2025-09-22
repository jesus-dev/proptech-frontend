import React from 'react';
import HeroSection from '@/components/public/sections/HeroSection';
import FeaturesSection from '@/components/public/sections/FeaturesSection';
import PricingSection from '@/components/public/sections/PricingSection';
import DemoSection from '@/components/public/sections/DemoSection';
import AuthSection from '@/components/public/sections/AuthSection';
import ContactSection from '@/components/public/sections/ContactSection';

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


