"use client";
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Mail, 
  TrendingUp, 
  Target, 
  Calendar,
  DollarSign,
  BarChart3,
  Lightbulb,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Building2,
  MapPin,
  Euro
} from 'lucide-react';
import ModernPopup from '@/components/ui/ModernPopup';
import { 
  OwnersPropertyService, 
  Owner, 
  OwnerProperty, 
  OwnerReport,
  CreateOwnerReportRequest,
  StrategicRecommendation,
  FollowUpAction,
  PerformanceMetrics
} from '@/services/ownersPropertyService';

export default function ReportsPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [ownerProperties, setOwnerProperties] = useState<OwnerProperty[]>([]);
  const [reports, setReports] = useState<OwnerReport[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingReport, setViewingReport] = useState<OwnerReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [period, setPeriod] = useState('month');
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [includeComparisons, setIncludeComparisons] = useState(true);
  const [includeMarketAnalysis, setIncludeMarketAnalysis] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState('default');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargar propietarios
      const ownersData = await OwnersPropertyService.getOwners();
      setOwners(ownersData);
      
      if (ownersData.length > 0) {
        // Cargar propiedades del primer propietario
        const propertiesData = await OwnersPropertyService.getOwnerProperties(ownersData[0].id);
        setOwnerProperties(propertiesData);
        
        // Cargar reportes del primer propietario
        const reportsData = await OwnersPropertyService.getOwnerReports(ownersData[0].id);
        setReports(reportsData);
        
        setSelectedOwner(ownersData[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // En producción, mostrar estado vacío (sin datos ficticios)
      setOwners([]);
      setOwnerProperties([]);
      setReports([]);
      setSelectedOwner(null);
    }
  };

  const handleOwnerChange = async (ownerId: number) => {
    const owner = owners.find(o => o.id === ownerId);
    if (owner) {
      setSelectedOwner(owner);
      try {
        const properties = await OwnersPropertyService.getOwnerProperties(ownerId);
        const ownerReports = await OwnersPropertyService.getOwnerReports(ownerId);
        setOwnerProperties(properties);
        setReports(ownerReports);
      } catch (error) {
        console.error('Error loading owner data:', error);
        // En producción, mostrar estado vacío
        setOwnerProperties([]);
        setReports([]);
      }
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedOwner) return;
    
    setIsGenerating(true);
    try {
      const request: CreateOwnerReportRequest = {
        ownerId: selectedOwner.id,
        period,
        includeRecommendations,
        includeComparisons,
        includeMarketAnalysis,
        sendEmail,
        emailTemplate
      };
      
      const newReport = await OwnersPropertyService.generateIntelligentReport(request);
      setReports(prev => [newReport, ...prev]);
      setShowGenerateModal(false);
      
      // Mostrar el reporte generado
      setViewingReport(newReport);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar el reporte. Por favor, inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (reportId: number) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    const content = generateReportContent(report);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${report.owner.name}-${report.period}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendReport = async (reportId: number) => {
    try {
      const success = await OwnersPropertyService.sendReportByEmail(reportId, 'default');
      if (success) {
        alert('Reporte enviado exitosamente por email');
        // Actualizar estado del reporte
        setReports(prev => prev.map(r => 
          r.id === reportId ? { ...r, status: 'SENT', emailSent: true } : r
        ));
      }
    } catch (error) {
      console.error('Error sending report:', error);
      alert('Error al enviar el reporte por email');
    }
  };

  const generateReportContent = (report: OwnerReport): string => {
    let content = `REPORTE DE PROPIEDADES - ${report.period}\n`;
    content += `Propietario: ${report.owner.name}\n`;
    content += `Generado: ${new Date(report.generatedAt).toLocaleDateString()}\n`;
    content += `=====================================\n\n`;
    
    content += `RESUMEN EJECUTIVO:\n`;
    content += `- Total de propiedades: ${report.propertiesCount}\n`;
    content += `- Valor total: €${report.totalValue.toLocaleString()}\n`;
    content += `- Vistas totales: ${report.totalViews}\n`;
    content += `- Favoritos totales: ${report.totalFavorites}\n`;
    content += `- Compartidos: ${report.totalShares}\n\n`;
    
    if (report.marketAnalysis) {
      content += `ANÁLISIS DE MERCADO:\n`;
      content += `- Tendencia: ${report.marketAnalysis.marketTrend === 'BULL' ? 'Alcista' : report.marketAnalysis.marketTrend === 'BEAR' ? 'Bajista' : 'Neutral'}\n`;
      content += `- Índice de precios: ${report.marketAnalysis.priceIndex.toFixed(2)}%\n`;
      content += `- Nivel de demanda: ${report.marketAnalysis.demandLevel === 'HIGH' ? 'Alto' : report.marketAnalysis.demandLevel === 'LOW' ? 'Bajo' : 'Medio'}\n`;
      content += `- Estacionalidad: ${report.marketAnalysis.seasonality === 'PEAK' ? 'Pico' : report.marketAnalysis.seasonality === 'LOW' ? 'Baja' : 'Normal'}\n\n`;
    }
    
    if (report.strategicRecommendations && report.strategicRecommendations.length > 0) {
      content += `RECOMENDACIONES ESTRATÉGICAS:\n`;
      report.strategicRecommendations.forEach((rec, index) => {
        content += `${index + 1}. ${rec.title}\n`;
        content += `   Descripción: ${rec.description}\n`;
        content += `   Impacto esperado: ${rec.expectedImpact}\n`;
        content += `   Prioridad: ${rec.priority === 'HIGH' ? 'Alta' : rec.priority === 'MEDIUM' ? 'Media' : 'Baja'}\n`;
        content += `   Timeline: ${rec.timeline}\n\n`;
      });
    }
    
    if (report.followUpActions && report.followUpActions.length > 0) {
      content += `ACCIONES DE SEGUIMIENTO:\n`;
      report.followUpActions.forEach((action, index) => {
        content += `${index + 1}. ${action.title}\n`;
        content += `   Descripción: ${action.description}\n`;
        content += `   Fecha límite: ${new Date(action.dueDate).toLocaleDateString()}\n`;
        content += `   Prioridad: ${action.priority === 'HIGH' ? 'Alta' : action.priority === 'MEDIUM' ? 'Media' : 'Baja'}\n\n`;
      });
    }
    
    return content;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50';
      case 'MEDIUM': return 'text-orange-600 bg-orange-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH': return <AlertTriangle className="w-4 h-4" />;
      case 'MEDIUM': return <Clock className="w-4 h-4" />;
      case 'LOW': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'PRICING': return <DollarSign className="w-5 h-5" />;
      case 'MARKETING': return <Target className="w-5 h-5" />;
      case 'IMPROVEMENT': return <Building2 className="w-5 h-5" />;
      case 'TIMING': return <Calendar className="w-5 h-5" />;
      case 'NEGOTIATION': return <Users className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'PRICING': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'MARKETING': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'IMPROVEMENT': return 'bg-green-50 border-green-200 text-green-800';
      case 'TIMING': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'NEGOTIATION': return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes Inteligentes</h1>
          <p className="text-gray-600">
            Sistema de análisis de mercado y recomendaciones estratégicas para maximizar el valor de tus propiedades
          </p>
        </div>

        {/* Selector de Propietario */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Propietario
          </label>
          <select
            value={selectedOwner?.id || ''}
            onChange={(e) => handleOwnerChange(Number(e.target.value))}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            {owners.map(owner => (
              <option key={owner.id} value={owner.id}>
                {owner.name} - {owner.email}
              </option>
            ))}
          </select>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Propiedades</p>
                <p className="text-2xl font-bold text-gray-900">{ownerProperties.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vistas Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ownerProperties.reduce((sum, p) => sum + p.property.views, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-50 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Favoritos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ownerProperties.reduce((sum, p) => sum + p.property.favorites, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Euro className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{ownerProperties.reduce((sum, p) => sum + p.property.price, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón Generar Reporte */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center mx-auto"
          >
            <FileText className="w-5 h-5 mr-2" />
            Generar Reporte Inteligente
          </button>
        </div>

        {/* Reportes Generados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reportes Generados</h2>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hay reportes generados aún</p>
              <p className="text-sm">Genera tu primer reporte para ver análisis y recomendaciones</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Propietario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Propiedades
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vistas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Favoritos
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
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.owner.name}</div>
                          <div className="text-sm text-gray-500">{report.owner.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.propertiesCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.totalViews.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.totalFavorites.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.status === 'SENT' ? 'bg-green-100 text-green-800' :
                          report.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {OwnersPropertyService.getReportStatusDisplayName(report.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setViewingReport(report);
                              setShowViewModal(true);
                            }}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => handleDownloadReport(report.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Descargar
                          </button>
                          <button
                            onClick={() => handleSendReport(report.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Enviar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de generación de reportes */}
      <ModernPopup
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generar Reporte Inteligente"
        subtitle="Crea un reporte personalizado con análisis de mercado y recomendaciones estratégicas"
        icon={<FileText className="w-6 h-6 text-white" />}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período de Análisis
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mes</option>
              <option value="quarter">Último Trimestre</option>
              <option value="year">Último Año</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeRecommendations}
                onChange={(e) => setIncludeRecommendations(e.target.checked)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">Incluir Recomendaciones Estratégicas</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeComparisons}
                onChange={(e) => setIncludeComparisons(e.target.checked)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">Incluir Comparaciones de Mercado</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeMarketAnalysis}
                onChange={(e) => setIncludeMarketAnalysis(e.target.checked)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">Incluir Análisis de Mercado</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enviar por Email</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button
              onClick={() => setShowGenerateModal(false)}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              disabled={isGenerating}
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={!selectedOwner || isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generar Reporte
                </>
              )}
            </button>
          </div>
        </div>
      </ModernPopup>

      {/* Modal de visualización del reporte */}
      {viewingReport && (
        <ModernPopup
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title={`Reporte Inteligente - ${viewingReport.period}`}
          subtitle={`Análisis completo de ${viewingReport.owner.name}`}
          icon={<FileText className="w-6 h-6 text-white" />}
          maxWidth="max-w-6xl"
        >
          <div className="space-y-6">
            {/* Resumen Ejecutivo */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Resumen Ejecutivo
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{viewingReport.propertiesCount}</p>
                  <p className="text-sm text-gray-600">Propiedades</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{viewingReport.totalViews.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Vistas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{viewingReport.totalFavorites.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Favoritos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">€{viewingReport.totalValue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Valor Total</p>
                </div>
              </div>
            </div>

            {/* Análisis de Mercado */}
            {viewingReport.marketAnalysis && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Análisis de Mercado
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Tendencia del Mercado</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        viewingReport.marketAnalysis.marketTrend === 'BULL' ? 'bg-green-100 text-green-800' :
                        viewingReport.marketAnalysis.marketTrend === 'BEAR' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {viewingReport.marketAnalysis.marketTrend === 'BULL' ? 'Alcista' :
                         viewingReport.marketAnalysis.marketTrend === 'BEAR' ? 'Bajista' : 'Neutral'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Nivel de Demanda</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        viewingReport.marketAnalysis.demandLevel === 'HIGH' ? 'bg-green-100 text-green-800' :
                        viewingReport.marketAnalysis.demandLevel === 'LOW' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {viewingReport.marketAnalysis.demandLevel === 'HIGH' ? 'Alto' :
                         viewingReport.marketAnalysis.demandLevel === 'LOW' ? 'Bajo' : 'Medio'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Estacionalidad</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        viewingReport.marketAnalysis.seasonality === 'PEAK' ? 'bg-green-100 text-green-800' :
                        viewingReport.marketAnalysis.seasonality === 'LOW' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {viewingReport.marketAnalysis.seasonality === 'PEAK' ? 'Pico' :
                         viewingReport.marketAnalysis.seasonality === 'LOW' ? 'Baja' : 'Normal'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Insights del Mercado</h4>
                    <ul className="space-y-2">
                      {viewingReport.marketAnalysis.marketInsights.map((insight, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Recomendaciones Estratégicas */}
            {viewingReport.strategicRecommendations && viewingReport.strategicRecommendations.length > 0 && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-orange-600" />
                  Recomendaciones Estratégicas
                </h3>
                <div className="space-y-4">
                  {viewingReport.strategicRecommendations.map((recommendation) => (
                    <div key={recommendation.id} className={`border rounded-xl p-4 ${getRecommendationColor(recommendation.type)}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="p-2 bg-white rounded-lg mr-3">
                            {getRecommendationIcon(recommendation.type)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                            <p className="text-sm text-gray-600">{recommendation.description}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(recommendation.priority)}`}>
                          {recommendation.priority === 'HIGH' ? 'Alta' :
                           recommendation.priority === 'MEDIUM' ? 'Media' : 'Baja'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Impacto Esperado:</span>
                          <p className="text-gray-600">{recommendation.expectedImpact}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Timeline:</span>
                          <p className="text-gray-600">{recommendation.timeline}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Costo:</span>
                          <p className="text-gray-600">
                            {recommendation.implementationCost ? `€${recommendation.implementationCost.toLocaleString()}` : 'Gratis'}
                          </p>
                        </div>
                      </div>
                      {recommendation.actionItems && recommendation.actionItems.length > 0 && (
                        <div className="mt-4">
                          <span className="font-medium text-gray-700 block mb-2">Acciones a Implementar:</span>
                          <ul className="space-y-1">
                            {recommendation.actionItems.map((action, index) => (
                              <li key={index} className="flex items-center text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones de Seguimiento */}
            {viewingReport.followUpActions && viewingReport.followUpActions.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Plan de Seguimiento
                </h3>
                <div className="space-y-3">
                  {viewingReport.followUpActions.map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                          {getPriorityIcon(action.priority)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{action.title}</h4>
                          <p className="text-sm text-gray-600">{action.description}</p>
                          <p className="text-xs text-gray-500">
                            Fecha límite: {new Date(action.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(action.priority)}`}>
                          {action.priority === 'HIGH' ? 'Alta' :
                           action.priority === 'MEDIUM' ? 'Media' : 'Baja'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          action.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          action.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {action.status === 'COMPLETED' ? 'Completado' :
                           action.status === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  if (viewingReport) {
                    handleDownloadReport(viewingReport.id);
                    setShowViewModal(false);
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </button>
              <button
                onClick={() => {
                  if (viewingReport) {
                    handleSendReport(viewingReport.id);
                    setShowViewModal(false);
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center"
              >
                <Mail className="w-4 h-4 mr-2" />
                Enviar por Email
              </button>
            </div>
          </div>
        </ModernPopup>
      )}
    </div>
  );
}
