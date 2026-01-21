"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Building2, Plus, TrendingUp, Star, ArrowRight, CalendarDays, Users, BarChart3, Bell, CheckCircle, AlertCircle, Home, Info } from "lucide-react";
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
  propertyTitle?: string;
}

interface AppointmentStats {
  totalAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  pendingConfirmations: number;
}

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats>({
    totalAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    pendingConfirmations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointmentData();
  }, []);

  const fetchAppointmentData = async () => {
    try {
      // Obtener estadísticas
      const statsResponse = await fetch('/api/appointments/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Obtener citas del día
      const todayResponse = await fetch('/api/appointments/today');
      if (todayResponse.ok) {
        const todayData = await todayResponse.json();
        setAppointments(todayData);
      }

      // Obtener citas próximas
      const upcomingResponse = await fetch('/api/appointments/upcoming');
      if (upcomingResponse.ok) {
        const upcomingData = await upcomingResponse.json();
        // Combinar citas del día y próximas, eliminando duplicados
        const allAppointments = [...appointments, ...upcomingData];
        const uniqueAppointments = allAppointments.filter((appointment, index, self) =>
          index === self.findIndex(a => a.id === appointment.id)
        );
        setAppointments(uniqueAppointments);
      }
    } catch (error) {
      console.error('Error fetching appointment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Programada':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmada':
        return 'bg-green-100 text-green-800';
      case 'En Progreso':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completada':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      case 'No Se Presentó':
        return 'bg-orange-100 text-orange-800';
      case 'Reprogramada':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="container mx-auto px-4 py-4 relative z-10">
        {/* Hero Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 leading-tight">
              Agenda Inteligente
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300 mb-4 max-w-2xl mx-auto">
              Gestiona tus citas con elegancia y eficiencia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/agenda/new">
                <Button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                  Nueva Cita
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Button variant="outline" className="px-8 py-4 text-lg font-semibold rounded-2xl border-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300">
                <CalendarDays className="w-5 h-5 mr-3" />
                Ver Calendario
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
            <CardHeader className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm font-semibold">+12%</span>
                </div>
              </div>
              <CardTitle className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Total Citas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 relative z-10">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                {stats.totalAppointments}
              </div>
              <p className="text-blue-600 dark:text-blue-400 font-medium">Todas las citas</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
            <CardHeader className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                  <Star className="h-4 w-4 mr-1" />
                  <span className="text-sm font-semibold">Hoy</span>
                </div>
              </div>
              <CardTitle className="text-sm font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Citas de Hoy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 relative z-10">
              <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">
                {stats.todayAppointments}
              </div>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium">Programadas</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
            <CardHeader className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CalendarDays className="h-7 w-7 text-white" />
                </div>
                <div className="flex items-center text-purple-600 dark:text-purple-400">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  <span className="text-sm font-semibold">Próximas</span>
                </div>
              </div>
              <CardTitle className="text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                Próximas Citas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 relative z-10">
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                {stats.upcomingAppointments}
              </div>
              <p className="text-purple-600 dark:text-purple-400 font-medium">En los próximos días</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent"></div>
            <CardHeader className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Bell className="h-7 w-7 text-white" />
                </div>
                <div className="flex items-center text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-semibold">Pendiente</span>
                </div>
              </div>
              <CardTitle className="text-sm font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                Por Confirmar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 relative z-10">
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-1">
                {stats.pendingConfirmations}
              </div>
              <p className="text-amber-600 dark:text-amber-400 font-medium">Necesitan confirmación</p>
            </CardContent>
          </Card>
        </div>

        {/* Info Section: Difference between Appointments and Visits */}
        <div className="mb-6">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-purple-50/80 dark:from-slate-800/80 dark:via-slate-700/50 dark:to-slate-800/80 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-800/50 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
            <CardHeader className="p-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg flex-shrink-0">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                    ¿Cuál es la diferencia entre Citas y Visitas?
                  </CardTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Citas (Appointments)</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Sistema completo:</strong> Reuniones, inspecciones, firmas de contrato, valuaciones, tours</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Referencias:</strong> Vinculadas a clientes y agentes del sistema</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Fecha y hora completa:</strong> Con duración en minutos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Estados detallados:</strong> Programada, Confirmada, En Progreso, Completada, etc.</span>
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border border-orange-200/50 dark:border-orange-800/50">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <Home className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Visitas (Visits)</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Específico:</strong> Solo para visitas a propiedades</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Datos del visitante:</strong> Nombre, teléfono y email directos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Vista Kanban:</strong> Gestión visual por estados (Programada, En Progreso, Completada)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Simple y rápido:</strong> Ideal para agendar visitas rápidamente</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-100 bg-clip-text text-transparent mb-2">
              Acciones Rápidas
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Gestiona tu agenda de manera eficiente
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link href="/agenda/calendar">
              <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:shadow-blue-500/25 group-hover:scale-110 transition-all duration-300">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    Ver Calendario
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 relative z-10">
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-lg leading-relaxed">
                    Visualiza todas las citas en formato de calendario interactivo
                  </p>
                  <div className="flex items-center mt-4 text-blue-600 dark:text-blue-400 font-semibold">
                    <span>Explorar calendario</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/agenda/my-appointments">
              <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg group-hover:shadow-emerald-500/25 group-hover:scale-110 transition-all duration-300">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                    Mis Citas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 relative z-10">
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-lg leading-relaxed">
                    Gestiona y organiza todas tus citas personales
                  </p>
                  <div className="flex items-center mt-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Ver mis citas</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/visits">
              <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg group-hover:shadow-orange-500/25 group-hover:scale-110 transition-all duration-300">
                      <Home className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                    Visitas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 relative z-10">
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-lg leading-relaxed">
                    Gestiona visitas a propiedades con vista Kanban
                  </p>
                  <div className="flex items-center mt-4 text-orange-600 dark:text-orange-400 font-semibold">
                    <span>Ver visitas</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/agenda/reports">
              <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:shadow-purple-500/25 group-hover:scale-110 transition-all duration-300">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                    Reportes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 relative z-10">
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-lg leading-relaxed">
                    Analiza el rendimiento y estadísticas de tu agenda
                  </p>
                  <div className="flex items-center mt-4 text-purple-600 dark:text-purple-400 font-semibold">
                    <span>Ver reportes</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Enhanced Today's Appointments */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-100 bg-clip-text text-transparent mb-2">
              Citas de Hoy
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mantente al día con tu agenda diaria
            </p>
          </div>

          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
            
            <CardHeader className="p-8 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <div className="ml-6">
                    <CardTitle className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                      Agenda del Día
                    </CardTitle>
                    <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">
                      {new Date().toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-full">
                    {appointments.length} citas
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 pt-0 relative z-10">
              {appointments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                    <div className="relative p-8 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 w-32 h-32 mx-auto flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-slate-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
                    ¡Día libre!
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto">
                    No tienes citas programadas para hoy. Es un buen momento para organizar tu agenda.
                  </p>
                  <Link href="/agenda/new">
                    <Button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                      <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                      Programar Primera Cita
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {appointments.slice(0, 5).map((appointment, index) => (
                    <div key={appointment.id} className="group relative p-6 rounded-2xl bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-slate-700/50 dark:to-slate-600/50 border border-white/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <span className="text-white font-bold text-xl">
                                {new Date(appointment.appointmentDate).getHours().toString().padStart(2, '0')}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                {appointment.title}
                              </h3>
                              <Badge className={`px-3 py-1 rounded-full font-semibold text-sm ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600 dark:text-slate-400">
                              <div className="flex items-center">
                                <Clock className="w-5 h-5 mr-3 text-blue-500" />
                                <span className="font-medium">{formatDateTime(appointment.appointmentDate)}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-5 h-5 mr-3 text-emerald-500" />
                                <span className="font-medium">{appointment.location || 'Sin ubicación'}</span>
                              </div>
                              <div className="flex items-center">
                                <User className="w-5 h-5 mr-3 text-purple-500" />
                                <span className="font-medium">{appointment.clientName}</span>
                              </div>
                            </div>
                            {appointment.propertyTitle && (
                              <div className="flex items-center mt-3 text-slate-500 dark:text-slate-400">
                                <Building2 className="w-5 h-5 mr-3 text-amber-500" />
                                <span className="font-medium">{appointment.propertyTitle}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                              {formatDuration(appointment.durationMinutes)}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                              {appointment.appointmentType}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {appointments.length > 5 && (
                    <div className="text-center pt-8">
                      <Link href="/agenda/today">
                        <Button className="group bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-3 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                          Ver Todas las Citas del Día
                          <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
