import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto | PropTech CRM',
  description: 'Ponte en contacto con PropTech CRM para solicitar una demo gratuita, soporte o información sobre planes para agencias inmobiliarias en Paraguay.',
  keywords: ['contacto proptech', 'demo crm inmobiliario', 'soporte proptech', 'software inmobiliario paraguay'],
  alternates: {
    canonical: 'https://proptech.com.py/contact',
  },
  openGraph: {
    title: 'Contacto | PropTech CRM',
    description: 'Agenda una demo o solicita soporte a nuestro equipo de PropTech CRM.',
    url: 'https://proptech.com.py/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

