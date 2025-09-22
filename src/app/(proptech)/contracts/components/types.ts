import { SignatureAuditData } from "../services/signatureAuditService";

export interface Contract {
  id: string | number;
  title: string;
  description?: string;
  contractNumber?: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "SIGNED" | "SIGNED_PHYSICAL" | "SIGNED_DIGITAL";
  type: "SALE" | "RENT" | "MANAGEMENT";
  
  propertyId?: number;
  clientId?: number;
  agentId?: number;
  
  startDate?: string;
  endDate?: string;
  signedDate?: string;
  
  amount?: number;
  currency?: string;
  paymentTerms?: string;
  
  terms?: string;
  conditions?: string;
  
  createdAt?: string;
  updatedAt?: string;
  
  // Campos adicionales para compatibilidad con el frontend
  clientName?: string;
  clientIdentification?: string;
  brokerName?: string;
  brokerId?: string;
  commissionPercentage?: number;
  propertyAddress?: string;
  propertyDescription?: string;
  templateContent?: string;
  generatedDocumentUrl?: string;

  // Firmas dibujadas
  clientSignature?: string; // base64 PNG
  brokerSignature?: string; // base64 PNG

  // Datos de auditoría de firmas
  clientSignatureAudit?: SignatureAuditData;
  brokerSignatureAudit?: SignatureAuditData;

  // Documentos escaneados y archivos
  scannedDocumentUrl?: string; // URL del documento escaneado firmado
  scannedDocumentName?: string; // Nombre del archivo subido
  scannedDocumentSize?: number; // Tamaño del archivo en bytes
  scannedDocumentType?: string; // Tipo MIME del archivo
  scannedDocumentUploadDate?: string; // Fecha de subida del documento
  scannedDocumentUploadedBy?: string; // Usuario que subió el documento

  // Metadatos de impresión
  lastPrintedDate?: string; // Última fecha de impresión
  printCount?: number; // Número de veces impreso
  exportedToWordDate?: string; // Fecha de última exportación a Word
  exportedToPdfDate?: string; // Fecha de última exportación a PDF
} 

export interface KanbanColumn {
  id: Contract["status"];
  title: string;
  contracts: Contract[];
}

export interface KanbanBoardProps {
  initialColumns: KanbanColumn[];
  getProperty: (id: string) => unknown;
}

export interface KanbanColumnProps {
  column: KanbanColumn;
  handleDeleteColumn: (columnId: string) => void;
  activeId: string | null;
  getProperty: (id: string) => unknown;
  onContractDeleted: () => void;
} 