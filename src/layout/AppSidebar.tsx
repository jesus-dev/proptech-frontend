"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useSidebar } from "../context/SidebarContext";
import MobileSidebar from "../components/MobileSidebar";
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    if (isMobile) {
      toggleMobileSidebar();
    }
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
              } cursor-pointer ${
                isMobile 
                  ? "justify-start"
                  : !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
              }`}
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
              {(isMobile || isExpanded || isHovered) && (
                <span className={`text-sm font-medium`}>{nav.name}</span>
              )}
              {(isMobile || isExpanded || isHovered) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
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
                {(isMobile || isExpanded || isHovered) && (
                  <span className={`text-sm font-medium`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isMobile || isExpanded || isHovered) && (
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
                          <span className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full ${isActive(subItem.path) ? "bg-blue-200 text-blue-800" : "bg-green-100 text-green-800"}`}>
                            new
                          </span>
                        )}
                        {subItem.nuevo && (
                          <span className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full ${isActive(subItem.path) ? "bg-blue-200 text-blue-800" : "bg-green-100 text-green-800"}`}>
                            nuevo
                          </span>
                        )}
                        {subItem.pro && (
                          <span className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full ${isActive(subItem.path) ? "bg-blue-200 text-blue-800" : "bg-green-100 text-green-800"}`}>
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

  // Debug - removed for production

  const sidebarContent = (
    <>
      {/* Backdrop para móvil */}
      {isMobile && isMobileOpen && (
        <div
          className="sidebar-backdrop-fixed bg-black bg-opacity-50"
          onClick={toggleMobileSidebar}
        />
      )}
      <aside
        className={`flex flex-col px-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 transition-all duration-300 ease-in-out 
          ${
            isMobile 
              ? `sidebar-mobile-fixed`
              : `lg:mt-0 z-30 flex-shrink-0 fixed ${
                  isExpanded || isHovered
                    ? "w-[290px]"
                    : "w-[90px]"
                }`
          }`}
        style={{
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch' as any,
          height: '100vh',
          left: isMobile ? (isMobileOpen ? '0px' : '-290px') : undefined
        }}
        onMouseEnter={() => !isMobile && !isExpanded && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        <div
          className={`py-6 px-4 flex ${
            isMobile 
              ? "justify-start" 
              : !isExpanded && !isHovered 
                ? "lg:justify-center" 
                : "justify-start"
          }`}
        >
          <Link href="/dash">
            {isMobile || isExpanded || isHovered ? (
              <Image
                src="/images/logo/proptech.png"
                alt="PropTech"
                width={150}
                height={40}
                style={{ width: 'auto', height: 'auto' }}
                className="object-contain hover:opacity-80 transition-opacity cursor-pointer"
              />
            ) : (
              <Image
                src="/images/logo/proptech.png"
                alt="PropTech"
                width={32}
                height={32}
                style={{ width: 'auto', height: 'auto' }}
                className="object-contain hover:opacity-80 transition-opacity cursor-pointer"
              />
            )}
          </Link>
        </div>
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear px-4">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    isMobile 
                      ? "justify-start"
                      : !isExpanded && !isHovered
                        ? "lg:justify-center"
                        : "justify-start"
                  }`}
                >
                  {isMobile || isExpanded || isHovered ? (
                    "Menu"
                  ) : (
                    "•••"
                  )}
                </h2>
                {renderMenuItems(navItems, "main")}
              </div>
              
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    isMobile 
                      ? "justify-start"
                      : !isExpanded && !isHovered
                        ? "lg:justify-center"
                        : "justify-start"
                  }`}
                >
                  {isMobile || isExpanded || isHovered ? (
                    "Catálogos"
                  ) : (
                    "•••"
                  )}
                </h2>
                {renderMenuItems(catalogItems, "catalogs")}
              </div>
              
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    isMobile 
                      ? "justify-start"
                      : !isExpanded && !isHovered
                        ? "lg:justify-center"
                        : "justify-start"
                  }`}
                >
                  {isMobile || isExpanded || isHovered ? (
                    "Otros"
                  ) : (
                    "•••"
                  )}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );

  // En móvil, usar el componente MobileSidebar separado
  if (isMobile) {
    return <MobileSidebar />;
  }

  // En desktop, renderizar normalmente
  return sidebarContent;
};

export default AppSidebar;