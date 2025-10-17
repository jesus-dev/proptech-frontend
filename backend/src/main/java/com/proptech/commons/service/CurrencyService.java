package com.proptech.commons.service;

import com.proptech.commons.dto.CurrencyDTO;
import com.proptech.commons.entity.Currency;
import com.proptech.commons.repository.CurrencyRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class CurrencyService {

    @Inject
    CurrencyRepository currencyRepository;

    public List<CurrencyDTO> getAll() {
        return currencyRepository.listAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<CurrencyDTO> getActive() {
        return currencyRepository.find("isActive", true).list().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public CurrencyDTO getById(Long id) {
        Currency currency = currencyRepository.findById(id);
        return currency != null ? toDTO(currency) : null;
    }

    @Transactional
    public CurrencyDTO create(CurrencyDTO dto) {
        Currency currency = toEntity(dto);
        currencyRepository.persist(currency);
        return toDTO(currency);
    }

    @Transactional
    public CurrencyDTO update(Long id, CurrencyDTO dto) {
        Currency currency = currencyRepository.findById(id);
        if (currency == null) return null;
        currency.setCode(dto.getCode());
        currency.setName(dto.getName());
        currency.setSymbol(dto.getSymbol());
        currency.setExchangeRate(dto.getExchangeRate());
        currency.setIsBase(dto.getIsBase());
        currency.setIsActive(dto.getIsActive());
        currency.setDecimalPlaces(dto.getDecimalPlaces());
        currency.setFormat(dto.getFormat());
        currency.setDescription(dto.getDescription());
        currency.setUpdatedAt(java.time.LocalDateTime.now());
        currency.setUpdatedBy(dto.getUpdatedBy());
        return toDTO(currency);
    }

    @Transactional
    public boolean delete(Long id) {
        Currency currency = currencyRepository.findById(id);
        if (currency == null) return false;
        currencyRepository.delete(currency);
        return true;
    }

    // Conversion helpers
    private CurrencyDTO toDTO(Currency currency) {
        if (currency == null) return null;
        CurrencyDTO dto = new CurrencyDTO();
        dto.setId(currency.getId());
        dto.setCode(currency.getCode());
        dto.setName(currency.getName());
        dto.setSymbol(currency.getSymbol());
        dto.setExchangeRate(currency.getExchangeRate());
        dto.setIsBase(currency.getIsBase());
        dto.setIsActive(currency.getIsActive());
        dto.setDecimalPlaces(currency.getDecimalPlaces());
        dto.setFormat(currency.getFormat());
        dto.setDescription(currency.getDescription());
        dto.setCreatedAt(currency.getCreatedAt());
        dto.setCreatedBy(currency.getCreatedBy());
        dto.setUpdatedAt(currency.getUpdatedAt());
        dto.setUpdatedBy(currency.getUpdatedBy());
        return dto;
    }

    private Currency toEntity(CurrencyDTO dto) {
        if (dto == null) return null;
        Currency currency = new Currency();
        currency.setId(dto.getId());
        currency.setCode(dto.getCode());
        currency.setName(dto.getName());
        currency.setSymbol(dto.getSymbol());
        currency.setExchangeRate(dto.getExchangeRate());
        currency.setIsBase(dto.getIsBase());
        currency.setIsActive(dto.getIsActive());
        currency.setDecimalPlaces(dto.getDecimalPlaces());
        currency.setFormat(dto.getFormat());
        currency.setDescription(dto.getDescription());
        currency.setCreatedAt(dto.getCreatedAt());
        currency.setCreatedBy(dto.getCreatedBy());
        currency.setUpdatedAt(dto.getUpdatedAt());
        currency.setUpdatedBy(dto.getUpdatedBy());
        return currency;
    }
} 