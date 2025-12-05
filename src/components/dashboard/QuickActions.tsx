"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Calendar, 
  Users, 
  Phone, 
  Mail, 
  FileText,
  Building2,
  Search,
  MessageSquare,
  Clock,
  Star
} from 'lucide-react';

interface QuickActionsProps {
  agentStats?: any;
  propertyAlerts?: any[];
}

export default function QuickActions({ agentStats, propertyAlerts }: QuickActionsProps) {
  // Determinar acciones prioritarias basadas en los datos
  const priorityActions = getPriorityActions(agentStats, propertyAlerts);

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600" />
          Acciones Prioritarias
        </CardTitle>
        <p className="text-sm text-gray-600">
          {priorityActions.length} acciones recomendadas para hoy
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {priorityActions.map((action, index) => (
            <Link href={action.link} key={index}>
              <div className={`p-4 rounded-lg border-2 hover:shadow-md transition-all cursor-pointer group ${
                action.priority === 'high' ? 'border-red-300 bg-red-50 hover:bg-red-100' :
                action.priority === 'medium' ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100' :
                'border-blue-300 bg-blue-50 hover:bg-blue-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      action.priority === 'high' ? 'bg-red-500' :
                      action.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}>
                      {action.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {action.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    →
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Action Buttons Grid */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Acceso Rápido</h4>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/properties/new">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full hover:bg-green-50 hover:border-green-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Propiedad
              </Button>
            </Link>
            
            <Link href="/contacts/new">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full hover:bg-blue-50 hover:border-blue-300"
              >
                <Users className="h-4 w-4 mr-2" />
                Nuevo Contacto
              </Button>
            </Link>
            
            <Link href="/agenda/new">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full hover:bg-purple-50 hover:border-purple-300"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Cita
              </Button>
            </Link>
            
            <Link href="/properties/quick-search">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full hover:bg-indigo-50 hover:border-indigo-300"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getPriorityActions(agentStats: any, propertyAlerts: any[] = []) {
  const actions = [];

  // Acción 1: Contactar nuevos leads (ALTA PRIORIDAD)
  if (agentStats?.newLeadsToday > 0) {
    actions.push({
      priority: 'high',
      icon: <Phone className="h-5 w-5 text-white" />,
      title: `Contactar ${agentStats.newLeadsToday} leads nuevos`,
      description: 'Responder en las próximas 4 horas aumenta conversión 80%',
      link: '/contacts?filter=new'
    });
  }

  // Acción 2: Preparar citas de hoy (ALTA PRIORIDAD)
  if (agentStats?.todayAppointments > 0) {
    actions.push({
      priority: 'high',
      icon: <Calendar className="h-5 w-5 text-white" />,
      title: `Preparar ${agentStats.todayAppointments} citas de hoy`,
      description: 'Revisar detalles y confirmar asistencia',
      link: '/agenda/today'
    });
  }

  // Acción 3: Completar propiedades (MEDIA PRIORIDAD)
  if (agentStats?.propertiesNeedingAttention > 0) {
    actions.push({
      priority: 'medium',
      icon: <Building2 className="h-5 w-5 text-white" />,
      title: `Completar ${agentStats.propertiesNeedingAttention} propiedades`,
      description: 'Agregar fotos y descripciones para mejorar visibilidad',
      link: '/properties?filter=incomplete'
    });
  }

  // Acción 4: Seguimiento a leads antiguos (MEDIA PRIORIDAD)
  if (agentStats?.activeLeads > 10) {
    actions.push({
      priority: 'medium',
      icon: <MessageSquare className="h-5 w-5 text-white" />,
      title: 'Seguimiento a leads activos',
      description: `Tienes ${agentStats.activeLeads} leads esperando respuesta`,
      link: '/contacts?status=lead'
    });
  }

  // Acción 5: Crear contenido si tiene pocas propiedades (BAJA PRIORIDAD)
  if (agentStats?.myProperties < 5) {
    actions.push({
      priority: 'low',
      icon: <Plus className="h-5 w-5 text-white" />,
      title: 'Publicar más propiedades',
      description: 'Aumenta tu inventario para generar más oportunidades',
      link: '/properties/new'
    });
  }

  // Acción 6: Revisar propiedades destacadas
  if (agentStats?.myProperties > 0) {
    actions.push({
      priority: 'low',
      icon: <Star className="h-5 w-5 text-white" />,
      title: 'Destacar propiedades premium',
      description: 'Las propiedades destacadas reciben 5x más vistas',
      link: '/properties?featured=false'
    });
  }

  return actions.slice(0, 5); // Máximo 5 acciones
}

