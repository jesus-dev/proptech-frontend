package com.proptech.developments.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.proptech.commons.entity.Currency;
import com.proptech.commons.service.CurrencyService;
import com.proptech.developments.dto.DevelopmentQuotaDTO;
import com.proptech.developments.entity.Development;
import com.proptech.developments.entity.DevelopmentQuota;
import com.proptech.developments.entity.DevelopmentUnit;
import com.proptech.developments.enums.QuotaStatus;
import com.proptech.developments.enums.QuotaType;
import com.proptech.developments.repository.DevelopmentQuotaRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DevelopmentQuotaService {

    @Inject
    DevelopmentQuotaRepository developmentQuotaRepository;

    @Inject
    CurrencyService currencyService;

    public List<DevelopmentQuotaDTO> getAllQuotas() {
        return developmentQuotaRepository.listAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentQuotaDTO> getQuotasByDevelopmentId(Long developmentId) {
        return developmentQuotaRepository.findByDevelopmentId(developmentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public DevelopmentQuotaDTO getQuotaById(Long id) {
        DevelopmentQuota quota = developmentQuotaRepository.findById(id);
        if (quota == null) {
            throw new RuntimeException("Cuota no encontrada con ID: " + id);
        }
        return toDTO(quota);
    }

    @Transactional
    public DevelopmentQuotaDTO createQuota(DevelopmentQuotaDTO dto) {
        DevelopmentQuota quota = toEntity(dto);
        quota.setCreatedAt(LocalDateTime.now());
        quota.setActive(true);
        developmentQuotaRepository.persist(quota);
        return toDTO(quota);
    }

    @Transactional
    public DevelopmentQuotaDTO updateQuota(Long id, DevelopmentQuotaDTO dto) {
        DevelopmentQuota quota = developmentQuotaRepository.findById(id);
        if (quota == null) {
            throw new RuntimeException("Cuota no encontrada con ID: " + id);
        }

        // Update fields
        quota.setQuotaNumber(dto.getQuotaNumber());
        quota.setQuotaName(dto.getQuotaName());
        quota.setType(dto.getType());
        quota.setStatus(dto.getStatus());
        quota.setAmount(dto.getAmount());
        quota.setPaidAmount(dto.getPaidAmount());
        quota.setDiscountAmount(dto.getDiscountAmount());
        
        // Set currency if currencyId is provided
        if (dto.getCurrencyId() != null) {
            com.proptech.commons.dto.CurrencyDTO currencyDTO = currencyService.getById(dto.getCurrencyId());
            if (currencyDTO != null) {
                Currency currency = new Currency();
                currency.setId(currencyDTO.getId());
                currency.setCode(currencyDTO.getCode());
                currency.setName(currencyDTO.getName());
                currency.setSymbol(currencyDTO.getSymbol());
                quota.setCurrency(currency);
            }
        }
        
        quota.setDueDate(dto.getDueDate());
        quota.setPaidDate(dto.getPaidDate());
        quota.setInstallmentNumber(dto.getInstallmentNumber());
        quota.setTotalInstallments(dto.getTotalInstallments());
        quota.setDescription(dto.getDescription());
        quota.setNotes(dto.getNotes());
        quota.setPaymentMethod(dto.getPaymentMethod());
        quota.setPaymentReference(dto.getPaymentReference());
        quota.setProcessedBy(dto.getProcessedBy());
        quota.setProcessedAt(dto.getProcessedAt());
        quota.setActive(dto.getActive());
        quota.setUpdatedAt(LocalDateTime.now());

        return toDTO(quota);
    }

    @Transactional
    public void deleteQuota(Long id) {
        DevelopmentQuota quota = developmentQuotaRepository.findById(id);
        if (quota == null) {
            throw new RuntimeException("Cuota no encontrada con ID: " + id);
        }
        developmentQuotaRepository.delete(quota);
    }

    public List<DevelopmentQuotaDTO> getQuotasByStatus(QuotaStatus status) {
        return developmentQuotaRepository.findByStatus(status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentQuotaDTO> getQuotasByType(QuotaType type) {
        return developmentQuotaRepository.findByType(type).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentQuotaDTO> getQuotasByUnitId(Long unitId) {
        return developmentQuotaRepository.findByUnitId(unitId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentQuotaDTO> getOverdueQuotas() {
        return developmentQuotaRepository.findOverdueQuotas().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentQuotaDTO> getDueSoonQuotas(int daysAhead) {
        return developmentQuotaRepository.findDueSoonQuotas(daysAhead).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentQuotaDTO> getPendingQuotas() {
        return developmentQuotaRepository.findPendingQuotas().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DevelopmentQuotaDTO recordPayment(Long id, Map<String, Object> paymentData) {
        DevelopmentQuota quota = developmentQuotaRepository.findById(id);
        if (quota == null) {
            throw new RuntimeException("Cuota no encontrada con ID: " + id);
        }

        BigDecimal paidAmount = new BigDecimal(paymentData.get("paidAmount").toString());
        String paymentMethod = (String) paymentData.get("paymentMethod");
        String paymentReference = (String) paymentData.get("paymentReference");
        String notes = (String) paymentData.get("notes");

        quota.setPaidAmount(paidAmount);
        quota.setPaymentMethod(paymentMethod);
        quota.setPaymentReference(paymentReference);
        quota.setNotes(notes);
        quota.setPaidDate(LocalDate.now());
        quota.setProcessedAt(LocalDateTime.now());
        quota.setStatus(QuotaStatus.PAID);
        quota.setUpdatedAt(LocalDateTime.now());

        return toDTO(quota);
    }

    public Map<String, Object> getStats() {
        long total = developmentQuotaRepository.count();
        long pending = developmentQuotaRepository.countByStatus(QuotaStatus.PENDING);
        long paid = developmentQuotaRepository.countByStatus(QuotaStatus.PAID);
        long overdue = developmentQuotaRepository.countOverdueByDevelopmentId(null);

        return Map.of(
            "total", total,
            "pending", pending,
            "paid", paid,
            "overdue", overdue,
            "totalAmount", 0.0, 
            "paidAmount", 0.0,  
            "pendingAmount", 0.0
        );
    }

    private DevelopmentQuotaDTO toDTO(DevelopmentQuota quota) {
        DevelopmentQuotaDTO dto = new DevelopmentQuotaDTO();
        dto.setId(quota.getId());
        
        // Set developmentId from the relationship
        if (quota.getDevelopment() != null) {
            dto.setDevelopmentId(quota.getDevelopment().getId());
        }
        
        // Set unitId from the unit relationship
        if (quota.getUnit() != null) {
            dto.setUnitId(quota.getUnit().getId());
        }
        
        dto.setQuotaNumber(quota.getQuotaNumber());
        dto.setQuotaName(quota.getQuotaName());
        dto.setType(quota.getType());
        dto.setStatus(quota.getStatus());
        dto.setAmount(quota.getAmount());
        dto.setPaidAmount(quota.getPaidAmount());
        dto.setDiscountAmount(quota.getDiscountAmount());
        
        // Set currency info from the relationship
        if (quota.getCurrency() != null) {
            dto.setCurrencyId(quota.getCurrency().getId());
            dto.setCurrency(new com.proptech.commons.dto.CurrencyDTO());
            dto.getCurrency().setId(quota.getCurrency().getId());
            dto.getCurrency().setCode(quota.getCurrency().getCode());
            dto.getCurrency().setName(quota.getCurrency().getName());
            dto.getCurrency().setSymbol(quota.getCurrency().getSymbol());
        }
        
        dto.setDueDate(quota.getDueDate());
        dto.setPaidDate(quota.getPaidDate());
        dto.setInstallmentNumber(quota.getInstallmentNumber());
        dto.setTotalInstallments(quota.getTotalInstallments());
        dto.setDescription(quota.getDescription());
        dto.setNotes(quota.getNotes());
        dto.setPaymentMethod(quota.getPaymentMethod());
        dto.setPaymentReference(quota.getPaymentReference());
        dto.setProcessedBy(quota.getProcessedBy());
        dto.setProcessedAt(quota.getProcessedAt());
        dto.setActive(quota.getActive());
        dto.setCreatedAt(quota.getCreatedAt());
        dto.setCreatedBy(quota.getCreatedBy());
        dto.setUpdatedAt(quota.getUpdatedAt());
        dto.setUpdatedBy(quota.getUpdatedBy());
        return dto;
    }

    private DevelopmentQuota toEntity(DevelopmentQuotaDTO dto) {
        DevelopmentQuota quota = new DevelopmentQuota();
        quota.setId(dto.getId());
        
        // Set development relationship if developmentId is provided
        if (dto.getDevelopmentId() != null) {
            Development development = new Development();
            development.setId(dto.getDevelopmentId());
            quota.setDevelopment(development);
        }
        
        // Set unit relationship if unitId is provided
        if (dto.getUnitId() != null) {
            DevelopmentUnit unit = new DevelopmentUnit();
            unit.setId(dto.getUnitId());
            quota.setUnit(unit);
        }
        
        quota.setQuotaNumber(dto.getQuotaNumber());
        quota.setQuotaName(dto.getQuotaName());
        quota.setType(dto.getType());
        quota.setStatus(dto.getStatus());
        quota.setAmount(dto.getAmount());
        quota.setPaidAmount(dto.getPaidAmount());
        quota.setDiscountAmount(dto.getDiscountAmount());
        
        // Set currency relationship if currencyId is provided
        if (dto.getCurrencyId() != null) {
            Currency currency = new Currency();
            currency.setId(dto.getCurrencyId());
            quota.setCurrency(currency);
        }
        
        quota.setDueDate(dto.getDueDate());
        quota.setPaidDate(dto.getPaidDate());
        quota.setInstallmentNumber(dto.getInstallmentNumber());
        quota.setTotalInstallments(dto.getTotalInstallments());
        quota.setDescription(dto.getDescription());
        quota.setNotes(dto.getNotes());
        quota.setPaymentMethod(dto.getPaymentMethod());
        quota.setPaymentReference(dto.getPaymentReference());
        quota.setProcessedBy(dto.getProcessedBy());
        quota.setProcessedAt(dto.getProcessedAt());
        quota.setActive(dto.getActive());
        quota.setCreatedAt(dto.getCreatedAt());
        quota.setCreatedBy(dto.getCreatedBy());
        quota.setUpdatedAt(dto.getUpdatedAt());
        quota.setUpdatedBy(dto.getUpdatedBy());
        return quota;
    }
} 