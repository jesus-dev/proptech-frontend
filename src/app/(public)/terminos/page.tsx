import React from 'react';
import type { Metadata } from 'next';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Términos de Uso - PropTech Paraguay',
  description: 'Términos y condiciones de uso de la plataforma PropTech Paraguay',
  alternates: {
    canonical: 'https://proptech.com.py/terminos',
  },
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative -mt-[3.5rem] sm:-mt-16 min-h-[35vh] sm:min-h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pt-0">
        {/* Patrón de cuadrícula */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="property-grid-terminos" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="none" stroke="cyan" strokeWidth="0.5" opacity="0.3"/>
                <rect x="10" y="10" width="60" height="45" fill="none" stroke="cyan" strokeWidth="0.3" opacity="0.4" rx="2"/>
                <circle cx="20" cy="25" r="3" fill="cyan" opacity="0.3"/>
                <circle cx="35" cy="30" r="2" fill="cyan" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#property-grid-terminos)" />
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
              <InformationCircleIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Términos de Uso
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
              1. Aceptación de los Términos
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-3">
              Al acceder, navegar y utilizar la plataforma PropTech (en adelante, "la Plataforma"), 
              usted reconoce haber leído, entendido y acepta estar legalmente vinculado por estos 
              Términos y Condiciones de Uso (en adelante, "Términos"). Si no está de acuerdo con 
              alguno de estos términos, le recomendamos que no utilice nuestro servicio.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm">
              Estos Términos constituyen un acuerdo legal vinculante entre usted (el "Usuario") y 
              PropTech (la "Empresa", "nosotros", "nuestro"). El uso continuado de la Plataforma 
              constituye su aceptación de cualquier modificación a estos Términos.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. Descripción del Servicio y la Empresa
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-3">
              PropTech es una plataforma digital de intermediación que facilita la conexión entre 
              agentes inmobiliarios registrados y usuarios interesados en propiedades. Nuestra 
              plataforma permite a los agentes publicar anuncios de propiedades y a los usuarios 
              buscar, consultar y contactar con agentes.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <p className="text-gray-700 text-sm font-medium mb-2">Información de la Empresa:</p>
              <p className="text-gray-600 text-xs leading-relaxed">
                <strong>Razón Social:</strong> [COMPLETAR - Razón Social de la Empresa]<br/>
                <strong>RUC:</strong> [COMPLETAR - RUC de la Empresa]<br/>
                <strong>Dirección:</strong> [COMPLETAR - Dirección Fiscal]<br/>
                <strong>Teléfono:</strong> +595 [COMPLETAR]<br/>
                <strong>Email:</strong> contacto@proptech.com.py<br/>
                <strong>Jurisdicción:</strong> República del Paraguay
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm mt-4">
              PropTech actúa únicamente como intermediario tecnológico. No somos parte de ninguna 
              transacción inmobiliaria, ni garantizamos la disponibilidad, legalidad, exactitud o 
              calidad de las propiedades anunciadas.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Responsabilidad de los Anuncios y Limitación de Responsabilidad
            </h2>
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4 mt-4">
              <div className="flex items-start gap-4">
                <InformationCircleIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-900 mb-2">
                    Aviso Legal Importante
                  </h3>
                  <p className="text-sm text-amber-800 leading-relaxed mb-3">
                    PropTech actúa únicamente como plataforma tecnológica de intermediación. No somos 
                    parte de ninguna transacción inmobiliaria ni garantizamos la veracidad, exactitud, 
                    integridad, legalidad o calidad de la información, imágenes, documentos o datos 
                    proporcionados por los agentes inmobiliarios en sus anuncios.
                  </p>
                  <p className="text-sm text-amber-800 leading-relaxed mb-3">
                    Los anuncios publicados en esta plataforma son responsabilidad exclusiva y directa 
                    de los agentes inmobiliarios que los publican. Cada agente es responsable de asegurar 
                    que posee los derechos necesarios para ofrecer la propiedad y que toda la información 
                    proporcionada es veraz y actualizada.
                  </p>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    PropTech no garantiza la disponibilidad de las propiedades, ni asume responsabilidad 
                    alguna respecto de las negociaciones, transacciones, acuerdos, contratos o cualquier 
                    relación comercial realizada entre usuarios y agentes. Toda transacción se realiza 
                    directamente entre el usuario y el agente, sin intervención de PropTech.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm mt-4">
              El Usuario reconoce y acepta que debe realizar su propia verificación, investigación y 
              debida diligencia sobre cualquier propiedad de su interés, incluyendo pero no limitado a: 
              verificación de títulos de propiedad, estado legal, cargas, gravámenes, servidumbres, 
              condiciones físicas, permisos, y cualquier otro aspecto relevante. Se recomienda 
              encarecidamente consultar con profesionales independientes (abogados, arquitectos, 
              peritos) antes de tomar cualquier decisión de compra, arrendamiento o inversión.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Uso de la Plataforma
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3 text-sm">
              Usted se compromete a utilizar la plataforma de manera responsable y de acuerdo con la ley. 
              Está prohibido:
            </p>
            <ul className="space-y-1.5 text-gray-600 text-sm">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span>Publicar información falsa o engañosa</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span>Utilizar la plataforma para actividades ilegales</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span>Intentar acceder a áreas restringidas del sistema</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span>Interferir con el funcionamiento normal de la plataforma</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span>Publicar contenido ofensivo, discriminatorio o inapropiado</span>
              </li>
            </ul>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. Propiedad Intelectual
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Todo el contenido de la plataforma, incluyendo textos, gráficos, logos, iconos, imágenes, 
              clips de audio y software, es propiedad de PropTech o de sus proveedores de contenido y está 
              protegido por las leyes de propiedad intelectual.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Limitación de Responsabilidad y Exención de Garantías
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-3">
              EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY PARAGUAYA, PROPTECH Y SUS DIRECTORES, 
              EMPLEADOS, AGENTES, PROVEEDORES Y LICENCIANTES NO SERÁN RESPONSABLES DE NINGÚN 
              DAÑO DIRECTO, INDIRECTO, INCIDENTAL, ESPECIAL, CONSECUENTE O PUNITIVO, INCLUYENDO 
              PERO NO LIMITADO A:
            </p>
            <ul className="space-y-1.5 text-gray-600 text-sm mb-4 ml-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span>Pérdidas de datos, información o contenido</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span>Pérdida de beneficios, ingresos o oportunidades comerciales</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span>Daños resultantes de transacciones entre usuarios y agentes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span>Interrupciones del servicio, errores técnicos o fallos del sistema</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                <span>Acceso no autorizado o uso indebido de la plataforma</span>
              </li>
            </ul>
            <p className="text-gray-600 leading-relaxed text-sm">
              La Plataforma se proporciona "TAL CUAL" y "SEGÚN DISPONIBILIDAD", sin garantías de 
              ningún tipo, expresas o implícitas, incluyendo pero no limitado a garantías de 
              comerciabilidad, idoneidad para un propósito particular, o no violación de derechos. 
              No garantizamos que la Plataforma será ininterrumpida, segura, libre de errores, 
              virus u otros componentes dañinos.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7. Modificaciones de los Términos
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              PropTech se reserva el derecho, a su sola discreción, de modificar, actualizar o 
              reemplazar estos Términos en cualquier momento. Las modificaciones entrarán en vigor 
              inmediatamente después de su publicación en la Plataforma. Es su responsabilidad 
              revisar periódicamente estos Términos para estar informado de cualquier cambio. 
              El uso continuado de la Plataforma después de la publicación de modificaciones 
              constituye su aceptación de los Términos modificados.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              8. Ley Aplicable y Jurisdicción
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-3">
              Estos Términos se rigen e interpretan de acuerdo con las leyes de la República del 
              Paraguay, sin dar efecto a ningún principio de conflictos de leyes.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm">
              Para cualquier controversia, disputa o reclamación que surja de o esté relacionada 
              con estos Términos o el uso de la Plataforma, las partes se comprometen a intentar 
              resolver el asunto mediante negociación de buena fe. Si no se alcanza un acuerdo 
              dentro de un plazo razonable, las partes se someten a la jurisdicción exclusiva de 
              los tribunales competentes de [COMPLETAR - Ciudad, Paraguay], renunciando expresamente 
              a cualquier otro fuero que pudiera corresponderles.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              9. Disposiciones Generales
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-3">
              Si alguna disposición de estos Términos resulta ser inválida, ilegal o inaplicable, 
              las demás disposiciones permanecerán en pleno vigor y efecto. La invalidez de una 
              disposición no afectará la validez de las demás.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm mb-3">
              Estos Términos constituyen el acuerdo completo entre usted y PropTech respecto del 
              uso de la Plataforma y reemplazan todos los acuerdos o entendimientos previos o 
              contemporáneos, ya sean escritos u orales.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm">
              La falta de PropTech para hacer valer cualquier derecho o disposición de estos 
              Términos no constituirá una renuncia a tal derecho o disposición.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              10. Contacto
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-3">
              Si tiene preguntas, dudas o comentarios sobre estos Términos de Uso, puede 
              contactarnos a través de:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                <strong>Email:</strong> contacto@proptech.com.py<br/>
                <strong>Teléfono:</strong> +595 [COMPLETAR]<br/>
                <strong>Dirección:</strong> [COMPLETAR - Dirección de contacto]<br/>
                <strong>Formulario:</strong> Disponible en la sección de Contacto de la Plataforma
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
