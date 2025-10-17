package com.proptech.developments.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.proptech.commons.entity.Currency;
import com.proptech.developments.enums.ReservationStatus;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "development_reservations", schema = "proptech")
public class DevelopmentReservation extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "development_id", nullable = false)
    private Development development;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private DevelopmentUnit unit;
    
    @Column(nullable = false)
    private String reservationNumber; // Número de reserva
    
    @Column(nullable = false)
    private String clientName; // Nombre del cliente
    
    @Column(nullable = false)
    private String clientEmail; // Email del cliente
    
    @Column
    private String clientPhone; // Teléfono del cliente
    
    @Column
    private String clientDocument; // Documento del cliente
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status; // PENDING, CONFIRMED, CANCELLED, EXPIRED, CONVERTED
    
    @Column(precision = 15, scale = 2)
    private BigDecimal reservationAmount; // Monto de la reserva
    
    @Column(precision = 15, scale = 2)
    private BigDecimal totalPrice; // Precio total de la unidad
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "currency_id")
    private Currency currency;
    
    @Column(nullable = false)
    private LocalDate reservationDate; // Fecha de reserva
    
    @Column(nullable = false)
    private LocalDate expirationDate; // Fecha de vencimiento de la reserva
    
    @Column
    private LocalDate confirmationDate; // Fecha de confirmación
    
    @Column
    private LocalDate cancellationDate; // Fecha de cancelación
    
    @Column
    private String cancellationReason; // Motivo de cancelación
    
    @Column
    private String notes; // Notas adicionales
    
    @Column
    private String agentName; // Nombre del agente
    
    @Column
    private String agentId; // ID del agente
    
    @Column
    private String paymentMethod; // Método de pago de la reserva
    
    @Column
    private String paymentReference; // Referencia de pago
    
    @Column
    private Boolean active;
    
    @Column
    private LocalDateTime createdAt;
    
    @Column
    private String createdBy;
    
    @Column
    private LocalDateTime updatedAt;
    
    @Column
    private String updatedBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (active == null) {
            active = true;
        }
        if (status == null) {
            status = ReservationStatus.PENDING;
        }
        if (reservationDate == null) {
            reservationDate = LocalDate.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Development getDevelopment() { return development; }
    public void setDevelopment(Development development) { this.development = development; }
    
    public DevelopmentUnit getUnit() { return unit; }
    public void setUnit(DevelopmentUnit unit) { this.unit = unit; }
    
    public String getReservationNumber() { return reservationNumber; }
    public void setReservationNumber(String reservationNumber) { this.reservationNumber = reservationNumber; }
    
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    
    public String getClientEmail() { return clientEmail; }
    public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }
    
    public String getClientPhone() { return clientPhone; }
    public void setClientPhone(String clientPhone) { this.clientPhone = clientPhone; }
    
    public String getClientDocument() { return clientDocument; }
    public void setClientDocument(String clientDocument) { this.clientDocument = clientDocument; }
    
    public ReservationStatus getStatus() { return status; }
    public void setStatus(ReservationStatus status) { this.status = status; }
    
    public BigDecimal getReservationAmount() { return reservationAmount; }
    public void setReservationAmount(BigDecimal reservationAmount) { this.reservationAmount = reservationAmount; }
    
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    
    public Currency getCurrency() { return currency; }
    public void setCurrency(Currency currency) { this.currency = currency; }
    
    public LocalDate getReservationDate() { return reservationDate; }
    public void setReservationDate(LocalDate reservationDate) { this.reservationDate = reservationDate; }
    
    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }
    
    public LocalDate getConfirmationDate() { return confirmationDate; }
    public void setConfirmationDate(LocalDate confirmationDate) { this.confirmationDate = confirmationDate; }
    
    public LocalDate getCancellationDate() { return cancellationDate; }
    public void setCancellationDate(LocalDate cancellationDate) { this.cancellationDate = cancellationDate; }
    
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }
    
    public String getAgentId() { return agentId; }
    public void setAgentId(String agentId) { this.agentId = agentId; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
    
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
} 