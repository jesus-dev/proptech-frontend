"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Building2, 
  ArrowLeft, 
  Save,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Phone,
  Mail,
  Filter,
  Search,
  BedIcon,
  BathIcon,
  Square
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { agendaService, Agent, TimeSlot, AppointmentRequest } from "../services/agendaService";
import { Property } from "../../properties/components/types";
import PropertyCard from "../../properties/components/PropertyCard";
import { formatPrice } from "@/lib/utils";



// Componente wrapper para PropertyCard con funcionalidad de selección
const SelectablePropertyCard = ({ property, onSelect }: { property: Property; onSelect: (property: Property) => void }) => {
  const handleSelect = () => {
    onSelect(property);
    // Cambiar al siguiente paso después de seleccionar
    setTimeout(() => {
      const event = new CustomEvent('propertySelected', { detail: property });
      window.dispatchEvent(event);
    }, 100);
  };

  return (
    <div 
      className="cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={handleSelect}
    >
      <PropertyCard property={property} />
    </div>
  );
};

export default function PublicAgendaPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: Propiedad, 2: Agente, 3: Horario, 4: Datos
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProperties, setTotalProperties] = useState(0);
  const [pageSize] = useState(12);
  
  // Filtros para propiedades
  const [propertyFilters, setPropertyFilters] = useState({
    type: "all",
    priceRange: "all",
    location: "all",
    bedrooms: "all",
    area: "all",
    search: ""
  });

  // Filtros para agentes
  const [agentFilters, setAgentFilters] = useState({
    specialty: "all",
    rating: "all",
    availability: "all",
    search: ""
  });
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyPropertyFilters();
  }, [properties, propertyFilters]);

  useEffect(() => {
    applyAgentFilters();
  }, [agents, agentFilters]);

  // Event listener para cambio de paso cuando se selecciona una propiedad
  useEffect(() => {
    const handlePropertySelected = () => {
      setStep(2);
    };

    window.addEventListener('propertySelected', handlePropertySelected);
    return () => {
      window.removeEventListener('propertySelected', handlePropertySelected);
    };
  }, []);

  const fetchData = async (page: number = 0) => {
    try {
      setLoading(true);
      
      // Obtener propiedades usando el servicio con paginación
      const propertiesData = await agendaService.getActiveProperties(page, pageSize);

      setProperties(propertiesData.properties);
      setTotalProperties(propertiesData.total);
      setTotalPages(propertiesData.totalPages);
      setCurrentPage(page);
      
      // Obtener agentes activos usando el servicio
      const agentsData = await agendaService.getActiveAgents();
      setAgents(agentsData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback a datos de ejemplo si hay error
      setProperties([
        { 
          id: "1", 
          title: "Casa Moderna en Las Palmas", 
          address: "Av. Principal 123, Las Palmas, Asunción",
          city: "Asunción",
          state: "Central",
          zip: "0000",
          price: 150000,
          currency: "USD",
          images: [],
          description: "Hermosa casa de 3 habitaciones con jardín y garaje para 2 autos",
          bedrooms: 3,
          bathrooms: 2,
          area: 180,
          type: "Casa",
          status: "active",
          privateFiles: [],
          amenities: [],
          services: []
        } as Property
      ]);
    } finally {
      setLoading(false);
    }
  };

  const applyPropertyFilters = () => {

    let filtered = [...properties];

    // Búsqueda por texto
    if (propertyFilters.search.trim() !== "") {
      const searchTerm = propertyFilters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.address.toLowerCase().includes(searchTerm) ||
        (p.type && p.type.toLowerCase().includes(searchTerm))
      );
    }

    if (propertyFilters.type !== "all") {
      filtered = filtered.filter(p => p.type === propertyFilters.type);
    }

    if (propertyFilters.priceRange !== "all") {
      filtered = filtered.filter(p => {
        const price = p.price;
        switch (propertyFilters.priceRange) {
          case "low": return price <= 100000;
          case "medium": return price > 100000 && price <= 200000;
          case "high": return price > 200000;
          default: return true;
        }
      });
    }

    if (propertyFilters.location !== "all") {
      filtered = filtered.filter(p => p.address.includes(propertyFilters.location));
    }

    if (propertyFilters.bedrooms !== "all") {
      filtered = filtered.filter(p => p.bedrooms === parseInt(propertyFilters.bedrooms));
    }

    if (propertyFilters.area !== "all") {
      filtered = filtered.filter(p => {
        if (!p.area) return false;
        const area = p.area;
        switch (propertyFilters.area) {
          case "small": return area <= 120;
          case "medium": return area > 120 && area <= 200;
          case "large": return area > 200;
          default: return true;
        }
      });
    }


    setFilteredProperties(filtered);
  };

  // Funciones para manejar la paginación
  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      fetchData(page);
    }
  };

  const applyAgentFilters = () => {
    let filtered = [...agents];

    // Búsqueda por texto
    if (agentFilters.search.trim() !== "") {
      const searchTerm = agentFilters.search.toLowerCase();
      filtered = filtered.filter(a => 
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchTerm) ||
        (a.specialties && a.specialties.some(s => s.toLowerCase().includes(searchTerm)))
      );
    }

    if (agentFilters.specialty !== "all") {
      filtered = filtered.filter(a => a.specialties && a.specialties.includes(agentFilters.specialty));
    }

    if (agentFilters.rating !== "all") {
      filtered = filtered.filter(a => {
        const rating = parseFloat(agentFilters.rating);
        return a.rating && a.rating >= rating;
      });
    }

    if (agentFilters.availability !== "all") {
      filtered = filtered.filter(a => a.isActive === (agentFilters.availability === "Disponible"));
    }

    setFilteredAgents(filtered);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const fetchAvailableSlots = async (propertyId: string, date: string) => {
    try {
      const slots = await agendaService.getAvailableSlots(parseInt(propertyId), date);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      // Fallback a slots simulados
      const slots: TimeSlot[] = [];
      for (let hour = 9; hour < 18; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const available = Math.random() > 0.3;
        const agentId = Math.floor(Math.random() * agents.length) + 1;
        
        slots.push({
          time,
          available,
          agentId
        });
      }
      setAvailableSlots(slots);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    if (selectedProperty) {
      await fetchAvailableSlots(selectedProperty.id, date.toISOString().split('T')[0]);
    }
    setStep(3);
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    
    const agent = agents.find(a => a.id === slot.agentId);
    if (agent) {
      setSelectedAgent(agent);
      setSelectedTime(slot.time);
      setStep(4);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dateTime = new Date(`${selectedDate}T${selectedTime}`);
      
      const appointmentData: AppointmentRequest = {
        title: formData.title || `Visita a ${selectedProperty?.title}`,
        description: formData.description,
        appointmentDate: dateTime.toISOString(),
        durationMinutes: 60,
        propertyId: parseInt(selectedProperty?.id || '0'),
        agentId: selectedAgent?.id || 0,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        notes: formData.notes,
      };

      // Crear cita pública
      const response = await agendaService.createPublicAppointment(appointmentData);
      
      if (response) {
        setSuccess(true);
        setFormData({
          title: "",
          description: "",
          clientName: "",
          clientEmail: "",
          clientPhone: "",
          notes: "",
        });
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Cita Confirmada!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Tu visita ha sido agendada exitosamente. {selectedAgent?.firstName} {selectedAgent?.lastName} se pondrá en contacto contigo 
              para confirmar los detalles finales.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-blue-900 mb-3">Detalles de la Cita:</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Propiedad:</strong> {selectedProperty?.title}</p>
                <p><strong>Agente:</strong> {selectedAgent?.firstName} {selectedAgent?.lastName}</p>
                <p><strong>Fecha:</strong> {new Date(selectedDate).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p><strong>Hora:</strong> {selectedTime}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={() => {
                  setSuccess(false);
                  setStep(1);
                  setSelectedProperty(null);
                  setSelectedAgent(null);
                  setSelectedDate("");
                  setSelectedTime("");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
              >
                Agendar Otra Cita
              </Button>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full text-lg py-3">
                  Volver al Inicio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Agenda tu Visita</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecciona la propiedad de tu interés, elige un agente y reserva el horario que mejor te convenga
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Selección de Propiedad */}
        {step === 1 && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Selecciona la Propiedad</h2>
            
            {/* Filtros de Propiedades */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-purple-600" />
                  Filtros de Propiedades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Buscador */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-2">Buscar Propiedades</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Buscar por nombre, descripción, ubicación..."
                      value={propertyFilters.search}
                      onChange={(e) => setPropertyFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10 pr-4"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Tipo</Label>
                    <select
                      value={propertyFilters.type}
                      onChange={(e) => setPropertyFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="all">Todos los tipos</option>
                      <option value="Casa">Casa</option>
                      <option value="Apartamento">Apartamento</option>
                      <option value="Oficina">Oficina</option>
                      <option value="Comercial">Comercial</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Precio</Label>
                    <select
                      value={propertyFilters.priceRange}
                      onChange={(e) => setPropertyFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="all">Todos los precios</option>
                      <option value="low">Hasta $100,000</option>
                      <option value="medium">$100,000 - $200,000</option>
                      <option value="high">Más de $200,000</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Ubicación</Label>
                    <select
                      value={propertyFilters.location}
                      onChange={(e) => setPropertyFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="all">Todas las ubicaciones</option>
                      <option value="Las Palmas">Las Palmas</option>
                      <option value="Centro">Centro</option>
                      <option value="San Lorenzo">San Lorenzo</option>
                      <option value="Costanera">Costanera</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Dormitorios</Label>
                    <select
                      value={propertyFilters.bedrooms}
                      onChange={(e) => setPropertyFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="all">Cualquier cantidad</option>
                      <option value="0">Sin dormitorios</option>
                      <option value="1">1 dormitorio</option>
                      <option value="2">2 dormitorios</option>
                      <option value="3">3 dormitorios</option>
                      <option value="4">4+ dormitorios</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Área</Label>
                    <select
                      value={propertyFilters.area}
                      onChange={(e) => setPropertyFilters(prev => ({ ...prev, area: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="all">Cualquier área</option>
                      <option value="small">Hasta 120m²</option>
                      <option value="medium">120m² - 200m²</option>
                      <option value="large">Más de 200m²</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Propiedades Filtradas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <SelectablePropertyCard 
                  key={property.id} 
                  property={property} 
                  onSelect={setSelectedProperty}
                />
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron propiedades</h3>
                <p className="text-gray-600">Intenta ajustar los filtros para ver más resultados</p>
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10 h-10 p-0"
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Información de paginación */}
            {totalProperties > 0 && (
              <div className="text-center text-sm text-gray-600 mt-4">
                Mostrando {filteredProperties.length} de {totalProperties} propiedades
                {totalPages > 1 && ` (Página ${currentPage + 1} de ${totalPages})`}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Selección de Agente */}
        {step === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">Selecciona un Agente</h2>
            </div>
            
            {/* Filtros de Agentes */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-purple-600" />
                  Filtros de Agentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Buscador */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-2">Buscar Agentes</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Buscar por nombre o especialidad..."
                      value={agentFilters.search}
                      onChange={(e) => setAgentFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10 pr-4"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Especialidad</Label>
                    <select
                      value={agentFilters.specialty}
                      onChange={(e) => setAgentFilters(prev => ({ ...prev, specialty: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="all">Todas las especialidades</option>
                      <option value="Residencial">Residencial</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Lujo">Lujo</option>
                      <option value="Inversión">Inversión</option>
                      <option value="Desarrollo">Desarrollo</option>
                      <option value="Terrenos">Terrenos</option>
                      <option value="Oficinas">Oficinas</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Rating Mínimo</Label>
                    <select
                      value={agentFilters.rating}
                      onChange={(e) => setAgentFilters(prev => ({ ...prev, rating: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="all">Cualquier rating</option>
                      <option value="4.5">4.5+ estrellas</option>
                      <option value="4.0">4.0+ estrellas</option>
                      <option value="3.5">3.5+ estrellas</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Disponibilidad</Label>
                    <select
                      value={agentFilters.availability}
                      onChange={(e) => setAgentFilters(prev => ({ ...prev, availability: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="all">Todos</option>
                      <option value="Disponible">Disponible</option>
                      <option value="Ocupado">Ocupado</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Lista de Agentes Filtrados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <Card 
                  key={agent.id} 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300"
                  onClick={() => {
                    setSelectedAgent(agent);
                    setStep(3);
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {agent.photo ? (
                        <Image
                          src={agent.photo}
                          alt={`${agent.firstName} ${agent.lastName}`}
                          width={80}
                          height={80}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-blue-600" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{agent.firstName} {agent.lastName}</h3>
                    {agent.rating && (
                      <div className="flex items-center justify-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < Math.floor(agent.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`} 
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">({agent.rating})</span>
                      </div>
                    )}
                    {agent.specialties && agent.specialties.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {agent.specialties.slice(0, 3).map((specialty, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" />
                        {agent.email}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4" />
                        {agent.phone}
                      </div>
                      {agent.agency && (
                        <div className="text-xs text-gray-500">
                          {agent.agency.name}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      Seleccionar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAgents.length === 0 && (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron agentes</h3>
                <p className="text-gray-600">Intenta ajustar los filtros para ver más resultados</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Selección de Fecha y Hora */}
        {step === 3 && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">Selecciona Fecha y Hora</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendario */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Calendario</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={prevMonth}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={nextMonth}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                    {getDaysInMonth(currentMonth).map((day, index) => {
                      if (!day) {
                        return <div key={index} className="p-2" />;
                      }
                      
                      const isToday = day.toDateString() === new Date().toDateString();
                      const isSelected = selectedDate === day.toISOString().split('T')[0];
                      const isPast = day < new Date();
                      
                      return (
                        <div
                          key={index}
                          className={`p-2 text-center cursor-pointer rounded-lg transition-colors ${
                            isPast 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : isSelected 
                                ? 'bg-blue-600 text-white' 
                                : isToday 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'hover:bg-gray-100'
                          }`}
                          onClick={() => !isPast && handleDateSelect(day)}
                        >
                          {day.getDate()}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Horarios Disponibles */}
              {selectedDate && (
                <Card>
                  <CardHeader>
                    <CardTitle>Horarios Disponibles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {availableSlots.map((slot, index) => (
                        <Button
                          key={index}
                          variant={slot.available ? "outline" : "default"}
                          className={`h-12 ${
                            slot.available 
                              ? 'hover:bg-blue-50 hover:border-blue-300' 
                              : 'text-gray-400 cursor-not-allowed bg-gray-100'
                          }`}
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot)}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Información del Cliente */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">Completa tus Datos</h2>
            </div>
            
            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="clientName">Nombre Completo *</Label>
                      <Input
                        id="clientName"
                        value={formData.clientName}
                        onChange={(e) => handleInputChange('clientName', e.target.value)}
                        placeholder="Tu nombre completo"
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientEmail">Email *</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                        placeholder="tu@email.com"
                        required
                        className="h-12"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="clientPhone">Teléfono</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                      placeholder="+595 123 456 789"
                      className="h-12"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Motivo de la Visita</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Cuéntanos por qué te interesa esta propiedad..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notas Adicionales</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Instrucciones especiales, preferencias de horario..."
                      rows={2}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!formData.clientName.trim() || !formData.clientEmail.trim() || loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Confirmar Cita
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
