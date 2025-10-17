package com.proptech.developments.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.proptech.commons.dto.CurrencyDTO;
import com.proptech.developments.enums.ReservationStatus;

public class DevelopmentReservationDTO {
    
    private Long id;
    private Long developmentId;
    private Long unitId;
    private String reservationNumber;
    private String clientName;
    private String clientEmail;
    private String clientPhone;
    private String clientDocument;
    private ReservationStatus status;
    private BigDecimal reservationAmount;
    private BigDecimal totalPrice;
    private Long currencyId;
    private CurrencyDTO currency;
    private LocalDate reservationDate;
    private LocalDate expirationDate;
    private LocalDate confirmationDate;
    private LocalDate cancellationDate;
    private String cancellationReason;
    private String notes;
    private String agentName;
    private String agentId;
    private String paymentMethod;
    private String paymentReference;
    private Boolean active;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;

    // Constructors
    public DevelopmentReservationDTO() {}

    public DevelopmentReservationDTO(Long id, Long developmentId, Long unitId, String reservationNumber, String clientName, String clientEmail, ReservationStatus status) {
        this.id = id;
        this.developmentId = developmentId;
        this.unitId = unitId;
        this.reservationNumber = reservationNumber;
        this.clientName = clientName;
        this.clientEmail = clientEmail;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDevelopmentId() { return developmentId; }
    public void setDevelopmentId(Long developmentId) { this.developmentId = developmentId; }

    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }

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

    public Long getCurrencyId() { return currencyId; }
    public void setCurrencyId(Long currencyId) { this.currencyId = currencyId; }

    public CurrencyDTO getCurrency() { return currency; }
    public void setCurrency(CurrencyDTO currency) { this.currency = currency; }

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