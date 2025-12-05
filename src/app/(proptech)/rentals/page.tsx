"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarIcon,
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";

interface TemporalRental {
  id: number;
  confirmationCode: string;
  property: {
    id: number;
    title: string;
    address: string;
    featuredImage?: string;
  };
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  pricePerNight: number;
  finalPrice: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  CHECKED_IN: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CHECKED_OUT: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  COMPLETED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  NO_SHOW: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

const STATUS_LABELS = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CHECKED_IN: "Check-in",
  CHECKED_OUT: "Check-out",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No Show",
};

const PAYMENT_STATUS_LABELS = {
  PENDING: "Pendiente",
  PARTIAL: "Parcial",
  PAID: "Pagado",
  REFUNDED: "Reembolsado",
  FAILED: "Fallido",
};

export default function RentalsPage() {
  const router = useRouter();
  const [rentals, setRentals] = useState<TemporalRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      setLoading(true);
      const { temporalRentalService } = await import("./services/temporalRentalService");
      const data = await temporalRentalService.getAll();
      setRentals(data as any);
    } catch (error) {
      console.error('Error loading rentals:', error);
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRentals = rentals.filter(rental => {
    // Filtro de búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !rental.confirmationCode.toLowerCase().includes(searchLower) &&
        !rental.guestName.toLowerCase().includes(searchLower) &&
        !rental.property.title.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Filtro de estado
    if (statusFilter !== "ALL" && rental.status !== statusFilter) {
      return false;
    }

    // Filtro de fecha
    if (dateFilter !== "ALL") {
      const now = new Date();
      const checkIn = new Date(rental.checkInDate);
      
      if (dateFilter === "UPCOMING" && checkIn < now) return false;
      if (dateFilter === "PAST" && checkIn >= now) return false;
      if (dateFilter === "TODAY") {
        const today = new Date().toDateString();
        if (checkIn.toDateString() !== today) return false;
      }
    }

    return true;
  });

  const stats = {
    total: rentals.length,
    confirmed: rentals.filter(r => r.status === "CONFIRMED").length,
    checkedIn: rentals.filter(r => r.status === "CHECKED_IN").length,
    upcoming: rentals.filter(r => {
      const checkIn = new Date(r.checkInDate);
      return checkIn > new Date() && r.status === "CONFIRMED";
    }).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-blue-600" />
                Alquileres Temporales
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestiona reservas de hoteles, quintas, granjas y departamentos
              </p>
            </div>
            <button
              onClick={() => router.push("/rentals/new")}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nueva Reserva
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {stats.total}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Total Reservas
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {stats.confirmed}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Confirmadas
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {stats.checkedIn}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                En Estadía
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                {stats.upcoming}
              </div>
              <div className="text-sm text-amber-600 dark:text-amber-400">
                Próximas
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por código, huésped o propiedad..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todos los estados</option>
                <option value="PENDING">Pendientes</option>
                <option value="CONFIRMED">Confirmadas</option>
                <option value="CHECKED_IN">Check-in</option>
                <option value="CHECKED_OUT">Check-out</option>
                <option value="COMPLETED">Completadas</option>
                <option value="CANCELLED">Canceladas</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todas las fechas</option>
                <option value="TODAY">Hoy</option>
                <option value="UPCOMING">Próximas</option>
                <option value="PAST">Pasadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rentals List */}
        <div className="mt-6 space-y-4">
          {filteredRentals.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
              <CalendarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No hay reservas
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {search || statusFilter !== "ALL" || dateFilter !== "ALL"
                  ? "No se encontraron reservas con los filtros aplicados"
                  : "Comienza creando tu primera reserva de alquiler temporal"}
              </p>
              <button
                onClick={() => router.push("/rentals/new")}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Nueva Reserva
              </button>
            </div>
          ) : (
            filteredRentals.map((rental) => (
              <div
                key={rental.id}
                onClick={() => router.push(`/rentals/${rental.id}`)}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">
                        #{rental.confirmationCode}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[rental.status as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABELS[rental.status as keyof typeof STATUS_LABELS]}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {rental.property.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {rental.property.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('es-PY', {
                        style: 'currency',
                        currency: rental.currency,
                        minimumFractionDigits: 0,
                      }).format(rental.finalPrice)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {rental.numberOfNights} {rental.numberOfNights === 1 ? 'noche' : 'noches'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Huésped</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" />
                      {rental.guestName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {rental.numberOfGuests} {rental.numberOfGuests === 1 ? 'persona' : 'personas'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Check-in</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(rental.checkInDate).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Check-out</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(rental.checkOutDate).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Pago</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {PAYMENT_STATUS_LABELS[rental.paymentStatus as keyof typeof PAYMENT_STATUS_LABELS]}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

