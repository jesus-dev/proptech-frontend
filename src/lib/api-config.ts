/**
 * Centralized API configuration service
 * Automatically reads environment variables and provides fallbacks
 */

class ApiConfig {
  private static instance: ApiConfig;
  private apiUrl: string;

  private constructor() {
    this.apiUrl = this.resolveApiUrl();
  }

  public static getInstance(): ApiConfig {
    if (!ApiConfig.instance) {
      ApiConfig.instance = new ApiConfig();
    }
    return ApiConfig.instance;
  }

  private resolveApiUrl(): string {
    // Usar variable de entorno o fallback para desarrollo
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Clean up malformed URLs that might have double concatenation
    if (apiUrl.includes('https://proptech.com.py/https/api.proptech.com.py')) {
      apiUrl = 'https://api.proptech.com.py';
    } else if (apiUrl.includes('http://proptech.com.py/http/api.proptech.com.py')) {
      apiUrl = 'http://api.proptech.com.py';
    }
    
    return apiUrl;
  }

  public getApiUrl(): string {
    return this.apiUrl;
  }

  public getEndpoint(path: string): string {
    // Ensure we don't double-concatenate URLs
    if (path.startsWith('/') && this.apiUrl.endsWith('/')) {
      return `${this.apiUrl.slice(0, -1)}${path}`;
    }
    return `${this.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  // Method to update API URL (useful for testing or dynamic configuration)
  public setApiUrl(url: string): void {
    this.apiUrl = url;
  }

  // Get current configuration for debugging
  public getConfig() {
    return {
      apiUrl: this.apiUrl,
      environment: typeof window !== 'undefined' ? 'client' : 'server',
      envVar: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : 'not available'
    };
  }
}

// Export singleton instance
export const apiConfig = ApiConfig.getInstance();

// Export helper functions
export const getApiUrl = () => apiConfig.getApiUrl();
export const getEndpoint = (path: string) => apiConfig.getEndpoint(path); 