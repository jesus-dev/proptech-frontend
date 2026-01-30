import { NextRequest, NextResponse } from 'next/server';

/** Orígenes permitidos para el proxy de imágenes (evita SSRF). Proptech, Aciapp y OnBienesRaices consumen la misma API. */
const ALLOWED_ORIGINS = [
  'https://api.proptech.com.py',
  'http://api.proptech.com.py',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const origin = `${parsed.protocol}//${parsed.host}`;
    return ALLOWED_ORIGINS.some((allowed) => origin === allowed);
  } catch {
    return false;
  }
}

/**
 * Proxy de imágenes de galería para evitar CORS y fallos de carga.
 * Solo permite URLs del backend (api.proptech.com.py o localhost).
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Aceptar URL codificada una o dos veces (p. ej. desde query string)
  let decodedUrl = url;
  try {
    decodedUrl = decodeURIComponent(url);
    if (decodedUrl.includes('%')) decodedUrl = decodeURIComponent(decodedUrl);
  } catch {
    decodedUrl = url;
  }
  if (!isAllowedUrl(decodedUrl)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
  }

  const fetchOpts: RequestInit = {
    method: 'GET',
    headers: {
      Accept: 'image/*,*/*',
      'User-Agent': 'Proptech-Image-Proxy/1.0',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(25000), // 25s timeout para evitar 502 por espera
  };

  try {
    let res = await fetch(decodedUrl, fetchOpts);

    // Si 404 y la ruta es /uploads/{número}/{file} sin "gallery", reintentar con /uploads/gallery/...
    if (res.status === 404) {
      try {
        const u = new URL(decodedUrl);
        const path = u.pathname;
        const match = path.match(/^\/uploads\/(\d+)\/([^/]+)$/);
        if (match) {
          const retryUrl = `${u.origin}/uploads/gallery/${match[1]}/${match[2]}`;
          res = await fetch(retryUrl, fetchOpts);
          if (res.ok) decodedUrl = retryUrl;
        }
      } catch {
        // ignore retry
      }
    }

    if (!res.ok) {
      console.error('[proxy-image] Backend returned', res.status, decodedUrl);
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get('Content-Type') || 'image/jpeg';
    const body = await res.arrayBuffer();

    // Solo reenviar si el backend devolvió algo que parece imagen (evita reenviar HTML/JS por error)
    const safeType = contentType.toLowerCase().startsWith('image/') ? contentType : 'image/jpeg';

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': safeType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[proxy-image]', err);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 502 });
  }
}
