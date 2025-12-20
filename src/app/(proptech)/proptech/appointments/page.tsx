"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, User, ArrowLeft, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { proptechService } from "../services/proptechService";
import { PublicAppointment } from "../types";

export default function PublicAppointmentsPage() {
  const [appointments, setAppointments] = useState<PublicAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const { hasRole } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // Verificar que el usuario sea SUPER_ADMIN
    if (!hasRole("SUPER_ADMIN")) {
      router.push("/dash");
      return;
    }
    fetchAppointments();
  }, [page, hasRole, router]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await proptechService.getPublicAppointments(page, 50);
      setAppointments(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "programada":
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "confirmada":
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "en progreso":
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completada":
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelada":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      apt.title?.toLowerCase().includes(searchLower) ||
      apt.description?.toLowerCase().includes(searchLower) ||
      apt.clientName?.toLowerCase().includes(searchLower) ||
      apt.location?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/dash">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Citas Agendadas
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Citas agendadas desde registros públicos
                </p>
              </div>
            </div>
            <Button onClick={fetchAppointments} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-1" />
              Actualizar
            </Button>
          </div>

          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Buscar por título, descripción, cliente o ubicación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Total: {totalElements}</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Citas Agendadas ({filteredAppointments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay citas agendadas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {apt.title}
                          </h3>
                          <Badge className={getStatusColor(apt.status)}>{apt.status}</Badge>
                        </div>

                        {apt.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {apt.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(apt.appointmentDate).toLocaleDateString("es-PY", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(apt.appointmentDate).toLocaleTimeString("es-PY", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              ({apt.durationMinutes} min)
                            </span>
                          </div>
                          {apt.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="w-4 h-4" />
                              <span>{apt.location}</span>
                            </div>
                          )}
                          {apt.clientName && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <User className="w-4 h-4" />
                              <span>{apt.clientName}</span>
                            </div>
                          )}
                          {apt.appointmentType && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">Tipo:</span>
                              <span>{apt.appointmentType}</span>
                            </div>
                          )}
                        </div>

                        {apt.notes && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">Notas:</span> {apt.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {page + 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

