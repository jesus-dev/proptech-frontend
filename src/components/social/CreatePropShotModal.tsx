'use client';

import React, { useState } from 'react';

interface CreatePropShotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (propShotData: any) => void;
  creating?: boolean;
}

export default function CreatePropShotModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  creating = false 
}: CreatePropShotModalProps) {
  const [newPropShot, setNewPropShot] = useState({ title: '', description: '', duration: '90:00', link: '' });
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const handleSubmit = () => {
    onSubmit({
      ...newPropShot,
      video: selectedVideo,
      thumbnail: selectedThumbnail
    });
  };

  const handleClose = () => {
    // Limpiar estados
    setSelectedVideo(null);
    setVideoPreview(null);
    setSelectedThumbnail(null);
    setThumbnailPreview(null);
    setNewPropShot({ title: '', description: '', duration: '90:00', link: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header fijo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h3 className="text-xl font-bold text-gray-900">Crear PropShot</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>
        
        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Área de video con upload funcional */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Video del PropShot</label>
            
            {videoPreview ? (
              /* Preview del video seleccionado */
              <div className="relative">
                <video
                  src={videoPreview}
                  className="w-full aspect-[9/16] rounded-xl object-cover"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onLoadStart={() => console.log('🎬 Video iniciando carga:', videoPreview)}
                  onLoadedData={(e) => {
                    console.log('🎬 Video datos cargados:', videoPreview);
                    const videoElement = e.currentTarget;
                    videoElement.muted = true;
                    // Múltiples intentos de auto-play
                    videoElement.play()
                      .then(() => console.log('🎬 Video reproduciéndose automáticamente'))
                      .catch(err => {
                        console.log('❌ Auto-play bloqueado:', err);
                        // Intentar de nuevo después de un delay
                        setTimeout(() => {
                          videoElement.play()
                            .then(() => console.log('🎬 Segundo intento exitoso'))
                            .catch(e2 => console.log('❌ Segundo intento falló:', e2));
                        }, 1000);
                      });
                  }}
                  onCanPlay={() => console.log('🎬 Video puede reproducirse:', videoPreview)}
                  onPlay={() => console.log('🎬 Video comenzó a reproducirse')}
                  onError={(e) => console.log('❌ Error en video:', e.currentTarget.error)}
                />
                
                {/* Botón de sonido */}
                <button
                  onClick={() => {
                    const videoElement = document.querySelector('video') as HTMLVideoElement;
                    if (videoElement) {
                      if (videoElement.muted) {
                        videoElement.muted = false;
                        console.log('🔊 Sonido activado');
                      } else {
                        videoElement.muted = true;
                        console.log('🔇 Sonido desactivado');
                      }
                    }
                  }}
                  className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.5 4.14L19.5 3.14C19.9 2.74 20.5 2.74 20.9 3.14C21.3 3.54 21.3 4.14 20.9 4.54L19.9 5.54C19.5 5.94 18.9 5.94 18.5 5.54C18.1 5.14 18.1 4.54 18.5 4.14ZM15.5 7.14L16.5 6.14C16.9 5.74 17.5 5.74 17.9 6.14C18.3 6.54 18.3 7.14 17.9 7.54L16.9 8.54C16.5 8.94 15.9 8.94 15.5 8.54C15.1 8.14 15.1 7.54 15.5 7.14ZM12.5 10.14L13.5 9.14C13.9 8.74 14.5 8.74 14.9 9.14C15.3 9.54 15.3 10.14 14.9 10.54L13.9 11.54C13.5 11.94 12.9 11.94 12.5 11.54C12.1 11.14 12.1 10.54 12.5 10.14ZM9.5 13.14L10.5 12.14C10.9 11.74 11.5 11.74 11.9 12.14C12.3 12.54 12.3 13.14 11.9 13.54L10.9 14.54C10.5 14.94 9.9 14.94 9.5 14.54C9.1 14.14 9.1 13.14 9.5 13.14ZM6.5 16.14L7.5 15.14C7.9 14.74 8.5 14.74 8.9 15.14C9.3 15.54 9.3 16.14 8.9 16.54L7.9 17.54C7.5 17.94 6.9 17.94 6.5 17.54C6.1 17.14 6.1 16.14 6.5 16.14ZM3.5 19.14L4.5 18.14C4.9 17.74 5.5 17.74 5.9 18.14C6.3 18.54 6.3 19.14 5.9 19.54L4.9 20.54C4.5 20.94 3.9 20.94 3.5 20.54C3.1 20.14 3.1 19.14 3.5 19.14Z"/>
                  </svg>
                </button>
                
                {/* Botón para cambiar video */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C13.1 2 14 2.9 14 4v6h6c1.1 0 2 .9 2 2s-.9 2-2 2h-6v6c0 1.1-.9 2-2 2s-2-.9-2-2v-6H4c-1.1 0-2-.9-2-2s.9-2 2-2h6V4c0-1.1.9-2 2-2z"/>
                    </svg>
                    <span>{selectedVideo?.name}</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedVideo(null);
                      setVideoPreview(null);
                      // Limpiar el input
                      const input = document.getElementById('video-upload') as HTMLInputElement;
                      if (input) input.value = '';
                    }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    Cambiar video
                  </button>
                </div>
              </div>
            ) : (
              /* Área de upload - TODO clickeable */
              <label htmlFor="video-upload" className="aspect-[9/16] bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 rounded-2xl border-2 border-dashed border-orange-300 flex items-center justify-center cursor-pointer hover:border-orange-500 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 to-orange-600/0 group-hover:from-orange-400/10 group-hover:to-orange-600/10 transition-all duration-300"></div>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  id="video-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('🎬 Video seleccionado:', file.name);
                      console.log('🎬 Tamaño del archivo:', file.size);
                      console.log('🎬 Tipo de archivo:', file.type);
                      
                      setSelectedVideo(file);
                      
                      // Crear preview del video
                      const videoUrl = URL.createObjectURL(file);
                      console.log('🎬 URL del preview creada:', videoUrl);
                      setVideoPreview(videoUrl);
                      
                      // Log adicional para verificar que el estado se actualiza
                      setTimeout(() => {
                        console.log('🎬 Estado videoPreview después de 100ms:', videoPreview);
                      }, 100);
                    }
                  }}
                />
                <div className="text-center relative z-10">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C13.1 2 14 2.9 14 4v6h6c1.1 0 2 .9 2 2s-.9 2-2 2h-6v6c0 1.1-.9 2-2 2s-2-.9-2-2v-6H4c-1.1 0-2-.9-2-2s.9-2 2-2h6V4c0-1.1.9-2 2-2z"/>
                      </svg>
                    </div>
                  </div>
                  <p className="text-orange-700 font-bold text-lg mb-2">Seleccionar Video</p>
                  <p className="text-orange-600 text-sm mb-3">o arrastra y suelta aquí</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-200/50 rounded-full">
                    <span className="text-orange-700 text-xs font-medium">MP4, MOV • Máximo 100MB</span>
                  </div>
                </div>
              </label>
            )}
          </div>
          
          {/* Nota sobre thumbnail */}
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Thumbnail automático</p>
                  <p className="text-xs">Se generará automáticamente del video que subas</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Formulario */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título del PropShot *</label>
              <input
                type="text"
                value={newPropShot.title}
                onChange={(e) => setNewPropShot(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Casa en Las Mercedes"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{newPropShot.title.length}/100</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                value={newPropShot.description}
                onChange={(e) => setNewPropShot(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe la propiedad, características principales, ubicación..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{newPropShot.description.length}/500</p>
            </div>        
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enlace "Ver más"</label>
              <input
                type="url"
                value={newPropShot.link}
                onChange={(e) => setNewPropShot(prev => ({ ...prev, link: e.target.value }))}
                placeholder="https://ejemplo.com/propiedad"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Enlace opcional para más información de la propiedad</p>
            </div>
            
            {/* Información adicional */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-orange-500 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <div className="text-sm text-orange-700">
                  <p className="font-medium">Consejos para un buen PropShot:</p>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>• Muestra la propiedad desde diferentes ángulos</li>
                    <li>• Incluye detalles importantes como habitaciones y baños</li>
                    <li>• Mantén el video estable y bien iluminado</li>
                    <li>• Usa un título atractivo y descriptivo</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Botones de acción fijos */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!newPropShot.title.trim() || !selectedVideo || creating}
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {creating ? 'Creando...' : 'Crear PropShot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
