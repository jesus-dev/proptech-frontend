"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Calendar, Clock, MapPin, User, Building2, ArrowLeft, Save, CalendarDays, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AppointmentType {
  value: string;
  label: string;
}

interface LocationType {
  value: string;
  label: string;
}

interface Agent {
  id: number;
  name: string;
}

interface Client {
  id: number;
  name: string;
}

interface Property {
  id: number;
  title: string;
}

const appointmentTypes: AppointmentType[] = [
  { value: "PROPERTY_VISIT", label: "Visita a Propiedad" },
  { value: "CLIENT_MEETING", label: "Reunión con Cliente" },
  { value: "PROPERTY_INSPECTION", label: "Inspección Técnica" },
  { value: "CONTRACT_SIGNING", label: "Firma de Contrato" },
  { value: "PROPERTY_VALUATION", label: "Valuación" },
  { value: "DEVELOPMENT_TOUR", label: "Tour de Desarrollo" },
  { value: "OTHER", label: "Otro" },
];

const locationTypes: LocationType[] = [
  { value: "PROPERTY_ADDRESS", label: "Dirección de Propiedad" },
  { value: "OFFICE", label: "Oficina" },
  { value: "CLIENT_HOME", label: "Casa del Cliente" },
  { value: "NEUTRAL_LOCATION", label: "Ubicación Neutral" },
  { value: "VIRTUAL", label: "Virtual/Online" },
  { value: "OTHER", label: "Otro" },
];

export default function NewAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    appointmentDate: "",
    appointmentTime: "",
    durationMinutes: 60,
    appointmentType: "",
    location: "",
    locationType: "",
    agentId: "",
    clientId: "",
    propertyId: "",
    notes: "",
  });

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      // Aquí deberías hacer las llamadas a tu API para obtener:
      // - Lista de agentes
      // - Lista de clientes
      // - Lista de propiedades
      
      // Por ahora usamos datos de ejemplo
      setAgents([
        { id: 1, name: "Juan Pérez" },
        { id: 2, name: "María García" },
        { id: 3, name: "Carlos López" },
      ]);
      
      setClients([
        { id: 1, name: "Ana Rodríguez" },
        { id: 2, name: "Luis Martínez" },
        { id: 3, name: "Carmen Silva" },
      ]);
      
      setProperties([
        { id: 1, title: "Casa en Las Palmas" },
        { id: 2, title: "Apartamento Centro" },
        { id: 3, title: "Oficina Comercial" },
      ]);
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combinar fecha y hora
      const dateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
      
      const appointmentData = {
        title: formData.title,
        description: formData.description,
        appointmentDate: dateTime.toISOString(),
        durationMinutes: formData.durationMinutes,
        appointmentType: formData.appointmentType,
        location: formData.location,
        locationType: formData.locationType,
        agentId: parseInt(formData.agentId),
        clientId: parseInt(formData.clientId),
        propertyId: formData.propertyId ? parseInt(formData.propertyId) : null,
        notes: formData.notes,
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        router.push('/agenda');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim() !== "" &&
      formData.appointmentDate !== "" &&
      formData.appointmentTime !== "" &&
      formData.agentId !== "" &&
      formData.clientId !== ""
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-10 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/agenda">
                  <Button variant="outline" className="group px-6 py-3 rounded-2xl border-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    Volver
                  </Button>
                </Link>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-lg">
                    <CalendarDays className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      Nueva Cita
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                      Programa una nueva cita o reunión
                    </p>
                  </div>
                </div>
              </div>
              <Link href="/agenda">
                <Button className="group bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-6 md:px-8 py-3 md:py-4 text-sm md:text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 group-hover:translate-x-1 transition-transform duration-300" />
                  Volver a Agenda
                </Button>
              </Link>
            </div>
          </div>
        </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información Básica */}
          <Card className="card-modern hover-lift">
            <CardHeader className="p-6">
              <CardTitle className="flex items-center text-xl font-bold">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 mr-4">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <Label htmlFor="title" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                  Título de la Cita *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Visita a propiedad en Las Palmas"
                  className="input-modern"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descripción detallada de la cita..."
                  rows={3}
                  className="input-modern"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appointmentDate" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                    Fecha *
                  </Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-modern"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="appointmentTime" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                    Hora *
                  </Label>
                  <Input
                    id="appointmentTime"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                    className="input-modern"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="durationMinutes" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                  Duración (minutos) *
                </Label>
                <select
                  id="durationMinutes"
                  value={formData.durationMinutes}
                  onChange={(e) => handleInputChange('durationMinutes', parseInt(e.target.value))}
                  className="input-modern"
                >
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={90}>1.5 horas</option>
                  <option value={120}>2 horas</option>
                  <option value={180}>3 horas</option>
                </select>
              </div>

              <div>
                <Label htmlFor="appointmentType" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                  Tipo de Cita *
                </Label>
                <select
                  id="appointmentType"
                  value={formData.appointmentType}
                  onChange={(e) => handleInputChange('appointmentType', e.target.value)}
                  className="input-modern"
                  required
                >
                  <option value="">Selecciona el tipo de cita</option>
                  {appointmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Ubicación y Participantes */}
          <Card className="card-modern hover-lift">
            <CardHeader className="p-6">
              <CardTitle className="flex items-center text-xl font-bold">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 mr-4">
                  <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                Ubicación y Participantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <Label htmlFor="locationType" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                  Tipo de Ubicación
                </Label>
                <select
                  id="locationType"
                  value={formData.locationType}
                  onChange={(e) => handleInputChange('locationType', e.target.value)}
                  className="input-modern"
                >
                  <option value="">Selecciona el tipo de ubicación</option>
                  {locationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="location" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                  Dirección/Ubicación
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ej: Av. Principal 123, Ciudad"
                  className="input-modern"
                />
              </div>

              <div>
                <Label htmlFor="agentId" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                  Agente *
                </Label>
                <select
                  id="agentId"
                  value={formData.agentId}
                  onChange={(e) => handleInputChange('agentId', e.target.value)}
                  className="input-modern"
                  required
                >
                  <option value="">Selecciona un agente</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id.toString()}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="clientId" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                  Cliente *
                </Label>
                <select
                  id="clientId"
                  value={formData.clientId}
                  onChange={(e) => handleInputChange('clientId', e.target.value)}
                  className="input-modern"
                  required
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id.toString()}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="propertyId" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                  Propiedad (Opcional)
                </Label>
                <select
                  id="propertyId"
                  value={formData.propertyId}
                  onChange={(e) => handleInputChange('propertyId', e.target.value)}
                  className="input-modern"
                >
                  <option value="">Sin propiedad</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id.toString()}>
                      {property.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                  Notas Adicionales
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notas adicionales, instrucciones especiales..."
                  rows={3}
                  className="input-modern"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-center gap-6 mt-12">
          <Link href="/agenda">
            <Button variant="outline" type="button" className="btn-modern px-8 py-3">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={!isFormValid() || loading}
            className="btn-modern px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Crear Cita
              </>
            )}
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}
