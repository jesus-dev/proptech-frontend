package com.proptech.partners.service;

import com.proptech.partners.entity.PartnerPayment;
import com.proptech.partners.dto.PartnerPaymentDTO;
import com.proptech.partners.repository.PartnerPaymentRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@ApplicationScoped
public class PartnerPaymentService {
    @Inject
    PartnerPaymentRepository partnerPaymentRepository;

    public List<PartnerPaymentDTO> listAll() {
        return partnerPaymentRepository.listAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<PartnerPaymentDTO> findByPartnerId(Long partnerId) {
        return partnerPaymentRepository.findByPartnerId(partnerId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public PartnerPaymentDTO findById(Long id) {
        PartnerPayment payment = partnerPaymentRepository.findById(id);
        return payment != null ? toDTO(payment) : null;
    }

    @Transactional
    public PartnerPaymentDTO create(PartnerPaymentDTO dto) {
        PartnerPayment payment = toEntity(dto);
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        partnerPaymentRepository.persist(payment);
        return toDTO(payment);
    }

    @Transactional
    public PartnerPaymentDTO update(Long id, PartnerPaymentDTO dto) {
        PartnerPayment payment = partnerPaymentRepository.findById(id);
        if (payment == null) return null;
        payment.setPartnerId(dto.partnerId);
        payment.setPartnerName(dto.partnerName);
        payment.setPaymentNumber(dto.paymentNumber);
        payment.setPaymentDate(dto.paymentDate);
        payment.setDueDate(dto.dueDate);
        payment.setAmount(dto.amount);
        payment.setCurrency(dto.currency);
        payment.setPaymentType(dto.paymentType);
        payment.setStatus(dto.status);
        payment.setPaymentMethod(dto.paymentMethod);
        payment.setReferenceNumber(dto.referenceNumber);
        payment.setDescription(dto.description);
        payment.setNotes(dto.notes);
        payment.setProcessedBy(dto.processedBy);
        payment.setProcessedAt(dto.processedAt);
        payment.setUpdatedAt(LocalDateTime.now());
        return toDTO(payment);
    }

    @Transactional
    public boolean delete(Long id) {
        PartnerPayment payment = partnerPaymentRepository.findById(id);
        if (payment == null) return false;
        partnerPaymentRepository.delete(payment);
        return true;
    }

    private PartnerPaymentDTO toDTO(PartnerPayment payment) {
        PartnerPaymentDTO dto = new PartnerPaymentDTO();
        dto.id = payment.getId();
        dto.partnerId = payment.getPartnerId();
        dto.partnerName = payment.getPartnerName();
        dto.paymentNumber = payment.getPaymentNumber();
        dto.paymentDate = payment.getPaymentDate();
        dto.dueDate = payment.getDueDate();
        dto.amount = payment.getAmount();
        dto.currency = payment.getCurrency();
        dto.paymentType = payment.getPaymentType();
        dto.status = payment.getStatus();
        dto.paymentMethod = payment.getPaymentMethod();
        dto.referenceNumber = payment.getReferenceNumber();
        dto.description = payment.getDescription();
        dto.notes = payment.getNotes();
        dto.processedBy = payment.getProcessedBy();
        dto.processedAt = payment.getProcessedAt();
        dto.createdAt = payment.getCreatedAt();
        dto.updatedAt = payment.getUpdatedAt();
        return dto;
    }

    private PartnerPayment toEntity(PartnerPaymentDTO dto) {
        PartnerPayment payment = new PartnerPayment();
        payment.setId(dto.id);
        payment.setPartnerId(dto.partnerId);
        payment.setPartnerName(dto.partnerName);
        payment.setPaymentNumber(dto.paymentNumber);
        payment.setPaymentDate(dto.paymentDate);
        payment.setDueDate(dto.dueDate);
        payment.setAmount(dto.amount);
        payment.setCurrency(dto.currency);
        payment.setPaymentType(dto.paymentType);
        payment.setStatus(dto.status);
        payment.setPaymentMethod(dto.paymentMethod);
        payment.setReferenceNumber(dto.referenceNumber);
        payment.setDescription(dto.description);
        payment.setNotes(dto.notes);
        payment.setProcessedBy(dto.processedBy);
        payment.setProcessedAt(dto.processedAt);
        payment.setCreatedAt(dto.createdAt);
        payment.setUpdatedAt(dto.updatedAt);
        return payment;
    }
} 