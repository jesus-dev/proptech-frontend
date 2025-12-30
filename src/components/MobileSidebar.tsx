"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  BuildingIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  ListIcon,
  PieChartIcon,
  TableIcon,
  UserCircleIcon,
  DocsIcon,
  GroupIcon,
} from "../icons/index";
import { Package, Bell, MoreHorizontal, FileText, Mail, Globe, Rocket, Calendar, Wrench } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

interface NavItem {
  name: string;
  path?: string;
  icon?: React.ReactNode;
  requiredRole?: string | string[]; // Rol requerido para ver este item
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    nuevo?: boolean;
    requiredRole?: string | string[]; // Rol requerido para ver este subitem
  }[];
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    path: "/dash",
    icon: <PieChartIcon />,
  },
  {
    name: "Gestión de Propiedades",
    path: "/properties",
    icon: <BuildingIcon />,
    subItems: [
      {
        name: "Todas las Propiedades",
        path: "/properties",
      },
      {
        name: "Búsqueda rápida",
        path: "/properties/quick-search",
        nuevo: true,
      },
      {
        name: "Recomendador Inteligente",
        path: "/properties/recommendations",
        nuevo: true,
      },
      {
        name: "Estadísticas",
        path: "/properties/statistics",
      },
      {
        name: "Favoritos",
        path: "/properties/favorites",
      },
      {
        name: "Comparador de Propiedades",
        path: "/properties/compare",
        nuevo: true,
      },
      {
        name: "Historial de Precios",
        path: "/properties/price-history",
        nuevo: true,
      },
    ],
  },
  {
    name: "Gestión de Propiedades de Propietarios",
    path: "/owners-property",
    icon: <UserCircleIcon />,
  },
  {
    name: "Gestión Comercial",
    path: "/sales",
    icon: <ListIcon />,
    subItems: [
      {
        name: "Pipeline de Ventas",
        path: "/sales-pipeline",
      },
      {
        name: "Analytics de Ventas",
        path: "/sales-analytics",
      },
      {
        name: "Mapa de Calor",
        path: "/sales-analytics/heatmap",
        nuevo: true,
      },
      {
        name: "Registro de Ventas",
        path: "/sales",
      },
    ],
  },
  {
    name: "Alquileres Temporales",
    path: "/rentals",
    icon: <CalenderIcon />,
    subItems: [
      {
        name: "Todas las Reservas",
        path: "/rentals",
      },
      {
        name: "Calendario",
        path: "/rentals/calendar",
      },
      {
        name: "Nueva Reserva",
        path: "/rentals/new",
        nuevo: true,
      },
    ],
  },
  {
    name: "Agenda",
    path: "/agenda",
    icon: <CalenderIcon />,
    subItems: [
      {
        name: "Calendario",
        path: "/agenda/calendar",
      },
      {
        name: "Nueva Cita",
        path: "/agenda/new",
      },
      {
        name: "Mis Citas",
        path: "/agenda/my-appointments",
      },
      {
        name: "Citas del Día",
        path: "/agenda/today",
      },
      {
        name: "Reportes",
        path: "/agenda/reports",
      },
    ],
  },
  {
    name: "Visitas",
    path: "/visits",
    icon: <CalenderIcon />,
  },
  {
    name: "Contactos",
    path: "/contacts",
    icon: <UserCircleIcon />,
  },
  {
    name: "Gestión de Socios",
    path: "/partners",
    icon: <GroupIcon className="w-5 h-5" />,
    subItems: [
      {
        name: "Dashboard",
        path: "/partners/dashboard",
      },
      {
        name: "Todos los Socios",
        path: "/partners",
      },
      {
        name: "Planes y Productos",
        path: "/partners/plans",
        nuevo: true,
      },
      {
        name: "Suscripciones",
        path: "/partners/subscriptions",
        nuevo: true,
      },
      {
        name: "Facturas de Suscripción",
        path: "/partners/subscription-invoices",
        nuevo: true,
      },
      {
        name: "Notificaciones",
        path: "/partners/subscription-notifications",
        nuevo: true,
      },
      {
        name: "Registro de Pagos",
        path: "/partners/payments",
      },
    ],
  },
  {
    name: "Profesionales",
    path: "/professionals",
    icon: <Wrench className="w-5 h-5" />,
    subItems: [
      {
        name: "Todos los Profesionales",
        path: "/professionals",
      },
      {
        name: "Tipos de Servicio",
        path: "/professionals/service-types",
      },
    ],
  },
  {
    name: "Desarrollos",
    path: "/developments",
    icon: <BoxCubeIcon />,
    subItems: [
      {
        name: "Dashboard",
        path: "/developments/dashboard",
      },
      {
        name: "Todos los desarrollos",
        path: "/developments",
      },
      {
        name: "Gestionar Unidades",
        path: "/developments/units",
      },
      {
        name: "Gestionar Cuotas",
        path: "/developments/quotas",
      },
      {
        name: "Reservas",
        path: "/developments/reservations",
      },
    ],
  },
  {
    name: "Contratos",
    path: "/contracts",
    icon: <DocsIcon />,
    subItems: [
      {
        name: "Todos los contratos",
        path: "/contracts",
      },
      {
        name: "Plantillas",
        path: "/contracts/templates",
      }
    ],
  },
  {
    name: "Calendario",
    path: "/calendar",
    icon: <CalenderIcon />,
  },
  {
    name: "Autenticación",
    path: "/auth",
    icon: <UserCircleIcon />,
    subItems: [
      {
        name: "Usuarios",
        path: "/auth/users",
      },
      {
        name: "Roles",
        path: "/auth/roles",
      },
      {
        name: "Roles y Permisos",
        path: "/auth/role-permissions",
        nuevo: true,
      },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    name: "Mi Perfil",
    path: "/profile",
    icon: <UserCircleIcon />,
  },
  {
    name: "Red Social",
    path: "/verse",
    icon: (
      <div className="relative">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/>
        </svg>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
      </div>
    ),
  },
];

const proptechItems: NavItem[] = [
  {
    name: "Suscripciones",
    path: "/proptech/subscriptions",
    icon: <Rocket className="w-5 h-5" />,
    subItems: [
      {
        name: "Dashboard Admin",
        path: "/proptech/subscriptions/admin",
      },
      {
        name: "Gestionar Planes",
        path: "/proptech/subscriptions/admin/plans",
      },
      {
        name: "Gestionar Suscripciones",
        path: "/proptech/subscriptions/admin/subscriptions",
      },
      {
        name: "Agentes de Ventas",
        path: "/proptech/subscriptions/admin/sales-agents",
      },
      {
        name: "Dashboard Comisiones",
        path: "/proptech/subscriptions/admin/commissions",
      },
      {
        name: "Reportes",
        path: "/proptech/subscriptions/admin/reports",
      },
    ],
  },
  {
    name: "Citas Agendadas",
    path: "/proptech/appointments",
    icon: <Calendar className="w-5 h-5" />,
  },
];

const catalogItems: NavItem[] = [
  {
    name: "Catálogos",
    icon: <BoxCubeIcon />,
    subItems: [
      {
        name: "Agencias",
        path: "/catalogs/agencies",
      },
      {
        name: "Agentes",
        path: "/catalogs/agents",
      },
      {
        name: "Campañas",
        path: "/catalogs/campaigns",
      },
      {
        name: "Países",
        path: "/catalogs/countries",
      },
      {
        name: "Departamentos",
        path: "/catalogs/departments",
      },
      {
        name: "Ciudades",
        path: "/catalogs/cities",
      },
      {
        name: "Barrios",
        path: "/catalogs/neighborhoods",
      },
      {
        name: "Tipos de Propiedad",
        path: "/catalogs/property-types",
      },
      {
        name: "Servicios",
        path: "/catalogs/services",
      },
      {
        name: "Amenities",
        path: "/catalogs/amenities",
      },
      {
        name: "Monedas",
        path: "/catalogs/currencies",
      },
      {
        name: "Estados de Propiedad",
        path: "/catalogs/property-status",
      },
      {
        name: "Zonas de la Ciudad",
        path: "/catalogs/city-zones",
      },
      {
        name: "Facilidades Cercanas",
        path: "/catalogs/nearby-facilities",
      },
    ],
  },
  {
    name: "CMS - Sitio Web",
    path: "/cms",
    icon: <Globe className="w-5 h-5" />,
    subItems: [
      {
        name: "Panel CMS",
        path: "/cms",
      },
      {
        name: "Blog",
        path: "/cms/blog",
      },
      {
        name: "Eventos",
        path: "/cms/events",
      },
      {
        name: "Páginas Web",
        path: "/cms/pages",
      },
      {
        name: "Galería de Medios",
        path: "/cms/media",
      },
    ],
  },
];

const MobileSidebar: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const { hasRole, hasAnyRole } = useAuthContext();
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others" | "catalogs" | "proptech";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});

  // Función para verificar si el usuario puede ver un item del menú
  const canViewItem = (item: NavItem): boolean => {
    if (!item.requiredRole) return true;
    if (Array.isArray(item.requiredRole)) {
      return hasAnyRole(item.requiredRole);
    }
    return hasRole(item.requiredRole);
  };

  // Función para verificar si el usuario puede ver un subitem del menú
  const canViewSubItem = (subItem: NonNullable<NavItem['subItems']>[0]): boolean => {
    if (!subItem.requiredRole) return true;
    if (Array.isArray(subItem.requiredRole)) {
      return hasAnyRole(subItem.requiredRole);
    }
    return hasRole(subItem.requiredRole);
  };
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Controlar animación de entrada
  useEffect(() => {
    if (isMobileOpen) {
      // Solo animar al abrir
      setIsAnimating(true);
    } else {
      // Al cerrar, no animar
      setIsAnimating(false);
    }
  }, [isMobileOpen]);

  // Prevenir scroll del body cuando el sidebar esté abierto
  useEffect(() => {
    if (isMobileOpen) {
      // Guardar la posición del scroll
      const scrollY = window.scrollY;
      
      // Oscurecer la página ANTES de mover para ocultar el movimiento
      document.body.style.filter = 'brightness(0)';
      document.body.style.transition = 'none';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // Mover la página al inicio mientras está oscura
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
      
      // Restaurar el brillo después del movimiento
      setTimeout(() => {
        document.body.style.filter = '';
        document.body.style.transition = '';
      }, 50);
      
      return () => {
        document.body.style.filter = '';
        document.body.style.transition = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        // Restaurar la posición del scroll
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMobileOpen]);

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others" | "catalogs" | "proptech") => {
    const key = `${menuType}-${index}`;
    if (openSubmenu?.type === menuType && openSubmenu?.index === index) {
      setOpenSubmenu(null);
      setSubMenuHeight((prev) => ({ ...prev, [key]: 0 }));
    } else {
      setOpenSubmenu({ type: menuType, index });
      setTimeout(() => {
        if (subMenuRefs.current[key]) {
          const scrollHeight = subMenuRefs.current[key]?.scrollHeight || 0;
          setSubMenuHeight((prev) => ({
            ...prev,
            [key]: scrollHeight + 16,
          }));
        }
      }, 0);
    }
  };

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others", "catalogs", "proptech"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : menuType === "others" ? othersItems : menuType === "proptech" ? proptechItems : catalogItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              const key = `${menuType}-${index}`;
              setOpenSubmenu({
                type: menuType as "main" | "others" | "catalogs" | "proptech",
                index,
              });
              if (subMenuRefs.current[key]) {
                setSubMenuHeight((prev) => ({
                  ...prev,
                  [key]: subMenuRefs.current[key]?.scrollHeight || 0,
                }));
              }
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  const handleMenuLinkClick = () => {
    toggleMobileSidebar();
  };

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others" | "catalogs" | "proptech"
  ) => {
    // Filtrar items según el rol del usuario
    const filteredItems = navItems.filter(canViewItem);
    
    // Si no hay items después del filtro, no renderizar nada
    if (filteredItems.length === 0) {
      return null;
    }
    
    return (
    <ul className="flex flex-col gap-4">
      {filteredItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`relative flex items-center w-full gap-3 px-3 py-2 font-medium rounded-lg text-sm group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "bg-blue-50 text-blue-500 dark:bg-blue-500/[0.12] dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-100 group-hover:text-gray-700 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-300"
              } cursor-pointer justify-start`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "text-blue-500 dark:text-blue-400"
                    : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                {nav.icon}
              </span>
              <span className={`text-sm font-medium`}>{nav.name}</span>
              <ChevronDownIcon
                className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                  openSubmenu?.type === menuType &&
                  openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                }`}
              />
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`relative flex items-center w-full gap-3 px-3 py-2 font-medium rounded-lg text-sm group ${
                  isActive(nav.path) ? "bg-blue-50 text-blue-500 dark:bg-blue-500/[0.12] dark:text-blue-400" : "text-gray-700 hover:bg-gray-100 group-hover:text-gray-700 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-300"
                }`}
                onClick={handleMenuLinkClick}
              >
                <span
                  className={`${isActive(nav.path) ? "text-blue-500 dark:text-blue-400" : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400"}`}
                >
                  {nav.icon}
                </span>
                <span className={`text-sm font-medium`}>{nav.name}</span>
              </Link>
            )
          )}
          {nav.subItems && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.filter(canViewSubItem).map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`relative flex items-center w-full gap-3 px-3 py-2 font-medium rounded-lg text-sm ${
                        isActive(subItem.path) ? "bg-blue-50 text-blue-500 dark:bg-blue-500/[0.12] dark:text-blue-400" : "text-gray-700 hover:bg-gray-100 group-hover:text-gray-700 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-300"
                      }`}
                      onClick={handleMenuLinkClick}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full ${
                              isActive(subItem.path)
                                ? "bg-blue-200 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            new
                          </span>
                        )}
                        {subItem.nuevo && (
                          <span
                            className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full ${
                              isActive(subItem.path)
                                ? "bg-blue-200 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            nuevo
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full ${
                              isActive(subItem.path)
                                ? "bg-blue-200 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
    );
  };

  if (!isMounted || !isMobileOpen) {
    return null;
  }

  const sidebarContent = (
    <>
      {/* Backdrop mejorado */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[99998]"
        onClick={toggleMobileSidebar}
      />
      
      {/* Sidebar mejorado */}
      <aside
        className={`fixed top-0 left-0 w-80 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-[99999] flex flex-col transform transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header mejorado */}
        <div className="flex-shrink-0 py-3 px-4 flex items-center justify-between">
          <Link href="/dash" onClick={toggleMobileSidebar}>
            <Image
              src="/images/logo/proptech.png"
              alt="PropTech"
              width={150}
              height={40}
              style={{ width: 'auto', height: 'auto' }}
              className="object-contain hover:opacity-80 transition-opacity cursor-pointer"
            />
          </Link>
          <button
            onClick={toggleMobileSidebar}
            className="p-2 ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Contenido con scroll móvil */}
        <div 
          className="flex flex-col overflow-y-auto duration-300 ease-linear px-4"
          style={{
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              {/* Menú Principal */}
              <div>
                <h2 className="mb-4 text-xs uppercase flex leading-[20px] text-gray-400 justify-start">
                  Menu
                </h2>
                {renderMenuItems(navItems, "main")}
              </div>
              
              {/* PropTech */}
              <div>
                <h2 className="mb-4 text-xs uppercase flex leading-[20px] text-gray-400 justify-start">
                  PropTech
                </h2>
                {renderMenuItems(proptechItems, "proptech")}
              </div>
              
              {/* Catálogos */}
              <div>
                <h2 className="mb-4 text-xs uppercase flex leading-[20px] text-gray-400 justify-start">
                  Catálogos
                </h2>
                {renderMenuItems(catalogItems, "catalogs")}
              </div>
              
              {/* Otros */}
              <div>
                <h2 className="mb-4 text-xs uppercase flex leading-[20px] text-gray-400 justify-start">
                  Otros
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );

  return sidebarContent;
};

export default MobileSidebar;
