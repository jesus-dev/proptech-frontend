package com.proptech.contracts.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contract_signatures", schema = "proptech")
public class ContractSignature extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "signer_id", nullable = false)
    private Long signerId;

    @Column(name = "signer_name", nullable = false)
    private String signerName;

    @Column(name = "signer_email")
    private String signerEmail;

    @Column(name = "signer_role", nullable = false)
    @Enumerated(EnumType.STRING)
    private SignerRole signerRole;

    @Column(name = "signature_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private SignatureType signatureType;

    // Firma digital (base64 PNG)
    @Column(name = "signature_data", columnDefinition = "TEXT")
    private String signatureData;

    // Datos de auditoría
    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "device_info")
    private String deviceInfo;

    @Column(name = "location")
    private String location;

    @Column(name = "signed_at", nullable = false)
    private LocalDateTime signedAt;

    @Column(name = "signature_hash")
    private String signatureHash;

    @Column(name = "verification_code")
    private String verificationCode;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private SignatureStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum SignerRole {
        BUYER("Comprador"),
        SELLER("Vendedor"),
        AGENT("Agente"),
        WITNESS("Testigo"),
        NOTARY("Notario");

        private final String displayName;

        SignerRole(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum SignatureType {
        DIGITAL("Firma Digital"),
        ELECTRONIC("Firma Electrónica"),
        MANUAL("Firma Manual"),
        BIOMETRIC("Firma Biométrica");

        private final String displayName;

        SignatureType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum SignatureStatus {
        PENDING("Pendiente"),
        SIGNED("Firmado"),
        VERIFIED("Verificado"),
        REJECTED("Rechazado"),
        EXPIRED("Expirado");

        private final String displayName;

        SignatureStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Contract getContract() { return contract; }
    public void setContract(Contract contract) { this.contract = contract; }

    public Long getSignerId() { return signerId; }
    public void setSignerId(Long signerId) { this.signerId = signerId; }

    public String getSignerName() { return signerName; }
    public void setSignerName(String signerName) { this.signerName = signerName; }

    public String getSignerEmail() { return signerEmail; }
    public void setSignerEmail(String signerEmail) { this.signerEmail = signerEmail; }

    public SignerRole getSignerRole() { return signerRole; }
    public void setSignerRole(SignerRole signerRole) { this.signerRole = signerRole; }

    public SignatureType getSignatureType() { return signatureType; }
    public void setSignatureType(SignatureType signatureType) { this.signatureType = signatureType; }

    public String getSignatureData() { return signatureData; }
    public void setSignatureData(String signatureData) { this.signatureData = signatureData; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDateTime getSignedAt() { return signedAt; }
    public void setSignedAt(LocalDateTime signedAt) { this.signedAt = signedAt; }

    public String getSignatureHash() { return signatureHash; }
    public void setSignatureHash(String signatureHash) { this.signatureHash = signatureHash; }

    public String getVerificationCode() { return verificationCode; }
    public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }

    public SignatureStatus getStatus() { return status; }
    public void setStatus(SignatureStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (signedAt == null) {
            signedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = SignatureStatus.PENDING;
        }
    }
}
