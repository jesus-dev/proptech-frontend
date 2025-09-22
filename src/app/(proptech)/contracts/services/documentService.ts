import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, ImageRun, Table, TableRow, TableCell, WidthType, Header, Footer } from 'docx';
import { Contract } from '../components/types';

// Utilidad para convertir base64 a Uint8Array
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64.split(',')[1]);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Utilidad para cargar el logo PNG como Uint8Array
export const fetchLogo = async (): Promise<Uint8Array> => {
  const res = await fetch('/images/logo/on-logo.png');
  const blob = await res.arrayBuffer();
  return new Uint8Array(blob);
};

export const generateContractDocument = async (contract: Contract, logoData: Uint8Array): Promise<Blob> => {
  console.log('🔍 DocumentService: Starting document generation');
  console.log('🔍 DocumentService: Contract templateContent:', contract.templateContent);
  console.log('🔍 DocumentService: Contract templateContent length:', contract.templateContent?.length || 0);
  
  // Preparar las firmas si existen
  const clientSignatureImage = contract.clientSignature ? base64ToUint8Array(contract.clientSignature) : null;
  const brokerSignatureImage = contract.brokerSignature ? base64ToUint8Array(contract.brokerSignature) : null;

  // Información de auditoría para validación
  const clientAuditInfo = contract.clientSignatureAudit;
  const brokerAuditInfo = contract.brokerSignatureAudit;

  // Usar el contenido de la plantilla si está disponible, sino usar contenido por defecto
  const contractContent = contract.templateContent || `CONTRATO DE CORRETAJE INMOBILIARIO

Entre los suscritos, a saber:

CORREDOR: ${contract.brokerName || 'No especificado'}, identificado con ${contract.brokerId || 'No especificado'}, a quien en adelante se le denominará "EL CORREDOR";

CLIENTE: ${contract.clientName || 'No especificado'}, identificado con ${contract.clientIdentification || 'No especificado'}, a quien en adelante se le denominará "EL CLIENTE";

Se ha convenido celebrar el presente contrato de corretaje inmobiliario, que se regirá por las siguientes cláusulas:

PRIMERA: OBJETO DEL CONTRATO
El CLIENTE contrata los servicios profesionales del CORREDOR para la intermediación en la operación inmobiliaria relacionada con la siguiente propiedad:

Dirección: ${contract.propertyAddress || 'No especificada'}
Descripción: ${contract.propertyDescription || 'No especificada'}

SEGUNDA: COMISIÓN
El CORREDOR tendrá derecho a una comisión del ${contract.commissionPercentage || 3}% sobre el valor de la operación.

TERCERA: DURACIÓN
El presente contrato tendrá una duración de 6 meses a partir de su firma.

En fe de lo cual se firma el presente contrato.`;

  console.log('🔍 DocumentService: Final contract content length:', contractContent.length);
  console.log('🔍 DocumentService: Contract content preview:', contractContent.substring(0, 200) + '...');

  // Convertir el contenido de texto a párrafos de Word
  const contentParagraphs = contractContent.split('\n\n').map(paragraph => {
    if (paragraph.trim() === '') return new Paragraph({});
    
    // Detectar títulos (líneas en mayúsculas)
    if (paragraph.toUpperCase() === paragraph && paragraph.length > 3) {
      return new Paragraph({
        text: paragraph,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      });
    }
    
    // Detectar subtítulos (líneas que terminan con :)
    if (paragraph.includes(':') && paragraph.length < 100) {
      return new Paragraph({
        children: [
          new TextRun({
            text: paragraph,
            bold: true,
          }),
        ],
      });
    }
    
    // Párrafo normal
    return new Paragraph({
      text: paragraph,
    });
  });

  console.log('🔍 DocumentService: Generated', contentParagraphs.length, 'paragraphs');

  const doc = new Document({
    sections: [{
      properties: {},
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: logoData as any,
                  transformation: { width: 160, height: 70 },
                  type: 'png',
                })
              ],
              alignment: AlignmentType.LEFT,
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Proptech S.A. | www.proptech.com | info@proptech.com',
                  size: 18,
                  color: '888888',
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
      children: [
        // Separador visual
        new Paragraph({
          border: {
            bottom: { color: '465FFF', space: 1, style: BorderStyle.SINGLE, size: 6 },
          },
        }),
        // Fecha
        new Paragraph({
          children: [
            new TextRun({
              text: `Fecha: ${
                contract.signedDate
                  ? new Date(contract.signedDate).toLocaleDateString()
                  : contract.createdAt
                    ? new Date(contract.createdAt).toLocaleDateString()
                    : 'No especificada'
              }`,
            }),
          ],
          alignment: AlignmentType.RIGHT,
        }),
        new Paragraph({}),
        // Contenido del contrato
        ...contentParagraphs,
        new Paragraph({}),
        
        // Firmas con imágenes digitales
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'EL CORREDOR', bold: true }),
                        new TextRun({ text: '\n\n' }),
                        ...(brokerSignatureImage ? [
                          new ImageRun({
                            data: brokerSignatureImage as any,
                            transformation: { width: 200, height: 80 },
                            type: 'png',
                          })
                        ] : [
                          new TextRun({ text: '_________________' })
                        ]),
                        new TextRun({ text: '\n\n' }),
                        new TextRun({ text: contract.brokerName || '_________________' }),
                        // Información de auditoría del corredor
                        ...(brokerAuditInfo ? [
                          new TextRun({ text: '\n\n', size: 8 }),
                          new TextRun({ 
                            text: `Firma digital validada\nTimestamp: ${brokerAuditInfo.timestamp}\nIP: ${brokerAuditInfo.ipAddress}\nHash: ${brokerAuditInfo.signatureData.signatureHash}`, 
                            size: 8,
                            color: '666666'
                          })
                        ] : [])
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  borders: {},
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'EL CLIENTE', bold: true }),
                        new TextRun({ text: '\n\n' }),
                        ...(clientSignatureImage ? [
                          new ImageRun({
                            data: clientSignatureImage as any,
                            transformation: { width: 200, height: 80 },
                            type: 'png',
                          })
                        ] : [
                          new TextRun({ text: '_________________' })
                        ]),
                        new TextRun({ text: '\n\n' }),
                        new TextRun({ text: contract.clientName || '_________________' }),
                        // Información de auditoría del cliente
                        ...(clientAuditInfo ? [
                          new TextRun({ text: '\n\n', size: 8 }),
                          new TextRun({ 
                            text: `Firma digital validada\nTimestamp: ${clientAuditInfo.timestamp}\nIP: ${clientAuditInfo.ipAddress}\nHash: ${clientAuditInfo.signatureData.signatureHash}`, 
                            size: 8,
                            color: '666666'
                          })
                        ] : [])
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  borders: {},
                }),
              ],
            }),
          ],
        }),
        
        // Información adicional de validación
        ...(clientAuditInfo || brokerAuditInfo ? [
          new Paragraph({}),
          new Paragraph({
            children: [
              new TextRun({
                text: "INFORMACIÓN DE VALIDACIÓN DIGITAL",
                bold: true,
                size: 20,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({}),
          new Paragraph({
            children: [
              new TextRun({
                text: "Este documento contiene firmas digitales con información de auditoría para su validación. Los datos incluyen timestamp, dirección IP, hash de firma y metadatos del dispositivo utilizado para la firma.",
                size: 16,
                color: '666666',
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ] : []),
      ],
    }],
  });
  return await Packer.toBlob(doc);
};

export const downloadContractDocument = async (contract: Contract) => {
  try {
    const logoData = await fetchLogo();
    const blob = await generateContractDocument(contract, logoData);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contrato-corretaje-${contract.title.toLowerCase().replace(/\s+/g, '-')}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al generar el documento:', error);
    throw error;
  }
}; 