"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { propertyService } from "../../properties/services/propertyService";
import { clientService } from "../../developments/services/clientService";
import { leadApiService } from "../services/leadApiService";
import type { Property } from "../../properties/components/types";
import type { Client } from "../../developments/components/types";
import { Combobox, Listbox } from '@headlessui/react';
import { BuildingIcon, UserCircleIcon, CheckCircleIcon } from "@/icons";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import CurrencySymbol from "@/components/ui/CurrencySymbol";
export default function NewPropertySalePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillPropertyId = searchParams?.get("propertyId");
  const prefillContactEmail = searchParams?.get("contactEmail");
  const prefillContactPhone = searchParams?.get("contactPhone");
  const prefillNegocioId = searchParams?.get("negocioId");
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [price, setPrice] = useState("");
  const [commission, setCommission] = useState("");
  const [commissionPercentage, setCommissionPercentage] = useState("3");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [downPayment, setDownPayment] = useState("");
  const [financing, setFinancing] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Agregar estado para búsqueda de clientes en Combobox
  const [clientQuery, setClientQuery] = useState("");
  const filteredClients = clientQuery === ""
    ? clients
    : clients.filter(c =>
        `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(clientQuery.toLowerCase())
      );

  // Agregar estado para búsqueda de propiedades (ahora para Combobox)
  const [propertyQuery, setPropertyQuery] = useState("");
  const filteredProperties = propertyQuery === ""
    ? properties
    : properties.filter(p =>
        `${p.title} ${p.address} ${p.city}`.toLowerCase().includes(propertyQuery.toLowerCase())
      );

  // Agregar estado para tipo de operación
  const [operationType, setOperationType] = useState<'venta' | 'alquiler'>('venta');

  useEffect(() => {
    propertyService.getAllProperties().then((response) => {
      const props = response.data;
      setProperties(props.filter((p: Property) => p.status !== "sold"));
      if (prefillPropertyId) {
        const found = props.find((p: Property) => p.id === prefillPropertyId);
        if (found) setSelectedProperty(found);
      }
    });
    clientService.getAllClients().then((clients: Client[]) => {
      setClients(clients);
      if (prefillContactEmail || prefillContactPhone) {
        const found = clients.find(c =>
          (prefillContactEmail && c.email === prefillContactEmail) ||
          (prefillContactPhone && c.phone === prefillContactPhone)
        );
        if (found) setSelectedClient(found);
      }
    });
  }, []);

  // Actualiza el precio al seleccionar propiedad
  useEffect(() => {
    if (selectedProperty) {
      setPrice(selectedProperty.price.toString());
      // Calcular comisión por defecto
      const defaultCommission = (selectedProperty.price * 0.03).toFixed(2);
      setCommission(defaultCommission);
    }
  }, [selectedProperty]);

  // Calcular comisión cuando cambia el porcentaje
  useEffect(() => {
    if (price && commissionPercentage) {
      const calculatedCommission = (parseFloat(price) * parseFloat(commissionPercentage) / 100).toFixed(2);
      setCommission(calculatedCommission);
    }
  }, [price, commissionPercentage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedProperty || !selectedClient || !price) {
      setError("Completa todos los campos obligatorios.");
      return;
    }
    setSaving(true);
    try {
      // Marcar propiedad como vendida
      await propertyService.updateProperty(selectedProperty.id, { status: "sold" });
      // Marcar negocio como cerrado si corresponde
      if (prefillNegocioId) {
        await leadApiService.updateLead(prefillNegocioId, { status: "GANADO" });
      }
      // Aquí podrías agregar la venta a un servicio de ventas si lo deseas
      setSaving(false);
      router.push("/dashboard/sales");
    } catch (err) {
      setError("Error al guardar la venta. Intenta nuevamente.");
      setSaving(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: selectedProperty?.currency || 'USD'
    }).format(Number(amount));
  };

  const inputBaseClass =
    "w-full px-4 py-2.5 bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500";

  const selectBaseClass =
    "w-full px-4 py-2.5 bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 cursor-pointer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 via-purple-600/10 to-indigo-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-800/60 shadow-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl shadow-xl">
                <BuildingIcon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-brand-700 to-purple-700 dark:from-white dark:via-brand-300 dark:to-purple-300 bg-clip-text text-transparent">
                  Nueva operación
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Registrá una <span className="font-semibold">venta</span> o <span className="font-semibold">alquiler</span> de una propiedad y guardá los datos de la transacción.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
        {/* Selector de tipo de operación */}
        <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/60 shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tipo de operación</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Elegí si la transacción es una venta o un alquiler.</p>
            </div>
          </div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
            Tipo <span className="text-red-500">*</span>
          </label>
          <select
            value={operationType}
            onChange={e => setOperationType(e.target.value as 'venta' | 'alquiler')}
            className={selectBaseClass}
          >
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
          </select>
        </div>
        {/* Información de la Propiedad */}
        <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/60 shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2 text-gray-900 dark:text-white">
            <BuildingIcon className="w-5 h-5 text-brand-600" />
            Propiedad
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Seleccioná la propiedad que se va a operar.</p>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
              Propiedad <span className="text-red-500">*</span>
            </label>
            <Combobox value={selectedProperty} onChange={setSelectedProperty} nullable>
              <div className="relative">
                <Combobox.Input
                  className={inputBaseClass}
                  displayValue={(p: Property|null) => p ? `${p.title} (${p.city})` : ""}
                  onChange={e => setPropertyQuery(e.target.value)}
                  placeholder="Buscar y seleccionar propiedad..."
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Combobox.Button>
                <Combobox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl max-h-60 overflow-auto">
                  {filteredProperties.length === 0 && (
                    <div className="text-gray-500 dark:text-gray-400 px-4 py-3 text-center">No se encontraron propiedades disponibles.</div>
                  )}
                  {filteredProperties.map((p) => (
                    <Combobox.Option key={p.id} value={p} className={({ active }) => `cursor-pointer select-none px-4 py-3 ${active ? 'bg-brand-50 dark:bg-gray-800/60' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{p.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{p.address}, {p.city}</p>
                          <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {p.bedrooms && <span>🛏️ {p.bedrooms} dorm.</span>}
                            {p.bathrooms && <span>🚿 {p.bathrooms} baños</span>}
                            {p.area && <span>📐 {p.area}m²</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-brand-600">{formatCurrency(p.price)}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{p.type}</div>
                        </div>
                      </div>
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </div>
            </Combobox>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Tip: podés buscar por título, dirección o ciudad.
            </p>
          </div>
          {selectedProperty && (
            <div className="mt-4 p-4 bg-brand-50/80 dark:bg-gray-800/50 rounded-xl border border-brand-200/70 dark:border-gray-700/60">
              <h3 className="font-semibold text-brand-900 dark:text-white mb-2 flex items-center gap-2">
                <BuildingIcon className="w-5 h-5 text-brand-500" /> Propiedad Seleccionada
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <span className="font-medium">Título:</span> {selectedProperty.title}
                </div>
                <div>
                  <span className="font-medium">Precio:</span> {formatCurrency(selectedProperty.price)}
                </div>
                <div>
                  <span className="font-medium">Dirección:</span> {selectedProperty.address}
                </div>
                <div>
                  <span className="font-medium">Ciudad:</span> {selectedProperty.city}
                </div>
                {selectedProperty.bedrooms && (
                  <div>
                    <span className="font-medium">Dormitorios:</span> {selectedProperty.bedrooms}
                  </div>
                )}
                {selectedProperty.bathrooms && (
                  <div>
                    <span className="font-medium">Baños:</span> {selectedProperty.bathrooms}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Información del Cliente */}
        <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/60 shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2 text-gray-900 dark:text-white">
            <UserCircleIcon className="w-5 h-5 text-brand-600" />
            Cliente
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Seleccioná el cliente que participa en la operación.</p>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
              Cliente <span className="text-red-500">*</span>
            </label>
            <Combobox value={selectedClient} onChange={setSelectedClient} nullable>
              <div className="relative">
                <Combobox.Input
                  className={inputBaseClass}
                  displayValue={(c: Client|null) => c ? `${c.firstName} ${c.lastName}` : ""}
                  onChange={e => setClientQuery(e.target.value)}
                  placeholder="Buscar y seleccionar cliente..."
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Combobox.Button>
                <Combobox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl max-h-60 overflow-auto">
                  {filteredClients.length === 0 && (
                    <div className="text-gray-500 dark:text-gray-400 px-4 py-3 text-center">No se encontraron clientes.</div>
                  )}
                  {filteredClients.map((c) => (
                    <Combobox.Option key={c.id} value={c} className={({ active }) => `cursor-pointer select-none px-4 py-3 ${active ? 'bg-brand-50 dark:bg-gray-800/60' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{c.firstName} {c.lastName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{c.email}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{c.phone}</p>
                        </div>
                        <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                          <div>DNI: {c.dni}</div>
                          <div>{c.city}</div>
                        </div>
                      </div>
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </div>
            </Combobox>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Tip: buscá por nombre, email o teléfono.
            </p>
          </div>
          {selectedClient && (
            <div className="mt-4 p-4 bg-green-50/80 dark:bg-gray-800/50 rounded-xl border border-green-200/70 dark:border-gray-700/60">
              <h3 className="font-semibold text-green-900 dark:text-white mb-2 flex items-center gap-2">
                <UserCircleIcon className="w-5 h-5 text-green-600" /> Cliente Seleccionado
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <span className="font-medium">Nombre:</span> {selectedClient.firstName} {selectedClient.lastName}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {selectedClient.email}
                </div>
                <div>
                  <span className="font-medium">Teléfono:</span> {selectedClient.phone}
                </div>
                <div>
                  <span className="font-medium">DNI:</span> {selectedClient.dni}
                </div>
                <div>
                  <span className="font-medium">Dirección:</span> {selectedClient.address}
                </div>
                <div>
                  <span className="font-medium">Ciudad:</span> {selectedClient.city}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Detalles de la Operación */}
        <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/60 shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2 text-gray-900 dark:text-white">
            <CurrencyDollarIcon className="w-6 h-6 text-brand-500" />
            Detalles de la Operación
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Completá los valores y condiciones de la transacción.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Precio Total */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Precio total <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">
                  <CurrencySymbol currencyCode={selectedProperty?.currency} />
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className={`${inputBaseClass} pl-12`}
                  min={0}
                  step="0.01"
                />
              </div>
            </div>
            {/* Pago Inicial */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Pago inicial</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">
                  <CurrencySymbol currencyCode={selectedProperty?.currency} />
                </span>
                <input
                  type="number"
                  value={downPayment}
                  onChange={e => setDownPayment(e.target.value)}
                  className={`${inputBaseClass} pl-12`}
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Monto entregado al inicio (anticipo o depósito)</p>
            </div>
            {/* Método de Pago */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Método de pago</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className={selectBaseClass}
              >
                <option value="cash">Efectivo</option>
                <option value="bank_transfer">Transferencia Bancaria</option>
                <option value="check">Cheque</option>
                <option value="credit_card">Tarjeta de Crédito</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Porcentaje de Comisión */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Porcentaje de comisión (%)</label>
              <select
                value={commissionPercentage}
                onChange={e => setCommissionPercentage(e.target.value)}
                className={selectBaseClass}
              >
                <option value="2">2%</option>
                <option value="2.5">2.5%</option>
                <option value="3">3%</option>
                <option value="3.5">3.5%</option>
                <option value="4">4%</option>
                <option value="5">5%</option>
              </select>
            </div>
            {/* Comisión Calculada */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Comisión calculada</label>
              <input
                type="text"
                value={formatCurrency(commission)}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100/70 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-gray-200"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Se calcula automáticamente a partir del precio y el porcentaje.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Fecha de Operación */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Fecha de operación</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={inputBaseClass}
              />
            </div>
            {/* Notas Adicionales */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Notas</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className={`${inputBaseClass} min-h-[96px] resize-y`}
                placeholder="Información adicional sobre la operación, condiciones especiales, etc."
              />
            </div>
          </div>
        </div>
        {/* Resumen de la Operación */}
        {selectedProperty && selectedClient && price && (
          <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/60 shadow-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              Resumen de la Operación
            </h2>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 font-semibold text-sm">
                Tipo de operación: {operationType === 'venta' ? 'Venta' : 'Alquiler'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/60 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200/60 dark:border-gray-700/60 flex flex-col items-center">
                <BuildingIcon className="w-8 h-8 text-brand-500 mb-2" />
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Propiedad</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white text-center">{selectedProperty.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{selectedProperty.address}</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200/60 dark:border-gray-700/60 flex flex-col items-center">
                <UserCircleIcon className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white text-center">{selectedClient.firstName} {selectedClient.lastName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{selectedClient.email}</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200/60 dark:border-gray-700/60 flex flex-col items-center">
                <CurrencyDollarIcon className="w-8 h-8 text-brand-500 mb-2" />
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Valores</h3>
                <p className="text-lg font-semibold text-brand-600">{formatCurrency(price)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Comisión: {formatCurrency(commission)}</p>
              </div>
            </div>
          </div>
        )}
        {/* Botones */}
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-200 bg-white/90 dark:bg-gray-900/70 hover:bg-gray-50 dark:hover:bg-gray-800 transition w-full md:w-auto shadow-sm hover:shadow-md"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-extrabold text-lg shadow-xl hover:shadow-2xl hover:from-brand-700 hover:to-brand-800 transition w-full md:w-auto disabled:opacity-60"
            disabled={saving || !selectedProperty || !selectedClient || !price}
          >
            <CheckCircleIcon className="w-6 h-6" />
            {saving ? "Guardando..." : "Registrar Operación"}
          </button>
        </div>
        {error && (
          <div className="bg-red-50/90 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 rounded-xl p-4 mt-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        </form>
      </div>
    </div>
  );
} 