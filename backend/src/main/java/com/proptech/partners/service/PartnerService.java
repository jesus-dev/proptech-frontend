package com.proptech.partners.service;

import com.proptech.partners.entity.Partner;
import com.proptech.partners.dto.PartnerDTO;
import com.proptech.partners.repository.PartnerRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class PartnerService {
    @Inject
    PartnerRepository partnerRepository;

    public List<PartnerDTO> listAll() {
        return partnerRepository.listAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public PartnerDTO findById(Long id) {
        Partner partner = partnerRepository.findById(id);
        return partner != null ? toDTO(partner) : null;
    }

    @Transactional
    public PartnerDTO create(PartnerDTO dto) {
        Partner partner = toEntity(dto);
        partnerRepository.persist(partner);
        return toDTO(partner);
    }

    @Transactional
    public PartnerDTO update(Long id, PartnerDTO dto) {
        Partner partner = partnerRepository.findById(id);
        if (partner == null) return null;
        
        // Update all fields
        partner.setFirstName(dto.firstName);
        partner.setLastName(dto.lastName);
        partner.setEmail(dto.email);
        partner.setPhone(dto.phone);
        partner.setDocumentNumber(dto.documentNumber);
        partner.setDocumentType(dto.documentType);
        partner.setType(dto.type);
        partner.setStatus(dto.status);
        partner.setCompanyName(dto.companyName);
        partner.setCompanyRegistration(dto.companyRegistration);
        partner.setPosition(dto.position);
        partner.setAddress(dto.address);
        partner.setCity(dto.city);
        partner.setState(dto.state);
        partner.setZipCode(dto.zipCode);
        partner.setCountry(dto.country);
        partner.setWebsite(dto.website);
        partner.setSocialMedia(dto.socialMedia);
        partner.setBankAccount(dto.bankAccount);
        partner.setBankName(dto.bankName);
        partner.setCommissionRate(dto.commissionRate);
        partner.setPartnershipDate(dto.partnershipDate);
        partner.setContractStartDate(dto.contractStartDate);
        partner.setContractEndDate(dto.contractEndDate);
        partner.setContractValue(dto.contractValue);
        partner.setCurrency(dto.currency);
        partner.setPaymentFrequency(dto.paymentFrequency);
        partner.setNextPaymentDate(dto.nextPaymentDate);
        partner.setTotalEarnings(dto.totalEarnings);
        partner.setPendingEarnings(dto.pendingEarnings);
        partner.setLastPaymentDate(dto.lastPaymentDate);
        partner.setLastPaymentAmount(dto.lastPaymentAmount);
        partner.setAssignedAgentId(dto.assignedAgentId);
        partner.setAssignedAgencyId(dto.assignedAgencyId);
        partner.setNotes(dto.notes);
        partner.setSpecializations(dto.specializations);
        partner.setTerritories(dto.territories);
        partner.setLanguages(dto.languages);
        partner.setCertifications(dto.certifications);
        partner.setExperienceYears(dto.experienceYears);
        partner.setPropertiesManaged(dto.propertiesManaged);
        partner.setSuccessfulDeals(dto.successfulDeals);
        partner.setAverageRating(dto.averageRating);
        partner.setTotalReviews(dto.totalReviews);
        partner.setIsVerified(dto.isVerified);
        partner.setVerificationDate(dto.verificationDate);
        
        return toDTO(partner);
    }

    @Transactional
    public boolean delete(Long id) {
        Partner partner = partnerRepository.findById(id);
        if (partner == null) return false;
        partnerRepository.delete(partner);
        return true;
    }

    private PartnerDTO toDTO(Partner partner) {
        PartnerDTO dto = new PartnerDTO();
        dto.id = partner.getId();
        dto.firstName = partner.getFirstName();
        dto.lastName = partner.getLastName();
        dto.email = partner.getEmail();
        dto.phone = partner.getPhone();
        dto.documentNumber = partner.getDocumentNumber();
        dto.documentType = partner.getDocumentType();
        dto.type = partner.getType();
        dto.status = partner.getStatus();
        dto.companyName = partner.getCompanyName();
        dto.companyRegistration = partner.getCompanyRegistration();
        dto.position = partner.getPosition();
        dto.address = partner.getAddress();
        dto.city = partner.getCity();
        dto.state = partner.getState();
        dto.zipCode = partner.getZipCode();
        dto.country = partner.getCountry();
        dto.website = partner.getWebsite();
        dto.socialMedia = partner.getSocialMedia();
        dto.bankAccount = partner.getBankAccount();
        dto.bankName = partner.getBankName();
        dto.commissionRate = partner.getCommissionRate();
        dto.partnershipDate = partner.getPartnershipDate();
        dto.contractStartDate = partner.getContractStartDate();
        dto.contractEndDate = partner.getContractEndDate();
        dto.contractValue = partner.getContractValue();
        dto.currency = partner.getCurrency();
        dto.paymentFrequency = partner.getPaymentFrequency();
        dto.nextPaymentDate = partner.getNextPaymentDate();
        dto.totalEarnings = partner.getTotalEarnings();
        dto.pendingEarnings = partner.getPendingEarnings();
        dto.lastPaymentDate = partner.getLastPaymentDate();
        dto.lastPaymentAmount = partner.getLastPaymentAmount();
        dto.assignedAgentId = partner.getAssignedAgentId();
        dto.assignedAgencyId = partner.getAssignedAgencyId();
        dto.notes = partner.getNotes();
        dto.specializations = partner.getSpecializations();
        dto.territories = partner.getTerritories();
        dto.languages = partner.getLanguages();
        dto.certifications = partner.getCertifications();
        dto.experienceYears = partner.getExperienceYears();
        dto.propertiesManaged = partner.getPropertiesManaged();
        dto.successfulDeals = partner.getSuccessfulDeals();
        dto.averageRating = partner.getAverageRating();
        dto.totalReviews = partner.getTotalReviews();
        dto.isVerified = partner.getIsVerified();
        dto.verificationDate = partner.getVerificationDate();
        dto.createdAt = partner.getCreatedAt();
        dto.updatedAt = partner.getUpdatedAt();
        return dto;
    }

    private Partner toEntity(PartnerDTO dto) {
        Partner partner = new Partner();
        partner.setId(dto.id);
        partner.setFirstName(dto.firstName);
        partner.setLastName(dto.lastName);
        partner.setEmail(dto.email);
        partner.setPhone(dto.phone);
        partner.setDocumentNumber(dto.documentNumber);
        partner.setDocumentType(dto.documentType);
        partner.setType(dto.type);
        partner.setStatus(dto.status);
        partner.setCompanyName(dto.companyName);
        partner.setCompanyRegistration(dto.companyRegistration);
        partner.setPosition(dto.position);
        partner.setAddress(dto.address);
        partner.setCity(dto.city);
        partner.setState(dto.state);
        partner.setZipCode(dto.zipCode);
        partner.setCountry(dto.country);
        partner.setWebsite(dto.website);
        partner.setSocialMedia(dto.socialMedia);
        partner.setBankAccount(dto.bankAccount);
        partner.setBankName(dto.bankName);
        partner.setCommissionRate(dto.commissionRate);
        partner.setPartnershipDate(dto.partnershipDate);
        partner.setContractStartDate(dto.contractStartDate);
        partner.setContractEndDate(dto.contractEndDate);
        partner.setContractValue(dto.contractValue);
        partner.setCurrency(dto.currency);
        partner.setPaymentFrequency(dto.paymentFrequency);
        partner.setNextPaymentDate(dto.nextPaymentDate);
        partner.setTotalEarnings(dto.totalEarnings);
        partner.setPendingEarnings(dto.pendingEarnings);
        partner.setLastPaymentDate(dto.lastPaymentDate);
        partner.setLastPaymentAmount(dto.lastPaymentAmount);
        partner.setAssignedAgentId(dto.assignedAgentId);
        partner.setAssignedAgencyId(dto.assignedAgencyId);
        partner.setNotes(dto.notes);
        partner.setSpecializations(dto.specializations);
        partner.setTerritories(dto.territories);
        partner.setLanguages(dto.languages);
        partner.setCertifications(dto.certifications);
        partner.setExperienceYears(dto.experienceYears);
        partner.setPropertiesManaged(dto.propertiesManaged);
        partner.setSuccessfulDeals(dto.successfulDeals);
        partner.setAverageRating(dto.averageRating);
        partner.setTotalReviews(dto.totalReviews);
        partner.setIsVerified(dto.isVerified);
        partner.setVerificationDate(dto.verificationDate);
        return partner;
    }
} 