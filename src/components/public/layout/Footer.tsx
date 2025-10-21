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
    <footer className="bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/15 via-indigo-900/15 to-blue-950/15"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-700/10 to-indigo-700/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-indigo-700/10 to-blue-800/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 md:py-16 lg:py-20 relative">
        {/* Mobile Layout - Compacto */}
        <div className="block sm:hidden">
          {/* Logo y descripción compacta */}
          <div className="text-center mb-6">
            {/* Logo 76px en mobile - Actualizado */}
            <Link href="/" className="flex justify-center mb-2 group">
              <img
                src="/proptech.png"
                alt="PropTech"
                className="transition-transform duration-300 group-hover:scale-105"
                style={{
                  height: '76px',
                  width: 'auto',
                  filter: 'brightness(0) invert(1)',
                  WebkitFilter: 'brightness(0) invert(1)',
                  maxHeight: '76px',
                  minHeight: '76px'
                }}
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              PropTech revoluciona el sector inmobiliario
            </p>
          </div>

          {/* Enlaces en grid compacto */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-bold text-white mb-3">Enlaces</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/propiedades" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                    Propiedades
                  </Link>
                </li>
                <li>
                  <Link href="/asesores" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                    Asesores
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-3">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#privacy" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#terms" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link href="#help" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                    Ayuda
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Redes sociales compactas */}
          <div className="flex justify-center space-x-3 mb-6">
            <a 
              href="#" 
              className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-300 hover:bg-blue-500 hover:text-white transition-all duration-300 hover:scale-110 border border-white/20" 
              aria-label="Twitter"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
            </a>
            <a 
              href="#" 
              className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-300 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-110 border border-white/20" 
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
            <a 
              href="#" 
              className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-300 hover:bg-pink-600 hover:text-white transition-all duration-300 hover:scale-110 border border-white/20" 
              aria-label="Instagram"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a 
              href="#" 
              className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-300 hover:scale-110 border border-white/20" 
              aria-label="YouTube"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

        {/* Desktop Layout - Completo */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-6 group">
              <img
                src="/proptech.png"
                alt="PropTech"
                className="h-8 sm:h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                style={{
                  filter: 'brightness(0) invert(1)',
                  WebkitFilter: 'brightness(0) invert(1)'
                }}
              />
            </Link>
            <p className="text-gray-300 mb-6 text-base leading-relaxed max-w-md">
              PropTech revoluciona la forma de trabajar en el sector inmobiliario.
              Gestioná propiedades, clientes y operaciones desde una única plataforma conectada, automatizada y lista para escalar tu negocio.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-300 hover:bg-blue-500 hover:text-white transition-all duration-300 hover:scale-110 border border-white/20" 
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-300 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-110 border border-white/20" 
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-300 hover:bg-pink-600 hover:text-white transition-all duration-300 hover:scale-110 border border-white/20" 
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-300 hover:scale-110 border border-white/20" 
                aria-label="YouTube"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Enlaces */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 relative inline-block">
              Enlaces
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/propiedades" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Propiedades
                </Link>
              </li>
              <li>
                <Link href="/asesores" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Asesores
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Precios
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 relative inline-block">
              Legal
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#privacy" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="#terms" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Términos
                </Link>
              </li>
              <li>
                <Link href="#help" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Ayuda
                </Link>
              </li>
              <li>
                <Link href="#security" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Seguridad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 sm:mt-12 pt-4 sm:pt-8 border-t border-white/10">
          {/* Mobile Layout */}
          <div className="block sm:hidden text-center space-y-3">
            <p className="text-gray-300 text-xs">
              © {currentYear} PropTech. Todos los derechos reservados.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-gray-400 text-xs">Powered by</span>
              <a 
                href="https://ontech.com.py" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-transform duration-300 hover:scale-110"
              >
                <img
                  src="/images/logo/OnTech.png"
                  alt="OnTech"
                  style={{
                    height: '56px',
                    width: 'auto',
                    filter: 'brightness(0) invert(1)',
                    WebkitFilter: 'brightness(0) invert(1)',
                    maxHeight: '56px',
                    minHeight: '56px'
                  }}
                />
              </a>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <span className="text-gray-300 text-xs">Hecho con</span>
              <span className="text-red-500 text-sm animate-pulse">❤️</span>
              <span className="text-gray-300 text-xs">en Paraguay</span>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <p className="text-gray-300 text-sm text-center md:text-left">
                © {currentYear} PropTech. Todos los derechos reservados.
              </p>
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 text-sm">Powered by</span>
                <a 
                  href="https://ontech.com.py" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform duration-300 hover:scale-110"
                >
                  <img
                    src="/images/logo/OnTech.png"
                    alt="OnTech"
                    className="h-10 w-auto"
                    style={{
                      filter: 'brightness(0) invert(1)',
                      WebkitFilter: 'brightness(0) invert(1)'
                    }}
                  />
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 text-sm">Hecho con</span>
              <span className="text-red-500 text-lg animate-pulse">❤️</span>
              <span className="text-gray-300 text-sm">en OnTech Paraguay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


