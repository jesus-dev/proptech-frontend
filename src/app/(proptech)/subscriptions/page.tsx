"use client";

import React, { useState, useEffect } from 'react';
import { useAuthContext as useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { subscriptionService, SubscriptionPlan, UserSubscription, SubscriptionAccess } from '@/services/subscriptionService';

export default function SubscriptionsPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [userAccess, setUserAccess] = useState<SubscriptionAccess | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);

  useEffect(() => {
    loadPlans();
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user]);

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      const plansData = await subscriptionService.getPropTechPlans();
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Error al cargar los planes de suscripción');
    } finally {
      setLoadingPlans(false);
    }
  };

  const loadUserData = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingSubscriptions(true);
      const [subscriptionsData, accessData] = await Promise.all([
        subscriptionService.getUserSubscriptions(user.id),
        subscriptionService.getUserAccess(user.id)
      ]);
      setUserSubscriptions(subscriptionsData);
      setUserAccess(accessData);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Error al cargar información del usuario');
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!isAuthenticated || !user) {
      toast.error('Debes iniciar sesión para suscribirte');
      return;
    }

    setLoading(true);
    try {
      const paymentReference = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await subscriptionService.subscribeUser(
        user.id,
        plan.id,
        paymentReference
      );

      toast.success(`¡Te has suscrito al ${plan.name}!`);
      
      // Recargar datos del usuario
      await loadUserData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al procesar la suscripción');
    } finally {
      setLoading(false);
    }
  };

  const isUserSubscribedToPlan = (planId: number): boolean => {
    return userSubscriptions.some(sub => sub.planId === planId && sub.status === 'ACTIVE');
  };

  const getCurrentPlan = (planId: number): UserSubscription | undefined => {
    return userSubscriptions.find(sub => sub.planId === planId && sub.status === 'ACTIVE');
  };

  const formatPrice = (price: number) => {
    return subscriptionService.formatPrice(price);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'PREMIUM': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'INTERMEDIO': return <Star className="h-5 w-5 text-blue-500" />;
      case 'INICIAL': return <Zap className="h-5 w-5 text-green-500" />;
      case 'FREE': return <span className="text-2xl">🆓</span>;
      default: return null;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PREMIUM': return 'ring-yellow-500';
      case 'INTERMEDIO': return 'ring-blue-500';
      case 'INICIAL': return 'ring-green-500';
      case 'FREE': return 'ring-gray-500';
      default: return 'ring-gray-500';
    }
  };

  if (loadingPlans) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-2 text-lg">Cargando planes de suscripción...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Planes de Suscripción
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tus necesidades. Todos incluyen acceso a nuestra red social inmobiliaria.
        </p>
      </div>

      {userAccess && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Tu Acceso Actual</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">PropTech:</span> 
              <Badge variant={userAccess.hasPropTechAccess ? "default" : "secondary"} className="ml-2">
                {userAccess.hasPropTechAccess ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Network:</span> 
              <Badge variant={userAccess.hasNetworkAccess ? "default" : "secondary"} className="ml-2">
                {userAccess.hasNetworkAccess ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Tier:</span> 
              <Badge variant="outline" className="ml-2">
                {userAccess.propTechTier}
              </Badge>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const isSubscribed = isUserSubscribedToPlan(plan.id);
          const currentSubscription = getCurrentPlan(plan.id);
          
          return (
            <div 
              key={plan.id} 
              className={`relative bg-white rounded-lg shadow-lg border-2 ${isSubscribed ? 'ring-2 ring-green-500' : getTierColor(plan.tier)} hover:shadow-xl transition-shadow duration-300`}
            >
              {isSubscribed && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500">
                  Plan Actual
                </Badge>
              )}
              
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  {getTierIcon(plan.tier)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-gray-600">/{subscriptionService.getBillingCycleText(plan.billingCycleDays)}</span>
                </div>

                <ul className="space-y-3 mb-6 text-left">
                  {plan.features && plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                  {plan.maxProperties > 0 && (
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">
                        {plan.maxProperties === -1 ? 'Propiedades ilimitadas' : `${plan.maxProperties} propiedades`}
                      </span>
                    </li>
                  )}
                  {plan.maxAgents > 0 && (
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">
                        {plan.maxAgents === -1 ? 'Agentes ilimitados' : `${plan.maxAgents} agentes`}
                      </span>
                    </li>
                  )}
                  {plan.hasAnalytics && (
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Analytics completo</span>
                    </li>
                  )}
                  {plan.hasCrm && (
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">CRM avanzado</span>
                    </li>
                  )}
                  {plan.hasNetworkAccess && (
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Acceso a network</span>
                    </li>
                  )}
                  {plan.hasPrioritySupport && (
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Soporte prioritario</span>
                    </li>
                  )}
                </ul>

                {isSubscribed ? (
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled
                    >
                      Plan Actual
                    </Button>
                    {currentSubscription && (
                      <p className="text-xs text-gray-500">
                        Válido hasta: {new Date(currentSubscription.endDate).toLocaleDateString('es-PY')}
                      </p>
                    )}
                  </div>
                ) : (
                  <Button 
                    onClick={() => handleSubscribe(plan)}
                    disabled={loading || plan.tier === 'FREE'}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Procesando...
                      </>
                    ) : (
                      'Suscribirse'
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600">
          ¿Tienes preguntas sobre nuestros planes? 
          <Button variant="link" className="text-orange-500">
            Contacta con soporte
          </Button>
        </p>
      </div>
    </div>
  );
}
