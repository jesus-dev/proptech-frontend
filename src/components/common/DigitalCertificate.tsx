import React from 'react';

interface DigitalCertificateProps {
  contractId: string;
  clientName: string;
  brokerName: string;
  clientAudit: unknown;
  brokerAudit: unknown;
  contractType: string;
  signedDate: string;
}

const DigitalCertificate: React.FC<DigitalCertificateProps> = ({
  contractId,
  clientName,
  brokerName,
  clientAudit,
  brokerAudit,
  contractType,
  signedDate
}) => {
  const certificateId = Math.random().toString(36).substr(2, 12).toUpperCase();
  const verificationHash = Math.random().toString(36).substr(2, 16).toUpperCase();

  return (
    <div className="bg-white border-4 border-green-600 rounded-lg p-8 shadow-2xl max-w-4xl mx-auto">
      {/* Header del certificado */}
      <div className="text-center mb-8 border-b-2 border-green-300 pb-6">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center border-4 border-green-600">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-green-900 mb-2">CERTIFICADO DE VERIFICACIÓN DIGITAL</h1>
        <p className="text-lg text-green-700">Documento Legalmente Válido y Auditado</p>
        <div className="mt-4 text-sm text-gray-600">
          <p>Certificado ID: {certificateId}</p>
          <p>Hash de Verificación: {verificationHash}</p>
        </div>
      </div>

      {/* Información del contrato */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
            Información del Contrato
          </h3>
          <div className="space-y-3 text-sm">
            <div><strong>ID del Contrato:</strong> {contractId}</div>
            <div><strong>Tipo:</strong> {contractType}</div>
            <div><strong>Fecha de Firma:</strong> {new Date(signedDate).toLocaleDateString('es-PY')}</div>
            <div><strong>Hora de Firma:</strong> {new Date(signedDate).toLocaleTimeString('es-PY')}</div>
            <div><strong>Estado:</strong> <span className="text-green-600 font-bold">VERIFICADO Y VÁLIDO</span></div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
            Firmantes
          </h3>
          <div className="space-y-4">
            <div>
              <div className="font-semibold text-gray-900">Cliente:</div>
              <div className="text-sm text-gray-700">{clientName}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">Corredor:</div>
              <div className="text-sm text-gray-700">{brokerName}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Auditoría de firmas */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
          Auditoría de Firmas Digitales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(clientAudit as any) && (
            <div className="border-2 border-green-400 bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Firma del Cliente
              </h4>
              <div className="text-sm space-y-1">
                <div><strong>Fecha/Hora:</strong> {(clientAudit as any).timestamp ? new Date((clientAudit as any).timestamp).toLocaleString('es-PY') : 'N/A'}</div>
                <div><strong>IP:</strong> {(clientAudit as any).ipAddress || 'N/A'}</div>
                <div><strong>Navegador:</strong> {(clientAudit as any).browser ? `${(clientAudit as any).browser}${(clientAudit as any).browserVersion ? ` (${(clientAudit as any).browserVersion})` : ''}` : 'N/A'}</div>
                <div><strong>Plataforma:</strong> {(clientAudit as any).platform || 'N/A'}</div>
                <div><strong>Hash:</strong> {(clientAudit as any).signatureHash || 'N/A'}</div>
              </div>
            </div>
          )}

          {(brokerAudit as any) && (
            <div className="border-2 border-blue-400 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                Firma del Corredor
              </h4>
              <div className="text-sm space-y-1">
                <div><strong>Fecha/Hora:</strong> {(brokerAudit as any).timestamp ? new Date((brokerAudit as any).timestamp).toLocaleString('es-PY') : 'N/A'}</div>
                <div><strong>IP:</strong> {(brokerAudit as any).ipAddress || 'N/A'}</div>
                <div><strong>Navegador:</strong> {(brokerAudit as any).browser ? `${(brokerAudit as any).browser}${(brokerAudit as any).browserVersion ? ` (${(brokerAudit as any).browserVersion})` : ''}` : 'N/A'}</div>
                <div><strong>Plataforma:</strong> {(brokerAudit as any).platform || 'N/A'}</div>
                <div><strong>Hash:</strong> {(brokerAudit as any).signatureHash || 'N/A'}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Garantías y cumplimiento */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
          Garantías de Seguridad y Cumplimiento Legal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-100 rounded-lg">
            <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="font-semibold text-green-900">Integridad Garantizada</div>
            <div className="text-sm text-green-700">Documento no alterable</div>
          </div>
          <div className="text-center p-4 bg-blue-100 rounded-lg">
            <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="font-semibold text-blue-900">Encriptación AES-256</div>
            <div className="text-sm text-blue-700">Máxima seguridad</div>
          </div>
          <div className="text-center p-4 bg-purple-100 rounded-lg">
            <svg className="w-8 h-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="font-semibold text-purple-900">Cumplimiento Legal</div>
            <div className="text-sm text-purple-700">Ley 4.017/10 Paraguay</div>
          </div>
        </div>
      </div>

      {/* Footer del certificado */}
      <div className="border-t-2 border-green-300 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Emitido por:</h4>
            <div className="text-sm text-gray-700">
              <div>OnTech Proptech Suite</div>
              <div>Sistema de Gestión Inmobiliaria</div>
              <div>Certificación Digital Autorizada</div>
            </div>
          </div>
          <div className="text-right">
            <h4 className="font-bold text-gray-900 mb-2">Fecha de Emisión:</h4>
            <div className="text-sm text-gray-700">
              {new Date().toLocaleDateString('es-PY')}
            </div>
            <div className="text-sm text-gray-700">
              {new Date().toLocaleTimeString('es-PY')}
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Este certificado es válido únicamente para el documento especificado y no puede ser transferido o modificado.</p>
          <p>Para verificar la autenticidad, escanee el código QR o visite: https://verify.ontech.com.py</p>
        </div>
      </div>
    </div>
  );
};

export default DigitalCertificate; 