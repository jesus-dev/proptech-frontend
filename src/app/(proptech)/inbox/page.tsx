"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, EnvelopeIcon, EyeSlashIcon, EyeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { apiClient } from '@/lib/api';

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId: number;
  createdAt: string;
  read?: boolean;
  propertyImage?: string;
}

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

export default function InboxPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

  useEffect(() => {
    setLoading(true);
    apiClient.get('/api/inquiries')
      .then(response => {
        const data = response.data;
        if (Array.isArray(data) && data.length > 0) {
          setInquiries(data);
        } else {
          // MOCK DE DATOS DE PRUEBA
          setInquiries([]); // No hay datos, no usar mock
        }
      })
      .catch(error => {
        console.error('❌ InboxPage: Error fetching inquiries:', error);
        // En caso de error, mostrar datos de prueba
        setInquiries([]); // No hay datos, no usar mock
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleExpand = (id: number) => {
    setExpanded(expanded === id ? null : id);
  };

  const toggleRead = async (inq: Inquiry) => {
    setUpdating(inq.id);
    try {
      const res = await apiClient.patch(`/api/inquiries/${inq.id}`, { read: !inq.read });
      if (res.status === 200) {
        setInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, read: !inq.read } : i));
      }
    } finally {
      setUpdating(null);
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    // Filtrar por estado (leído/no leído)
    if (filter === 'unread') return !inq.read;
    if (filter === 'read') return inq.read;
    
    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        inq.name.toLowerCase().includes(query) ||
        inq.email.toLowerCase().includes(query) ||
        inq.message.toLowerCase().includes(query) ||
        inq.propertyId.toString().includes(query)
      );
    }
    
    return true;
  });

  const unreadCount = inquiries.filter(inq => !inq.read).length;
  const totalCount = inquiries.length;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Partículas flotantes decorativas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-slate-400/15 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-gray-400/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-60 left-1/4 w-1.5 h-1.5 bg-zinc-400/15 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-80 right-1/3 w-1 h-1 bg-slate-300/15 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-96 left-1/2 w-2 h-2 bg-gray-300/10 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Header con glassmorphism mejorado */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-b border-white/30 dark:border-gray-700/60 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {/* Título con gradiente y animación */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-600 via-gray-700 to-zinc-800 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                <EnvelopeIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Bandeja de Entrada
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {inquiries.length} mensaje{inquiries.length !== 1 ? 's' : ''} • {unreadCount} no leído{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Stats con diseño moderno y profesional */}
            <div className="flex items-center gap-6">
              <div className="text-center group">
                <div className="text-4xl font-bold text-gray-900 dark:text-white group-hover:scale-110 transition-transform duration-300">{totalCount}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Total</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-bold text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform duration-300">{unreadCount}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Sin leer</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros con glassmorphism y efectos mejorados */}
      <div className="sticky top-24 z-10 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/30 dark:border-gray-700/60 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Buscar por nombre, email, mensaje..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/60 dark:bg-gray-800/60 border border-white/40 dark:border-gray-700/60 rounded-xl backdrop-blur-sm focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-sm transition-all duration-300 group-hover:bg-white/80 dark:group-hover:bg-gray-800/80"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 ${
                  filter === 'all' 
                    ? 'bg-gray-900 dark:bg-gray-700 text-white shadow-2xl' 
                    : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 border border-white/40 dark:border-gray-700/60 hover:border-gray-300'
                }`}
              >
                Todas ({totalCount})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 ${
                  filter === 'unread' 
                    ? 'bg-red-600 dark:bg-red-700 text-white shadow-2xl' 
                    : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 border border-white/40 dark:border-gray-700/60 hover:border-red-300'
                }`}
              >
                Sin leer ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 ${
                  filter === 'read' 
                    ? 'bg-green-600 dark:bg-green-700 text-white shadow-2xl' 
                    : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 border border-white/40 dark:border-gray-700/60 hover:border-green-300'
                }`}
              >
                Leídas ({totalCount - unreadCount})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal con animaciones de entrada */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-lg"></div>
              <p className="text-gray-600 dark:text-gray-400 animate-pulse">Cargando consultas...</p>
            </div>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-40 h-40 bg-gradient-to-br from-gray-100 via-slate-100 to-zinc-100 dark:from-gray-800 dark:via-slate-900 dark:to-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <EnvelopeIcon className="w-20 h-20 text-gray-400" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {filter === 'all' ? 'No hay consultas' : filter === 'unread' ? 'No hay consultas sin leer' : 'No hay consultas leídas'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              {filter === 'all' 
                ? 'Cuando recibas consultas sobre tus propiedades, aparecerán aquí.' 
                : filter === 'unread' 
                ? '¡Excelente! Has leído todas las consultas pendientes.' 
                : 'Aún no hay consultas marcadas como leídas.'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/60 overflow-hidden">
            {/* Email-like Header con diseño profesional */}
            <div className="bg-gradient-to-r from-gray-50 via-slate-50 to-zinc-50 dark:from-gray-800 dark:via-slate-900 dark:to-zinc-900 px-6 py-4 border-b border-white/40 dark:border-gray-700/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-700 dark:bg-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                    <EnvelopeIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Consultas de Propiedades</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Gestiona las consultas de tus propiedades</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">En línea</span>
                </div>
              </div>
            </div>

            {/* Lista de mensajes con animaciones de entrada */}
            {filteredInquiries.map((inq, index) => {
              const avatarColor = stringToColor(inq.name);
              const initial = inq.name?.[0]?.toUpperCase() || '?';
              
              return (
                <div key={inq.id} className="group" style={{ animationDelay: `${index * 100}ms` }}>
                  <div
                    className={`flex items-center gap-4 px-6 py-4 border-b border-white/30 dark:border-gray-700/50 hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.01] ${
                    expanded === inq.id ? 'bg-gray-100/90 dark:bg-gray-700/80' : ''
                  } ${!inq.read ? 'bg-blue-50/60 dark:bg-blue-900/20' : ''}`}
                    onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
                  >
                    {/* Avatar con gradiente y efectos avanzados */}
                    <div className="flex-shrink-0 relative group/avatar">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 group-hover/avatar:shadow-2xl"
                        style={{ 
                          background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}dd, ${avatarColor}bb)`,
                          boxShadow: `0 8px 25px ${avatarColor}50, 0 0 0 1px ${avatarColor}30`
                        }}
                      >
                        {initial}
                      </div>
                      {/* Indicador de estado con efectos */}
                      <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full border-3 border-white shadow-lg ${
                        inq.read ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                        {inq.name}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                      </div>
                    </div>

                    {/* Contenido principal con mejor tipografía */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-bold truncate ${
                          inq.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'
                        }`}>
                          {inq.name}
                        </h3>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {formatDate(inq.createdAt)}
                          </span>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                            inq.read 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                          }`}>
                            {inq.read ? 'Leído' : 'Nuevo'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 truncate font-medium">
                        {inq.email}
                      </p>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-500 italic truncate">
                        {inq.message.slice(0, 70)}{inq.message.length > 70 ? '…' : ''}
                      </p>
                    </div>

                    {/* Acciones con efectos avanzados */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={e => { e.stopPropagation(); toggleRead(inq); }}
                        className="p-3 rounded-2xl bg-white/60 dark:bg-gray-700/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 hover:-translate-y-1"
                        title={inq.read ? 'Marcar como no leído' : 'Marcar como leído'}
                      >
                        {inq.read ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Vista expandida con diseño profesional */}
                  {expanded === inq.id && (
                    <div className="px-6 py-6 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-white/40 dark:border-gray-700/60">
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                          Mensaje completo:
                        </h4>
                        <div className="bg-white/70 dark:bg-gray-800/70 p-6 rounded-2xl border border-white/40 dark:border-gray-700/60 backdrop-blur-sm shadow-lg">
                          <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line leading-relaxed text-sm">
                            {inq.message}
                          </p>
                        </div>
                      </div>
                      
                      {/* Botones de acción con diseño profesional */}
                      <div className="flex flex-wrap gap-4">
                        <button
                          onClick={() => toggleRead(inq)}
                          disabled={updating === inq.id}
                          className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 ${
                            inq.read 
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600' 
                              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                          } ${updating === inq.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {inq.read ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                          {inq.read ? 'Marcar no leído' : 'Marcar leído'}
                        </button>
                        
                        <a 
                          href={`tel:${inq.phone}`} 
                          className="flex items-center gap-3 px-6 py-3 bg-green-600 text-white rounded-2xl text-sm font-bold hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                        >
                          <PhoneIcon className="w-5 h-5" />
                          Llamar
                        </a>
                        
                        <a 
                          href={`mailto:${inq.email}`} 
                          className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                        >
                          <EnvelopeIcon className="w-5 h-5" />
                          Email
                        </a>
                        
                        <Link 
                          href={`/public/propiedad/${inq.propertyId}`}
                          className="flex items-center gap-3 px-6 py-3 bg-gray-700 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                        >
                          <HomeIcon className="w-5 h-5" />
                          Ver Propiedad
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 