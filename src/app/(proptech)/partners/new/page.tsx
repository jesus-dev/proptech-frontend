"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { Package } from "lucide-react";
import PartnerForm from "../components/PartnerForm";
import { SubscriptionProduct } from "../types/subscription";
import { subscriptionService } from "../services/subscriptionService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function NewPartnerPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<SubscriptionProduct | null>(null);
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const steps: RegistrationStep[] = [
    {
      id: "partner-info",
      title: "Información del Socio",
      description: "Datos básicos del socio",
      completed: currentStep > 1
    },
    {
      id: "subscription-plan",
      title: "Plan de Suscripción",
      description: "Seleccionar plan y configuración",
      completed: currentStep > 2
    },
    {
      id: "payment-setup",
      title: "Configuración de Pago",
      description: "Configurar método de pago",
      completed: currentStep > 3
    },
    {
      id: "confirmation",
      title: "Confirmación",
      description: "Revisar y confirmar registro",
      completed: currentStep > 4
    }
  ];

  React.useEffect(() => {
    loadSubscriptionProducts();
  }, []);

  const loadSubscriptionProducts = async () => {
    try {
      setLoadingProducts(true);
      const productsData = await subscriptionService.getAllProducts();
      setProducts(productsData.filter(p => p.isActive));
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos de suscripción');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProductSelect = (product: SubscriptionProduct) => {
    setSelectedProduct(product);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Información del Socio
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Completa los datos básicos del nuevo socio
              </p>
            </div>
            <PartnerForm />
          </div>
        );
      
      case 2:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Seleccionar Plan de Suscripción
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Elige el plan que mejor se adapte a las necesidades del socio
              </p>
            </div>
            <div className="p-6">
              {loadingProducts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Cargando planes...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        selectedProduct?.id === product.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {product.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {product.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        {product.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {subscriptionService.formatCurrency(product.price, product.currency)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          por {product.billingCycle.toLowerCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handlePreviousStep}>
                  Anterior
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={!selectedProduct}
                >
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Configuración de Pago
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configura el método de pago para la suscripción
              </p>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Resumen del Plan Seleccionado
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                    <span className="font-medium">{selectedProduct?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Precio:</span>
                    <span className="font-medium">
                      {selectedProduct ? subscriptionService.formatCurrency(selectedProduct.price, selectedProduct.currency) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Ciclo de facturación:</span>
                    <span className="font-medium capitalize">{selectedProduct?.billingCycle}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Método de Pago
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white">
                    <option value="credit_card">Tarjeta de Crédito</option>
                    <option value="bank_transfer">Transferencia Bancaria</option>
                    <option value="cash">Efectivo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoRenew"
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    defaultChecked
                  />
                  <label htmlFor="autoRenew" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Renovación automática
                  </label>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handlePreviousStep}>
                  Anterior
                </Button>
                <Button onClick={handleNextStep}>
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Confirmación Final
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Revisa toda la información antes de crear el socio
              </p>
            </div>
            <div className="p-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-3">
                    <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      Plan Seleccionado: {selectedProduct?.name}
                    </h3>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      {selectedProduct ? subscriptionService.formatCurrency(selectedProduct.price, selectedProduct.currency) : ''} por {selectedProduct?.billingCycle}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Estado del registro:</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Listo para crear
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Suscripción:</span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Se creará automáticamente
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Primer pago:</span>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Pendiente de configuración
                  </Badge>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handlePreviousStep}>
                  Anterior
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    toast.success('Socio creado exitosamente con suscripción');
                    router.push('/partners');
                  }}
                >
                  <CreditCardIcon className="w-4 h-4 mr-2" />
                  Crear Socio y Suscripción
                </Button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
                <UserPlusIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Nuevo Socio
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Registro completo con suscripción
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep > index + 1
                    ? 'bg-green-500 border-green-500 text-white'
                    : currentStep === index + 1
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500'
                }`}>
                  {currentStep > index + 1 ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= index + 1 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}
      </div>
    </div>
  );
} 