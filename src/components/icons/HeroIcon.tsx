import React from 'react';
import { ComponentProps } from 'react';

// Wrapper para iconos de Heroicons que sea compatible con Next.js
export const HeroIcon = React.forwardRef<
  SVGSVGElement,
  ComponentProps<'svg'> & {
    icon: React.ComponentType<ComponentProps<'svg'>>;
  }
>(({ icon: Icon, ...props }, ref) => {
  return <Icon ref={ref} {...props} />;
});

HeroIcon.displayName = 'HeroIcon';
