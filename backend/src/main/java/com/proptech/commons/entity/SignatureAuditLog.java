package com.proptech.commons.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "signature_audit_logs", schema = "proptech")
public class SignatureAuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "contract_id")
    private String contractId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "signature_type")
    private SignatureType signatureType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "event_type")
    private EventType eventType;
    
    @Column(name = "timestamp")
    private LocalDateTime timestamp;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
    
    @Column(name = "platform")
    private String platform;
    
    @Column(name = "browser")
    private String browser;
    
    @Column(name = "browser_version")
    private String browserVersion;
    
    @Column(name = "screen_resolution")
    private String screenResolution;
    
    @Column(name = "timezone")
    private String timezone;
    
    @Column(name = "language")
    private String language;
    
    @Column(name = "session_id")
    private String sessionId;
    
    @Column(name = "page_url", columnDefinition = "TEXT")
    private String pageUrl;
    
    @Column(name = "referrer", columnDefinition = "TEXT")
    private String referrer;
    
    @Column(name = "canvas_width")
    private Integer canvasWidth;
    
    @Column(name = "canvas_height")
    private Integer canvasHeight;
    
    @Column(name = "signature_hash")
    private String signatureHash;
    
    @Column(name = "signature_length")
    private Integer signatureLength;
    
    @Column(name = "log_timestamp")
    private LocalDateTime logTimestamp;
    
    // Campos adicionales específicos de la firma digital
    @Column(name = "signature_stroke_count")
    private Integer signatureStrokeCount; // Número de trazos en la firma
    
    @Column(name = "signature_duration_ms")
    private Long signatureDurationMs; // Duración total de la firma en milisegundos
    
    @Column(name = "signature_pressure_data")
    private String signaturePressureData; // Datos de presión (JSON array)
    
    @Column(name = "signature_velocity_data")
    private String signatureVelocityData; // Datos de velocidad (JSON array)
    
    @Column(name = "signature_pen_type")
    private String signaturePenType; // Tipo de lápiz usado (mouse, touch, stylus)
    
    @Column(name = "signature_device_type")
    private String signatureDeviceType; // Tipo de dispositivo (desktop, mobile, tablet)
    
    @Column(name = "signature_geolocation")
    private String signatureGeolocation; // Coordenadas GPS (lat,lng)
    
    @Column(name = "signature_network_type")
    private String signatureNetworkType; // Tipo de red (wifi, 4g, ethernet)
    
    @Column(name = "signature_connection_speed")
    private String signatureConnectionSpeed; // Velocidad de conexión
    
    @Column(name = "signature_battery_level")
    private Integer signatureBatteryLevel; // Nivel de batería del dispositivo
    
    @Column(name = "signature_device_memory")
    private String signatureDeviceMemory; // Memoria disponible del dispositivo
    
    @Column(name = "signature_cpu_cores")
    private Integer signatureCpuCores; // Número de núcleos CPU
    
    @Column(name = "signature_os_version")
    private String signatureOsVersion; // Versión exacta del sistema operativo
    
    @Column(name = "signature_browser_plugins")
    private String signatureBrowserPlugins; // Plugins del navegador (JSON array)
    
    @Column(name = "signature_cookies_enabled")
    private Boolean signatureCookiesEnabled; // Si las cookies están habilitadas
    
    @Column(name = "signature_do_not_track")
    private Boolean signatureDoNotTrack; // Si DNT está habilitado
    
    @Column(name = "signature_ad_blocker")
    private Boolean signatureAdBlocker; // Si hay bloqueador de anuncios
    
    @Column(name = "signature_vpn_detected")
    private Boolean signatureVpnDetected; // Si se detecta VPN
    
    @Column(name = "signature_proxy_detected")
    private Boolean signatureProxyDetected; // Si se detecta proxy
    
    @Column(name = "signature_tor_detected")
    private Boolean signatureTorDetected; // Si se detecta Tor
    
    @Column(name = "signature_fingerprint_hash")
    private String signatureFingerprintHash; // Hash del fingerprint del navegador
    
    @Column(name = "signature_canvas_fingerprint")
    private String signatureCanvasFingerprint; // Fingerprint del canvas
    
    @Column(name = "signature_webgl_fingerprint")
    private String signatureWebglFingerprint; // Fingerprint de WebGL
    
    @Column(name = "signature_audio_fingerprint")
    private String signatureAudioFingerprint; // Fingerprint de audio
    
    @Column(name = "signature_font_fingerprint")
    private String signatureFontFingerprint; // Fingerprint de fuentes
    
    @Column(name = "signature_screen_fingerprint")
    private String signatureScreenFingerprint; // Fingerprint de pantalla
    
    @Column(name = "signature_hardware_concurrency")
    private Integer signatureHardwareConcurrency; // Número de núcleos lógicos
    
    @Column(name = "signature_device_pixel_ratio")
    private Double signatureDevicePixelRatio; // Ratio de píxeles del dispositivo
    
    @Column(name = "signature_color_depth")
    private Integer signatureColorDepth; // Profundidad de color
    
    @Column(name = "signature_touch_support")
    private Boolean signatureTouchSupport; // Si soporta touch
    
    @Column(name = "signature_max_touch_points")
    private Integer signatureMaxTouchPoints; // Máximo número de puntos táctiles
    
    @Column(name = "signature_pointer_support")
    private Boolean signaturePointerSupport; // Si soporta pointer events
    
    @Column(name = "signature_web_worker_support")
    private Boolean signatureWebWorkerSupport; // Si soporta web workers
    
    @Column(name = "signature_service_worker_support")
    private Boolean signatureServiceWorkerSupport; // Si soporta service workers
    
    @Column(name = "signature_web_assembly_support")
    private Boolean signatureWebAssemblySupport; // Si soporta WebAssembly
    
    @Column(name = "signature_webgl_support")
    private Boolean signatureWebglSupport; // Si soporta WebGL
    
    @Column(name = "signature_webgl2_support")
    private Boolean signatureWebgl2Support; // Si soporta WebGL2
    
    @Column(name = "signature_web_rtc_support")
    private Boolean signatureWebRtcSupport; // Si soporta WebRTC
    
    @Column(name = "signature_geolocation_support")
    private Boolean signatureGeolocationSupport; // Si soporta geolocalización
    
    @Column(name = "signature_notification_support")
    private Boolean signatureNotificationSupport; // Si soporta notificaciones
    
    @Column(name = "signature_push_support")
    private Boolean signaturePushSupport; // Si soporta push notifications
    
    @Column(name = "signature_created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Enums
    public enum SignatureType {
        CLIENT, BROKER
    }
    
    public enum EventType {
        CREATED, CLEARED, MODIFIED
    }
    
    // Constructors
    public SignatureAuditLog() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getContractId() {
        return contractId;
    }
    
    public void setContractId(String contractId) {
        this.contractId = contractId;
    }
    
    public SignatureType getSignatureType() {
        return signatureType;
    }
    
    public void setSignatureType(SignatureType signatureType) {
        this.signatureType = signatureType;
    }
    
    public EventType getEventType() {
        return eventType;
    }
    
    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
    
    public String getPlatform() {
        return platform;
    }
    
    public void setPlatform(String platform) {
        this.platform = platform;
    }
    
    public String getBrowser() {
        return browser;
    }
    
    public void setBrowser(String browser) {
        this.browser = browser;
    }
    
    public String getBrowserVersion() {
        return browserVersion;
    }
    
    public void setBrowserVersion(String browserVersion) {
        this.browserVersion = browserVersion;
    }
    
    public String getScreenResolution() {
        return screenResolution;
    }
    
    public void setScreenResolution(String screenResolution) {
        this.screenResolution = screenResolution;
    }
    
    public String getTimezone() {
        return timezone;
    }
    
    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public String getPageUrl() {
        return pageUrl;
    }
    
    public void setPageUrl(String pageUrl) {
        this.pageUrl = pageUrl;
    }
    
    public String getReferrer() {
        return referrer;
    }
    
    public void setReferrer(String referrer) {
        this.referrer = referrer;
    }
    
    public Integer getCanvasWidth() {
        return canvasWidth;
    }
    
    public void setCanvasWidth(Integer canvasWidth) {
        this.canvasWidth = canvasWidth;
    }
    
    public Integer getCanvasHeight() {
        return canvasHeight;
    }
    
    public void setCanvasHeight(Integer canvasHeight) {
        this.canvasHeight = canvasHeight;
    }
    
    public String getSignatureHash() {
        return signatureHash;
    }
    
    public void setSignatureHash(String signatureHash) {
        this.signatureHash = signatureHash;
    }
    
    public Integer getSignatureLength() {
        return signatureLength;
    }
    
    public void setSignatureLength(Integer signatureLength) {
        this.signatureLength = signatureLength;
    }
    
    public LocalDateTime getLogTimestamp() {
        return logTimestamp;
    }
    
    public void setLogTimestamp(LocalDateTime logTimestamp) {
        this.logTimestamp = logTimestamp;
    }
    
    public Integer getSignatureStrokeCount() {
        return signatureStrokeCount;
    }
    
    public void setSignatureStrokeCount(Integer signatureStrokeCount) {
        this.signatureStrokeCount = signatureStrokeCount;
    }
    
    public Long getSignatureDurationMs() {
        return signatureDurationMs;
    }
    
    public void setSignatureDurationMs(Long signatureDurationMs) {
        this.signatureDurationMs = signatureDurationMs;
    }
    
    public String getSignaturePressureData() {
        return signaturePressureData;
    }
    
    public void setSignaturePressureData(String signaturePressureData) {
        this.signaturePressureData = signaturePressureData;
    }
    
    public String getSignatureVelocityData() {
        return signatureVelocityData;
    }
    
    public void setSignatureVelocityData(String signatureVelocityData) {
        this.signatureVelocityData = signatureVelocityData;
    }
    
    public String getSignaturePenType() {
        return signaturePenType;
    }
    
    public void setSignaturePenType(String signaturePenType) {
        this.signaturePenType = signaturePenType;
    }
    
    public String getSignatureDeviceType() {
        return signatureDeviceType;
    }
    
    public void setSignatureDeviceType(String signatureDeviceType) {
        this.signatureDeviceType = signatureDeviceType;
    }
    
    public String getSignatureGeolocation() {
        return signatureGeolocation;
    }
    
    public void setSignatureGeolocation(String signatureGeolocation) {
        this.signatureGeolocation = signatureGeolocation;
    }
    
    public String getSignatureNetworkType() {
        return signatureNetworkType;
    }
    
    public void setSignatureNetworkType(String signatureNetworkType) {
        this.signatureNetworkType = signatureNetworkType;
    }
    
    public String getSignatureConnectionSpeed() {
        return signatureConnectionSpeed;
    }
    
    public void setSignatureConnectionSpeed(String signatureConnectionSpeed) {
        this.signatureConnectionSpeed = signatureConnectionSpeed;
    }
    
    public Integer getSignatureBatteryLevel() {
        return signatureBatteryLevel;
    }
    
    public void setSignatureBatteryLevel(Integer signatureBatteryLevel) {
        this.signatureBatteryLevel = signatureBatteryLevel;
    }
    
    public String getSignatureDeviceMemory() {
        return signatureDeviceMemory;
    }
    
    public void setSignatureDeviceMemory(String signatureDeviceMemory) {
        this.signatureDeviceMemory = signatureDeviceMemory;
    }
    
    public Integer getSignatureCpuCores() {
        return signatureCpuCores;
    }
    
    public void setSignatureCpuCores(Integer signatureCpuCores) {
        this.signatureCpuCores = signatureCpuCores;
    }
    
    public String getSignatureOsVersion() {
        return signatureOsVersion;
    }
    
    public void setSignatureOsVersion(String signatureOsVersion) {
        this.signatureOsVersion = signatureOsVersion;
    }
    
    public String getSignatureBrowserPlugins() {
        return signatureBrowserPlugins;
    }
    
    public void setSignatureBrowserPlugins(String signatureBrowserPlugins) {
        this.signatureBrowserPlugins = signatureBrowserPlugins;
    }
    
    public Boolean getSignatureCookiesEnabled() {
        return signatureCookiesEnabled;
    }
    
    public void setSignatureCookiesEnabled(Boolean signatureCookiesEnabled) {
        this.signatureCookiesEnabled = signatureCookiesEnabled;
    }
    
    public Boolean getSignatureDoNotTrack() {
        return signatureDoNotTrack;
    }
    
    public void setSignatureDoNotTrack(Boolean signatureDoNotTrack) {
        this.signatureDoNotTrack = signatureDoNotTrack;
    }
    
    public Boolean getSignatureAdBlocker() {
        return signatureAdBlocker;
    }
    
    public void setSignatureAdBlocker(Boolean signatureAdBlocker) {
        this.signatureAdBlocker = signatureAdBlocker;
    }
    
    public Boolean getSignatureVpnDetected() {
        return signatureVpnDetected;
    }
    
    public void setSignatureVpnDetected(Boolean signatureVpnDetected) {
        this.signatureVpnDetected = signatureVpnDetected;
    }
    
    public Boolean getSignatureProxyDetected() {
        return signatureProxyDetected;
    }
    
    public void setSignatureProxyDetected(Boolean signatureProxyDetected) {
        this.signatureProxyDetected = signatureProxyDetected;
    }
    
    public Boolean getSignatureTorDetected() {
        return signatureTorDetected;
    }
    
    public void setSignatureTorDetected(Boolean signatureTorDetected) {
        this.signatureTorDetected = signatureTorDetected;
    }
    
    public String getSignatureFingerprintHash() {
        return signatureFingerprintHash;
    }
    
    public void setSignatureFingerprintHash(String signatureFingerprintHash) {
        this.signatureFingerprintHash = signatureFingerprintHash;
    }
    
    public String getSignatureCanvasFingerprint() {
        return signatureCanvasFingerprint;
    }
    
    public void setSignatureCanvasFingerprint(String signatureCanvasFingerprint) {
        this.signatureCanvasFingerprint = signatureCanvasFingerprint;
    }
    
    public String getSignatureWebglFingerprint() {
        return signatureWebglFingerprint;
    }
    
    public void setSignatureWebglFingerprint(String signatureWebglFingerprint) {
        this.signatureWebglFingerprint = signatureWebglFingerprint;
    }
    
    public String getSignatureAudioFingerprint() {
        return signatureAudioFingerprint;
    }
    
    public void setSignatureAudioFingerprint(String signatureAudioFingerprint) {
        this.signatureAudioFingerprint = signatureAudioFingerprint;
    }
    
    public String getSignatureFontFingerprint() {
        return signatureFontFingerprint;
    }
    
    public void setSignatureFontFingerprint(String signatureFontFingerprint) {
        this.signatureFontFingerprint = signatureFontFingerprint;
    }
    
    public String getSignatureScreenFingerprint() {
        return signatureScreenFingerprint;
    }
    
    public void setSignatureScreenFingerprint(String signatureScreenFingerprint) {
        this.signatureScreenFingerprint = signatureScreenFingerprint;
    }
    
    public Integer getSignatureHardwareConcurrency() {
        return signatureHardwareConcurrency;
    }
    
    public void setSignatureHardwareConcurrency(Integer signatureHardwareConcurrency) {
        this.signatureHardwareConcurrency = signatureHardwareConcurrency;
    }
    
    public Double getSignatureDevicePixelRatio() {
        return signatureDevicePixelRatio;
    }
    
    public void setSignatureDevicePixelRatio(Double signatureDevicePixelRatio) {
        this.signatureDevicePixelRatio = signatureDevicePixelRatio;
    }
    
    public Integer getSignatureColorDepth() {
        return signatureColorDepth;
    }
    
    public void setSignatureColorDepth(Integer signatureColorDepth) {
        this.signatureColorDepth = signatureColorDepth;
    }
    
    public Boolean getSignatureTouchSupport() {
        return signatureTouchSupport;
    }
    
    public void setSignatureTouchSupport(Boolean signatureTouchSupport) {
        this.signatureTouchSupport = signatureTouchSupport;
    }
    
    public Integer getSignatureMaxTouchPoints() {
        return signatureMaxTouchPoints;
    }
    
    public void setSignatureMaxTouchPoints(Integer signatureMaxTouchPoints) {
        this.signatureMaxTouchPoints = signatureMaxTouchPoints;
    }
    
    public Boolean getSignaturePointerSupport() {
        return signaturePointerSupport;
    }
    
    public void setSignaturePointerSupport(Boolean signaturePointerSupport) {
        this.signaturePointerSupport = signaturePointerSupport;
    }
    
    public Boolean getSignatureWebWorkerSupport() {
        return signatureWebWorkerSupport;
    }
    
    public void setSignatureWebWorkerSupport(Boolean signatureWebWorkerSupport) {
        this.signatureWebWorkerSupport = signatureWebWorkerSupport;
    }
    
    public Boolean getSignatureServiceWorkerSupport() {
        return signatureServiceWorkerSupport;
    }
    
    public void setSignatureServiceWorkerSupport(Boolean signatureServiceWorkerSupport) {
        this.signatureServiceWorkerSupport = signatureServiceWorkerSupport;
    }
    
    public Boolean getSignatureWebAssemblySupport() {
        return signatureWebAssemblySupport;
    }
    
    public void setSignatureWebAssemblySupport(Boolean signatureWebAssemblySupport) {
        this.signatureWebAssemblySupport = signatureWebAssemblySupport;
    }
    
    public Boolean getSignatureWebglSupport() {
        return signatureWebglSupport;
    }
    
    public void setSignatureWebglSupport(Boolean signatureWebglSupport) {
        this.signatureWebglSupport = signatureWebglSupport;
    }
    
    public Boolean getSignatureWebgl2Support() {
        return signatureWebgl2Support;
    }
    
    public void setSignatureWebgl2Support(Boolean signatureWebgl2Support) {
        this.signatureWebgl2Support = signatureWebgl2Support;
    }
    
    public Boolean getSignatureWebRtcSupport() {
        return signatureWebRtcSupport;
    }
    
    public void setSignatureWebRtcSupport(Boolean signatureWebRtcSupport) {
        this.signatureWebRtcSupport = signatureWebRtcSupport;
    }
    
    public Boolean getSignatureGeolocationSupport() {
        return signatureGeolocationSupport;
    }
    
    public void setSignatureGeolocationSupport(Boolean signatureGeolocationSupport) {
        this.signatureGeolocationSupport = signatureGeolocationSupport;
    }
    
    public Boolean getSignatureNotificationSupport() {
        return signatureNotificationSupport;
    }
    
    public void setSignatureNotificationSupport(Boolean signatureNotificationSupport) {
        this.signatureNotificationSupport = signatureNotificationSupport;
    }
    
    public Boolean getSignaturePushSupport() {
        return signaturePushSupport;
    }
    
    public void setSignaturePushSupport(Boolean signaturePushSupport) {
        this.signaturePushSupport = signaturePushSupport;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 