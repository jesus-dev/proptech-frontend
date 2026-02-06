'use client';

import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsVideoProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  poster?: string;
  onLoadedData?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onError?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onCanPlay?: () => void;
  onPlaying?: () => void;
  onLoadedMetadata?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLVideoElement>) => void;
  style?: React.CSSProperties;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

/**
 * Componente de video que soporta HLS streaming.
 * Detecta automáticamente si la URL es HLS (.m3u8) y usa hls.js si es necesario.
 * Para URLs normales de video (.mp4, etc.), usa el elemento video nativo.
 */
const HlsVideo: React.FC<HlsVideoProps> = ({
  src,
  className,
  autoPlay = false,
  muted = false,
  loop = false,
  playsInline = true,
  controls = false,
  poster,
  onLoadedData,
  onError,
  onCanPlay,
  onPlaying,
  onLoadedMetadata,
  onClick,
  style,
  videoRef: externalRef,
}) => {
  const internalRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalRef || internalRef;
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Detectar si es un stream HLS
    const isHls = src.includes('.m3u8');

    if (isHls) {
      // Usar hls.js para streams HLS
      if (Hls.isSupported()) {
        // Limpiar instancia anterior
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls({
          // Configuración optimizada para streaming
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          maxBufferSize: 60 * 1000 * 1000, // 60 MB
          maxBufferHole: 0.5,
        });

        hlsRef.current = hls;

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('🎬 [HLS] Manifest cargado, iniciando reproducción');
          if (autoPlay) {
            video.play().catch((error) => {
              console.log('Autoplay bloqueado:', error);
              // Si falla autoplay, intentar con mute
              video.muted = true;
              video.play().catch(() => {});
            });
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('❌ [HLS] Error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('🔄 [HLS] Error de red, reintentando...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('🔄 [HLS] Error de media, recuperando...');
                hls.recoverMediaError();
                break;
              default:
                console.error('❌ [HLS] Error fatal, destruyendo');
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari soporta HLS nativamente
        video.src = src;
        if (autoPlay) {
          video.play().catch(() => {});
        }
      }
    } else {
      // Video normal (mp4, webm, etc.)
      video.src = src;
      if (autoPlay) {
        video.play().catch((error) => {
          console.log('Autoplay bloqueado:', error);
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    }

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay]);

  return (
    <video
      ref={videoRef as React.RefObject<HTMLVideoElement>}
      className={className}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      controls={controls}
      poster={poster}
      onLoadedData={onLoadedData}
      onError={onError}
      onCanPlay={onCanPlay}
      onPlaying={onPlaying}
      onLoadedMetadata={onLoadedMetadata}
      onClick={onClick}
      style={style}
      // Atributos para Safari
      webkit-playsinline="true"
      x5-playsinline="true"
    />
  );
};

export default HlsVideo;
