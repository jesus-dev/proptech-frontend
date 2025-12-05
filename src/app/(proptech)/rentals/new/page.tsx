"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Home,
  User,
  Mail,
  Phone,
  Users,
  DollarSign,
  FileText,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Building,
  Search,
} from "lucide-react";
import { temporalRentalService, CreateRentalDTO } from "../services/temporalRentalService";
import { rentalPropertyService, RentalProperty } from "../services/rentalPropertyService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";

export default function NewRentalPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Estados del formulario
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [properties, setProperties] = useState<RentalProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<RentalProperty[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [numberOfNights, setNumberOfNights] = useState(1);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestDocument, setGuestDocument] = useState("");
  const [pricePerNight, setPricePerNight] = useState<number | undefined>(undefined);
  const [cleaningFee, setCleaningFee] = useState<number | undefined>(undefined);
  const [discount, setDiscount] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState("PYG");
  const [specialRequests, setSpecialRequests] = useState("");
  const [notes, setNotes] = useState("");
  
  // Estados de validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Cargar propiedades
  useEffect(() => {
    loadProperties();
  }, []);

  // Filtrar propiedades según el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProperties(properties);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = properties.filter(rp => {
        const prop = rp.property;
        return (
          prop.title?.toLowerCase().includes(term) ||
          prop.address?.toLowerCase().includes(term) ||
          prop.city?.toLowerCase().includes(term)
        );
      });
      setFilteredProperties(filtered);
    }
  }, [searchTerm, properties]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.property-search-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calcular número de noches
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNumberOfNights(diffDays > 0 ? diffDays : 1);
      
      // Verificar disponibilidad automáticamente
      if (selectedProperty && diffDays > 0) {
        checkAvailability();
      }
    } else {
      setNumberOfNights(1);
      setIsAvailable(null);
      setAvailabilityChecked(false);
    }
  }, [checkInDate, checkOutDate, selectedProperty]);

  // Cargar precio cuando se selecciona propiedad
  useEffect(() => {
    if (selectedProperty) {
      const rentalProp = properties.find(rp => rp.propertyId.toString() === selectedProperty);
      if (rentalProp) {
        setPricePerNight(rentalProp.pricePerNight);
        setCleaningFee(rentalProp.cleaningFee || undefined);
        setCurrency(rentalProp.currency || "PYG");
      }
    }
  }, [selectedProperty, properties]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      console.log("🔄 Cargando propiedades de alquiler temporal...");
      const rentalProps = await rentalPropertyService.getActiveRentalProperties();
      console.log("📦 Propiedades recibidas:", rentalProps);
      console.log("📊 Total de propiedades:", rentalProps.length);
      
      setProperties(rentalProps);
      setFilteredProperties(rentalProps);
      
      if (rentalProps.length === 0) {
        console.warn("⚠️ No se encontraron propiedades configuradas para alquiler temporal");
        toast({
          title: "Sin propiedades disponibles",
          description: "No hay propiedades configuradas para alquiler temporal. Ve a Propiedades > Nueva/Editar y activa la opción de Alquiler Temporal.",
        });
      } else {
        console.log("✅ Propiedades cargadas exitosamente");
        rentalProps.forEach((rp, idx) => {
          console.log(`  ${idx + 1}. ${rp.property?.title || 'Sin título'} (ID: ${rp.propertyId})`);
        });
      }
    } catch (error) {
      console.error("❌ Error loading rental properties:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las propiedades de alquiler",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!selectedProperty || !checkInDate || !checkOutDate) {
      return;
    }

    try {
      const available = await temporalRentalService.checkAvailability(
        parseInt(selectedProperty),
        checkInDate,
        checkOutDate
      );
      setIsAvailable(available);
      setAvailabilityChecked(true);
      
      if (!available) {
        setErrors({
          ...errors,
          dates: "La propiedad no está disponible en estas fechas",
        });
      } else {
        const newErrors = { ...errors };
        delete newErrors.dates;
        setErrors(newErrors);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setIsAvailable(false);
      setAvailabilityChecked(true);
    }
  };

  const calculateTotal = () => {
    if (!pricePerNight || numberOfNights <= 0) return 0;
    const subtotal = pricePerNight * numberOfNights;
    const cleaning = cleaningFee || 0;
    const disc = discount || 0;
    return subtotal + cleaning - disc;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedProperty) {
      newErrors.property = "Debes seleccionar una propiedad";
    }

    if (!checkInDate) {
      newErrors.checkInDate = "La fecha de check-in es requerida";
    }

    if (!checkOutDate) {
      newErrors.checkOutDate = "La fecha de check-out es requerida";
    }

    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      if (checkOut <= checkIn) {
        newErrors.checkOutDate = "La fecha de check-out debe ser posterior al check-in";
      }
    }

    if (!guestName.trim()) {
      newErrors.guestName = "El nombre del huésped es requerido";
    }

    if (!guestPhone.trim()) {
      newErrors.guestPhone = "El teléfono del huésped es requerido";
    }

    if (guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      newErrors.guestEmail = "El email no es válido";
    }

    if (numberOfGuests < 1) {
      newErrors.numberOfGuests = "Debe haber al menos 1 huésped";
    }

    if (!pricePerNight || pricePerNight <= 0) {
      newErrors.pricePerNight = "El precio por noche debe ser mayor a 0";
    }

    if (availabilityChecked && !isAvailable) {
      newErrors.dates = "La propiedad no está disponible en estas fechas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: "Error de validación",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const rentalData: CreateRentalDTO = {
        propertyId: parseInt(selectedProperty),
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim() || undefined,
        guestPhone: guestPhone.trim(),
        guestDocument: guestDocument.trim() || undefined,
        numberOfGuests,
        checkInDate,
        checkOutDate,
        pricePerNight,
        cleaningFee: cleaningFee || undefined,
        discount: discount || undefined,
        currency,
        specialRequests: specialRequests.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const newRental = await temporalRentalService.create(rentalData);

      toast({
        title: "Reserva creada",
        description: `Reserva creada exitosamente. Código: ${newRental.confirmationCode}`,
      });

      // Redirigir a la lista de reservas
      router.push("/rentals");
    } catch (error: any) {
      console.error("Error creating rental:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Error al crear la reserva";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const selectedRentalProperty = properties.find(rp => rp.propertyId.toString() === selectedProperty);
  const totalPrice = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Calendar className="h-8 w-8 text-brand-500" />
                Nueva Reserva
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Crea una nueva reserva de alquiler temporal
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
              Cancelar
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {/* Propiedad - Select con buscador */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Home className="h-4 w-4 inline mr-2" />
                Propiedad <span className="text-red-500">*</span>
              </label>
              
              {/* Select con input de búsqueda */}
              <div className="relative property-search-container">
                {/* Input de búsqueda dentro del select */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                      if (!e.target.value) {
                        setSelectedProperty("");
                      }
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={selectedProperty ? "" : "Selecciona o busca una propiedad..."}
                    className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.property ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {/* Ícono de dropdown */}
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showDropdown ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Dropdown con opciones */}
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {filteredProperties.length > 0 ? (
                      <div className="py-1">
                        {filteredProperties.map((rentalProp) => (
                          <button
                            key={rentalProp.id}
                            type="button"
                            onClick={() => {
                              setSelectedProperty(rentalProp.propertyId.toString());
                              setSearchTerm(rentalProp.property.title);
                              setShowDropdown(false);
                              setIsAvailable(null);
                              setAvailabilityChecked(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              selectedProperty === rentalProp.propertyId.toString()
                                ? "bg-brand-50 dark:bg-brand-900/30 border-l-4 border-brand-500"
                                : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {rentalProp.property.title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-0.5">
                                  {rentalProp.property.address}
                                  {rentalProp.property.city && `, ${rentalProp.property.city}`}
                                </p>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                  {rentalProp.property.bedrooms && (
                                    <span className="flex items-center gap-1">
                                      🛏️ {rentalProp.property.bedrooms}
                                    </span>
                                  )}
                                  {rentalProp.property.bathrooms && (
                                    <span className="flex items-center gap-1">
                                      🚿 {rentalProp.property.bathrooms}
                                    </span>
                                  )}
                                  {rentalProp.property.area && (
                                    <span className="flex items-center gap-1">
                                      📐 {Math.round(rentalProp.property.area)} m²
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-semibold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                                  {rentalProp.pricePerNight?.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {rentalProp.currency}/noche
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                          {searchTerm ? "No se encontraron propiedades" : "No hay propiedades disponibles"}
                        </p>
                        {properties.length === 0 && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            Configura propiedades para alquiler temporal en el último paso del formulario de propiedades
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Vista de propiedad seleccionada */}
              {selectedRentalProperty && !showDropdown && (
                <div className="mt-3 p-3 bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20 border border-brand-200 dark:border-brand-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center text-white">
                      <Home className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-900 dark:text-brand-100 flex items-center gap-2">
                        {selectedRentalProperty.property.title}
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </p>
                      <p className="text-sm text-brand-700 dark:text-brand-300">
                        {selectedRentalProperty.property.address}
                        {selectedRentalProperty.property.city && `, ${selectedRentalProperty.property.city}`}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-brand-600 dark:text-brand-400">
                        {selectedRentalProperty.property.bedrooms && (
                          <span>🛏️ {selectedRentalProperty.property.bedrooms} hab</span>
                        )}
                        {selectedRentalProperty.property.bathrooms && (
                          <span>🚿 {selectedRentalProperty.property.bathrooms} baños</span>
                        )}
                        {selectedRentalProperty.property.area && (
                          <span>📐 {Math.round(selectedRentalProperty.property.area)} m²</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProperty("");
                        setSearchTerm("");
                        setIsAvailable(null);
                        setAvailabilityChecked(false);
                      }}
                      className="flex-shrink-0 p-1 text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-200 hover:bg-brand-100 dark:hover:bg-brand-800 rounded transition-colors"
                      title="Deseleccionar"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {errors.property && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.property}
                </p>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Check-in <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => {
                    setCheckInDate(e.target.value);
                    setAvailabilityChecked(false);
                    setIsAvailable(null);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.checkInDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.checkInDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.checkInDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Check-out <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => {
                    setCheckOutDate(e.target.value);
                    setAvailabilityChecked(false);
                    setIsAvailable(null);
                  }}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.checkOutDate || errors.dates ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.checkOutDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.checkOutDate}</p>
                )}
                {errors.dates && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dates}</p>
                )}
                {availabilityChecked && isAvailable && (
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Disponible
                  </p>
                )}
                {availabilityChecked && !isAvailable && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    No disponible
                  </p>
                )}
              </div>
            </div>

            {/* Noches y huéspedes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Noches
                </label>
                <input
                  type="number"
                  value={numberOfNights}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Calculado automáticamente
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Users className="h-4 w-4 inline mr-2" />
                  Número de huéspedes <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(parseInt(e.target.value) || 1)}
                  min={1}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.numberOfGuests ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.numberOfGuests && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.numberOfGuests}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información del huésped */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-brand-500" />
              Información del Huésped
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.guestName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Juan Pérez"
                />
                {errors.guestName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.guestName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.guestPhone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="+595 981 123456"
                />
                {errors.guestPhone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.guestPhone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.guestEmail ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="juan@example.com"
                />
                {errors.guestEmail && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.guestEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="h-4 w-4 inline mr-2" />
                  Documento (DNI/Pasaporte)
                </label>
                <input
                  type="text"
                  value={guestDocument}
                  onChange={(e) => setGuestDocument(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="1234567"
                />
              </div>
            </div>
          </div>

          {/* Precios */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-brand-500" />
              Información de Precios
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio por noche <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={pricePerNight || ""}
                    onChange={(e) => setPricePerNight(parseFloat(e.target.value) || undefined)}
                    min={0}
                    step="0.01"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.pricePerNight ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="150000"
                  />
                </div>
                {errors.pricePerNight && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.pricePerNight}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tarifa de limpieza
                </label>
                <input
                  type="number"
                  value={cleaningFee || ""}
                  onChange={(e) => setCleaningFee(parseFloat(e.target.value) || undefined)}
                  min={0}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descuento
                </label>
                <input
                  type="number"
                  value={discount || ""}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || undefined)}
                  min={0}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="PYG">PYG - Guaraní</option>
                <option value="USD">USD - Dólar</option>
                <option value="ARS">ARS - Peso Argentino</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            {/* Resumen de precio */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal ({numberOfNights} noches)</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {((pricePerNight || 0) * numberOfNights).toLocaleString()} {currency}
                </span>
              </div>
              {cleaningFee && cleaningFee > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tarifa de limpieza</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {cleaningFee.toLocaleString()} {currency}
                  </span>
                </div>
              )}
              {discount && discount > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-red-600 dark:text-red-400">Descuento</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    -{discount.toLocaleString()} {currency}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-300 dark:border-gray-600">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
                  {totalPrice.toLocaleString()} {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Notas adicionales */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-500" />
              Información Adicional
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Solicitudes especiales
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ej: Necesito check-in tardío, tengo una mascota..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notas internas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Notas privadas que solo verás tú..."
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Crear Reserva
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

