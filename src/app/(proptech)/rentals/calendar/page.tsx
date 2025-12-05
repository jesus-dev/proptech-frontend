"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

export default function RentalsCalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    return { daysInMonth, startDayOfWeek };
  };

  const { daysInMonth, startDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // TODO: Cargar reservas reales desde la API
  const mockReservations = [
    { day: 15, property: "Quinta Los Aromos", guests: 4, status: "confirmed" },
    { day: 16, property: "Quinta Los Aromos", guests: 4, status: "confirmed" },
    { day: 17, property: "Quinta Los Aromos", guests: 4, status: "confirmed" },
    { day: 20, property: "Hotel Suite 101", guests: 2, status: "checked_in" },
    { day: 21, property: "Hotel Suite 101", guests: 2, status: "checked_in" },
    { day: 25, property: "Depto Centro", guests: 1, status: "pending" },
  ];

  const getReservationsForDay = (day: number) => {
    return mockReservations.filter(r => r.day === day);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-200 dark:bg-yellow-800";
      case "confirmed": return "bg-blue-200 dark:bg-blue-800";
      case "checked_in": return "bg-green-200 dark:bg-green-800";
      default: return "bg-gray-200 dark:bg-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-blue-600" />
                Calendario de Reservas
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Visualiza la ocupación de tus propiedades
              </p>
            </div>
            <button
              onClick={() => router.push("/rentals")}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Ver Lista
            </button>
          </div>

          {/* Calendar Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-4">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white min-w-[200px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("month")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === "month"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setView("week")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === "week"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                Semana
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startDayOfWeek }, (_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[120px] p-2 border-b border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50"
              />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const reservations = getReservationsForDay(day);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day}
                  className={`min-h-[120px] p-2 border-b border-r border-gray-200 dark:border-gray-800 ${
                    isCurrentDay ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm font-semibold ${
                        isCurrentDay
                          ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {day}
                    </span>
                    {reservations.length > 0 && (
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {reservations.length}
                      </span>
                    )}
                  </div>

                  {/* Reservations */}
                  <div className="space-y-1">
                    {reservations.slice(0, 2).map((reservation, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-1 rounded ${getStatusColor(reservation.status)} truncate cursor-pointer hover:opacity-80 transition-opacity`}
                        title={`${reservation.property} - ${reservation.guests} huéspedes`}
                      >
                        <div className="font-medium truncate">
                          {reservation.property}
                        </div>
                      </div>
                    ))}
                    {reservations.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{reservations.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Leyenda
          </h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-200 dark:bg-yellow-800"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Pendiente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-200 dark:bg-blue-800"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Confirmada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-800"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">En Estadía</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

