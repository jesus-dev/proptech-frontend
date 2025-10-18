"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, ArrowLeft, Plus, ChevronLeft, ChevronRight, Filter, CalendarDays, Star, TrendingUp, Bell, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Appointment {
  id: number;
  title: string;
  appointmentDate: string;
  durationMinutes: number;
  appointmentType: string;
  status: string;
  location: string;
  agentName: string;
  clientName: string;
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Programada': return 'bg-blue-100 text-blue-800';
      case 'Confirmada': return 'bg-green-100 text-green-800';
      case 'En Progreso': return 'bg-yellow-100 text-yellow-800';
      case 'Completada': return 'bg-gray-100 text-gray-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Días del mes anterior para completar la primera semana
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  const getFilteredAppointments = () => {
    let filtered = appointments;
    
    if (filterType !== "all") {
      filtered = filtered.filter(appointment => appointment.appointmentType === filterType);
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(appointment => appointment.status === filterStatus);
    }
    
    return filtered;
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="container mx-auto px-4 py-4 relative z-10">
        {/* Enhanced Header */}
        <div className="mb-4 relative">
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/agenda">
                  <Button variant="outline" size="sm" className="group px-3 py-2 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-700">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow">
                    <CalendarDays className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      Calendario de Citas
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Visualiza todas las citas programadas
                    </p>
                  </div>
                </div>
              </div>
              <Link href="/agenda/new">
                <Button size="sm" className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow">
                  <Plus className="w-4 h-4 mr-1" />
                  Nueva Cita
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="mb-4">
          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow">
            <CardHeader className="p-3 relative z-10">
              <CardTitle className="flex items-center text-base font-bold text-slate-800 dark:text-slate-200">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow mr-2">
                  <Filter className="w-4 h-4 text-white" />
                </div>
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tipo de Cita
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-800"
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="PROPERTY_VISIT">Visita a Propiedad</option>
                    <option value="CLIENT_MEETING">Reunión con Cliente</option>
                    <option value="PROPERTY_INSPECTION">Inspección Técnica</option>
                    <option value="CONTRACT_SIGNING">Firma de Contrato</option>
                    <option value="PROPERTY_VALUATION">Valuación</option>
                    <option value="DEVELOPMENT_TOUR">Tour de Desarrollo</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Estado
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-800"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="Programada">Programada</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="En Progreso">En Progreso</option>
                    <option value="Completada">Completada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Calendar */}
        <div className="mb-4">
          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
            
            <CardHeader className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Calendario interactivo de citas
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={prevMonth}
                    className="p-2 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={nextMonth}
                    className="p-2 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pt-0 relative z-10">
              <div className="grid grid-cols-7 gap-1">
                {/* Días de la semana */}
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-bold text-slate-600 dark:text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg">
                    {day}
                  </div>
                ))}
                
                {/* Días del mes */}
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="p-1 min-h-[80px] bg-slate-50 dark:bg-slate-700 rounded-lg"></div>;
                  }
                  
                  const dayAppointments = getAppointmentsForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
                  
                  return (
                    <div
                      key={index}
                      className={`group p-2 min-h-[80px] rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 ${
                        isToday 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                          : isSelected 
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg shadow-yellow-400/25'
                            : 'bg-white/50 dark:bg-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-600/80 border border-white/20'
                      }`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className={`text-sm font-bold mb-1 ${
                        isToday || isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-0.5">
                        {dayAppointments.slice(0, 2).map(appointment => (
                          <div
                            key={appointment.id}
                            className={`text-xs p-1 rounded-md truncate transition-all duration-300 ${
                              isToday || isSelected 
                                ? 'bg-white/20 text-white backdrop-blur-sm' 
                                : 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-300'
                            }`}
                            title={appointment.title}
                          >
                            <div className="font-semibold text-[10px]">{formatTime(appointment.appointmentDate)}</div>
                            <div className="truncate text-[10px]">{appointment.title}</div>
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className={`text-[10px] text-center font-semibold ${
                            isToday || isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            +{dayAppointments.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Selected Day Appointments */}
        {selectedDate && (
          <div className="mb-12">
            <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5"></div>
              
              <CardHeader className="p-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                      Citas del Día
                    </CardTitle>
                    <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">
                      {selectedDate.toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 pt-0 relative z-10">
                {getAppointmentsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
                      <div className="relative p-8 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 w-32 h-32 mx-auto flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-slate-400" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
                      Día libre
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto">
                      No tienes citas programadas para este día. Es un buen momento para organizar tu agenda.
                    </p>
                    <Link href="/agenda/new">
                      <Button className="group bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                        <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                        Programar Cita
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {getAppointmentsForDate(selectedDate).map((appointment, index) => (
                      <div key={appointment.id} className="group relative p-6 rounded-2xl bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-slate-700/50 dark:to-slate-600/50 border border-white/20 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex-shrink-0">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <span className="text-white font-bold text-xl">
                                  {new Date(appointment.appointmentDate).getHours().toString().padStart(2, '0')}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-3">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                                  {appointment.title}
                                </h3>
                                <Badge className={`px-3 py-1 rounded-full font-semibold text-sm ${getStatusColor(appointment.status)}`}>
                                  {appointment.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600 dark:text-slate-400">
                                <div className="flex items-center">
                                  <Clock className="w-5 h-5 mr-3 text-emerald-500" />
                                  <span className="font-medium">{formatTime(appointment.appointmentDate)}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-5 h-5 mr-3 text-blue-500" />
                                  <span className="font-medium">{appointment.location || 'Sin ubicación'}</span>
                                </div>
                                <div className="flex items-center">
                                  <User className="w-5 h-5 mr-3 text-purple-500" />
                                  <span className="font-medium">{appointment.clientName}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                              <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                {appointment.durationMinutes} min
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {appointment.appointmentType}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
