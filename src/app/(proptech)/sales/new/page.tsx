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
export default function NewPropertySalePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillPropertyId = searchParams.get("propertyId");
  const prefillContactEmail = searchParams.get("contactEmail");
  const prefillContactPhone = searchParams.get("contactPhone");
  const prefillNegocioId = searchParams.get("negocioId");
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

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 bg-white rounded-2xl shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <BuildingIcon className="w-8 h-8 text-brand-500" />
          Nueva Operación de Propiedad
        </h1>
        <p className="text-gray-600">Completa los datos de la operación para registrar la transacción</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Selector de tipo de operación */}
        <div>
          <label className="block text-sm font-medium mb-2">Tipo de Operación <span className="text-red-500">*</span></label>
          <select
            value={operationType}
            onChange={e => setOperationType(e.target.value as 'venta' | 'alquiler')}
            className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
          </select>
        </div>
        {/* Información de la Propiedad */}
        <div>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
            <BuildingIcon className="w-6 h-6 text-brand-500" />
            Propiedad a Operar
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Propiedad <span className="text-red-500">*</span></label>
            <Combobox value={selectedProperty} onChange={setSelectedProperty} nullable>
              <div className="relative">
                <Combobox.Input
                  className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  displayValue={(p: Property|null) => p ? `${p.title} (${p.city})` : ""}
                  onChange={e => setPropertyQuery(e.target.value)}
                  placeholder="Buscar y seleccionar propiedad..."
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Combobox.Button>
                <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {filteredProperties.length === 0 && (
                    <div className="text-gray-500 px-4 py-3 text-center">No se encontraron propiedades disponibles.</div>
                  )}
                  {filteredProperties.map((p) => (
                    <Combobox.Option key={p.id} value={p} className={({ active }) => `cursor-pointer select-none px-4 py-3 ${active ? 'bg-brand-50' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{p.title}</h3>
                          <p className="text-sm text-gray-600">{p.address}, {p.city}</p>
                          <div className="flex gap-4 mt-1 text-xs text-gray-500">
                            {p.bedrooms && <span>🛏️ {p.bedrooms} dorm.</span>}
                            {p.bathrooms && <span>🚿 {p.bathrooms} baños</span>}
                            {p.area && <span>📐 {p.area}m²</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-brand-600">{formatCurrency(p.price)}</div>
                          <div className="text-xs text-gray-500">{p.type}</div>
                        </div>
                      </div>
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </div>
            </Combobox>
          </div>
          {selectedProperty && (
            <div className="mt-4 p-4 bg-brand-50 rounded-xl border border-brand-200">
              <h3 className="font-semibold text-brand-800 mb-2 flex items-center gap-2">
                <BuildingIcon className="w-5 h-5 text-brand-500" /> Propiedad Seleccionada
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
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
        <div>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
            <UserCircleIcon className="w-6 h-6 text-brand-500" />
            Cliente
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Cliente <span className="text-red-500">*</span></label>
            <Combobox value={selectedClient} onChange={setSelectedClient} nullable>
              <div className="relative">
                <Combobox.Input
                  className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  displayValue={(c: Client|null) => c ? `${c.firstName} ${c.lastName}` : ""}
                  onChange={e => setClientQuery(e.target.value)}
                  placeholder="Buscar y seleccionar cliente..."
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Combobox.Button>
                <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {filteredClients.length === 0 && (
                    <div className="text-gray-500 px-4 py-3 text-center">No se encontraron clientes.</div>
                  )}
                  {filteredClients.map((c) => (
                    <Combobox.Option key={c.id} value={c} className={({ active }) => `cursor-pointer select-none px-4 py-3 ${active ? 'bg-brand-50' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{c.firstName} {c.lastName}</h3>
                          <p className="text-sm text-gray-600">{c.email}</p>
                          <p className="text-sm text-gray-500">{c.phone}</p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <div>DNI: {c.dni}</div>
                          <div>{c.city}</div>
                        </div>
                      </div>
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </div>
            </Combobox>
          </div>
          {selectedClient && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <UserCircleIcon className="w-5 h-5 text-green-600" /> Cliente Seleccionado
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
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
        <div>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
            <CurrencyDollarIcon className="w-6 h-6 text-brand-500" />
            Detalles de la Operación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Precio Total */}
            <div>
              <label className="block text-sm font-medium mb-1">Precio Total <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">
                  {selectedProperty?.currency === 'USD' ? '$' : selectedProperty?.currency === 'PYG' ? 'Gs.' : '$'}
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full h-12 pl-12 pr-3 rounded-xl border shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  min={0}
                  step="0.01"
                />
              </div>
            </div>
            {/* Pago Inicial */}
            <div>
              <label className="block text-sm font-medium mb-1">Pago Inicial</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">
                  {selectedProperty?.currency === 'USD' ? '$' : selectedProperty?.currency === 'PYG' ? 'Gs.' : '$'}
                </span>
                <input
                  type="number"
                  value={downPayment}
                  onChange={e => setDownPayment(e.target.value)}
                  className="w-full h-12 pl-12 pr-3 rounded-xl border shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Monto entregado al inicio (anticipo o depósito)</p>
            </div>
            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium mb-1">Método de Pago</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full h-12 rounded-xl border shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
              <label className="block text-sm font-medium mb-2">Porcentaje de Comisión (%)</label>
              <select
                value={commissionPercentage}
                onChange={e => setCommissionPercentage(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
              <label className="block text-sm font-medium mb-2">Comisión Calculada</label>
              <input
                type="text"
                value={formatCurrency(commission)}
                readOnly
                className="border border-gray-300 rounded-xl px-4 py-3 w-full bg-gray-50"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Fecha de Operación */}
            <div>
              <label className="block text-sm font-medium mb-2">Fecha de Operación</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            {/* Notas Adicionales */}
            <div>
              <label className="block text-sm font-medium mb-2">Notas Adicionales</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="Información adicional sobre la operación, condiciones especiales, etc."
              />
            </div>
          </div>
        </div>
        {/* Resumen de la Operación */}
        {selectedProperty && selectedClient && price && (
          <div className="bg-gray-50 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              Resumen de la Operación
            </h2>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 font-semibold text-sm">
                Tipo de operación: {operationType === 'venta' ? 'Venta' : 'Alquiler'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-xl border flex flex-col items-center">
                <BuildingIcon className="w-8 h-8 text-brand-500 mb-2" />
                <h3 className="font-medium text-gray-700 mb-1">Propiedad</h3>
                <p className="text-lg font-semibold text-gray-900">{selectedProperty.title}</p>
                <p className="text-sm text-gray-600">{selectedProperty.address}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border flex flex-col items-center">
                <UserCircleIcon className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-medium text-gray-700 mb-1">Cliente</h3>
                <p className="text-lg font-semibold text-gray-900">{selectedClient.firstName} {selectedClient.lastName}</p>
                <p className="text-sm text-gray-600">{selectedClient.email}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border flex flex-col items-center">
                <CurrencyDollarIcon className="w-8 h-8 text-brand-500 mb-2" />
                <h3 className="font-medium text-gray-700 mb-1">Valores</h3>
                <p className="text-lg font-semibold text-brand-600">{formatCurrency(price)}</p>
                <p className="text-sm text-gray-600">Comisión: {formatCurrency(commission)}</p>
              </div>
            </div>
          </div>
        )}
        {/* Botones */}
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 transition w-full md:w-auto"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-xl font-bold text-lg shadow hover:bg-brand-700 transition w-full md:w-auto disabled:opacity-60"
            disabled={saving || !selectedProperty || !selectedClient || !price}
          >
            <CheckCircleIcon className="w-6 h-6" />
            {saving ? "Guardando..." : "Registrar Operación"}
          </button>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
} 