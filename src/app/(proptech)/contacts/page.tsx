"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  UserPlusIcon,
  ArrowUpOnSquareIcon,
  UsersIcon,
  UserGroupIcon,
  EyeIcon,
  ShoppingBagIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import { contactService } from "./services/contactService";
import { Contact, ContactType, ContactStatus } from "./types";
import ContactCard from "./components/ContactCard";
import ContactList from "./components/ContactList";
import ContactForm from "./components/ContactForm";
import ImportContactsModal from "./components/ImportContactsModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Pagination from "@/components/common/Pagination";
import ModernPopup from "@/components/ui/ModernPopup";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContactType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">("all");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    clients: 0,
    prospects: 0,
    buyers: 0,
    sellers: 0
  });

  useEffect(() => {
    loadContacts();
    loadStats();
  }, [currentPage, pageSize, searchQuery, typeFilter, statusFilter]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      
      const filters = {
        ...(searchQuery && { search: searchQuery }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      };

      const response = await contactService.getContactsPaginated(currentPage, pageSize, filters);
      
      // Ensure we always have a valid array
      setContacts(response?.content || []);
      setTotalElements(response?.totalElements || 0);
      setTotalPages(response?.totalPages || 0);
    } catch (error) {
      console.error("Error loading contacts:", error);
      // Set default values on error
      setContacts([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const allContacts = await contactService.getAllContacts();
      const contactsArray = Array.isArray(allContacts) ? allContacts : [];
      
      setStats({
        total: contactsArray.length,
        clients: contactsArray.filter(c => c.type === "client").length,
        prospects: contactsArray.filter(c => c.type === "prospect").length,
        buyers: contactsArray.filter(c => c.type === "buyer").length,
        sellers: contactsArray.filter(c => c.type === "seller").length
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      // Set default values on error
      setStats({
        total: 0,
        clients: 0,
        prospects: 0,
        buyers: 0,
        sellers: 0
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleTypeFilter = (type: ContactType | "all") => {
    setTypeFilter(type);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleStatusFilter = (status: ContactStatus | "all") => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getTypeLabel = (type: ContactType) => {
    switch (type) {
      case "client": return "Cliente";
      case "prospect": return "Interesado";
      case "buyer": return "Comprador";
      case "seller": return "Vendedor";
      default: return type;
    }
  };

  const getStatusLabel = (status: ContactStatus) => {
    switch (status) {
      case "active": return "Activo";
      case "inactive": return "Inactivo";
      case "lead": return "Lead";
      case "qualified": return "Calificado";
      case "converted": return "Convertido";
      default: return status;
    }
  };

  const getStatusColor = (status: ContactStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "lead":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "qualified":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "converted":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full min-w-0">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Title Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <UsersIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-900 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
                  Gestión de Contactos
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Administra clientes, interesados, compradores y vendedores de manera eficiente
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/30"
              >
                <ArrowUpOnSquareIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                Importar
              </button>
              <Link href="/contacts/new">
                <button className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/30">
                  <PlusIcon className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                  Nuevo Contacto
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-8">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clientes</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.clients}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Interesados</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.prospects}</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <EyeIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compradores</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.buyers}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <ShoppingBagIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vendedores</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.sellers}</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions and Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar contactos..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-sm transition-all duration-200"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={typeFilter}
                  onChange={(e) => handleTypeFilter(e.target.value as ContactType | "all")}
                  className="px-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-sm transition-all duration-200"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="client">Clientes</option>
                  <option value="prospect">Interesados</option>
                  <option value="buyer">Compradores</option>
                  <option value="seller">Vendedores</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value as ContactStatus | "all")}
                  className="px-4 py-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-sm transition-all duration-200"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                  <option value="lead">Leads</option>
                  <option value="qualified">Calificados</option>
                  <option value="converted">Convertidos</option>
                </select>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100/80 dark:bg-gray-700/80 rounded-xl p-1">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  view === "grid"
                    ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  view === "list"
                    ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {(contacts?.length || 0)} de {totalElements} contactos
          </p>
        </div>

        {/* Contacts Display */}
        {contacts && contacts.length > 0 ? (
          view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 w-full min-w-0 overflow-x-auto">
              {contacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} onUpdate={loadContacts} />
              ))}
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <ContactList contacts={contacts} onUpdate={loadContacts} />
            </div>
          )
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-12">
            <div className="text-center">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <UsersIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                  ? "No se encontraron contactos"
                  : "No hay contactos registrados"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                  ? "No se encontraron contactos que coincidan con los filtros aplicados."
                  : "Comienza creando tu primer contacto para gestionar tu base de datos."}
              </p>
              {!searchQuery && typeFilter === "all" && statusFilter === "all" && (
                <Link href="/contacts/new">
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                    <PlusIcon className="w-5 h-5 mr-2 inline" />
                    Crear Primer Contacto
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <ImportContactsModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onUpdate={loadContacts}
      />
    </div>
  );
} 