"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, ArrowLeft, Plus, CalendarDays, Star, TrendingUp, Bell, CheckCircle, AlertCircle, ArrowRight, Building2 } from "lucide-react";
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

export default function TodayAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    upcomingAppointments: 0,
    pendingConfirmations: 0,
  });

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const fetchTodayAppointments = async () => {
    try {
      const response = await fetch('/api/appointments/today');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
        
        // Calcular estadísticas
        const now = new Date();
        const completed = data.filter((apt: Appointment) => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate < now && apt.status === 'Completada';
        }).length;
        
        const upcoming = data.filter((apt: Appointment) => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= now;
        }).length;
        
        const pending = data.filter((apt: Appointment) => apt.status === 'Programada').length;
        
        setStats({
          totalAppointments: data.length,
          completedAppointments: completed,
          upcomingAppointments: upcoming,
          pendingConfirmations: pending,
        });
      }
    } catch (error) {
      console.error('Error fetching today appointments:', error);
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Header */}
        <div className="mb-12 relative">
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
                    <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      Citas de Hoy
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
                      {new Date().toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <Link href="/agenda/new">
                <Button className="group bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                  Nueva Cita
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
            <CardHeader className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm font-semibold">Total</span>
                </div>
              </div>
              <CardTitle className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Citas del Día
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 relative z-10">
              <div className="text-4xl font-black text-blue-900 dark:text-blue-100 mb-2">
                {stats.totalAppointments}
              </div>
              <p className="text-blue-600 dark:text-blue-400 font-medium">Programadas para hoy</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
            <CardHeader className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                  <Star className="h-4 w-4 mr-1" />
                  <span className="text-sm font-semibold">Completadas</span>
                </div>
              </div>
              <CardTitle className="text-sm font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Citas Completadas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 relative z-10">
              <div className="text-4xl font-black text-emerald-900 dark:text-emerald-100 mb-2">
                {stats.completedAppointments}
              </div>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium">Finalizadas</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
            <CardHeader className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <div className="flex items-center text-purple-600 dark:text-purple-400">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  <span className="text-sm font-semibold">Próximas</span>
                </div>
              </div>
              <CardTitle className="text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                Citas Próximas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 relative z-10">
              <div className="text-4xl font-black text-purple-900 dark:text-purple-100 mb-2">
                {stats.upcomingAppointments}
              </div>
              <p className="text-purple-600 dark:text-purple-400 font-medium">Por realizar</p>
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
              <div className="text-4xl font-black text-amber-900 dark:text-amber-100 mb-2">
                {stats.pendingConfirmations}
              </div>
              <p className="text-amber-600 dark:text-amber-400 font-medium">Necesitan confirmación</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Appointments List */}
        <div className="mb-12">
          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
            
            <CardHeader className="p-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                    Agenda del Día
                  </CardTitle>
                  <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">
                    Todas las citas programadas para hoy
                  </p>
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
                  {appointments.map((appointment, index) => (
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
                                <span className="font-medium">{formatTime(appointment.appointmentDate)}</span>
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
                          <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
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
      </div>
    </div>
  );
}
