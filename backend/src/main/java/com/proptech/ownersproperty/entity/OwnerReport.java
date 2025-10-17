package com.proptech.ownersproperty.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "owner_reports")
public class OwnerReport extends PanacheEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    public Owner owner;
    
    @Column(nullable = false)
    public String period; // "Enero 2024", "Q1 2024", etc.
    
    @CreationTimestamp
    @Column(name = "generated_at", nullable = false, updatable = false)
    public LocalDateTime generatedAt;
    
    @Column(name = "properties_count")
    public Integer propertiesCount = 0;
    
    @Column(name = "total_views")
    public Integer totalViews = 0;
    
    @Column(name = "total_favorites")
    public Integer totalFavorites = 0;
    
    @Column(name = "total_comments")
    public Integer totalComments = 0;
    
    @Column(name = "total_shares")
    public Integer totalShares = 0;
    
    @Column(name = "total_value", precision = 15, scale = 2)
    public BigDecimal totalValue = BigDecimal.ZERO;
    
    @Column(columnDefinition = "JSON")
    public String recommendations; // Array de recomendaciones generales
    
    // Nuevo campo para almacenar métricas detalladas por propiedad
    @Column(columnDefinition = "JSON")
    public String propertyMetrics; // JSON con métricas detalladas por propiedad
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ReportStatus status = ReportStatus.PENDING;
    
    @Column(name = "sent_at")
    public LocalDateTime sentAt;
    
    @Column(name = "email_sent")
    public boolean emailSent = false;
    
    @Column(name = "pdf_generated")
    public boolean pdfGenerated = false;
    
    @Column(name = "pdf_url")
    public String pdfUrl;
    
    @Column(name = "email_subject")
    public String emailSubject;
    
    @Column(name = "email_body")
    public String emailBody;
    
    @Column(name = "created_by")
    public Long createdBy;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    public LocalDateTime updatedAt;
    
    // Constructores
    public OwnerReport() {}
    
    public OwnerReport(Owner owner, String period) {
        this.owner = owner;
        this.period = period;
    }
    
    // Métodos de negocio
    public boolean isSent() {
        return ReportStatus.SENT.equals(this.status);
    }
    
    public boolean isPending() {
        return ReportStatus.PENDING.equals(this.status);
    }
    
    public boolean isFailed() {
        return ReportStatus.FAILED.equals(this.status);
    }
    
    public void markAsSent() {
        this.status = ReportStatus.SENT;
        this.sentAt = LocalDateTime.now();
        this.emailSent = true;
    }
    
    public void markAsFailed() {
        this.status = ReportStatus.FAILED;
    }
    
    public void markPdfGenerated(String pdfUrl) {
        this.pdfGenerated = true;
        this.pdfUrl = pdfUrl;
    }
    
    public void setEmailContent(String subject, String body) {
        this.emailSubject = subject;
        this.emailBody = body;
    }
    
    public void updateMetrics(int propertiesCount, int totalViews, int totalFavorites, 
                            int totalComments, int totalShares, BigDecimal totalValue) {
        this.propertiesCount = propertiesCount;
        this.totalViews = totalViews;
        this.totalFavorites = totalFavorites;
        this.totalComments = totalComments;
        this.totalShares = totalShares;
        this.totalValue = totalValue;
    }
    
    // Enums
    public enum ReportStatus {
        PENDING("Pendiente"),
        SENT("Enviado"),
        FAILED("Fallido");
        
        private final String displayName;
        
        ReportStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
