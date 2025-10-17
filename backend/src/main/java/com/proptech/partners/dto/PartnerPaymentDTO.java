package com.proptech.partners.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PartnerPaymentDTO {
    public Long id;
    public Long partnerId;
    public String partnerName;
    public String paymentNumber;
    public LocalDate paymentDate;
    public LocalDate dueDate;
    public Double amount;
    public String currency;
    public String paymentType;
    public String status;
    public String paymentMethod;
    public String referenceNumber;
    public String description;
    public String notes;
    public String processedBy;
    public LocalDateTime processedAt;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
} 