import { NextRequest, NextResponse } from 'next/server';

/** Orígenes permitidos para el proxy de imágenes (evita SSRF) */
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

  const decodedUrl = decodeURIComponent(url);
  if (!isAllowedUrl(decodedUrl)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
  }

  try {
    const res = await fetch(decodedUrl, {
      method: 'GET',
      headers: {
        Accept: 'image/*,*/*',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get('Content-Type') || 'image/jpeg';
    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[proxy-image]', err);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 502 });
  }
}
