'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  Eye, 
  TrendingUp, 
  BarChart3, 
  Target, 
  User, 
  Calendar,
  MapPin,
  Euro,
  Star,
  Share2,
  MessageCircle,
  Lightbulb,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { OwnersPropertyService, OwnerReport, Owner, OwnerProperty } from '@/services/ownersPropertyService';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<OwnerReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        const reportId = parseInt(params.id as string);
        
        // Buscar el reporte en el localStorage o generar uno mock
        const storedReports = localStorage.getItem('generatedReports');
        let reports: OwnerReport[] = [];
        
        if (storedReports) {
          reports = JSON.parse(storedReports);
        }
        
        const foundReport = reports.find(r => r.id === reportId);
        
        if (foundReport) {
          setReport(foundReport);
        } else {
          // Si no se encuentra, generar un reporte mock
          const mockReport = generateMockReport(reportId);
          setReport(mockReport);
        }
      } catch (err) {
        setError('Error cargando el reporte');
        console.error('Error loading report:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [params.id]);

  const generateMockReport = (reportId: number): OwnerReport => {
    // Generar datos mock para el reporte
    const mockOwners = [
      { id: 1, name: 'María García', email: 'maria@example.com', phone: '+34 600 123 456', address: 'Madrid, España', status: 'ACTIVE' as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 2, name: 'Carlos López', email: 'carlos@example.com', phone: '+34 600 789 012', address: 'Barcelona, España', status: 'ACTIVE' as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 3, name: 'Ana Martínez', email: 'ana@example.com', phone: '+34 600 345 678', address: 'Valencia, España', status: 'ACTIVE' as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    
    const mockOwner = mockOwners[Math.floor(Math.random() * mockOwners.length)];
    
    return {
      id: reportId,
      owner: mockOwner,
      period: 'Este mes',
      propertiesCount: Math.floor(Math.random() * 5) + 1,
      totalViews: Math.floor(Math.random() * 1000) + 500,
      totalFavorites: Math.floor(Math.random() * 100) + 20,
      totalComments: Math.floor(Math.random() * 50) + 10,
      totalShares: Math.floor(Math.random() * 30) + 5,
      totalValue: Math.floor(Math.random() * 2000000) + 500000,
      status: 'PENDING',
      generatedAt: new Date().toISOString(),
      emailSent: false,
      pdfGenerated: false,
      recommendations: 'Propiedades de alto valor: Considera estrategias de marketing premium. Portfolio diversificado: Implementa estrategias de gestión centralizada. Mercado ascendente: Ajusta estrategias según tendencias del sector. Temporada alta: Aprovecha el aumento de demanda en primavera. ROI estimado: 25.3% - Considera optimizaciones para mejorar retornos.',
      propertyMetrics: JSON.stringify([
        {
          propertyId: 1,
          propertyTitle: 'Apartamento de lujo en Madrid',
          viewsCount: 450,
          favoritesCount: 35,
          commentsCount: 12,
          sharesCount: 8,
          performanceScore: 85,
          performanceLevel: 'EXCELLENT',
          conversionRate: '0.078',
          marketPosition: 'TOP 10%',
          engagementRate: '7.8',
          pricePerM2: '3500'
        }
      ]),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Required properties for OwnerReport interface
      marketAnalysis: {
        marketTrend: 'BULL',
        priceIndex: 5.2,
        demandLevel: 'HIGH',
        competitionLevel: 'MEDIUM',
        seasonality: 'PEAK',
        marketInsights: ['Mercado en alza', 'Alta demanda', 'Temporada pico']
      },
      strategicRecommendations: [],
      performanceMetrics: {
        overallScore: 85,
        marketPosition: 'LEADER',
        engagementRate: 7.8,
        conversionRate: 0.078,
        priceCompetitiveness: 75,
        visibilityScore: 80,
        buyerInterest: 85
      },
      followUpActions: []
    };
  };

  const handleDownload = () => {
    // Simular descarga
    const content = generateReportContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${report?.owner.name}-${report?.period}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendEmail = () => {
    // Simular envío de email
    alert('Reporte enviado por email exitosamente');
  };

  const generateReportContent = (): string => {
    if (!report) return '';
    
    return `
REPORTE DE PROPIEDADES - ${report.period.toUpperCase()}
====================================================

INFORMACIÓN DEL PROPIETARIO:
- Nombre: ${report.owner.name}
- Email: ${report.owner.email}
- Teléfono: ${report.owner.phone || 'No disponible'}
- Dirección: ${report.owner.address || 'No disponible'}

RESUMEN EJECUTIVO:
- Propiedades: ${report.propertiesCount}
- Total de vistas: ${report.totalViews.toLocaleString()}
- Total de favoritas: ${report.totalFavorites.toLocaleString()}
- Total de comentarios: ${report.totalComments.toLocaleString()}
- Valor total: ${report.totalValue.toLocaleString('es-ES')}€

MÉTRICAS DETALLADAS:
- Vistas promedio por propiedad: ${Math.round(report.totalViews / report.propertiesCount)}
- Favoritas promedio por propiedad: ${Math.round(report.totalFavorites / report.propertiesCount)}
- Comentarios promedio por propiedad: ${Math.round(report.totalComments / report.propertiesCount)}
- Valor promedio por propiedad: ${Math.round(report.totalValue / report.propertiesCount).toLocaleString('es-ES')}€

RECOMENDACIONES:
${report.recommendations}

INFORMACIÓN DEL REPORTE:
- Fecha de generación: ${new Date(report.generatedAt).toLocaleString('es-ES')}
- Estado: ${report.status}
- Email enviado: ${report.emailSent ? 'Sí' : 'No'}
- PDF generado: ${report.pdfGenerated ? 'Sí' : 'No'}
    `;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Reporte no encontrado'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Reporte de Propiedades
                </h1>
                <p className="text-sm text-gray-500">
                  {report.owner.name} - {report.period}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </button>
              <button
                onClick={handleSendEmail}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
              >
                <Mail className="w-4 h-4 mr-2" />
                Enviar Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Información del propietario */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-500" />
              Información del Propietario
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-medium text-gray-900">{report.owner.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{report.owner.email}</p>
              </div>
              {report.owner.phone && (
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium text-gray-900">{report.owner.phone}</p>
                </div>
              )}
              {report.owner.address && (
                <div>
                  <p className="text-sm text-gray-600">Dirección</p>
                  <p className="font-medium text-gray-900">{report.owner.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Resumen ejecutivo */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Resumen Ejecutivo
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{report.propertiesCount}</div>
                <p className="text-sm text-blue-700">Propiedades</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{report.totalViews.toLocaleString()}</div>
                <p className="text-sm text-green-700">Total Vistas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">{report.totalFavorites.toLocaleString()}</div>
                <p className="text-sm text-red-700">Total Favoritas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {report.totalValue.toLocaleString('es-ES')}€
                </div>
                <p className="text-sm text-orange-700">Valor Total</p>
              </div>
            </div>
          </div>

          {/* Métricas detalladas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Métricas Detalladas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Engagement por Propiedad</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Vistas promedio:</span>
                    <span className="font-medium">
                      {Math.round(report.totalViews / report.propertiesCount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Favoritas promedio:</span>
                    <span className="font-medium">
                      {Math.round(report.totalFavorites / report.propertiesCount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Comentarios promedio:</span>
                    <span className="font-medium">
                      {Math.round(report.totalComments / report.propertiesCount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Compartidos totales:</span>
                    <span className="font-medium">{report.totalShares}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Estadísticas Adicionales</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valor promedio:</span>
                    <span className="font-medium">
                      {Math.round(report.totalValue / report.propertiesCount).toLocaleString('es-ES')}€
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tasa de engagement:</span>
                    <span className="font-medium">
                      {((report.totalFavorites / report.totalViews) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estado del reporte:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.status === 'SENT' ? 'bg-green-100 text-green-800' :
                      report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.status === 'SENT' ? 'Enviado' : 
                       report.status === 'PENDING' ? 'Pendiente' : 'Fallido'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fecha de generación:</span>
                    <span className="font-medium">
                      {new Date(report.generatedAt).toLocaleString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recomendaciones */}
          {report.recommendations && (
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                Recomendaciones Estratégicas
              </h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">{report.recommendations}</p>
              </div>
            </div>
          )}

          {/* Información del reporte */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-500" />
              Información del Reporte
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Período analizado</p>
                <p className="font-medium text-gray-900">{report.period}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email enviado</p>
                <p className="font-medium text-gray-900">
                  {report.emailSent ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Sí
                    </span>
                  ) : (
                    <span className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      No
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">PDF generado</p>
                <p className="font-medium text-gray-900">
                  {report.pdfGenerated ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Sí
                    </span>
                  ) : (
                    <span className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      No
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Última actualización</p>
                <p className="font-medium text-gray-900">
                  {new Date(report.updatedAt).toLocaleString('es-ES')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
