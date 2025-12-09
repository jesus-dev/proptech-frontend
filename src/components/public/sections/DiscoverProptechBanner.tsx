"use client";

import Link from 'next/link';
import { Rocket, ShieldCheck, LayoutDashboard } from 'lucide-react';

const bulletPoints = [
  {
    icon: <LayoutDashboard className="h-5 w-5 text-brand-500" />,
    title: 'CRM inmobiliario completo',
    description: 'Pipeline de ventas, agenda inteligente y seguimiento de clientes.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-brand-500" />,
    title: 'Seguridad y soporte local',
    description: 'Infraestructura segura, soporte paraguayo y actualizaciones constantes.',
  },
  {
    icon: <Rocket className="h-5 w-5 text-brand-500" />,
    title: 'Automatiza tu marketing',
    description: 'Publicaciones automáticas, landing pages y campañas multicanal.',
  },
];

export default function DiscoverProptechBanner() {
  return (
    <section id="descubre-proptech" className="relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-white via-brand-50/40 to-white shadow-lg">
      <div className="absolute inset-0 opacity-60 mix-blend-screen">
        <div className="absolute top-[-20%] right-[-10%] h-64 w-64 rounded-full bg-brand-200 blur-3xl"></div>
        <div className="absolute bottom-[-25%] left-[-15%] h-72 w-72 rounded-full bg-brand-300 blur-3xl"></div>
      </div>

      <div className="relative grid items-center gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1.2fr,1fr]">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-600">
            <Rocket className="h-4 w-4" />
            Conoce PropTech
          </span>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Lleva tu inmobiliaria al siguiente nivel con PropTech CRM
          </h2>
          <p className="text-gray-600">
            Digitaliza tu operación, automatiza tu marketing y fideliza clientes desde un solo lugar.
            Somos el CRM inmobiliario paraguayo que evoluciona con tu negocio.
          </p>

          <ul className="space-y-3">
            {bulletPoints.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <div className="mt-1">{item.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/proptech"
              className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              Conocer PropTech
            </Link>
            <p className="text-xs text-gray-500">
              Descubre por qué agencias en Paraguay eligen PropTech CRM para centralizar su gestión.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-brand-100/40 blur-2xl"></div>
          <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-2xl">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Panel PropTech CRM</p>
                  <p className="text-xs text-gray-500">Dashboard en tiempo real</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-brand-500"></span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                </div>
              </div>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Resumen</p>
                <div className="mt-2 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl border border-brand-100 bg-brand-50/60 px-3 py-4">
                    <p className="text-xs text-brand-600">Propiedades activas</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">124</p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-4">
                    <p className="text-xs text-emerald-600">Clientes activos</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">312</p>
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-4">
                    <p className="text-xs text-amber-600">Oportunidades</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">58</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Integraciones</p>
                <div className="mt-2 grid grid-cols-2 gap-3 text-left text-xs text-gray-600">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3">
                    Automatización de marketing
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3">
                    Portal PropTech
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3">
                    CRM unificado
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3">
                    Reportes ejecutivos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

