"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import ImageComponent from "@/components/common/ImageComponent";
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
import { Package, Bell, MoreHorizontal, FileText, Plug, Mail } from "lucide-react";
import SidebarWidget from "./SidebarWidget";
import Logo from "@/components/common/Logo";

// Type assertion to resolve JSX compatibility issues
const LinkComponent = Link as any;

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

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others" | "catalogs";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Bloquear/desbloquear scroll del body cuando el sidebar móvil está abierto
  useEffect(() => {
    if (isMobile && isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isMobileOpen]);

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
    if (isMobile && isMobileOpen) {
      toggleMobileSidebar();
    }
  };

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others" | "catalogs"
  ) => (
    <ul className="flex flex-col gap-1">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSubmenuToggle(index, menuType);
                }
              }}
              aria-expanded={openSubmenu?.type === menuType && openSubmenu?.index === index}
              aria-controls={`submenu-${menuType}-${index}`}
              className={`group w-full flex items-center px-3 py-3 rounded-xl transition-all duration-300 hover:bg-blue-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "bg-blue-100 text-blue-700 shadow-sm border border-blue-200"
                  : "text-gray-700 hover:text-blue-600"
              } ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`w-6 h-6 flex items-center justify-center transition-colors duration-300 ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-blue-600"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="ml-3 text-sm font-medium text-left break-words leading-snug">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="ml-auto">
                  <svg className={`w-4 h-4 transition-transform duration-300 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index ? 'rotate-180' : ''
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              )}
            </button>
          ) : (
            nav.path && (
              <LinkComponent
                href={nav.path}
                className={`group w-full flex items-center px-3 py-3 rounded-xl transition-all duration-300 hover:bg-blue-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isActive(nav.path) 
                    ? "bg-blue-100 text-blue-700 shadow-sm border border-blue-200" 
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={handleMenuLinkClick}
                aria-current={isActive(nav.path) ? "page" : undefined}
              >
                <span
                  className={`w-6 h-6 flex items-center justify-center transition-colors duration-300 ${
                    isActive(nav.path)
                      ? "text-blue-600"
                      : "text-gray-500 group-hover:text-blue-600"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="ml-3 text-sm font-medium text-left break-words leading-snug">{nav.name}</span>
                )}
              </LinkComponent>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              id={`submenu-${menuType}-${index}`}
              className="transition-all duration-300"
              role="region"
              aria-label={`Submenú de ${nav.name}`}
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
                overflow: openSubmenu?.type === menuType && openSubmenu?.index === index ? "visible" : "hidden",
              }}
            >
              <ul className="mt-2 space-y-1 ml-6">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <LinkComponent
                      href={subItem.path}
                      className={`group flex items-center px-3 py-2 rounded-lg transition-all duration-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isActive(subItem.path)
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:text-blue-600"
                      }`}
                      onClick={handleMenuLinkClick}
                      aria-current={isActive(subItem.path) ? "page" : undefined}
                    >
                      <span className="text-xs">{subItem.name}</span>
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
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
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              isActive(subItem.path)
                                ? "bg-blue-200 text-blue-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            nuevo
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              isActive(subItem.path)
                                ? "bg-blue-200 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </LinkComponent>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Backdrop para móvil */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gradient-to-br from-white/80 via-blue-100/60 to-blue-200/40 transition-opacity duration-300"
          onClick={toggleMobileSidebar}
          aria-label="Cerrar menú"
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen transition-all duration-300
          ${isExpanded ? "w-64" : "w-20"}
          glass border-r border-white/20 dark:border-gray-600/20 shadow-modern-lg
          ${isMobile ?
            (isMobileOpen ? "translate-x-0" : "-translate-x-full") + " w-64" :
            ""
          }
        `}
        style={isMobile ? { transition: 'transform 0.3s', willChange: 'transform', height: '100dvh' } : {}}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Menú lateral"
      >
        {/* Botón cerrar solo en móvil */}
        {isMobile && (
          <button
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none shadow-lg border border-gray-200 dark:border-gray-600"
            onClick={toggleMobileSidebar}
            aria-label="Cerrar menú"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 px-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
            <LinkComponent href="/" className="flex items-center justify-center group">
              <div className="relative">
                <img
                  src="/images/logo/proptech.png"
                  alt="PropTech"
                  width={isMobile && isMobileOpen ? 160 : isExpanded ? 180 : 50}
                  height={isMobile && isMobileOpen ? 44 : 50}
                  className="object-contain transition-all duration-300 group-hover:scale-105"
                />
                {!isExpanded && !isMobile && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </LinkComponent>
          </div>
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="space-y-1">
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="pt-6 mt-6 border-t border-gray-200/60 dark:border-gray-700/60">
              <div className="px-2 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Catálogos</h3>
              </div>
              <div className="space-y-1">
                {renderMenuItems(catalogItems, "catalogs")}
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-gray-200/60 dark:border-gray-700/60">
              <div className="px-2 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Otros</h3>
              </div>
              <div className="space-y-1">
                {renderMenuItems(othersItems, "others")}
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;