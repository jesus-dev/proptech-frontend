"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Eye, Loader2, Save, X, DollarSign, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';
import { salesAgentService, SalesAgent, CreateSalesAgentRequest } from '@/services/salesAgentService';
import DeleteConfirmationDialog from './components/DeleteConfirmationDialog';
import AgentDetailsDialog from './components/AgentDetailsDialog';
import { SalesAgentsManager } from '@/components/auth/ProtectedRoute';

interface AgentFormData {
  agentCode: string;
  fullName: string;
  email: string;
  phone: string;
  commissionPercentage: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  notes?: string;
}

function AdminSalesAgentsPageContent() {
  const [agents, setAgents] = useState<SalesAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<SalesAgent | null>(null);
  const [formData, setFormData] = useState<AgentFormData>({
    agentCode: '',
    fullName: '',
    email: '',
    phone: '',
    commissionPercentage: 15,
    status: 'ACTIVE',
    notes: ''
  });
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; agentId: number | null; agentName: string }>({
    isOpen: false,
    agentId: null,
    agentName: ""
  });
  const [detailsDialog, setDetailsDialog] = useState<{ isOpen: boolean; agent: SalesAgent | null }>({
    isOpen: false,
    agent: null
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const agentsData = await salesAgentService.getAllAgents();
      setAgents(agentsData);
    } catch (error) {
      console.error('Error loading agents:', error);
      toast.error('Error al cargar los agentes');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAgent) {
        // Actualizar agente existente
        const updatedAgent = await salesAgentService.updateAgent(editingAgent.id, formData);
        setAgents(prev => prev.map(agent => 
          agent.id === editingAgent.id ? updatedAgent : agent
        ));
        toast.success('Agente actualizado exitosamente');
      } else {
        // Crear nuevo agente
        const newAgent = await salesAgentService.createAgent(formData);
        setAgents(prev => [...prev, newAgent]);
        toast.success('Agente creado exitosamente');
      }
      
      setShowForm(false);
      setEditingAgent(null);
      resetForm();
    } catch (error: any) {
      console.error('Error saving agent:', error);
      toast.error(error.message || 'Error al guardar el agente');
    }
  };

  const handleEdit = (agent: SalesAgent) => {
    setEditingAgent(agent);
    setFormData({
      agentCode: agent.agentCode,
      fullName: agent.fullName,
      email: agent.email,
      phone: agent.phone,
      commissionPercentage: agent.commissionPercentage,
      status: agent.status,
      notes: agent.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = (agentId: number, agentName: string) => {
    setDeleteDialog({
      isOpen: true,
      agentId,
      agentName
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.agentId) return;
    
    try {
      await salesAgentService.deleteAgent(deleteDialog.agentId);
      setAgents(prev => prev.filter(agent => agent.id !== deleteDialog.agentId));
      toast.success('Agente eliminado exitosamente');
      setDeleteDialog({ isOpen: false, agentId: null, agentName: "" });
    } catch (error: any) {
      console.error('Error deleting agent:', error);
      toast.error(error.message || 'Error al eliminar el agente');
    }
  };

  const handleViewDetails = (agent: SalesAgent) => {
    setDetailsDialog({
      isOpen: true,
      agent
    });
  };

  const resetForm = () => {
    setFormData({
      agentCode: '',
      fullName: '',
      email: '',
      phone: '',
      commissionPercentage: 15,
      status: 'ACTIVE',
      notes: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activo';
      case 'INACTIVE': return 'Inactivo';
      case 'SUSPENDED': return 'Suspendido';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
    }).format(amount);
  };

  const totalStats = agents.reduce((acc, agent) => ({
    totalSales: acc.totalSales + agent.totalSales,
    totalCommissions: acc.totalCommissions + agent.totalCommissions,
    pendingCommissions: acc.pendingCommissions + agent.pendingCommissions
  }), { totalSales: 0, totalCommissions: 0, pendingCommissions: 0 });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-lg">Cargando agentes...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Administrar Agentes de Ventas</h1>
        <Button 
          onClick={() => {
            setShowForm(true);
            setEditingAgent(null);
            resetForm();
          }}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Agente
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Agentes</p>
              <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.totalSales)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Comisiones Totales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.totalCommissions)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Comisiones Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.pendingCommissions)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingAgent ? 'Editar Agente' : 'Crear Nuevo Agente'}
            </h2>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingAgent(null);
                resetForm();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Agente
                </label>
                <Input
                  value={formData.agentCode}
                  onChange={(e) => setFormData({ ...formData, agentCode: e.target.value })}
                  placeholder="Ej: AGENT001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nombre y apellido"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@ejemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+595 981 123456"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porcentaje de Comisión (%)
                </label>
                <Input
                  type="number"
                  value={formData.commissionPercentage}
                  onChange={(e) => setFormData({ ...formData, commissionPercentage: parseFloat(e.target.value) || 0 })}
                  placeholder="15"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                  <option value="SUSPENDED">Suspendido</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales sobre el agente"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingAgent(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                <Save className="h-4 w-4 mr-2" />
                {editingAgent ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Agentes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Agentes de Ventas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ventas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{agent.fullName}</div>
                      <div className="text-sm text-gray-500">{agent.agentCode}</div>
                      <div className="text-sm text-gray-500">{agent.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {agent.commissionPercentage}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(agent.totalCommissions)} total
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(agent.pendingCommissions)} pendiente
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(agent.totalSales)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Contratado: {new Date(agent.hireDate).toLocaleDateString('es-PY')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(agent.status)}>
                      {getStatusLabel(agent.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleViewDetails(agent)}
                        className="bg-gray-500 hover:bg-gray-600 text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEdit(agent)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDelete(agent.id, agent.fullName)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, agentId: null, agentName: "" })}
        onConfirm={confirmDelete}
        agentName={deleteDialog.agentName}
      />

      {/* Agent Details Dialog */}
      <AgentDetailsDialog
        isOpen={detailsDialog.isOpen}
        onClose={() => setDetailsDialog({ isOpen: false, agent: null })}
        agent={detailsDialog.agent}
      />
    </div>
  );
}

export default function AdminSalesAgentsPage() {
  return (
    <SalesAgentsManager>
      <AdminSalesAgentsPageContent />
    </SalesAgentsManager>
  );
}
