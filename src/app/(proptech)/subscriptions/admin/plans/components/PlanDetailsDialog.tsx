"use client";
import React from "react";
import { SubscriptionPlan } from "@/services/subscriptionService";
import { Badge } from "@/components/ui/badge";
import { subscriptionService } from "@/services/subscriptionService";

interface PlanDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
}

export default function PlanDetailsDialog({
  isOpen,
  onClose,
  plan,
}: PlanDetailsDialogProps) {
  if (!isOpen || !plan) return null;

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'gratuito': return 'bg-gray-100 text-gray-800';
      case 'inicial': return 'bg-blue-100 text-blue-800';
      case 'intermedio': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mensual': return 'bg-blue-100 text-blue-800';
      case 'anual': return 'bg-green-100 text-green-800';
      case 'semestral': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Detalles del Plan
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Plan Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                {plan.name}
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {plan.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className={getTierColor(plan.tier)}>
                  {plan.tier}
                </Badge>
                <Badge className={getTypeColor(plan.type)}>
                  {plan.type}
                </Badge>
                <Badge variant={plan.isActive ? "default" : "secondary"}>
                  {plan.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Precio</h5>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {subscriptionService.formatPrice(plan.price)}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  /{subscriptionService.getBillingCycleText(plan.billingCycleDays)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">Ciclo de Facturación</h5>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {plan.billingCycleDays} días
                </p>
              </div>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Límites</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700 dark:text-purple-300">Propiedades:</span>
                    <span className="font-medium text-purple-900 dark:text-purple-100">
                      {plan.maxProperties === -1 ? 'Ilimitadas' : plan.maxProperties}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700 dark:text-purple-300">Agentes:</span>
                    <span className="font-medium text-purple-900 dark:text-purple-100">
                      {plan.maxAgents === -1 ? 'Ilimitados' : plan.maxAgents}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <h5 className="font-medium text-orange-900 dark:text-orange-100 mb-2">Características</h5>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${plan.hasAnalytics ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-orange-700 dark:text-orange-300">Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${plan.hasCrm ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-orange-700 dark:text-orange-300">CRM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${plan.hasNetworkAccess ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-orange-700 dark:text-orange-300">Red</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${plan.hasPrioritySupport ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-orange-700 dark:text-orange-300">Soporte Prioritario</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features List */}
            {plan.features && plan.features.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Características Incluidas</h5>
                <div className="grid grid-cols-2 gap-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
