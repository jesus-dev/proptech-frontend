/**
 * Slug para galería: ID ofuscado con XOR + base36 para URLs cortas.
 * Compatible con slugs legacy: solo dígitos (ej. "29") o base36 corto (ej. "t").
 */

const OBFUSCATE_KEY = 0x7a3c9e1b;

export function encodePostId(id: number): string {
  if (!Number.isInteger(id) || id < 0) return String(id);
  const obfuscated = id ^ OBFUSCATE_KEY;
  return obfuscated.toString(36);
}

/**
 * Decodifica el slug al ID numérico.
 * Acepta: solo dígitos ("29"), base36 corto legacy ("t"), o slug XOR ("xwzlza").
 */
export function decodePostSlug(slug: string | undefined): number | null {
  if (slug == null || slug === '') return null;
  const s = String(slug).trim().toLowerCase();
  if (s === '') return null;
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  const n = parseInt(s, 36);
  if (Number.isNaN(n) || n <= 0) return null;
  // Slug largo = ofuscado con XOR (ej. xwzlza → 29). Corto = legacy base36 sin XOR (ej. t → 29).
  if (n < 1e6) return n;
  const decoded = n ^ OBFUSCATE_KEY;
  return decoded > 0 && Number.isInteger(decoded) ? decoded : null;
}
