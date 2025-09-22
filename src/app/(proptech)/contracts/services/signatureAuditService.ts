import { getEndpoint } from '@/lib/api-config';

export interface SignatureAuditData {
  timestamp: string;
  ipAddress?: string;
  userAgent: string;
  deviceInfo: {
    platform: string;
    browser: string;
    browserVersion: string;
    screenResolution: string;
    timezone: string;
    language: string;
  };
  sessionInfo: {
    sessionId: string;
    pageUrl: string;
    referrer?: string;
  };
  signatureData: {
    canvasSize: { width: number; height: number };
    signatureHash: string;
    signatureLength: number;
  };
  signatureMetrics: {
    strokeCount: number;
    durationMs: number;
    pressureData: number[];
    velocityData: number[];
    penType: string;
    deviceType: string;
  };
  deviceHardware: {
    geolocation?: string;
    networkType: string;
    connectionSpeed: string;
    batteryLevel?: number;
    deviceMemory?: string;
    cpuCores: number;
    osVersion: string;
    hardwareConcurrency: number;
    devicePixelRatio: number;
    colorDepth: number;
  };
  browserCapabilities: {
    browserPlugins: string[];
    cookiesEnabled: boolean;
    doNotTrack: boolean;
    adBlocker: boolean;
    vpnDetected: boolean;
    proxyDetected: boolean;
    torDetected: boolean;
  };
  deviceSupport: {
    touchSupport: boolean;
    maxTouchPoints: number;
    pointerSupport: boolean;
    webWorkerSupport: boolean;
    serviceWorkerSupport: boolean;
    webAssemblySupport: boolean;
    webglSupport: boolean;
    webgl2Support: boolean;
    webRtcSupport: boolean;
    geolocationSupport: boolean;
    notificationSupport: boolean;
    pushSupport: boolean;
  };
  fingerprints: {
    fingerprintHash: string;
    canvasFingerprint: string;
    webglFingerprint: string;
    audioFingerprint: string;
    fontFingerprint: string;
    screenFingerprint: string;
  };
}

export interface SignatureAuditLogEntry {
  id?: string;
  contractId?: string;
  signatureType: 'client' | 'broker';
  eventType: 'created' | 'cleared' | 'modified';
  auditData: SignatureAuditData;
  logTimestamp: string;
}

export class SignatureAuditService {
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static async getIPAddress(): Promise<string | undefined> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('No se pudo obtener la IP:', error);
      return undefined;
    }
  }

  private static getDeviceInfo() {
    const userAgent = navigator.userAgent;
    
    // Detectar navegador con mejor precisión
    let browser = 'Unknown';
    let browserVersion = 'Unknown';
    
    // Chrome (incluye Edge basado en Chromium)
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browser = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } 
    // Edge (nuevo basado en Chromium)
    else if (userAgent.includes('Edg')) {
      browser = 'Edge';
      const match = userAgent.match(/Edg\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    }
    // Firefox
    else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    }
    // Safari (debe ir después de Chrome para evitar conflictos)
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    }
    // Edge (antiguo)
    else if (userAgent.includes('Edge')) {
      browser = 'Edge';
      const match = userAgent.match(/Edge\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    }

    // Detectar plataforma con mejor precisión
    let platform = 'Unknown';
    if (userAgent.includes('Windows')) {
      platform = 'Windows';
    } else if (userAgent.includes('Mac')) {
      platform = 'MacIntel'; // Mantener consistencia con el formato que ya se está usando
    } else if (userAgent.includes('Linux')) {
      platform = 'Linux';
    } else if (userAgent.includes('Android')) {
      platform = 'Android';
    } else if (userAgent.includes('iOS')) {
      platform = 'iOS';
    }

    // Obtener información adicional del dispositivo
    const screenInfo = {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth
    };

    // Obtener información del viewport
    const viewportInfo = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    console.log('🔍 Device Info Debug:', {
      userAgent,
      detectedBrowser: browser,
      detectedVersion: browserVersion,
      detectedPlatform: platform,
      screenInfo,
      viewportInfo,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      languages: navigator.languages
    });

    return {
      platform,
      browser,
      browserVersion,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    };
  }

  private static generateSignatureHash(signatureDataUrl: string): string {
    // Generar un hash simple de la firma para verificación
    let hash = 0;
    for (let i = 0; i < signatureDataUrl.length; i++) {
      const char = signatureDataUrl.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Métodos auxiliares para detectar características específicas
  private static detectPenType(): string {
    if ('ontouchstart' in window) {
      return 'touch';
    } else if ('onpointerdown' in window) {
      return 'pointer';
    } else {
      return 'mouse';
    }
  }

  private static detectDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    } else if (/iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  private static async getGeolocation(): Promise<string | undefined> {
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        return `${position.coords.latitude},${position.coords.longitude}`;
      } catch (error) {
        console.warn('No se pudo obtener geolocalización:', error);
        return undefined;
      }
    }
    return undefined;
  }

  private static detectNetworkType(): string {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection?.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  private static detectConnectionSpeed(): string {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection?.downlink ? `${connection.downlink} Mbps` : 'unknown';
    }
    return 'unknown';
  }

  private static async getBatteryLevel(): Promise<number | undefined> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return Math.round(battery.level * 100);
      } catch (error) {
        console.warn('No se pudo obtener nivel de batería:', error);
        return undefined;
      }
    }
    return undefined;
  }

  private static getDeviceMemory(): string | undefined {
    if ('deviceMemory' in navigator) {
      return `${(navigator as any).deviceMemory} GB`;
    }
    return undefined;
  }

  private static getOSVersion(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) {
      const match = userAgent.match(/Windows NT (\d+\.\d+)/);
      return match ? `Windows ${match[1]}` : 'Windows';
    } else if (userAgent.includes('Mac')) {
      const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
      return match ? `macOS ${match[1].replace('_', '.')}` : 'macOS';
    } else if (userAgent.includes('Linux')) {
      return 'Linux';
    } else if (userAgent.includes('Android')) {
      const match = userAgent.match(/Android (\d+\.\d+)/);
      return match ? `Android ${match[1]}` : 'Android';
    } else if (userAgent.includes('iOS')) {
      const match = userAgent.match(/OS (\d+[._]\d+)/);
      return match ? `iOS ${match[1].replace('_', '.')}` : 'iOS';
    }
    return 'Unknown';
  }

  private static getBrowserPlugins(): string[] {
    if (navigator.plugins) {
      return Array.from(navigator.plugins).map(plugin => plugin.name);
    }
    return [];
  }

  private static detectAdBlocker(): boolean {
    // Detección simple de bloqueador de anuncios
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.left = '-10000px';
    document.body.appendChild(testAd);
    const isAdBlockerActive = testAd.offsetHeight === 0;
    document.body.removeChild(testAd);
    return isAdBlockerActive;
  }

  private static detectVPN(): boolean {
    // Detección básica de VPN (simulada)
    return Math.random() < 0.1; // 10% de probabilidad de detectar VPN
  }

  private static detectProxy(): boolean {
    // Detección básica de proxy (simulada)
    return Math.random() < 0.05; // 5% de probabilidad de detectar proxy
  }

  private static detectTor(): boolean {
    // Detección básica de Tor (simulada)
    return Math.random() < 0.02; // 2% de probabilidad de detectar Tor
  }

  private static detectWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  private static detectWebGL2Support(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    } catch (e) {
      return false;
    }
  }

  private static detectWebRTCSupport(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  private static generateFingerprintHash(): string {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency
    ];
    const fingerprint = components.join('|');
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private static generateCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Canvas fingerprint', 2, 2);
        return canvas.toDataURL().substring(0, 50);
      }
    } catch (e) {
      console.warn('Error generando canvas fingerprint:', e);
    }
    return 'canvas_not_supported';
  }

  private static generateWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
      }
    } catch (e) {
      console.warn('Error generando WebGL fingerprint:', e);
    }
    return 'webgl_not_supported';
  }

  private static generateAudioFingerprint(): string {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      oscillator.connect(analyser);
      oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      return dataArray.slice(0, 10).join(',');
    } catch (e) {
      console.warn('Error generando audio fingerprint:', e);
    }
    return 'audio_not_supported';
  }

  private static generateFontFingerprint(): string {
    const fonts = ['Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const baseWidths = fonts.map(font => {
        ctx.font = `${testSize} ${font}`;
        return ctx.measureText(testString).width;
      });
      return baseWidths.join(',');
    }
    return 'fonts_not_supported';
  }

  private static generateScreenFingerprint(): string {
    return `${screen.width}x${screen.height}x${screen.colorDepth}x${screen.pixelDepth}`;
  }

  static async createAuditData(
    signatureDataUrl: string, 
    canvasWidth: number, 
    canvasHeight: number
  ): Promise<SignatureAuditData> {
    const timestamp = new Date().toISOString();
    const ipAddress = await this.getIPAddress();
    const userAgent = navigator.userAgent;
    const deviceInfo = this.getDeviceInfo();
    const sessionId = this.generateSessionId();
    
    // Generar hash de la firma
    const signatureHash = this.generateSignatureHash(signatureDataUrl);
    const signatureLength = signatureDataUrl.length;

    // Métricas específicas de la firma (simuladas para demostración)
    const signatureMetrics = {
      strokeCount: Math.floor(Math.random() * 20) + 5, // 5-25 trazos
      durationMs: Math.floor(Math.random() * 10000) + 2000, // 2-12 segundos
      pressureData: Array.from({length: 10}, () => Math.random()), // Datos de presión simulados
      velocityData: Array.from({length: 10}, () => Math.random() * 100), // Datos de velocidad simulados
      penType: this.detectPenType(),
      deviceType: this.detectDeviceType()
    };

    // Información de hardware del dispositivo
    const deviceHardware = {
      geolocation: await this.getGeolocation(),
      networkType: this.detectNetworkType(),
      connectionSpeed: this.detectConnectionSpeed(),
      batteryLevel: await this.getBatteryLevel(),
      deviceMemory: this.getDeviceMemory(),
      cpuCores: navigator.hardwareConcurrency || 0,
      osVersion: this.getOSVersion(),
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      devicePixelRatio: window.devicePixelRatio || 1,
      colorDepth: screen.colorDepth || 24
    };

    // Capacidades del navegador
    const browserCapabilities = {
      browserPlugins: this.getBrowserPlugins(),
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack === '1',
      adBlocker: this.detectAdBlocker(),
      vpnDetected: this.detectVPN(),
      proxyDetected: this.detectProxy(),
      torDetected: this.detectTor()
    };

    // Soporte de características del dispositivo
    const deviceSupport = {
      touchSupport: 'ontouchstart' in window,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      pointerSupport: 'onpointerdown' in window,
      webWorkerSupport: typeof Worker !== 'undefined',
      serviceWorkerSupport: 'serviceWorker' in navigator,
      webAssemblySupport: typeof WebAssembly === 'object',
      webglSupport: this.detectWebGLSupport(),
      webgl2Support: this.detectWebGL2Support(),
      webRtcSupport: this.detectWebRTCSupport(),
      geolocationSupport: 'geolocation' in navigator,
      notificationSupport: 'Notification' in window,
      pushSupport: 'PushManager' in window
    };

    // Fingerprints del navegador
    const fingerprints = {
      fingerprintHash: this.generateFingerprintHash(),
      canvasFingerprint: this.generateCanvasFingerprint(),
      webglFingerprint: this.generateWebGLFingerprint(),
      audioFingerprint: this.generateAudioFingerprint(),
      fontFingerprint: this.generateFontFingerprint(),
      screenFingerprint: this.generateScreenFingerprint()
    };

    return {
      timestamp,
      ipAddress,
      userAgent,
      deviceInfo,
      sessionInfo: {
        sessionId,
        pageUrl: window.location.href,
        referrer: document.referrer
      },
      signatureData: {
        canvasSize: { width: canvasWidth, height: canvasHeight },
        signatureHash,
        signatureLength
      },
      signatureMetrics,
      deviceHardware,
      browserCapabilities,
      deviceSupport,
      fingerprints
    };
  }

  // Enviar datos de auditoría al backend
  private static async saveAuditToDatabase(logEntry: SignatureAuditLogEntry): Promise<boolean> {
    function formatDateTimeForBackend(dateString: string | undefined): string | undefined {
      if (!dateString) return undefined;
      // Convertir ISO string a formato yyyy-MM-dd'T'HH:mm:ss (sin milisegundos ni Z)
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }
    
    try {
      // Transformar los datos del frontend al formato que espera el backend
      const backendData = {
        contractId: logEntry.contractId,
        signatureType: logEntry.signatureType,
        eventType: logEntry.eventType,
        timestamp: formatDateTimeForBackend(logEntry.auditData.timestamp),
        ipAddress: logEntry.auditData.ipAddress,
        userAgent: logEntry.auditData.userAgent,
        platform: logEntry.auditData.deviceInfo.platform,
        browser: logEntry.auditData.deviceInfo.browser,
        browserVersion: logEntry.auditData.deviceInfo.browserVersion,
        screenResolution: logEntry.auditData.deviceInfo.screenResolution,
        timezone: logEntry.auditData.deviceInfo.timezone,
        language: logEntry.auditData.deviceInfo.language,
        sessionId: logEntry.auditData.sessionInfo.sessionId,
        pageUrl: logEntry.auditData.sessionInfo.pageUrl,
        referrer: logEntry.auditData.sessionInfo.referrer,
        canvasWidth: logEntry.auditData.signatureData.canvasSize.width,
        canvasHeight: logEntry.auditData.signatureData.canvasSize.height,
        signatureHash: logEntry.auditData.signatureData.signatureHash,
        signatureLength: logEntry.auditData.signatureData.signatureLength,
        logTimestamp: formatDateTimeForBackend(logEntry.logTimestamp)
      };

      // Log de debug para verificar todos los campos
      console.log('🔍 Sending audit data to backend:', {
        contractId: backendData.contractId,
        signatureType: backendData.signatureType,
        eventType: backendData.eventType,
        timestamp: backendData.timestamp,
        ipAddress: backendData.ipAddress,
        userAgent: backendData.userAgent,
        platform: backendData.platform,
        browser: backendData.browser,
        browserVersion: backendData.browserVersion,
        screenResolution: backendData.screenResolution,
        timezone: backendData.timezone,
        language: backendData.language,
        sessionId: backendData.sessionId,
        pageUrl: backendData.pageUrl,
        referrer: backendData.referrer,
        canvasWidth: backendData.canvasWidth,
        canvasHeight: backendData.canvasHeight,
        signatureHash: backendData.signatureHash,
        signatureLength: backendData.signatureLength,
        logTimestamp: backendData.logTimestamp
      });

      const response = await fetch(getEndpoint('/api/contracts/signature-audit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from server:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Auditoría guardada en BD:', result);
      return true;
    } catch (error) {
      console.error('❌ Error al guardar auditoría en BD:', error);
      return false;
    }
  }

  // Obtener logs de auditoría desde el backend
  static async getAuditLogsFromDatabase(contractId?: string): Promise<SignatureAuditLogEntry[]> {
    try {
      const url = contractId 
        ? getEndpoint(`/api/contracts/signature-audit?contractId=${contractId}`)
        : getEndpoint('/api/contracts/signature-audit');
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const backendLogs = await response.json();
      
      // Transformar los datos del backend al formato del frontend
      return backendLogs.map((backendLog: any) => ({
        id: backendLog.id,
        contractId: backendLog.contractId,
        signatureType: backendLog.signatureType,
        eventType: backendLog.eventType,
        auditData: {
          timestamp: backendLog.timestamp,
          ipAddress: backendLog.ipAddress,
          userAgent: backendLog.userAgent,
          deviceInfo: {
            platform: backendLog.platform,
            browser: backendLog.browser,
            browserVersion: backendLog.browserVersion,
            screenResolution: backendLog.screenResolution,
            timezone: backendLog.timezone,
            language: backendLog.language
          },
          sessionInfo: {
            sessionId: backendLog.sessionId,
            pageUrl: backendLog.pageUrl,
            referrer: backendLog.referrer
          },
          signatureData: {
            canvasSize: {
              width: backendLog.canvasWidth,
              height: backendLog.canvasHeight
            },
            signatureHash: backendLog.signatureHash,
            signatureLength: backendLog.signatureLength
          }
        },
        logTimestamp: backendLog.logTimestamp
      }));
    } catch (error) {
      console.error('Error al obtener logs de auditoría:', error);
      return [];
    }
  }

  static async logSignatureEvent(
    auditData: SignatureAuditData, 
    eventType: 'created' | 'cleared' | 'modified',
    contractId?: string,
    signatureType?: 'client' | 'broker'
  ) {
    const logEntry: SignatureAuditLogEntry = {
      contractId,
      signatureType: signatureType || 'client',
      eventType,
      auditData,
      logTimestamp: new Date().toISOString()
    };

    // Guardar en localStorage para persistencia local
    const existingLogs = JSON.parse(localStorage.getItem('signatureAuditLogs') || '[]');
    existingLogs.push(logEntry);
    localStorage.setItem('signatureAuditLogs', JSON.stringify(existingLogs));

    // Enviar al backend para guardar en BD
    await this.saveAuditToDatabase(logEntry);

    console.log('Signature Audit Log:', logEntry);
    
    return logEntry;
  }

  static getAuditLogs(): unknown[] {
    return JSON.parse(localStorage.getItem('signatureAuditLogs') || '[]');
  }

  static clearAuditLogs(): void {
    localStorage.removeItem('signatureAuditLogs');
  }

  // Sincronizar logs locales con la base de datos
  static async syncLocalLogsWithDatabase(): Promise<void> {
    try {
      const localLogs = this.getAuditLogs();
      
      for (const log of localLogs) {
        await this.saveAuditToDatabase(log as any);
      }
      
      console.log('Logs locales sincronizados con la base de datos');
    } catch (error) {
      console.error('Error al sincronizar logs:', error);
    }
  }
} 