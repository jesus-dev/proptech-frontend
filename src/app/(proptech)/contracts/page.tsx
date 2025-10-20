"use client";

import React, { useState, useEffect } from "react";
import { 
  PlusIcon, 
  ChevronUpIcon, 
  ChevronDownIcon, 
  UserCircleIcon, 
  DocumentArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UsersIcon as Users,
  CalendarIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { propertyService } from "@/app/(proptech)/properties/services/propertyService";
import { Contract } from "./components/types";
import { contractService } from "./services/contractService";
import { formatDateLatino, formatDateLista } from "./utils/dateUtils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { downloadContractDocument } from "./services/documentService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import DeleteConfirmationDialog from "./components/DeleteConfirmationDialog";

const getProperty = (id: string) => propertyService.getPropertyById(id);

type SortField = "title" | "date" | "clientName" | "status";
type SortDirection = "asc" | "desc";

interface SortableContractRowProps {
  contract: Contract;
  getStatusText: (status: Contract["status"]) => string;
  getStatusColor: (status: Contract["status"]) => string;
}

const SortableContractRow = ({ contract, getStatusText, getStatusColor }: SortableContractRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: contract.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${isDragging ? "opacity-50" : ""}`}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
        {contract.title}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {contract.clientName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {contract.signedDate ? formatDateLatino(contract.signedDate) : 
         contract.createdAt ? formatDateLatino(contract.createdAt) : "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
            contract.status
          )}`}
        >
          {getStatusText(contract.status)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link
          href={`/contracts/edit/${contract.id}`}
          className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
        >
          Editar
        </Link>
      </td>
    </tr>
  );
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    contractId: string;
    contractTitle: string;
  }>({
    isOpen: false,
    contractId: "",
    contractTitle: "",
  });

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const fetchedContracts = await contractService.getAllContracts();
      setContracts(fetchedContracts);
    } catch (error) {
      console.error('❌ ContractsPage: Error fetching contracts:', error);
      setError('Error al cargar los contratos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDownloadWord = async (contract: Contract) => {
    await downloadContractDocument(contract);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  const getStatusText = (status: Contract["status"]) => {
    switch (status) {
      case "DRAFT":
        return "Borrador";
      case "ACTIVE":
        return "Activo";
      case "COMPLETED":
        return "Completado";
      case "CANCELLED":
        return "Cancelado";
      case "SIGNED_PHYSICAL":
        return "Firmado Físicamente";
      case "SIGNED_DIGITAL":
        return "Digital";
      default:
        return status;
    }
  };

  const getStatusColor = (status: Contract["status"]) => {
    switch (status) {
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "SIGNED_PHYSICAL":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "SIGNED_DIGITAL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const handleView = (id: string | number) => {
    router.push(`/contracts/${id}`);
  };

  const handleEdit = async (id: string | number) => {
    try {
      // Verificar si el contrato puede ser modificado antes de redirigir
      const modificationCheck = await contractService.canModifyContract(String(id));
      if (!modificationCheck.canModify) {
        alert(`No se puede editar este contrato: ${modificationCheck.reason}`);
        return;
      }
      router.push(`/contracts/edit/${id}`);
    } catch (error) {
      console.error('Error checking contract modification:', error);
      alert('Error al verificar si el contrato puede ser editado. Por favor, intente nuevamente.');
    }
  };

  const handleDeleteClick = (contract: Contract) => {
    setDeleteDialog({
      isOpen: true,
      contractId: String(contract.id),
      contractTitle: contract.title,
    });
  };

  const confirmDelete = async () => {
    try {
      await contractService.deleteContract(deleteDialog.contractId);
      
      // Refresh the contracts list
      await fetchContracts();
      
      // Close the dialog
      setDeleteDialog({ isOpen: false, contractId: "", contractTitle: "" });
    } catch (error) {
      console.error('❌ ContractsPage: Error deleting contract:', error);
      alert('Error al eliminar el contrato. Por favor, intente nuevamente.');
    }
  };

  // Calculate stats
  const stats = {
    total: contracts.length,
    draft: contracts.filter(c => c.status === "DRAFT").length,
    active: contracts.filter(c => c.status === "ACTIVE").length,
    completed: contracts.filter(c => c.status === "COMPLETED").length,
    signed: contracts.filter(c => c.status === "SIGNED_PHYSICAL" || c.status === "SIGNED_DIGITAL").length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar contratos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const filteredContracts = contracts.filter((contract) => {
    const searchLower = search.toLowerCase();
    return (
      contract.title.toLowerCase().includes(searchLower) ||
      (contract.clientName && contract.clientName.toLowerCase().includes(searchLower)) ||
      getStatusText(contract.status).toLowerCase().includes(searchLower)
    );
  });

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;
    switch (sortField) {
      case "title":
        return direction * a.title.localeCompare(b.title);
      case "date":
        const dateA = a.signedDate ? new Date(a.signedDate).getTime() : 
                     a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.signedDate ? new Date(b.signedDate).getTime() : 
                     b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return direction * (dateA - dateB);
      case "clientName":
        const nameA = a.clientName || "";
        const nameB = b.clientName || "";
        return direction * nameA.localeCompare(nameB);
      case "status":
        return direction * a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full min-w-0">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Title Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg">
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-amber-900 dark:from-white dark:via-orange-200 dark:to-amber-200 bg-clip-text text-transparent">
                  Gestión de Contratos
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Administra y gestiona todos los contratos de propiedades de manera eficiente
              </p>
            </div>

            {/* Action Button */}
            <Link href="/contracts/new">
              <button className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-orange-500/30">
                <PlusIcon className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                Nuevo Contrato
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
              </button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-8">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.total}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Borradores</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.draft}</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Activos</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completados</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.completed}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Firmados</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.signed}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <DocumentArrowDownIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Actions */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título, cliente o estado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-sm transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {sortedContracts.length} de {contracts.length} contratos
              </span>
            </div>
          </div>
        </div>
        
        {/* Contracts Table */}
        {sortedContracts.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-12">
            <div className="text-center">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DocumentTextIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {search ? "No se encontraron contratos" : "No hay contratos registrados"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {search 
                  ? "No se encontraron contratos que coincidan con tu búsqueda."
                  : "Comienza creando tu primer contrato para gestionar las transacciones inmobiliarias."}
              </p>
              {!search && (
                <Link href="/contracts/new">
                  <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                    <PlusIcon className="w-5 h-5 mr-2 inline" />
                    Crear Primer Contrato
                  </button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="overflow-x-auto w-full min-w-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/80 dark:to-gray-800/80 border-b border-gray-200/50 dark:border-gray-600/50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-600/80 transition-colors"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center gap-2">
                        <DocumentTextIcon className="h-4 w-4 text-orange-500" />
                        Título
                        {getSortIcon("title")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-600/80 transition-colors"
                      onClick={() => handleSort("clientName")}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        Cliente
                        {getSortIcon("clientName")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-600/80 transition-colors"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-green-500" />
                        Fecha
                        {getSortIcon("date")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-600/80 transition-colors"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-2">
                        <span>Estado</span>
                        {getSortIcon("status")}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <span>Acciones</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-100/50 dark:divide-gray-700/50">
                  {sortedContracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 dark:hover:from-orange-900/10 dark:hover:to-amber-900/10 transition-all duration-200 group">
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                            <DocumentTextIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200">
                              {contract.title}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg shadow-sm">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            {contract.clientName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg shadow-sm">
                            <CalendarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {contract.signedDate ? formatDateLatino(contract.signedDate) : 
                             contract.createdAt ? formatDateLatino(contract.createdAt) : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          {contract.status === "ACTIVE" || contract.status === "SIGNED_PHYSICAL" || contract.status === "SIGNED_DIGITAL" ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-400 border border-green-200 dark:border-green-700 shadow-sm`}>
                                {getStatusText(contract.status)}
                              </span>
                            </div>
                          ) : contract.status === "DRAFT" ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 dark:from-yellow-900/20 dark:to-amber-900/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700 shadow-sm`}>
                                {getStatusText(contract.status)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900/20 dark:to-pink-900/20 dark:text-red-400 border border-red-200 dark:border-red-700 shadow-sm`}>
                                {getStatusText(contract.status)}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(contract.id)}
                            className="inline-flex items-center justify-center p-2 text-orange-600 hover:text-orange-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:text-orange-400 dark:hover:from-orange-900/20 dark:hover:to-amber-900/20 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Ver contrato"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(contract.id)}
                            className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:from-gray-700 dark:hover:to-gray-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Editar"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(contract)}
                            className="inline-flex items-center justify-center p-2 text-red-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:text-red-400 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Eliminar"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, contractId: "", contractTitle: "" })}
        onConfirm={confirmDelete}
        title="Eliminar Contrato"
        message={`¿Estás seguro de que deseas eliminar el contrato "${deleteDialog.contractTitle}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}