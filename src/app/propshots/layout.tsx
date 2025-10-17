import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'PropShots - Videos Inmobiliarios',
  description: 'Videos de propiedades en formato reel',
}

export default function PropShotsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}

