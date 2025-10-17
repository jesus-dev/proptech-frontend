package com.proptech.inquiries.service;

import com.proptech.inquiries.entity.Inquiry;
import com.proptech.inquiries.dto.InquiryDTO;
import com.proptech.inquiries.repository.InquiryRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class InquiryService {
    @Inject
    InquiryRepository inquiryRepository;

    public List<InquiryDTO> listAll() {
        return inquiryRepository.listAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public InquiryDTO findById(Long id) {
        Inquiry inquiry = inquiryRepository.findById(id);
        return inquiry != null ? toDTO(inquiry) : null;
    }

    @Transactional
    public InquiryDTO create(InquiryDTO dto) {
        Inquiry inquiry = toEntity(dto);
        inquiry.setCreatedAt(LocalDateTime.now());
        inquiry.setUpdatedAt(LocalDateTime.now());
        inquiryRepository.persist(inquiry);
        return toDTO(inquiry);
    }

    @Transactional
    public InquiryDTO update(Long id, InquiryDTO dto) {
        Inquiry inquiry = inquiryRepository.findById(id);
        if (inquiry == null) return null;
        
        inquiry.setName(dto.name);
        inquiry.setEmail(dto.email);
        inquiry.setPhone(dto.phone);
        inquiry.setMessage(dto.message);
        inquiry.setPropertyId(dto.propertyId);
        inquiry.setPropertyImage(dto.propertyImage);
        inquiry.setRead(dto.read);
        inquiry.setUpdatedAt(LocalDateTime.now());
        
        return toDTO(inquiry);
    }

    @Transactional
    public InquiryDTO updateReadStatus(Long id, Boolean read) {
        Inquiry inquiry = inquiryRepository.findById(id);
        if (inquiry == null) return null;
        
        inquiry.setRead(read);
        inquiry.setUpdatedAt(LocalDateTime.now());
        
        return toDTO(inquiry);
    }

    @Transactional
    public boolean delete(Long id) {
        Inquiry inquiry = inquiryRepository.findById(id);
        if (inquiry == null) return false;
        inquiryRepository.delete(inquiry);
        return true;
    }

    private InquiryDTO toDTO(Inquiry inquiry) {
        InquiryDTO dto = new InquiryDTO();
        dto.id = inquiry.getId();
        dto.name = inquiry.getName();
        dto.email = inquiry.getEmail();
        dto.phone = inquiry.getPhone();
        dto.message = inquiry.getMessage();
        dto.propertyId = inquiry.getPropertyId();
        dto.propertyImage = inquiry.getPropertyImage();
        dto.read = inquiry.getRead();
        dto.createdAt = inquiry.getCreatedAt();
        dto.updatedAt = inquiry.getUpdatedAt();
        return dto;
    }

    private Inquiry toEntity(InquiryDTO dto) {
        Inquiry inquiry = new Inquiry();
        inquiry.setId(dto.id);
        inquiry.setName(dto.name);
        inquiry.setEmail(dto.email);
        inquiry.setPhone(dto.phone);
        inquiry.setMessage(dto.message);
        inquiry.setPropertyId(dto.propertyId);
        inquiry.setPropertyImage(dto.propertyImage);
        inquiry.setRead(dto.read);
        return inquiry;
    }
} 