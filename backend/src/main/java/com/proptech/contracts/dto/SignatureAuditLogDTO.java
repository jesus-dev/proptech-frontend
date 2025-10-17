package com.proptech.contracts.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class SignatureAuditLogDTO {
    
    private Long id;
    private String contractId;
    private String signatureType;
    private String eventType;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    
    private String ipAddress;
    private String userAgent;
    private String platform;
    private String browser;
    private String browserVersion;
    private String screenResolution;
    private String timezone;
    private String language;
    private String sessionId;
    private String pageUrl;
    private String referrer;
    private Integer canvasWidth;
    private Integer canvasHeight;
    private String signatureHash;
    private Integer signatureLength;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime logTimestamp;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    // Campos adicionales específicos de la firma digital
    private Integer signatureStrokeCount;
    private Long signatureDurationMs;
    private String signaturePressureData;
    private String signatureVelocityData;
    private String signaturePenType;
    private String signatureDeviceType;
    private String signatureGeolocation;
    private String signatureNetworkType;
    private String signatureConnectionSpeed;
    private Integer signatureBatteryLevel;
    private String signatureDeviceMemory;
    private Integer signatureCpuCores;
    private String signatureOsVersion;
    private String signatureBrowserPlugins;
    private Boolean signatureCookiesEnabled;
    private Boolean signatureDoNotTrack;
    private Boolean signatureAdBlocker;
    private Boolean signatureVpnDetected;
    private Boolean signatureProxyDetected;
    private Boolean signatureTorDetected;
    private String signatureFingerprintHash;
    private String signatureCanvasFingerprint;
    private String signatureWebglFingerprint;
    private String signatureAudioFingerprint;
    private String signatureFontFingerprint;
    private String signatureScreenFingerprint;
    private Integer signatureHardwareConcurrency;
    private Double signatureDevicePixelRatio;
    private Integer signatureColorDepth;
    private Boolean signatureTouchSupport;
    private Integer signatureMaxTouchPoints;
    private Boolean signaturePointerSupport;
    private Boolean signatureWebWorkerSupport;
    private Boolean signatureServiceWorkerSupport;
    private Boolean signatureWebAssemblySupport;
    private Boolean signatureWebglSupport;
    private Boolean signatureWebgl2Support;
    private Boolean signatureWebRtcSupport;
    private Boolean signatureGeolocationSupport;
    private Boolean signatureNotificationSupport;
    private Boolean signaturePushSupport;
    
    // Constructors
    public SignatureAuditLogDTO() {}
    
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
    
    public String getSignatureType() {
        return signatureType;
    }
    
    public void setSignatureType(String signatureType) {
        this.signatureType = signatureType;
    }
    
    public String getEventType() {
        return eventType;
    }
    
    public void setEventType(String eventType) {
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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
} 