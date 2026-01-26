/**
 * Centralized URL utility functions
 * Provides consistent URL construction and cleaning logic
 */

/**
 * Clean up malformed API URLs that might have double concatenation
 */
export function resolveApiUrl(envVar?: string): string {
  let apiUrl = envVar || process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://api.proptech.com.py' : 'http://localhost:8080');
  
  // Clean up malformed URLs that might have double concatenation
  if (apiUrl.includes('https://proptech.com.py/https/api.proptech.com.py')) {
    apiUrl = 'https://api.proptech.com.py';
  } else if (apiUrl.includes('http://proptech.com.py/http/api.proptech.com.py')) {
    apiUrl = 'http://api.proptech.com.py';
  }
  
  return apiUrl;
}

/**
 * Build a complete API URL from base URL and endpoint
 */
export function buildApiUrl(baseUrl: string, endpoint: string): string {
  // Clean up malformed URLs that might have double concatenation
  if (baseUrl.includes('https://proptech.com.py/https/api.proptech.com.py')) {
    baseUrl = 'https://api.proptech.com.py';
  } else if (baseUrl.includes('http://proptech.com.py/http/api.proptech.com.py')) {
    baseUrl = 'http://api.proptech.com.py';
  }
  
  // Ensure we don't double-concatenate URLs
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${cleanBaseUrl}${cleanEndpoint}`;
}

/**
 * Build image URL with proper URL construction
 */
export function buildImageUrl(imagePath: string | null | undefined, baseUrl?: string): string | null {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it's a blob URL, return as is
  if (imagePath.startsWith('blob:')) return imagePath;
  
  const apiBaseUrl = baseUrl || resolveApiUrl();
  
  // Ensure we don't double-concatenate URLs
  if (imagePath.startsWith('/') && apiBaseUrl.endsWith('/')) {
    return `${apiBaseUrl.slice(0, -1)}${imagePath}`;
  }
  
  return `${apiBaseUrl}${imagePath}`;
}

/**
 * Get profile photo URL from user or agent object
 * Handles multiple possible field names and constructs the full URL
 * 
 * Priority order:
 * 1. photoUrl (user field)
 * 2. fotoPerfilUrl (agent field)
 * 3. photo (legacy/alternative field)
 * 4. avatar (alternative field)
 * 
 * @param entity - User or Agent object with potential photo fields
 * @param baseUrl - Optional base URL, defaults to API URL from env
 * @returns Full photo URL or null if no photo found
 */
export function getProfilePhotoUrl(
  entity: {
    photoUrl?: string | null;
    fotoPerfilUrl?: string | null;
    photo?: string | null;
    avatar?: string | null;
  } | null | undefined,
  baseUrl?: string
): string | null {
  if (!entity) return null;
  
  // Try all possible fields in priority order
  const photoPath = entity.photoUrl || 
                    entity.fotoPerfilUrl || 
                    entity.photo || 
                    entity.avatar || 
                    null;
  
  if (!photoPath) return null;
  
  return buildImageUrl(photoPath, baseUrl);
}

/**
 * Get profile photo URL with fallback to initials
 * Returns the photo URL if available, or null for fallback rendering
 * 
 * @param entity - User or Agent object
 * @param baseUrl - Optional base URL
 * @returns Photo URL string or null
 */
export function getProfilePhotoUrlOrNull(
  entity: {
    photoUrl?: string | null;
    fotoPerfilUrl?: string | null;
    photo?: string | null;
    avatar?: string | null;
  } | null | undefined,
  baseUrl?: string
): string | null {
  return getProfilePhotoUrl(entity, baseUrl);
}
