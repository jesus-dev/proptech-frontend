import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    producto: [
      { name: 'Características', href: '#features' },
      { name: 'Precios', href: '#pricing' },
      { name: 'Demo', href: '#demo' },
      { name: 'API', href: '#api' },
    ],
    empresa: [
      { name: 'Acerca de', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Carreras', href: '#careers' },
      { name: 'Prensa', href: '#press' },
    ],
    soporte: [
      { name: 'Centro de Ayuda', href: '#help' },
      { name: 'Documentación', href: '#docs' },
      { name: 'Contacto', href: '#contact' },
      { name: 'Estado del Sistema', href: '#status' },
    ],
    legal: [
      { name: 'Privacidad', href: '#privacy' },
      { name: 'Términos', href: '#terms' },
      { name: 'Cookies', href: '#cookies' },
      { name: 'Seguridad', href: '#security' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        <div className="grid grid-cols-4 gap-2 sm:gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center mb-2">
              <img
                src="/proptech.png"
                alt="PropTech"
                className="h-4 sm:h-6 w-auto"
                style={{
                  filter: 'brightness(0) invert(1)',
                  WebkitFilter: 'brightness(0) invert(1)'
                }}
              />
            </Link>
            <p className="text-gray-400 mb-2 text-xs leading-tight">
              CRM inmobiliario completo.
            </p>
            <div className="flex space-x-2">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-1">Enlaces</h3>
            <ul className="space-y-1 text-xs">
              <li><Link href="/propiedades" className="text-gray-400 hover:text-white transition-colors">Propiedades</Link></li>
              <li><Link href="/asesores" className="text-gray-400 hover:text-white transition-colors">Asesores</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-1">Legal</h3>
            <ul className="space-y-1 text-xs">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacidad</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Términos</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Ayuda</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-4 sm:mt-8 pt-3 sm:pt-6 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-gray-400 text-xs text-center sm:text-left">© {currentYear} PropTech CRM. Todos los derechos reservados.</p>
            <div className="flex items-center">
              <span className="text-gray-400 text-xs">Hecho con ❤️ en Paraguay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


