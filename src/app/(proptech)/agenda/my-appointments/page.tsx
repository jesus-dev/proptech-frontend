"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, ArrowLeft, Plus, CalendarDays, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuthContext as useAuth } from "@/context/AuthContext";
import { agendaService } from "../services/agendaService";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("DATE_DESC");
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      fetchMyAppointments();
    }
  }, [isLoading]);

  const fetchMyAppointments = async () => {
    try {
      if (!isAuthenticated || !user?.id) {
        setAppointments([]);
        return;
      }
      const data = await agendaService.getAppointmentsByAgent(Number(user.id));
      setAppointments(data || []);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="mb-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
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
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 shadow">
                    <CalendarDays className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      Mis Citas
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Gestiona tus citas personales
                    </p>
                  </div>
                </div>
              </div>
              <Link href="/agenda/new">
                <Button size="sm" className="group bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow">
                  <Plus className="w-4 h-4 mr-1" />
                  Nueva Cita
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
          <CardHeader className="p-4 relative z-10">
            <CardTitle className="flex items-center text-xl font-bold text-slate-800 dark:text-slate-200">
              <User className="w-5 h-5 mr-2 text-green-600" />
              Mis Citas Programadas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 relative z-10">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por título o cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="Programada">Programada</SelectItem>
                <SelectItem value="Confirmada">Confirmada</SelectItem>
                <SelectItem value="En Progreso">En Progreso</SelectItem>
                <SelectItem value="Completada">Completada</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DATE_DESC">Fecha descendente</SelectItem>
                <SelectItem value="DATE_ASC">Fecha ascendente</SelectItem>
                <SelectItem value="DURATION_DESC">Duración descendente</SelectItem>
                <SelectItem value="DURATION_ASC">Duración ascendente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(() => {
            const filtered = appointments.filter((a) => {
              const matchesSearch = !search ||
                a.title.toLowerCase().includes(search.toLowerCase()) ||
                (a.clientName || '').toLowerCase().includes(search.toLowerCase());
              const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
              return matchesSearch && matchesStatus;
            });

            const sorted = [...filtered].sort((a, b) => {
              if (sortBy === 'DATE_DESC') return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
              if (sortBy === 'DATE_ASC') return new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime();
              if (sortBy === 'DURATION_DESC') return (b.durationMinutes || 0) - (a.durationMinutes || 0);
              if (sortBy === 'DURATION_ASC') return (a.durationMinutes || 0) - (b.durationMinutes || 0);
              return 0;
            });

            // Agrupar por día
            const groups: Record<string, Appointment[]> = {};
            sorted.forEach((apt) => {
              const d = new Date(apt.appointmentDate);
              const key = d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
              if (!groups[key]) groups[key] = [];
              groups[key].push(apt);
            });

            return (
              <>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No tienes citas programadas</p>
              <Link href="/agenda/new">
                <Button variant="outline" className="mt-4">
                  Programar Primera Cita
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groups).map(([dateLabel, items]) => (
                <div key={dateLabel}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-8 rounded-full bg-gradient-to-b from-blue-600 to-purple-600"></div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{dateLabel}</h3>
                  </div>
                  <div className="space-y-4">
                    {items.map((appointment) => (
                      <div key={appointment.id} className="group relative p-6 rounded-2xl bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-slate-700/50 dark:to-slate-600/50 border border-white/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{appointment.title}</h4>
                              <Badge className={`px-3 py-1 rounded-full font-semibold text-xs ${getStatusColor(appointment.status)}`}>{appointment.status}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                {new Date(appointment.appointmentDate).toLocaleString('es-ES')}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
                                {appointment.location || 'Sin ubicación'}
                              </span>
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-2 text-purple-500" />
                                {appointment.clientName}
                              </span>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{appointment.durationMinutes} min</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{appointment.appointmentType}</div>
                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Button size="sm" variant="outline" onClick={async () => {
                                try {
                                  const updated = await agendaService.updateAppointmentStatus(appointment.id, 'Confirmada');
                                  setAppointments(prev => prev.map(a => a.id === appointment.id ? { ...a, status: updated.status || 'Confirmada' } : a));
                                } catch (e) { console.error(e); }
                              }}>Confirmar</Button>
                              <Button size="sm" variant="outline" onClick={async () => {
                                try {
                                  const updated = await agendaService.updateAppointmentStatus(appointment.id, 'Completada');
                                  setAppointments(prev => prev.map(a => a.id === appointment.id ? { ...a, status: updated.status || 'Completada' } : a));
                                } catch (e) { console.error(e); }
                              }}>Completar</Button>
                              <Button size="sm" variant="destructive" onClick={async () => {
                                try {
                                  const updated = await agendaService.cancelAppointment(appointment.id, 'Cancelada desde Mis Citas');
                                  setAppointments(prev => prev.map(a => a.id === appointment.id ? { ...a, status: updated.status || 'Cancelada' } : a));
                                } catch (e) { console.error(e); }
                              }}>Cancelar</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
              </>
            );
          })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
