import jsPDF from 'jspdf';
import { propertyService } from './propertyService';

interface ReportData {
  title: string;
  content: string;
  fileName: string;
}

const addReportHeader = (doc: jsPDF, title: string) => {
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39); // gray-900 color
  doc.text(title, 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // gray-500 color
  doc.text(`Generado el: ${new Date().toLocaleDateString('es-PY')}`, 20, 40);
  
  doc.setLineWidth(0.2);
  doc.line(15, 44, 195, 44); // Línea divisoria

  return 50; // Y para el contenido
};

export const reportService = {
  async generateInventoryReport(): Promise<ReportData> {
    const properties = await propertyService.getAllProperties();
    const doc = new jsPDF();
    
    let y = addReportHeader(doc, "Inventario de Propiedades");
    
    (properties as any).data?.forEach((property: any, index: number) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        addReportHeader(doc, "Inventario de Propiedades (continuación)");
        y = 55;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(17, 24, 39); // gray-900 color
      doc.text(`${index + 1}. ${property.title}`, 20, y);
      y += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(55, 65, 81); // gray-700 color
      doc.text(`Dirección: ${property.address}`, 20, y);
      y += 9;
      doc.text(`Tipo: ${property.type}`, 20, y);
      y += 7;
      doc.text(`Estado: ${property.status}`, 20, y);
      y += 7;
      doc.text(`Precio: $${property.price.toLocaleString()}`, 20, y);
      y += 7;
      doc.text(`Habitaciones: ${property.bedrooms}`, 20, y);
      y += 7;
      doc.text(`Baños: ${property.bathrooms}`, 20, y);
      y += 7;
      doc.text(`Área: ${property.area}m²`, 20, y);
      y += 7;
      doc.text(`Año: ${property.yearBuilt}`, 20, y);
      y += 7;
      const amenities = Array.isArray(property.amenities) ? property.amenities.join(", ") : "Ninguna";
      doc.text(`Amenidades: ${amenities}`, 20, y);
      y += 15;
    });

    const content = doc.output('datauristring');
    return {
      title: "Inventario de Propiedades",
      content,
      fileName: `inventario-propiedades-${new Date().toISOString().split('T')[0]}.pdf`
    };
  },

  async generatePriceAnalysisReport(): Promise<ReportData> {
    const properties = await propertyService.getAllProperties();
    const doc = new jsPDF();
    
    let y = addReportHeader(doc, "Análisis de Precios");
    
    // Análisis por tipo de propiedad
    const typeAnalysis = (properties as any).data?.reduce((acc: any, property: any) => {
      if (!acc[property.type]) {
        acc[property.type] = {
          count: 0,
          totalPrice: 0,
          minPrice: property.price,
          maxPrice: property.price
        };
      }
      
      acc[property.type].count++;
      acc[property.type].totalPrice += property.price;
      acc[property.type].minPrice = Math.min(acc[property.type].minPrice, property.price);
      acc[property.type].maxPrice = Math.max(acc[property.type].maxPrice, property.price);
      
      return acc;
    }, {} as Record<string, { count: number; totalPrice: number; minPrice: number; maxPrice: number }>) || {};

    Object.entries(typeAnalysis).forEach(([type, data]) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        addReportHeader(doc, "Análisis de Precios (continuación)");
        y = 55;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(17, 24, 39); // gray-900 color
      doc.text(`Tipo: ${type}`, 20, y);
      y += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(55, 65, 81); // gray-700 color
      doc.text(`Cantidad: ${(data as any).count}`, 20, y);
      y += 7;
      doc.text(`Precio Promedio: $${((data as any).totalPrice / (data as any).count).toLocaleString()}`, 20, y);
      y += 7;
      doc.text(`Precio Mínimo: $${(data as any).minPrice.toLocaleString()}`, 20, y);
      y += 7;
      doc.text(`Precio Máximo: $${(data as any).maxPrice.toLocaleString()}`, 20, y);
      y += 15;
    });

    const content = doc.output('datauristring');
    return {
      title: "Análisis de Precios",
      content,
      fileName: `analisis-precios-${new Date().toISOString().split('T')[0]}.pdf`
    };
  },

  async generateStatusReport(): Promise<ReportData> {
    const properties = await propertyService.getAllProperties();
    const doc = new jsPDF();
    
    let y = addReportHeader(doc, "Estado de Propiedades");
    
    const statusCount = (properties as any).data?.reduce((acc: any, property: any) => {
      acc[property.status] = (acc[property.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39); // gray-900 color
    doc.text(`Total Propiedades: ${(properties as any).data?.length || 0}`, 20, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81); // gray-700 color
    doc.text(`Activas: ${statusCount.active || 0}`, 20, y);
    y += 7;
    doc.text(`Inactivas: ${statusCount.inactive || 0}`, 20, y);
    y += 7;
    doc.text(`Pendientes: ${statusCount.pending || 0}`, 20, y);
    y += 15;

    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39); // gray-900 color
    doc.text("Detalle por Estado:", 20, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81); // gray-700 color
    Object.entries(statusCount).forEach(([status, count]) => {
      doc.text(`${status}: ${count} propiedades`, 20, y);
      y += 7;
    });

    const content = doc.output('datauristring');
    return {
      title: "Estado de Propiedades",
      content,
      fileName: `estado-propiedades-${new Date().toISOString().split('T')[0]}.pdf`
    };
  },

  async generateValuationReport(): Promise<ReportData> {
    const properties = await propertyService.getAllProperties();
    const doc = new jsPDF();
    
    let y = addReportHeader(doc, "Valoración Total del Portafolio");
    
    const totalValue = (properties as any).data?.reduce((sum: number, property: any) => sum + property.price, 0) || 0;
    
    const typeDistribution = (properties as any).data?.reduce((acc: any, property: any) => {
      if (!acc[property.type]) {
        acc[property.type] = {
          count: 0,
          totalValue: 0
        };
      }
      
      acc[property.type].count++;
      acc[property.type].totalValue += property.price;
      
      return acc;
    }, {} as Record<string, { count: number; totalValue: number }>) || {};

    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39); // gray-900 color
    doc.text(`Valor Total: $${totalValue.toLocaleString()}`, 20, y);
    y += 15;

    doc.text("Distribución por Tipo:", 20, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81); // gray-700 color
    Object.entries(typeDistribution).forEach(([type, data]) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        addReportHeader(doc, "Valoración Total del Portafolio (continuación)");
        y = 55;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(17, 24, 39); // gray-900 color
      doc.text(`${type}:`, 20, y);
      y += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(55, 65, 81); // gray-700 color
      doc.text(`Cantidad: ${(data as any).count}`, 20, y);
      y += 7;
      doc.text(`Valor Total: $${(data as any).totalValue.toLocaleString()}`, 20, y);
      y += 7;
      doc.text(`Porcentaje: ${(((data as any).totalValue / totalValue) * 100).toFixed(2)}%`, 20, y);
      y += 15;
    });

    const content = doc.output('datauristring');
    return {
      title: "Valoración Total",
      content,
      fileName: `valoracion-total-${new Date().toISOString().split('T')[0]}.pdf`
    };
  },

  downloadReport(report: ReportData) {
    const link = document.createElement('a');
    link.href = report.content;
    link.download = report.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};