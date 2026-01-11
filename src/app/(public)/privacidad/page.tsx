import React from 'react';
import type { Metadata } from 'next';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Política de Privacidad - PropTech Paraguay',
  description: 'Política de privacidad y protección de datos de PropTech Paraguay',
  alternates: {
    canonical: 'https://proptech.com.py/privacidad',
  },
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative -mt-[3.5rem] sm:-mt-16 min-h-[35vh] sm:min-h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
        {/* Patrón de cuadrícula */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="property-grid-privacidad" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="none" stroke="cyan" strokeWidth="0.5" opacity="0.3"/>
                <rect x="10" y="10" width="60" height="45" fill="none" stroke="cyan" strokeWidth="0.3" opacity="0.4" rx="2"/>
                <circle cx="20" cy="25" r="3" fill="cyan" opacity="0.3"/>
                <circle cx="35" cy="30" r="2" fill="cyan" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#property-grid-privacidad)" />
          </svg>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-300/20 rounded-full blur-xl animate-bounce"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Política de Privacidad
            </h1>
          </div>
          <p className="text-white/80 text-sm">
            Última actualización: {new Date().toLocaleDateString('es-PY', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white">
        <div className="prose prose-lg max-w-none space-y-8">
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1. Introducción y Marco Legal
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-3">
              En PropTech, nos comprometemos a proteger su privacidad y sus datos personales de 
              acuerdo con la Ley N° 1266/2021 "De Protección de Datos Personales" de la República 
              del Paraguay y demás normativas aplicables.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm mb-3">
              Esta Política de Privacidad explica cómo recopilamos, utilizamos, almacenamos, 
              protegemos y procesamos su información personal cuando utiliza nuestra plataforma. 
              Al utilizar nuestros servicios, usted acepta las prácticas descritas en esta política.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <p className="text-gray-700 text-sm font-medium mb-2">Responsable del Tratamiento:</p>
              <p className="text-gray-600 text-xs leading-relaxed">
                <strong>Razón Social:</strong> [COMPLETAR - Razón Social de la Empresa]<br/>
                <strong>RUC:</strong> [COMPLETAR - RUC de la Empresa]<br/>
                <strong>Dirección:</strong> [COMPLETAR - Dirección Fiscal]<br/>
                <strong>Email:</strong> privacidad@proptech.com.py<br/>
                <strong>Teléfono:</strong> +595 [COMPLETAR]
              </p>
            </div>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. Información que Recopilamos
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3 text-sm">
              Recopilamos diferentes tipos de información:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-1 text-sm">Información de cuenta</h3>
                <p className="text-xs text-gray-600">Nombre, email, teléfono y otra información que nos proporcione al registrarse</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-1 text-sm">Información de propiedades</h3>
                <p className="text-xs text-gray-600">Datos de las propiedades que publique o consulte</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-1 text-sm">Información de navegación</h3>
                <p className="text-xs text-gray-600">Dirección IP, tipo de navegador, páginas visitadas</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-1 text-sm">Información de uso</h3>
                <p className="text-xs text-gray-600">Cómo utiliza nuestra plataforma, búsquedas realizadas</p>
              </div>
            </div>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Cómo Utilizamos su Información
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3 text-sm">
              Utilizamos su información para:
            </p>
            <ul className="space-y-1.5 text-gray-600 text-sm">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span>Proporcionar y mejorar nuestros servicios</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span>Comunicarnos con usted sobre su cuenta y nuestros servicios</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span>Personalizar su experiencia en la plataforma</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span>Enviar notificaciones importantes sobre cambios en nuestros términos o servicios</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span>Prevenir fraudes y mantener la seguridad de la plataforma</span>
              </li>
            </ul>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Compartir y Transferir Información
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-3">
              <strong>No vendemos su información personal.</strong> Solo compartimos su información 
              en las siguientes circunstancias:
            </p>
            <ul className="space-y-1.5 text-gray-600 text-sm mb-3">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span><strong>Proveedores de servicios:</strong> Con empresas que nos ayudan a operar 
                la plataforma (hosting, análisis, email), siempre bajo estrictos acuerdos de 
                confidencialidad y solo para los fines autorizados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley, orden judicial 
                o autoridad competente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span><strong>Agentes inmobiliarios:</strong> Cuando usted contacta con un agente, 
                compartimos la información necesaria para facilitar la comunicación</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span><strong>Con su consentimiento:</strong> En cualquier otro caso, solo con su 
                consentimiento explícito</span>
              </li>
            </ul>
            <p className="text-gray-600 leading-relaxed text-sm">
              Todos los terceros con los que compartimos información están contractualmente obligados 
              a mantener la confidencialidad de sus datos y utilizarlos únicamente para los fines 
              autorizados.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. Seguridad de los Datos
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Implementamos medidas de seguridad técnicas y organizativas para proteger su información 
              contra acceso no autorizado, pérdida o destrucción. Sin embargo, ningún sistema es 100% 
              seguro, y no podemos garantizar la seguridad absoluta de sus datos.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Sus Derechos según la Ley 1266/2021
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3 text-sm">
              De acuerdo con la Ley de Protección de Datos Personales de Paraguay, usted tiene 
              derecho a:
            </p>
            <ul className="space-y-1.5 text-gray-600 text-sm mb-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span><strong>Acceso:</strong> Obtener información sobre sus datos personales que 
                procesamos y acceder a los mismos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos 
                o incompletos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span><strong>Supresión/Eliminación:</strong> Solicitar la eliminación de sus 
                datos cuando ya no sean necesarios o cuando retire su consentimiento</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span><strong>Oposición:</strong> Oponerse al procesamiento de sus datos para 
                ciertos fines</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span><strong>Limitación:</strong> Solicitar la limitación del procesamiento de 
                sus datos en determinadas circunstancias</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado 
                y de uso común</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span><strong>Revocación del consentimiento:</strong> Retirar su consentimiento 
                en cualquier momento cuando el tratamiento se base en consentimiento</span>
              </li>
            </ul>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-gray-700 text-sm font-medium mb-2">Para ejercer sus derechos:</p>
              <p className="text-gray-600 text-xs leading-relaxed mb-2">
                Puede ejercer cualquiera de estos derechos enviando una solicitud por escrito a:
              </p>
              <p className="text-gray-700 text-xs">
                <strong>Email:</strong> privacidad@proptech.com.py<br/>
                <strong>Asunto:</strong> Ejercicio de Derechos de Protección de Datos<br/>
                <strong>Plazo de respuesta:</strong> Le responderemos dentro de los plazos establecidos por la ley
              </p>
            </div>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7. Cookies y Tecnologías de Seguimiento
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-3">
              Utilizamos cookies, píxeles, web beacons y tecnologías similares para mejorar su 
              experiencia, analizar el uso de la plataforma, personalizar el contenido y realizar 
              análisis estadísticos.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm mb-3">
              <strong>Tipos de cookies que utilizamos:</strong>
            </p>
            <ul className="space-y-1.5 text-gray-600 text-sm mb-3">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento de la 
                plataforma</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span><strong>Cookies de funcionalidad:</strong> Permiten recordar sus preferencias</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span><strong>Cookies analíticas:</strong> Nos ayudan a entender cómo se usa la 
                plataforma</span>
              </li>
            </ul>
            <p className="text-gray-600 leading-relaxed text-sm">
              Puede gestionar sus preferencias de cookies desde la configuración de su navegador. 
              Tenga en cuenta que deshabilitar ciertas cookies puede afectar la funcionalidad de 
              la plataforma.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              8. Cambios a esta Política
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre 
              cambios significativos mediante un aviso en la plataforma o por email.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              9. Conservación de Datos
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Conservaremos sus datos personales durante el tiempo necesario para cumplir con los 
              fines para los que fueron recopilados, cumplir con obligaciones legales, resolver 
              disputas y hacer cumplir nuestros acuerdos. Cuando los datos ya no sean necesarios, 
              los eliminaremos de forma segura de acuerdo con nuestros procedimientos internos.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              10. Menores de Edad
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos 
              intencionalmente información personal de menores de edad. Si descubrimos que hemos 
              recopilado información de un menor sin el consentimiento apropiado, tomaremos medidas 
              para eliminar dicha información de nuestros sistemas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              11. Contacto y Reclamos
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-3">
              Si tiene preguntas, dudas, comentarios o reclamos sobre esta Política de Privacidad 
              o sobre cómo manejamos sus datos personales, puede contactarnos a través de:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <p className="text-gray-700 text-sm">
                <strong>Email:</strong> privacidad@proptech.com.py<br/>
                <strong>Asunto:</strong> Consulta/Reclamo - Política de Privacidad<br/>
                <strong>Dirección:</strong> [COMPLETAR - Dirección de contacto]<br/>
                <strong>Teléfono:</strong> +595 [COMPLETAR]
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">
              Si no está satisfecho con nuestra respuesta, tiene derecho a presentar un reclamo 
              ante la autoridad de protección de datos competente en Paraguay.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
