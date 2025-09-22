"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sale, Client, Lot } from "../components/types";
import { saleService } from "../services/saleService";
import { clientService } from "../services/clientService";
import { developmentService } from "../services/developmentService";
import PaymentHistory from "../components/PaymentHistory";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [developments, setDevelopments] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalRevenue: 0,
    activeSales: 0,
    completedSales: 0,
    overduePayments: 0,
  });
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDevelopment, setSelectedDevelopment] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [clientsMap, setClientsMap] = useState<Record<string, Client>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [salesData, clientsData, developmentsData, summaryData] = await Promise.all([
        saleService.getAllSales(),
        clientService.getAllClients(),
        developmentService.getAllDevelopments(),
        saleService.getSalesSummary(),
      ]);
      
      console.log('Sales loaded:', salesData.length);
      console.log('Clients loaded:', clientsData.length);
      console.log('Developments loaded:', (developmentsData as any).length);
      console.log('Sample sale:', salesData[0]);
      console.log('Sample development:', (developmentsData as any).find((d: any) => d.type === 'loteamiento'));
      
      setSales(salesData);
      setClients(clientsData);
      setDevelopments((developmentsData as any).data || []);
      setSummary(summaryData);

      const map: Record<string, Client> = {};
      clientsData.forEach((c) => { map[c.id] = c; });
      setClientsMap(map);
    } catch (error) {
      console.error("Error loading sales data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions using useMemo to recalculate when data changes
  const getClientForSale = useMemo(() => {
    return (clientId: string): Client | undefined => {
      return clients.find(client => client.id === clientId);
    };
  }, [clients]);

  const getLotForSale = useMemo(() => {
    return (lotId: string): Lot | undefined => {
      for (const development of developments) {
        if (development.type === 'loteamiento' && development.lots) {
          const lot = development.lots.find((l: Lot) => l.id === lotId);
          if (lot) return lot;
        }
      }
      return undefined;
    };
  }, [developments]);

  const getDevelopmentForLot = useMemo(() => {
    return (lotId: string): any => {
      for (const development of developments) {
        if (development.type === 'loteamiento' && development.lots) {
          const lot = development.lots.find((l: any) => l.id === lotId);
          if (lot) return development;
        }
      }
      return null;
    };
  }, [developments]);

  // Filtrar ventas por desarrollo y estado usando useMemo
  const filteredSales = useMemo(() => {
    console.log('Filtering sales:', {
      totalSales: sales.length,
      selectedDevelopment,
      filterStatus,
      developmentsCount: developments.length
    });
    
    const filtered = sales.filter(sale => {
      if (!sale.lotId) return false; // Skip sales without lotId
      
      const development = getDevelopmentForLot(sale.lotId);
      
      const matchesDevelopment = selectedDevelopment === "all" || 
        (development && development.id === selectedDevelopment);
      
      const matchesStatus = filterStatus === "all" || sale.status === filterStatus;
      
      if (selectedDevelopment !== "all") {
        console.log('Sale development check:', {
          saleId: sale.id,
          lotId: sale.lotId,
          development: development?.title,
          developmentId: development?.id,
          selectedDevelopment,
          matchesDevelopment
        });
      }
      
      return matchesDevelopment && matchesStatus;
    });
    
    console.log('Filtered sales result:', filtered.length);
    return filtered;
  }, [sales, selectedDevelopment, filterStatus, getDevelopmentForLot]);

  // Calcular estadísticas filtradas usando useMemo
  const filteredSummary = useMemo(() => {
    return {
      totalSales: filteredSales.length,
      totalRevenue: filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0),
      activeSales: filteredSales.filter(sale => sale.status === 'active').length,
      completedSales: filteredSales.filter(sale => sale.status === 'completed').length,
      overduePayments: filteredSales.reduce((sum, sale) => {
        const overdue = sale.payments.filter(p => 
          p.status === 'pending' && new Date(p.dueDate) < new Date()
        ).length;
        return sum + overdue;
      }, 0),
    };
  }, [filteredSales]);

  const generateSampleSales = async () => {
    try {
      // Obtener lotes vendidos y clientes
      const developments = await developmentService.getAllDevelopments();
      const clients = await clientService.getAllClients();
      
      const soldLots: unknown[] = [];
      (developments as any).forEach((dev: any) => {
        if (dev.type === 'loteamiento' && dev.lots) {
          dev.lots.forEach((lot: any) => {
            if (lot.status === 'sold') {
              soldLots.push({
                ...lot,
                developmentTitle: dev.title,
                developmentId: dev.id
              });
            }
          });
        }
      });

      if (soldLots.length === 0) {
        alert('No hay lotes vendidos. Primero vende algunos lotes desde la página de desarrollos.');
        return;
      }

      if (clients.length === 0) {
        alert('No hay clientes registrados. Primero agrega algunos clientes.');
        return;
      }

      // Generar ventas para los lotes vendidos
      for (const lot of soldLots.slice(0, 3)) { // Solo los primeros 3 lotes
        const client = clients[Math.floor(Math.random() * clients.length)];
        const downPayment = (lot as any).price * 0.3; // 30% de cuota inicial
        const totalPayments = 12 + Math.floor(Math.random() * 24); // 12-36 cuotas
        
        await saleService.createSale({
          clientId: client.id,
          lotId: (lot as any).id,
          totalPrice: (lot as any).price,
          downPayment,
          totalPayments,
          startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Últimos 90 días
        });
      }

      // Recargar datos
      await loadData();
      alert('Ventas de muestra generadas correctamente!');
    } catch (error) {
      console.error('Error generating sample sales:', error);
      alert('Error generando ventas de muestra');
    }
  };

  const clearAndReloadAll = async () => {
    try {
      // Limpiar localStorage
      localStorage.removeItem('sales');
      localStorage.removeItem('developments');
      localStorage.removeItem('clients');
      
      // Recargar datos
      await loadData();
      
      // Resetear filtros
      setSelectedDevelopment("all");
      setFilterStatus("all");
      
      alert('Datos limpiados y recargados correctamente!');
    } catch (error) {
      console.error('Error clearing and reloading data:', error);
      alert('Error limpiando y recargando datos');
    }
  };

  const generateSampleData = async () => {
    try {
      // Limpiar datos existentes
      localStorage.removeItem('sales');
      localStorage.removeItem('developments');
      localStorage.removeItem('clients');
      
      // Generar desarrollos de prueba
      const sampleDevelopments = [
        {
          type: "loteamiento",
          title: "Residencial Los Pinos",
          description: "Hermoso loteamiento con lotes desde 300m² hasta 800m², con todos los servicios incluidos.",
          address: "Ruta 2 Km 15",
          city: "San Lorenzo",
          state: "Central",
          zip: "2160",
          images: ["/images/placeholder.jpg"],
          status: "available",
          privateFiles: [],
          coordinates: { lat: -25.3400, lng: -57.5200 },
          numberOfLots: 20,
          totalArea: 15000,
          availableLots: 15,
          lotSizes: "300m² - 800m²",
          services: ["Agua", "Electricidad", "Gas", "Calles asfaltadas"],
        },
        {
          type: "loteamiento",
          title: "Country Club San Martín",
          description: "Exclusivo loteamiento con seguridad 24/7 y amenidades premium.",
          address: "Ruta 1 Km 25",
          city: "Luque",
          state: "Central",
          zip: "2060",
          images: ["/images/placeholder.jpg"],
          status: "available",
          privateFiles: [],
          coordinates: { lat: -25.2700, lng: -57.4800 },
          numberOfLots: 15,
          totalArea: 12000,
          availableLots: 10,
          lotSizes: "500m² - 1000m²",
          services: ["Agua", "Electricidad", "Gas", "Calles asfaltadas", "Seguridad 24/7"],
        }
      ];

      // Crear desarrollos
      for (const devData of sampleDevelopments) {
        await developmentService.createDevelopment(devData as any);
      }

      // Generar clientes de prueba
      const sampleClients = [
        {
          firstName: "Juan",
          lastName: "Pérez",
          dni: "12345678",
          email: "juan.perez@email.com",
          phone: "351-123-4567",
          address: "Av. Colón 123",
          city: "Córdoba",
          state: "Córdoba",
          zip: "5000",
        },
        {
          firstName: "María",
          lastName: "González",
          dni: "87654321",
          email: "maria.gonzalez@email.com",
          phone: "351-987-6543",
          address: "Belgrano 456",
          city: "Córdoba",
          state: "Córdoba",
          zip: "5000",
        },
        {
          firstName: "Carlos",
          lastName: "Rodríguez",
          dni: "11223344",
          email: "carlos.rodriguez@email.com",
          phone: "351-555-1234",
          address: "San Martín 789",
          city: "Córdoba",
          state: "Córdoba",
          zip: "5000",
        }
      ];

      // Crear clientes
      for (const clientData of sampleClients) {
        await clientService.createClient(clientData);
      }

      // Recargar datos
      await loadData();

      // Generar ventas de muestra
      await generateSampleSales();

      alert('Datos de prueba generados correctamente!');
    } catch (error) {
      console.error('Error generating sample data:', error);
      alert('Error generando datos de prueba');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "defaulted":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Activa";
      case "completed":
        return "Completada";
      case "cancelled":
        return "Cancelada";
      case "defaulted":
        return "En Mora";
      default:
        return status;
    }
  };

  const handlePaymentClick = (sale: Sale) => {
    setSelectedSale(sale);
    setIsPaymentModalOpen(true);
  };

  const updateDataAndSelectedSale = async () => {
    try {
      const [salesData, clientsData, developmentsData, summaryData] = await Promise.all([
        saleService.getAllSales(),
        clientService.getAllClients(),
        developmentService.getAllDevelopments(),
        saleService.getSalesSummary(),
      ]);
      
      setSales(salesData);
      setClients(clientsData);
      setDevelopments((developmentsData as any).data || []);
      setSummary(summaryData);
      
      // Actualizar la venta seleccionada con los datos más recientes
      if (selectedSale) {
        const updatedSale = salesData.find(s => s.id === selectedSale.id);
        if (updatedSale) {
          setSelectedSale(updatedSale);
        }
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handlePaymentRecorded = async () => {
    await updateDataAndSelectedSale();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard de Ventas
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gestiona y monitorea todas las ventas de lotes
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ventas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredSummary.totalSales}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${filteredSummary.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ventas Activas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredSummary.activeSales}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completadas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredSummary.completedSales}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900/20">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cuotas Vencidas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredSummary.overduePayments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h3>
          <div className="flex gap-2">
            <button
              onClick={clearAndReloadAll}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Limpiar Todo
            </button>
            <button
              onClick={() => {
                console.log('=== DEBUG INFO ===');
                console.log('Sales:', sales.length);
                console.log('Clients:', clients.length);
                console.log('Developments:', developments.length);
                console.log('Selected Development:', selectedDevelopment);
                console.log('Filter Status:', filterStatus);
                console.log('Filtered Sales:', filteredSales.length);
                
                // Detailed sales info
                console.log('=== SALES DETAILS ===');
                sales.forEach((sale, index) => {
                  if (!sale.lotId) {
                    console.log(`Sale ${index + 1}: No lotId`);
                    return;
                  }
                  const lot = getLotForSale(sale.lotId);
                  const development = getDevelopmentForLot(sale.lotId);
                  console.log(`Sale ${index + 1}:`, {
                    saleId: sale.id,
                    lotId: sale.lotId,
                    lot: lot ? `Lote ${lot.number}` : 'No encontrado',
                    development: development ? development.title : 'No encontrado',
                    developmentId: development?.id,
                    status: sale.status
                  });
                });
                
                // Developments info
                console.log('=== DEVELOPMENTS INFO ===');
                developments.forEach((dev, index) => {
                  console.log(`Development ${index + 1}:`, {
                    id: dev.id,
                    title: dev.title,
                    type: dev.type,
                    lotsCount: dev.lots?.length || 0,
                    soldLots: dev.lots?.filter((l: any) => l.status === 'sold').length || 0
                  });
                });
                
                alert(`Debug info logged to console.\nSales: ${sales.length}\nDevelopments: ${developments.length}\nFiltered: ${filteredSales.length}`);
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Debug
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Desarrollo
            </label>
            <select
              value={selectedDevelopment}
              onChange={(e) => setSelectedDevelopment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Todos los desarrollos</option>
              {developments
                .filter(dev => dev.type === 'loteamiento')
                .map(development => (
                  <option key={development.id} value={development.id}>
                    {development.title}
                  </option>
                ))}
            </select>
            {selectedDevelopment !== "all" && (
              <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">
                Filtrado por: {developments.find(d => d.id === selectedDevelopment)?.title}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado de Venta
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
              <option value="defaulted">En Mora</option>
            </select>
            {filterStatus !== "all" && (
              <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">
                Filtrado por: {getStatusLabel(filterStatus)}
              </p>
            )}
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedDevelopment("all");
                setFilterStatus("all");
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
        
        {/* Active filters indicator */}
        {(selectedDevelopment !== "all" || filterStatus !== "all") && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Filtros activos:</strong>
              {selectedDevelopment !== "all" && (
                <span className="ml-2">
                  Desarrollo: {developments.find(d => d.id === selectedDevelopment)?.title}
                </span>
              )}
              {filterStatus !== "all" && (
                <span className="ml-2">
                  Estado: {getStatusLabel(filterStatus)}
                </span>
              )}
              <span className="ml-2">
                ({filteredSales.length} de {sales.length} ventas)
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Sales List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Lista de Ventas ({filteredSales.length})
            {selectedDevelopment !== "all" && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                - {developments.find(d => d.id === selectedDevelopment)?.title}
              </span>
            )}
          </h2>
          {sales.length === 0 && (
            <div className="flex gap-3 justify-center">
              <button
                onClick={generateSampleData}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                Generar Datos de Prueba
              </button>
              <button
                onClick={generateSampleSales}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Solo Generar Ventas
              </button>
              <button
                onClick={clearAndReloadAll}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Limpiar y Recargar
              </button>
            </div>
          )}
        </div>

        {filteredSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Venta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lote
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Desarrollo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Precio Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cuota Mensual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSales.map((sale) => {
                  const client = getClientForSale(sale.clientId);
                  const lot = sale.lotId ? getLotForSale(sale.lotId) : undefined;
                  const development = sale.lotId ? getDevelopmentForLot(sale.lotId) : undefined;
                  const paidPayments = sale.payments.filter(p => p.status === 'paid').length;
                  const progressPercentage = (paidPayments / sale.totalPayments) * 100;

                  return (
                    <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        #{sale.id.split('-')[1]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {lot ? `Lote ${lot.number}` : 'Lote no encontrado'}
                        {lot && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {lot.area} m² - ${lot.price.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {development ? development.title : 'Desarrollo no encontrado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {client ? `${client.firstName} ${client.lastName}` : 'Cliente no encontrado'}
                        {client && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {client.dni}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${sale.totalPrice.toLocaleString()}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Cuota inicial: ${sale.downPayment.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${sale.monthlyPayment.toLocaleString()}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {sale.totalPayments} cuotas
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2 dark:bg-gray-700">
                            <div 
                              className="bg-brand-500 h-2 rounded-full" 
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {paidPayments}/{sale.totalPayments}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                          {getStatusLabel(sale.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handlePaymentClick(sale)}
                          className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          Ver Pagos
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {selectedDevelopment !== "all" || filterStatus !== "all" 
                ? "No hay ventas que coincidan con los filtros seleccionados."
                : "No hay ventas registradas."
              }
            </p>
            {selectedDevelopment === "all" && filterStatus === "all" && (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Para ver ventas aquí, primero necesitas generar datos de prueba.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={generateSampleData}
                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                  >
                    Generar Datos de Prueba
                  </button>
                  <button
                    onClick={generateSampleSales}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Solo Generar Ventas
                  </button>
                  <button
                    onClick={clearAndReloadAll}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Limpiar y Recargar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Payment History Modal */}
      {selectedSale && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isPaymentModalOpen ? '' : 'hidden'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Historial de Pagos - Venta #{selectedSale.id}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePaymentRecorded}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Actualizar
                </button>
                <button
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedSale(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <PaymentHistory 
              sale={selectedSale} 
              onPaymentRecorded={handlePaymentRecorded}
            />
          </div>
        </div>
      )}
    </div>
  );
} 