"use client";
import React, { useRef, useState, useEffect } from "react";
import { SignatureAuditService } from "../services/signatureAuditService";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 200;

interface SignaturePadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  error?: string;
}

interface SignatureVerification {
  timestamp: string;
  ipAddress: string;
  browser: string;
  platform: string;
  sessionId: string;
  signatureHash: string;
  signatureLength: number;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ value, onChange, label, error }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [verification, setVerification] = useState<SignatureVerification | null>(null);

  // Función para configurar el canvas
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Configurar el tamaño del canvas
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      
      // Configurar el estilo del canvas para que se vea bien en pantallas de alta densidad
      canvas.style.width = `${CANVAS_WIDTH}px`;
      canvas.style.height = `${CANVAS_HEIGHT}px`;
      
      // Configurar el fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Configurar el estilo del trazo
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Mejorar la calidad del renderizado
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
  };

  useEffect(() => {
    setupCanvas();
  }, []);

  useEffect(() => {
    if (value && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const img = new window.Image();
      img.onload = () => {
        if (ctx) {
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          // Asegurar fondo blanco antes de dibujar la imagen
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = value;
    }
  }, [value]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      const { x, y } = getPointerPosition(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      const { x, y } = getPointerPosition(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const endDrawing = async () => {
    drawing.current = false;
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      onChange(dataUrl);
      
      // Crear y registrar datos de auditoría
      try {
        const auditData = await SignatureAuditService.createAuditData(
          dataUrl, 
          CANVAS_WIDTH, 
          CANVAS_HEIGHT
        );
        
        // Agregar información específica de la firma
        const signatureAuditData = {
          ...auditData,
          signatureType: 'client',
          signatureAction: 'created'
        };
        
        SignatureAuditService.logSignatureEvent(signatureAuditData, 'created');
        
        // Guardar datos de verificación para mostrar con valores por defecto seguros
        setVerification({
          timestamp: auditData.timestamp || new Date().toISOString(),
          ipAddress: auditData.ipAddress || 'N/A',
          browser: auditData.deviceInfo.browser || 'N/A',
          platform: auditData.deviceInfo.platform || 'N/A',
          sessionId: auditData.sessionInfo.sessionId || 'N/A',
          signatureHash: auditData.signatureData.signatureHash || 'N/A',
          signatureLength: auditData.signatureData.signatureLength || 0
        });
        
        console.log(`Firma creada con auditoría:`, signatureAuditData);
        console.log(`Tamaño de la firma: ${dataUrl.length} caracteres`);
      } catch (error) {
        console.error('Error al crear auditoría de firma:', error);
        // En caso de error, establecer valores por defecto
        setVerification({
          timestamp: new Date().toISOString(),
          ipAddress: 'N/A',
          browser: 'N/A',
          platform: 'N/A',
          sessionId: 'N/A',
          signatureHash: 'N/A',
          signatureLength: 0
        });
      }
    }
  };

  const clear = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      onChange("");
      setVerification(null); // Limpiar verificación
      
      // Registrar evento de limpieza
      try {
        const auditData = await SignatureAuditService.createAuditData(
          "", 
          CANVAS_WIDTH, 
          CANVAS_HEIGHT
        );
        
        const signatureAuditData = {
          ...auditData,
          signatureType: 'client',
          signatureAction: 'cleared'
        };
        
        SignatureAuditService.logSignatureEvent(signatureAuditData, 'cleared');
        
        console.log(`Firma limpiada con auditoría:`, signatureAuditData);
      } catch (error) {
        console.error('Error al crear auditoría de limpieza:', error);
      }
    }
  };

  const getPointerPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX = 0, clientY = 0;
    
    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calcular coordenadas relativas al canvas
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    // Asegurar que las coordenadas estén dentro del canvas
    return {
      x: Math.max(0, Math.min(x, canvas.width)),
      y: Math.max(0, Math.min(y, canvas.height))
    };
  };

  // Función para validar que todos los campos de verificación estén presentes
  const isValidVerification = (verification: SignatureVerification | null): verification is SignatureVerification => {
    return verification !== null && 
           typeof verification.sessionId === 'string' && 
           typeof verification.signatureHash === 'string' &&
           verification.sessionId.length > 0 &&
           verification.signatureHash.length > 0 &&
           verification.sessionId !== 'N/A' &&
           verification.signatureHash !== 'N/A';
  };

  // Función para renderizar de forma segura los datos de verificación
  const renderVerificationData = () => {
    if (!isValidVerification(verification)) {
      return null;
    }

    return (
      <div style={{ display: 'grid', gap: 4 }}>
        <div><strong>Fecha:</strong> {verification.timestamp ? new Date(verification.timestamp).toLocaleString('es-PY') : 'N/A'}</div>
        <div><strong>IP:</strong> {verification.ipAddress || 'N/A'}</div>
        <div><strong>Navegador:</strong> {verification.browser || 'N/A'} ({verification.platform || 'N/A'})</div>
        <div><strong>Sesión:</strong> {verification.sessionId && verification.sessionId !== 'N/A' ? verification.sessionId.substring(0, 8) + '...' : 'N/A'}</div>
        <div><strong>Hash:</strong> {verification.signatureHash && verification.signatureHash !== 'N/A' ? verification.signatureHash.substring(0, 16) + '...' : 'N/A'}</div>
        <div><strong>Longitud:</strong> {verification.signatureLength || 0} caracteres</div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="border rounded-lg bg-white dark:bg-gray-800 p-2 relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-36 border border-gray-300 rounded-lg bg-white dark:bg-gray-900 cursor-crosshair touch-none"
          style={{
            cursor: 'crosshair',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
        <button
          type="button"
          onClick={clear}
          className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Limpiar
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Verificación de Firma */}
      {isValidVerification(verification) && (
        <div style={{
          marginTop: 12,
          padding: 12,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          fontSize: 12,
          color: '#475569',
          width: '100%',
          maxWidth: CANVAS_WIDTH
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>
            🔐 Verificación de Firma
          </div>
          {renderVerificationData()}
        </div>
      )}
    </div>
  );
};

export default SignaturePad;
