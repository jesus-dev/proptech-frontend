import React from 'react';
import PropertiesSection from '@/components/public/sections/PropertiesSection';
import SimpleContactSection from '@/components/public/sections/SimpleContactSection';

export default function PublicHome() {
  return (
    <div className="min-h-screen">
      <PropertiesSection />
      <SimpleContactSection />
    </div>
  );
}


