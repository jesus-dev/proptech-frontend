"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import PropertyCard from "./PropertyCard";
import PropertyListItem from "./PropertyListItem";
import { Property } from "./types";
import { useRouter } from "next/navigation";
import DeleteConfirmationDialog from "../../contracts/components/DeleteConfirmationDialog";
import Link from "next/link";
import { useAmenities } from "@/app/(proptech)/catalogs/amenities/hooks/useAmenities";
import { propertyService } from "../services/propertyService";
import { GlassWater, ParkingSquare, Wifi, Dumbbell, HelpCircle, MoveUpRight, Home, Shield, Leaf, Snowflake, Flame, PawPrint, Car, Star, Heart, MapPin, Building, Sun, Moon, Cloud, Droplets, Utensils, Phone, Mail, Globe, Download, Eye as EyeIcon, Clock, Award, Zap, Wrench, Bell, Pencil, Trash2 } from "lucide-react";
import { formatPrice, formatCurrency } from "@/lib/utils";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { ImageService } from '../services/imageService';

function getCurrencySymbolAndCode(currency: string) {
  switch ((currency || '').toUpperCase()) {
    case 'USD':
      return { symbol: '$', code: 'USD' };
    case 'PYG':
      return { symbol: '₲', code: 'PYG' };
    case 'ARS':
      return { symbol: '$', code: 'ARS' };
    case 'BRL':
      return { symbol: 'R$', code: 'BRL' };
    default:
      return { symbol: '', code: currency };
  }
}

interface PropertyListProps {
  properties: Property[];
  view: "grid" | "list";
  onPropertyDeleted?: (id: string) => void;
  onPropertyRemovedFromFavorites?: (id: string) => void;
  isFavoritesPage?: boolean;
}

// Iconos mejorados
const BuildingIcon = ({ className = "size-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 21V7L12 3L19 7V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21V13H15V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 9H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 9H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 13H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 13H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BedIcon = ({ className = "size-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 8H22V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 1V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 1V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 16H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BathIcon = ({ className = "size-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 12C4 9.79086 5.79086 8 8 8H16C18.2091 8 20 9.79086 20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 12V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 8V6C8 4.89543 8.89543 4 10 4H14C15.1046 4 16 4.89543 16 6V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AreaIcon = ({ className = "size-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 9H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 9H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 15H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 15H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StarIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);

const CrownIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 16L3 6L8.5 10L12 4L15.5 10L21 6L19 16H5M19 16C19 16.6 18.6 17 18 17H6C5.4 17 5 16.6 5 16M19 16V19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V16"/>
  </svg>
);

const CheckCircleIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const XCircleIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

const SearchIcon = ({ className = "size-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FilterIcon = ({ className = "size-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4C3 3.44772 3.44772 3 4 3H20C20.5523 3 21 3.44772 21 4V6.58579C21 6.851 20.8946 7.10536 20.7071 7.29289L14 14V21C14 21.5523 13.5523 22 13 22H11C10.4477 22 10 21.5523 10 21V14L3.29289 7.29289C3.10536 7.10536 3 6.851 3 6.58579V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

type Amenity = {
  id: string | number;
  name: string;
  icon?: string;
};

// Mapeo de nombre de amenity a icono Lucide (inglés y español)
const amenityIconMap: Record<string, React.ReactNode> = {
  pool: <GlassWater className="w-4 h-4" />, // piscina
  piscina: <GlassWater className="w-4 h-4" />, 
  gym: <Dumbbell className="w-4 h-4" />, // gimnasio
  gimnasio: <Dumbbell className="w-4 h-4" />,
  parking: <ParkingSquare className="w-4 h-4" />, // estacionamiento
  estacionamiento: <ParkingSquare className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />, // seguridad
  seguridad: <Shield className="w-4 h-4" />,
  garden: <Leaf className="w-4 h-4" />, // jardín
  jardin: <Leaf className="w-4 h-4" />,
  ac: <Snowflake className="w-4 h-4" />, // aire acondicionado
  aire: <Snowflake className="w-4 h-4" />, 
  heating: <Flame className="w-4 h-4" />, // calefacción
  calefaccion: <Flame className="w-4 h-4" />, 
  wifi: <Wifi className="w-4 h-4" />,
  pets: <PawPrint className="w-4 h-4" />, // mascotas
  mascotas: <PawPrint className="w-4 h-4" />,
  home: <Home className="w-4 h-4" />,
  casa: <Home className="w-4 h-4" />,
  ascensor: <MoveUpRight className="w-4 h-4" />, // elevator
  elevator: <MoveUpRight className="w-4 h-4" />,
  car: <Car className="w-4 h-4" />,
  estrella: <Star className="w-4 h-4" />,
  star: <Star className="w-4 h-4" />,
  corazon: <Heart className="w-4 h-4" />,
  heart: <Heart className="w-4 h-4" />,
  ubicacion: <MapPin className="w-4 h-4" />,
  location: <MapPin className="w-4 h-4" />,
  edificio: <Building className="w-4 h-4" />,
  building: <Building className="w-4 h-4" />,
  sol: <Sun className="w-4 h-4" />,
  sun: <Sun className="w-4 h-4" />,
  luna: <Moon className="w-4 h-4" />,
  moon: <Moon className="w-4 h-4" />,
  nube: <Cloud className="w-4 h-4" />,
  cloud: <Cloud className="w-4 h-4" />,
  gotas: <Droplets className="w-4 h-4" />,
  droplets: <Droplets className="w-4 h-4" />,
  utensilios: <Utensils className="w-4 h-4" />,
  utensils: <Utensils className="w-4 h-4" />,
  telefono: <Phone className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  mail: <Mail className="w-4 h-4" />,
  correo: <Mail className="w-4 h-4" />,
  globe: <Globe className="w-4 h-4" />,
  download: <Download className="w-4 h-4" />,
  eye: <EyeIcon className="w-4 h-4" />,
  clock: <Clock className="w-4 h-4" />,
  award: <Award className="w-4 h-4" />,
  zap: <Zap className="w-4 h-4" />,
  wrench: <Wrench className="w-4 h-4" />,
  bell: <Bell className="w-4 h-4" />,
};

// Función para renderizar el icono automáticamente
function getAmenityIcon(name: string) {
  if (!name) return <HelpCircle className="w-4 h-4" />;
  const key = name.toLowerCase();
  if (amenityIconMap[key]) return amenityIconMap[key];
  // Intentar buscar el componente Lucide por nombre capitalizado
  try {
    const Lucide = require("lucide-react");
    const Comp = Lucide[name.charAt(0).toUpperCase() + name.slice(1)];
    if (typeof Comp === "function") {
      return <Comp className="w-4 h-4" />;
    }
  } catch (e) {}
  return <HelpCircle className="w-4 h-4" />;
}

export default function PropertyList({ properties, view, onPropertyDeleted, onPropertyRemovedFromFavorites, isFavoritesPage }: PropertyListProps) {
  const imageService = new ImageService();
  
  // Función para convertir URLs relativas a URLs completas
  const getImageUrl = (imageUrl: string | null | undefined, propertyId?: string): string | null => {
    if (!imageUrl || imageUrl.trim() === '') return null;
    return imageService.getFullImageUrl(imageUrl, propertyId);
  };
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    propertyId: string;
    propertyTitle: string;
  }>({
    isOpen: false,
    propertyId: "",
    propertyTitle: "",
  });
  const [favoriteDialog, setFavoriteDialog] = useState<{
    isOpen: boolean;
    propertyId: string;
    propertyTitle: string;
  }>({
    isOpen: false,
    propertyId: "",
    propertyTitle: "",
  });
  const [updatingFavorites, setUpdatingFavorites] = useState<Set<string>>(new Set());
  const [deletingProperties, setDeletingProperties] = useState<Set<string>>(new Set());
  const { amenities: allAmenities } = useAmenities();

  const handleEdit = (id: string) => {
    router.push(`/properties/${id}/edit`);
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteDialog({
      isOpen: true,
      propertyId: id,
      propertyTitle: title,
    });
  };

  const handleRemoveFromFavorites = (id: string, title: string) => {
    setFavoriteDialog({
      isOpen: true,
      propertyId: id,
      propertyTitle: title,
    });
  };

  const confirmDelete = async () => {
    try {
      console.log('🔍 PropertyList: Deleting property with ID:', deleteDialog.propertyId);
      setDeletingProperties(prev => new Set(prev).add(deleteDialog.propertyId));
      
      await propertyService.deleteProperty(deleteDialog.propertyId);
      
      console.log('✅ PropertyList: Property deleted successfully');
      if (onPropertyDeleted) {
        onPropertyDeleted(deleteDialog.propertyId);
      }
    } catch (error) {
      console.error('❌ PropertyList: Error deleting property:', error);
      alert(`Error al eliminar la propiedad: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setDeletingProperties(prev => {
        const newSet = new Set(prev);
        newSet.delete(deleteDialog.propertyId);
        return newSet;
      });
      setDeleteDialog({ isOpen: false, propertyId: "", propertyTitle: "" });
    }
  };

  const confirmRemoveFromFavorites = async () => {
    try {
      console.log('🔍 PropertyList: Removing from favorites property with ID:', favoriteDialog.propertyId);
      setUpdatingFavorites(prev => new Set(prev).add(favoriteDialog.propertyId));
      
      await propertyService.removeFromFavorites(favoriteDialog.propertyId);
      
      console.log('✅ PropertyList: Property removed from favorites successfully');
      if (onPropertyRemovedFromFavorites) {
        onPropertyRemovedFromFavorites(favoriteDialog.propertyId);
      }
    } catch (error) {
      console.error('❌ PropertyList: Error removing from favorites:', error);
      alert(`Error al quitar de favoritos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setUpdatingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(favoriteDialog.propertyId);
        return newSet;
      });
      setFavoriteDialog({ isOpen: false, propertyId: "", propertyTitle: "" });
    }
  };

  function getAmenitiesForProperty(property: Property) {
    if (property.amenitiesDetails && property.amenitiesDetails.length > 0) {
      return property.amenitiesDetails;
    }
    if (Array.isArray(property.amenities) && allAmenities?.length > 0) {
      return property.amenities
        .map((id: number) => allAmenities.find((a: any) => a.id === id))
        .filter((amenity): amenity is any => amenity !== undefined);
    }
    return [];
  }

  if (properties && properties.length > 0) {
    const prop1 = properties.find(p => String(p.id) === '1');
    if (prop1) {
       
      console.log('Propiedad 1:', prop1);
       
      console.log('AmenitiesDetails de propiedad 1:', prop1.amenitiesDetails);
    }
    
    // Debug: verificar monedas en las primeras 3 propiedades - comentado para reducir ruido
    // console.log('💵 PropertyList - Monedas en primeras 3 propiedades:', properties.slice(0, 3).map(p => ({
    //   id: p.id,
    //   title: p.title,
    //   price: p.price,
    //   currency: p.currency,
    //   currencyType: typeof p.currency,
    //   formatted: formatCurrency(p.price, p.currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    // })));
  }

  if (view === "grid") {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full min-w-0 overflow-x-auto">
          {properties.map((property) => {
            return (
            <div
              key={property.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200 group"
            >
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {(() => {
                  const mainImage = property.featuredImage || (property.images && property.images[0]);
                  const fullImageUrl = getImageUrl(mainImage, property.id);
                  return fullImageUrl ? (
                    <img
                      src={fullImageUrl}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        // Silently hide the image if it fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BuildingIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  );
                })()}
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                    property.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                  }`}>
                    {property.status === "active" ? (
                      <>
                        <CheckCircleIcon className="w-3 h-3" />
                        Activa
                      </>
                    ) : (
                      "Inactiva"
                    )}
                  </span>
                </div>

                {/* Featured Badge */}
                {property.featured && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                      <StarIcon className="w-3 h-3" />
                      Destacada
                    </span>
                  </div>
                )}

                {/* Premium Badge */}
                {property.premium && (
                  <div className="absolute top-12 right-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded-full">
                      <CrownIcon className="w-3 h-3" />
                      Premium
                    </span>
                  </div>
                )}
              </div>

              {/* Property Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {property.title}
                </h3>
                
                {/* TIPO AQUI */}
                <div className="mb-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    {property.propertyType || property.type || "Sin tipo"}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {property.address}, {property.city}
                </p>

                {/* Property Features */}
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                  {property.bedrooms && (
                    <div className="flex items-center gap-1">
                      <BedIcon className="w-4 h-4" />
                      <span>{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-1">
                      <BathIcon className="w-4 h-4" />
                      <span>{property.bathrooms}</span>
                    </div>
                  )}
                  {property.area && (
                    <div className="flex items-center gap-1">
                      <AreaIcon className="w-4 h-4" />
                      <span>{property.area}m²</span>
                    </div>
                  )}
                </div>
                {/* Amenities (limitados) */}
                {(() => {
                  const MAX_VISIBLE_AMENITIES = 3;
                  const amenities = getAmenitiesForProperty(property);
                  const visibleAmenities = amenities.slice(0, MAX_VISIBLE_AMENITIES);
                  const hiddenAmenities = amenities.slice(MAX_VISIBLE_AMENITIES);
                  return (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {visibleAmenities.map((amenity: Amenity) => (
                        <span key={amenity.id} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          {getAmenityIcon(amenity.name)}
                          {amenity.name}
                        </span>
                      ))}
                      {hiddenAmenities.length > 0 && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-200 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200 cursor-pointer"
                          title={hiddenAmenities.map((a: Amenity) => a.name).join(', ')}
                        >
                          +{hiddenAmenities.length} más
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* Price */}
                <div className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {formatCurrency(property.price, property.currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/properties/${property.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                  >
                    <EyeIcon className="w-6 h-6" />
                    Ver
                  </Link>
                  <Link
                    href={`/properties/${property.id}/edit`}
                    className="inline-flex items-center justify-center p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Pencil className="w-6 h-6" />
                  </Link>
                  <button
                    onClick={() => isFavoritesPage ? handleRemoveFromFavorites(property.id, property.title) : handleDelete(property.id, property.title)}
                    disabled={isFavoritesPage ? updatingFavorites.has(String(property.id)) : deletingProperties.has(String(property.id))}
                    className={`inline-flex items-center justify-center p-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors ${
                      (isFavoritesPage ? updatingFavorites.has(String(property.id)) : deletingProperties.has(String(property.id))) ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    title={isFavoritesPage ? "Quitar de favoritos" : "Eliminar propiedad"}
                  >
                    {(isFavoritesPage ? updatingFavorites.has(String(property.id)) : deletingProperties.has(String(property.id))) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : isFavoritesPage ? (
                      <Heart className="w-6 h-6" />
                    ) : (
                      <Trash2 className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>

        {/* Confirmation Dialogs */}
        {isFavoritesPage ? (
          <DeleteConfirmationDialog
            isOpen={favoriteDialog.isOpen}
            onClose={() => setFavoriteDialog({ isOpen: false, propertyId: "", propertyTitle: "" })}
            onConfirm={confirmRemoveFromFavorites}
            title="Quitar de Favoritos"
            message={`¿Estás seguro de que quieres quitar "${favoriteDialog.propertyTitle}" de tus favoritos?`}
            confirmText="Quitar de Favoritos"
            cancelText="Cancelar"
          />
        ) : (
          <DeleteConfirmationDialog
            isOpen={deleteDialog.isOpen}
            onClose={() => setDeleteDialog({ isOpen: false, propertyId: "", propertyTitle: "" })}
            onConfirm={confirmDelete}
            title="Eliminar Propiedad"
            message={`¿Estás seguro de que quieres eliminar la propiedad "${deleteDialog.propertyTitle}"? Esta acción no se puede deshacer.`}
            confirmText="Eliminar"
            cancelText="Cancelar"
          />
        )}
      </>
    );
  }

  // List View
  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto w-full min-w-0">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Propiedad
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Características
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amenities
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {(() => {
                          const mainImage = property.featuredImage || (property.images && property.images[0]);
                          const fullImageUrl = getImageUrl(mainImage, property.id);
                          return fullImageUrl ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={fullImageUrl}
                              alt={property.title}
                              onError={(e) => {
                                // Silently hide the image if it fails to load
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <BuildingIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          );
                        })()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {property.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {property.featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                              <StarIcon className="w-3 h-3" />
                              Destacada
                            </span>
                          )}
                          {property.premium && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded-full">
                              <CrownIcon className="w-3 h-3" />
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {property.address}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {property.city}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {property.bedrooms && (
                        <div className="flex items-center gap-1">
                          <BedIcon className="w-4 h-4" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center gap-1">
                          <BathIcon className="w-4 h-4" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      {property.area && (
                        <div className="flex items-center gap-1">
                          <AreaIcon className="w-4 h-4" />
                          <span>{property.area}m²</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const amenities = getAmenitiesForProperty(property);
                      const MAX_VISIBLE = 2;
                      const visibleAmenities = amenities.slice(0, MAX_VISIBLE);
                      const hiddenAmenities = amenities.slice(MAX_VISIBLE);
                      return (
                        <div className="flex flex-wrap gap-2">
                          {visibleAmenities.map((amenity: Amenity) => (
                            <span key={amenity.id} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                              {getAmenityIcon(amenity.name)}
                              {amenity.name}
                            </span>
                          ))}
                          {hiddenAmenities.length > 0 && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-200 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200 cursor-pointer"
                              title={hiddenAmenities.map((a: Amenity) => a.name).join(', ')}
                            >
                              +{hiddenAmenities.length} más
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(property.price, property.currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                      property.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                    }`}>
                      {property.status === "active" ? (
                        <>
                          <CheckCircleIcon className="w-3 h-3" />
                          Activa
                        </>
                      ) : (
                        "Inactiva"
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/properties/${property.id}`}
                        className="inline-flex items-center justify-center p-3 text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <EyeIcon className="w-6 h-6" />
                      </Link>
                      <Link
                        href={`/properties/${property.id}/edit`}
                        className="inline-flex items-center justify-center p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-6 h-6" />
                      </Link>
                      <button
                        onClick={() => isFavoritesPage ? handleRemoveFromFavorites(property.id, property.title) : handleDelete(property.id, property.title)}
                        disabled={isFavoritesPage ? updatingFavorites.has(String(property.id)) : deletingProperties.has(String(property.id))}
                        className={`inline-flex items-center justify-center p-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors ${
                          (isFavoritesPage ? updatingFavorites.has(String(property.id)) : deletingProperties.has(String(property.id))) ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        title={isFavoritesPage ? "Quitar de favoritos" : "Eliminar propiedad"}
                      >
                        {(isFavoritesPage ? updatingFavorites.has(String(property.id)) : deletingProperties.has(String(property.id))) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : isFavoritesPage ? (
                          <Heart className="w-6 h-6" />
                        ) : (
                          <Trash2 className="w-6 h-6" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      {isFavoritesPage ? (
        <DeleteConfirmationDialog
          isOpen={favoriteDialog.isOpen}
          onClose={() => setFavoriteDialog({ isOpen: false, propertyId: "", propertyTitle: "" })}
          onConfirm={confirmRemoveFromFavorites}
          title="Quitar de Favoritos"
          message={`¿Estás seguro de que quieres quitar "${favoriteDialog.propertyTitle}" de tus favoritos?`}
          confirmText="Quitar de Favoritos"
          cancelText="Cancelar"
        />
      ) : (
        <DeleteConfirmationDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, propertyId: "", propertyTitle: "" })}
          onConfirm={confirmDelete}
          title="Eliminar Propiedad"
          message={`¿Estás seguro de que quieres eliminar la propiedad "${deleteDialog.propertyTitle}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      )}
    </>
  );
} 