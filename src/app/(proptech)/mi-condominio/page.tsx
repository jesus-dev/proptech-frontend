"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  MegaphoneIcon,
  UserGroupIcon,
  HomeIcon,
  CalendarIcon,
  PlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { residentCondominiumService, ResidentCondominium, ResidentMeResponse } from "@/services/residentCondominiumService";
import { toast } from "sonner";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function MiCondominioPage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<ResidentMeResponse | null>(null);
  const [selectedCondominiumId, setSelectedCondominiumId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [commonSpaces, setCommonSpaces] = useState<any[]>([]);
  const [assemblies, setAssemblies] = useState<any[]>([]);
  const [myPayments, setMyPayments] = useState<any[]>([]);
  const [myReservations, setMyReservations] = useState<any[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveForm, setReserveForm] = useState({ spaceId: 0, unitId: 0, reservationDate: "", startTime: "", endTime: "", notes: "" });
  const [reserveSubmitting, setReserveSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const condominium = me?.condominiums?.find((c) => c.id === selectedCondominiumId) ?? me?.condominiums?.[0];
  const allUnits = me?.condominiums?.flatMap((c) => c.units.map((u) => ({ ...u, condominiumId: c.id }))) ?? [];

  useEffect(() => {
    loadMe();
  }, []);

  useEffect(() => {
    if (condominium?.id) {
      setSelectedCondominiumId(condominium.id);
      loadSections(condominium.id);
    }
  }, [condominium?.id]);

  const loadMe = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await residentCondominiumService.getMe();
      setMe(data);
      if (data?.condominiums?.length) setSelectedCondominiumId(data.condominiums[0].id);
    } catch (e: any) {
      const message = e?.response?.data?.error || e?.message || "Error al cargar datos. Verifica tu conexión.";
      console.error("Mi condominio getMe error:", e?.response?.status, message, e);
      setLoadError(message);
      setMe({ condominiums: [] });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async (condominiumId: number) => {
    if (!condominiumId) return;
    try {
      setSectionsLoading(true);
      const [docs, ann, contacts, spaces, asm, payments, reservations] = await Promise.all([
        residentCondominiumService.getDocuments(condominiumId),
        residentCondominiumService.getAnnouncements(condominiumId),
        residentCondominiumService.getEmergencyContacts(condominiumId),
        residentCondominiumService.getCommonSpaces(condominiumId),
        residentCondominiumService.getAssemblies(condominiumId),
        residentCondominiumService.getMyPayments(),
        residentCondominiumService.getMyReservations(condominiumId),
      ]);
      setDocuments(Array.isArray(docs) ? docs : []);
      setAnnouncements(Array.isArray(ann) ? ann : []);
      setEmergencyContacts(Array.isArray(contacts) ? contacts : []);
      setCommonSpaces(Array.isArray(spaces) ? spaces : []);
      setAssemblies(Array.isArray(asm) ? asm : []);
      setMyPayments(Array.isArray(payments) ? payments : []);
      setMyReservations(Array.isArray(reservations) ? reservations : []);
    } catch (e: any) {
      toast.error(e?.message || "Error al cargar secciones");
    } finally {
      setSectionsLoading(false);
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveForm.spaceId || !reserveForm.unitId) {
      toast.error("Selecciona espacio y unidad");
      return;
    }
    try {
      setReserveSubmitting(true);
      await residentCondominiumService.createReservation({
        spaceId: reserveForm.spaceId,
        unitId: reserveForm.unitId,
        reservationDate: reserveForm.reservationDate || undefined,
        startTime: reserveForm.startTime || undefined,
        endTime: reserveForm.endTime || undefined,
        notes: reserveForm.notes || undefined,
      });
      toast.success("Reserva solicitada");
      setShowReserveModal(false);
      if (condominium?.id) loadSections(condominium.id);
    } catch (err: any) {
      toast.error(err?.message || "Error al crear reserva");
    } finally {
      setReserveSubmitting(false);
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    if (!confirm("¿Cancelar esta reserva?")) return;
    try {
      await residentCondominiumService.cancelReservation(reservationId);
      toast.success("Reserva cancelada");
      if (condominium?.id) loadSections(condominium.id);
    } catch (err: any) {
      toast.error(err?.message || "Error al cancelar reserva");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const noCondominium = !me?.condominiums?.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full min-w-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <HomeIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Mi condominio</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Vista para residentes y propietarios. Aquí verás la información de tu unidad y del edificio.
          </p>
        </div>

        {/* Error al cargar API */}
        {loadError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-200">No se pudieron cargar tus datos</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{loadError}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  Asegúrate de estar conectado y con sesión iniciada. Si el problema continúa, cierra sesión y vuelve a entrar.
                </p>
                <button
                  type="button"
                  onClick={() => loadMe()}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        )}

        {noCondominium && !loadError ? (
          <>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
              <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                Tu usuario aún no está asociado a ninguna unidad. Un administrador debe asignarte a una unidad desde{" "}
                <Link href="/condominiums" className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-100">
                  Administrar condominios
                </Link>
                {" "}→ entra a un condominio → pestaña <strong>Ocupantes</strong> → &quot;Asignar ocupante&quot;. Cuando te asocien, aquí podrás ver:
              </p>
              <ul className="mt-3 text-amber-700 dark:text-amber-300 text-sm space-y-1 list-disc list-inside">
                <li>Mis cuotas y pagos</li>
                <li>Documentos y reglamentos del edificio</li>
                <li>Comunicados y anuncios</li>
                <li>Contactos de emergencia</li>
                <li>Reservar espacios comunes</li>
                <li>Asambleas y actas</li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => loadMe()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Reintentar
                </button>
                <Link
                  href="/condominiums"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors"
                >
                  Ir a administrar condominios
                </Link>
              </div>
            </div>
          </>
        ) : !noCondominium ? (
          <>
            {me!.condominiums!.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Condominio</label>
                <select
                  value={selectedCondominiumId ?? ""}
                  onChange={(e) => setSelectedCondominiumId(Number(e.target.value))}
                  className="w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                >
                  {me!.condominiums!.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {condominium && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Unidad(es): {condominium.units.map((u) => `${u.unitNumber} (${u.role})`).join(", ")}
              </p>
            )}

            {sectionsLoading ? (
              <div className="flex justify-center py-12"><LoadingSpinner /></div>
            ) : (
              <div className="space-y-8">
                {/* Mis pagos */}
                <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-blue-600" /> Mis pagos
                  </h2>
                  {myPayments.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay pagos registrados.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-2 text-gray-600 dark:text-gray-400">Unidad</th>
                            <th className="text-left py-2 text-gray-600 dark:text-gray-400">Período</th>
                            <th className="text-left py-2 text-gray-600 dark:text-gray-400">Monto</th>
                            <th className="text-left py-2 text-gray-600 dark:text-gray-400">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myPayments.map((p: any) => (
                            <tr key={p.id} className="border-b border-gray-100 dark:border-gray-700/50">
                              <td className="py-2">{p.unitNumber}</td>
                              <td className="py-2">{p.feePeriod}</td>
                              <td className="py-2">{p.amount != null ? Number(p.amount).toLocaleString() : "-"}</td>
                              <td className="py-2">
                                <span className={`px-2 py-0.5 rounded text-xs ${p.status === "PAID" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                                  {p.status === "PAID" ? "Pagado" : p.status === "PENDING" ? "Pendiente" : p.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                {/* Documentos */}
                <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-green-600" /> Documentos
                  </h2>
                  {documents.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay documentos publicados.</p>
                  ) : (
                    <ul className="space-y-2">
                      {documents.map((d: any) => (
                        <li key={d.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                          <span className="font-medium text-gray-900 dark:text-white">{d.title}</span>
                          {d.fileUrl && (
                            <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">Ver</a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Comunicados */}
                <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MegaphoneIcon className="w-5 h-5 text-purple-600" /> Comunicados
                  </h2>
                  {announcements.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay comunicados.</p>
                  ) : (
                    <ul className="space-y-4">
                      {announcements.filter((a: any) => a.isActive !== false).map((a: any) => (
                        <li key={a.id} className="border-l-4 border-purple-500 pl-4 py-2">
                          <p className="font-medium text-gray-900 dark:text-white">{a.title}</p>
                          {a.publishedAt && <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(a.publishedAt).toLocaleDateString("es-PY")}</p>}
                          {a.content && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{a.content}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Contactos de emergencia */}
                <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <UserGroupIcon className="w-5 h-5 text-red-600" /> Contactos de emergencia
                  </h2>
                  {emergencyContacts.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay contactos registrados.</p>
                  ) : (
                    <ul className="space-y-3">
                      {emergencyContacts.map((c: any) => (
                        <li key={c.id} className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-medium text-gray-900 dark:text-white">{c.name}</span>
                          {c.role && <span className="text-gray-500 dark:text-gray-400">({c.role})</span>}
                          {c.phone && (
                            <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
                              <PhoneIcon className="w-4 h-4" /> {c.phone}
                            </a>
                          )}
                          {c.email && (
                            <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
                              <EnvelopeIcon className="w-4 h-4" /> {c.email}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Espacios comunes: solicitar / reservar (autogestión) */}
                <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-indigo-600" /> Solicitar / Reservar espacios comunes
                    </h2>
                    {commonSpaces.filter((s: any) => s.isActive !== false).length > 0 && (
                      <button
                        onClick={() => {
                          setReserveForm({ spaceId: 0, unitId: condominium!.units[0]?.id ?? 0, reservationDate: "", startTime: "", endTime: "", notes: "" });
                          setShowReserveModal(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                      >
                        <PlusIcon className="w-4 h-4" /> Pedir espacio
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Podés solicitar el uso de un espacio común (salón, quincho, etc.) para una fecha y horario. La administración puede confirmar o rechazar.
                  </p>
                  {commonSpaces.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay espacios comunes configurados.</p>
                  ) : (
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      {commonSpaces.map((s: any) => (
                        <li key={s.id}>{s.name}{s.capacity != null ? ` (capacidad ${s.capacity})` : ""}</li>
                      ))}
                    </ul>
                  )}
                  {myReservations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Mis reservas</h3>
                      <ul className="space-y-2 text-sm">
                        {myReservations.map((r: any) => (
                          <li key={r.id} className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                            <span>
                              {r.spaceName} – {r.reservationDate ? new Date(r.reservationDate).toLocaleDateString("es-PY") : ""}
                              {r.startTime && ` ${String(r.startTime).slice(0, 5)}`}
                              {r.endTime && ` a ${String(r.endTime).slice(0, 5)}`}
                              {" "}
                              <span className={`font-medium ${r.status === "CANCELLED" ? "text-gray-500 line-through" : r.status === "CONFIRMED" ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                                {r.status === "PENDING" ? "Pendiente" : r.status === "CONFIRMED" ? "Confirmada" : r.status === "CANCELLED" ? "Cancelada" : r.status}
                              </span>
                            </span>
                            {r.status !== "CANCELLED" && r.status !== "COMPLETED" && (
                              <button
                                type="button"
                                onClick={() => handleCancelReservation(r.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Cancelar reserva"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>

                {/* Asambleas */}
                <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-amber-600" /> Asambleas
                  </h2>
                  {assemblies.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay asambleas registradas.</p>
                  ) : (
                    <ul className="space-y-3">
                      {assemblies.map((a: any) => (
                        <li key={a.id} className="border-b border-gray-100 dark:border-gray-700/50 pb-3 last:border-0">
                          <p className="font-medium text-gray-900 dark:text-white">{a.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {a.assemblyDate ? new Date(a.assemblyDate).toLocaleDateString("es-PY") : ""} {a.location ? ` · ${a.location}` : ""} · {a.status ?? ""}
                          </p>
                          {a.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{a.description}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            )}
          </>
        ) : null}

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          ¿Eres administrador?{" "}
          <Link href="/condominiums" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Ir a administrar condominios
          </Link>
        </p>
      </div>

      {/* Modal reservar */}
      {showReserveModal && condominium && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowReserveModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Solicitar espacio común</h3>
            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Espacio *</label>
                <select
                  value={reserveForm.spaceId}
                  onChange={(e) => setReserveForm({ ...reserveForm, spaceId: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value={0}>Seleccionar...</option>
                  {commonSpaces.filter((s: any) => s.isActive !== false).map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mi unidad *</label>
                <select
                  value={reserveForm.unitId}
                  onChange={(e) => setReserveForm({ ...reserveForm, unitId: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value={0}>Seleccionar...</option>
                  {condominium.units.map((u) => (
                    <option key={u.id} value={u.id}>{u.unitNumber}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha *</label>
                <input
                  type="date"
                  value={reserveForm.reservationDate}
                  onChange={(e) => setReserveForm({ ...reserveForm, reservationDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora inicio</label>
                  <input
                    type="time"
                    value={reserveForm.startTime}
                    onChange={(e) => setReserveForm({ ...reserveForm, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora fin</label>
                  <input
                    type="time"
                    value={reserveForm.endTime}
                    onChange={(e) => setReserveForm({ ...reserveForm, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
                <textarea
                  value={reserveForm.notes}
                  onChange={(e) => setReserveForm({ ...reserveForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowReserveModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" disabled={reserveSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {reserveSubmitting ? "Enviando..." : "Solicitar espacio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
