"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Award, Clock, AlertTriangle } from 'lucide-react';

interface ExecutiveSummaryProps {
  agentStats: {
    myProperties: number;
    activeLeads: number;
    todayAppointments: number;
    weekAppointments: number;
    conversionRate: number;
    propertiesNeedingAttention: number;
    newLeadsToday: number;
    activeClients: number;
    avgResponseTime: number;
    avgDaysToClose: number;
  } | null;
}

export default function ExecutiveSummary({ agentStats }: ExecutiveSummaryProps) {
  if (!agentStats) return null;

  // Calcular insights automáticos
  const insights = getInsights(agentStats);

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-600" />
          Resumen Ejecutivo
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Análisis automático de tu rendimiento
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          
          {/* Performance Score */}
          <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Score de Rendimiento</h3>
                <p className="text-sm text-gray-600">Basado en tus métricas clave</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600">{insights.performanceScore}</div>
                <div className="text-xs text-gray-500">de 100</div>
              </div>
            </div>
            
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 transition-all duration-500 ${
                  insights.performanceScore >= 80 ? 'bg-green-500' :
                  insights.performanceScore >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${insights.performanceScore}%` }}
              />
            </div>
          </div>

          {/* Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Insight Positivo */}
            {insights.positiveInsight && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-900 mb-1">
                      {insights.positiveInsight.title}
                    </h4>
                    <p className="text-xs text-green-700">
                      {insights.positiveInsight.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Insight de Mejora */}
            {insights.improvementInsight && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                      {insights.improvementInsight.title}
                    </h4>
                    <p className="text-xs text-yellow-700">
                      {insights.improvementInsight.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Métricas Clave */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            
            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 text-center">
              <div className="text-2xl font-bold text-blue-600">{agentStats.conversionRate}%</div>
              <div className="text-xs text-gray-600 mt-1">Conversión</div>
            </div>

            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 text-center">
              <div className="text-2xl font-bold text-green-600">{agentStats.activeLeads}</div>
              <div className="text-xs text-gray-600 mt-1">Leads Activos</div>
            </div>

            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 text-center">
              <div className="text-2xl font-bold text-purple-600">{agentStats.weekAppointments}</div>
              <div className="text-xs text-gray-600 mt-1">Citas Semana</div>
            </div>

            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 text-center">
              <div className="text-2xl font-bold text-orange-600">{agentStats.avgResponseTime}h</div>
              <div className="text-xs text-gray-600 mt-1">Tiempo Respuesta</div>
            </div>
          </div>

          {/* Objetivos Sugeridos */}
          <div className="p-5 rounded-xl bg-white dark:bg-gray-800 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Objetivos Sugeridos Esta Semana
            </h3>
            <div className="space-y-3">
              {insights.goals.map((goal, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    goal.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {goal.completed ? (
                      <span className="text-white text-xs">✓</span>
                    ) : (
                      <span className="text-gray-600 text-xs">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      goal.completed ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'
                    }`}>
                      {goal.text}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {goal.progress}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}

// Función para calcular insights automáticos
function getInsights(stats: any) {
  const performanceScore = calculatePerformanceScore(stats);
  
  const insights: any = {
    performanceScore,
    goals: []
  };

  // Insight positivo
  if (stats.conversionRate > 25) {
    insights.positiveInsight = {
      title: "¡Excelente Tasa de Conversión!",
      message: `Con ${stats.conversionRate}% de conversión, estás superando el promedio del mercado (20%). Sigue así!`
    };
  } else if (stats.newLeadsToday > 5) {
    insights.positiveInsight = {
      title: "Gran Actividad de Leads",
      message: `Has recibido ${stats.newLeadsToday} nuevos leads hoy. Tu estrategia de marketing está funcionando!`
    };
  } else if (stats.todayAppointments > 3) {
    insights.positiveInsight = {
      title: "Agenda Productiva",
      message: `Tienes ${stats.todayAppointments} citas hoy. Tu gestión del tiempo es excelente!`
    };
  }

  // Insight de mejora
  if (stats.propertiesNeedingAttention > 5) {
    insights.improvementInsight = {
      title: "Propiedades Requieren Atención",
      message: `Tienes ${stats.propertiesNeedingAttention} propiedades incompletas. Completar fotos y descripciones aumenta las vistas en un 300%.`
    };
  } else if (stats.conversionRate < 15) {
    insights.improvementInsight = {
      title: "Mejora tu Conversión",
      message: `Tu tasa de conversión es ${stats.conversionRate}%. Responde más rápido y personaliza tu comunicación para mejorar.`
    };
  } else if (stats.avgResponseTime > 24) {
    insights.improvementInsight = {
      title: "Acelera tus Respuestas",
      message: `Tu tiempo promedio de respuesta es ${stats.avgResponseTime}h. Los leads que responden en <4h tienen 80% más probabilidad de conversión.`
    };
  }

  // Generar objetivos
  insights.goals = generateGoals(stats);

  return insights;
}

function calculatePerformanceScore(stats: any): number {
  let score = 0;
  
  // Propiedades activas (max 20 puntos)
  score += Math.min((stats.myProperties / 10) * 20, 20);
  
  // Leads activos (max 25 puntos)
  score += Math.min((stats.activeLeads / 20) * 25, 25);
  
  // Citas agendadas (max 20 puntos)
  score += Math.min((stats.weekAppointments / 5) * 20, 20);
  
  // Tasa de conversión (max 25 puntos)
  score += Math.min((stats.conversionRate / 30) * 25, 25);
  
  // Propiedades completas (max 10 puntos)
  const completionRate = stats.myProperties > 0 
    ? ((stats.myProperties - stats.propertiesNeedingAttention) / stats.myProperties) * 100 
    : 100;
  score += (completionRate / 100) * 10;
  
  return Math.round(score);
}

function generateGoals(stats: any) {
  const goals = [];

  // Objetivo 1: Completar propiedades
  if (stats.propertiesNeedingAttention > 0) {
    goals.push({
      text: `Completar ${stats.propertiesNeedingAttention} propiedades con fotos y descripción`,
      progress: `0 de ${stats.propertiesNeedingAttention} completadas`,
      completed: false
    });
  } else {
    goals.push({
      text: "Todas tus propiedades están completas",
      progress: "✓ Objetivo cumplido",
      completed: true
    });
  }

  // Objetivo 2: Contactar leads
  if (stats.newLeadsToday > 0) {
    goals.push({
      text: `Contactar ${stats.newLeadsToday} nuevos leads de hoy`,
      progress: `Respuesta rápida aumenta conversión 80%`,
      completed: false
    });
  }

  // Objetivo 3: Cerrar citas
  if (stats.todayAppointments > 0) {
    goals.push({
      text: `Completar ${stats.todayAppointments} citas programadas hoy`,
      progress: `Preparar documentación y propuestas`,
      completed: false
    });
  }

  // Objetivo 4: Aumentar conversión
  if (stats.conversionRate < 20) {
    goals.push({
      text: "Mejorar tasa de conversión a 20%",
      progress: `Actual: ${stats.conversionRate}% → Meta: 20%`,
      completed: false
    });
  } else {
    goals.push({
      text: "Mantener alta tasa de conversión",
      progress: `Actual: ${stats.conversionRate}% → Excelente!`,
      completed: true
    });
  }

  // Objetivo 5: Publicar propiedades
  const minProperties = 10;
  if (stats.myProperties < minProperties) {
    goals.push({
      text: `Publicar ${minProperties - stats.myProperties} propiedades más`,
      progress: `${stats.myProperties} de ${minProperties} activas`,
      completed: false
    });
  }

  return goals.slice(0, 5); // Máximo 5 objetivos
}

