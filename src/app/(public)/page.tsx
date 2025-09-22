import React from 'react';
import SearchHeroSection from '@/components/public/sections/SearchHeroSection';
import PropertiesSection from '@/components/public/sections/PropertiesSection';
import SimpleContactSection from '@/components/public/sections/SimpleContactSection';

export default function PublicHome() {
  return (
    <div className="min-h-screen">
      <SearchHeroSection />
      <PropertiesSection />
      <SimpleContactSection />
    </div>
  );
}


