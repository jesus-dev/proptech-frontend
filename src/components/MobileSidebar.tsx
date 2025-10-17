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
import { Package, Bell, MoreHorizontal, FileText, Mail } from "lucide-react";

interface NavItem {
  name: string;
  path?: string;
  icon?: React.ReactNode;
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    nuevo?: boolean;
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
    name: "Suscripciones",
    path: "/subscriptions",
    icon: <Package className="w-5 h-5" />,
    subItems: [
      {
        name: "Ver Planes",
        path: "/subscriptions",
      },
      {
        name: "Dashboard Admin",
        path: "/subscriptions/admin",
      },
      {
        name: "Gestionar Planes",
        path: "/subscriptions/admin/plans",
      },
      {
        name: "Gestionar Suscripciones",
        path: "/subscriptions/admin/subscriptions",
      },
      {
        name: "Agentes de Ventas",
        path: "/subscriptions/admin/sales-agents",
      },
      {
        name: "Dashboard Comisiones",
        path: "/subscriptions/admin/commissions",
      },
      {
        name: "Reportes",
        path: "/subscriptions/admin/reports",
      },
    ],
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
        name: "Permisos",
        path: "/auth/permissions",
      },
      {
        name: "Permisos de Menús",
        path: "/auth/menu-permissions",
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
    path: "/social",
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
];

const MobileSidebar: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others" | "catalogs";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
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

  const handleSubmenuToggle = (index: number, menuType: "main" | "others" | "catalogs") => {
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
    ["main", "others", "catalogs"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : menuType === "others" ? othersItems : catalogItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              const key = `${menuType}-${index}`;
              setOpenSubmenu({
                type: menuType as "main" | "others" | "catalogs",
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
    menuType: "main" | "others" | "catalogs"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
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
                className={`${
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
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
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

  if (!isMounted || !isMobileOpen) {
    return null;
  }

  const sidebarContent = (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 99998
        }}
        onClick={toggleMobileSidebar}
      />
      
      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '290px',
          height: '100vh',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          zIndex: 99999,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          transform: isAnimating ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s ease-out'
        }}
      >
        {/* Header con botón de cerrar */}
        <div className="py-4 px-3 flex items-center justify-between border-b border-gray-200">
          <Link href="/">
            <Image
              src="/images/logo/proptech.png"
              alt="PropTech"
              width={120}
              height={32}
              className="object-contain"
            />
          </Link>
          <button
            onClick={toggleMobileSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col overflow-y-auto duration-75 ease-out px-3">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="mb-4 text-xs uppercase flex leading-[20px] text-gray-400 justify-start pl-2">
                  Menu
                </h2>
                {renderMenuItems(navItems, "main")}
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
