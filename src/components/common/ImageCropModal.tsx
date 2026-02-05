"use client";

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { X, ZoomIn, ZoomOut, RotateCw, Check } from 'lucide-react';

// Importar react-easy-crop dinámicamente
// react-easy-crop exporta Cropper como default export
const Cropper = dynamic(
  () => import('react-easy-crop').then((mod) => mod.default || mod),
  { 
    ssr: false,
    loading: () => null // No mostrar loading aquí, lo manejamos en el componente
  }
) as React.ComponentType<any>;

interface ImageCropModalProps {
  imageSrc: string;
  onComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
  circularCrop?: boolean;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageCropModal({
  imageSrc,
  onComplete,
  onCancel,
  aspectRatio = 1,
  circularCrop = false,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cropperLoaded, setCropperLoaded] = useState(false);

  // Verificar que la imagen se carga correctamente
  useEffect(() => {
    if (imageSrc) {
      setImageLoaded(false);
      setImageError(false);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImageLoaded(true);
        setImageError(false);
      };
      img.onerror = () => {
        console.error('Error loading image in crop modal:', imageSrc);
        setImageError(true);
        setImageLoaded(false);
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  // Verificar que el componente Cropper se carga
  useEffect(() => {
    import('react-easy-crop').then(() => {
      setCropperLoaded(true);
    }).catch((error) => {
      console.error('Error loading react-easy-crop:', error);
      setImageError(true);
    });
  }, []);

  const onCropComplete = useCallback((_: CropArea, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CropArea,
    rotation = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg', 0.95);
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      onComplete(croppedImage);
    } catch (e) {
      console.error('Error cropping image:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center bg-black/80 pt-4 sm:pt-0">
      <div className="bg-white dark:bg-gray-800 w-full sm:w-[95%] sm:max-w-lg rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
            Editar Foto
          </h3>
          <button
            onClick={onCancel}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative w-full h-[250px] sm:h-[300px] flex-shrink-0" style={{ backgroundColor: '#000' }}>
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center text-white">
              <p className="text-red-400 text-sm">Error al cargar la imagen</p>
            </div>
          ) : !imageSrc ? (
            <div className="w-full h-full flex items-center justify-center text-white">
              <p className="text-sm">No hay imagen seleccionada</p>
            </div>
          ) : !imageLoaded || !cropperLoaded ? (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm">Cargando...</p>
              </div>
            </div>
          ) : (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropShape={circularCrop ? 'round' : 'rect'}
              showGrid={true}
            />
          )}
        </div>

        {/* Controls */}
        <div className="px-4 py-3 space-y-3 flex-shrink-0 bg-gray-50 dark:bg-gray-900/50">
          {/* Zoom */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setZoom(Math.max(1, zoom - 0.1))}
              className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600"
            >
              <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer dark:bg-gray-700 accent-brand-500"
            />
            <button 
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600"
            >
              <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Rotation */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setRotation((rotation - 90 + 360) % 360)}
              className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600"
            >
              <RotateCw className="w-4 h-4 text-gray-600 dark:text-gray-300 transform -scale-x-100" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">{rotation}°</span>
            </div>
            <button 
              onClick={() => setRotation((rotation + 90) % 360)}
              className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600"
            >
              <RotateCw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Aplicar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

