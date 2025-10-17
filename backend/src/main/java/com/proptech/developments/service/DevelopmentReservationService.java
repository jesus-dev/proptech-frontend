package com.proptech.developments.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.proptech.commons.entity.Currency;
import com.proptech.commons.service.CurrencyService;
import com.proptech.developments.dto.DevelopmentReservationDTO;
import com.proptech.developments.entity.Development;
import com.proptech.developments.entity.DevelopmentReservation;
import com.proptech.developments.entity.DevelopmentUnit;
import com.proptech.developments.enums.ReservationStatus;
import com.proptech.developments.repository.DevelopmentReservationRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DevelopmentReservationService {

    @Inject
    DevelopmentReservationRepository developmentReservationRepository;

    @Inject
    CurrencyService currencyService;

    public List<DevelopmentReservationDTO> getAllReservations() {
        return developmentReservationRepository.listAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentReservationDTO> getReservationsByDevelopmentId(Long developmentId) {
        return developmentReservationRepository.findByDevelopmentId(developmentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public DevelopmentReservationDTO getReservationById(Long id) {
        DevelopmentReservation reservation = developmentReservationRepository.findById(id);
        if (reservation == null) {
            throw new RuntimeException("Reserva no encontrada con ID: " + id);
        }
        return toDTO(reservation);
    }

    @Transactional
    public DevelopmentReservationDTO createReservation(DevelopmentReservationDTO dto) {
        DevelopmentReservation reservation = toEntity(dto);
        reservation.setCreatedAt(LocalDateTime.now());
        reservation.setActive(true);
        developmentReservationRepository.persist(reservation);
        return toDTO(reservation);
    }

    @Transactional
    public DevelopmentReservationDTO updateReservation(Long id, DevelopmentReservationDTO dto) {
        DevelopmentReservation reservation = developmentReservationRepository.findById(id);
        if (reservation == null) {
            throw new RuntimeException("Reserva no encontrada con ID: " + id);
        }

        // Update fields
        reservation.setReservationNumber(dto.getReservationNumber());
        reservation.setClientName(dto.getClientName());
        reservation.setClientEmail(dto.getClientEmail());
        reservation.setClientPhone(dto.getClientPhone());
        reservation.setClientDocument(dto.getClientDocument());
        reservation.setStatus(dto.getStatus());
        reservation.setReservationAmount(dto.getReservationAmount());
        reservation.setTotalPrice(dto.getTotalPrice());
        
        // Set currency if currencyId is provided
        if (dto.getCurrencyId() != null) {
            com.proptech.commons.dto.CurrencyDTO currencyDTO = currencyService.getById(dto.getCurrencyId());
            if (currencyDTO != null) {
                Currency currency = new Currency();
                currency.setId(currencyDTO.getId());
                currency.setCode(currencyDTO.getCode());
                currency.setName(currencyDTO.getName());
                currency.setSymbol(currencyDTO.getSymbol());
                reservation.setCurrency(currency);
            }
        }
        
        reservation.setReservationDate(dto.getReservationDate());
        reservation.setExpirationDate(dto.getExpirationDate());
        reservation.setConfirmationDate(dto.getConfirmationDate());
        reservation.setCancellationDate(dto.getCancellationDate());
        reservation.setCancellationReason(dto.getCancellationReason());
        reservation.setNotes(dto.getNotes());
        reservation.setAgentName(dto.getAgentName());
        reservation.setAgentId(dto.getAgentId());
        reservation.setPaymentMethod(dto.getPaymentMethod());
        reservation.setPaymentReference(dto.getPaymentReference());
        reservation.setActive(dto.getActive());
        reservation.setUpdatedAt(LocalDateTime.now());

        return toDTO(reservation);
    }

    @Transactional
    public void deleteReservation(Long id) {
        DevelopmentReservation reservation = developmentReservationRepository.findById(id);
        if (reservation == null) {
            throw new RuntimeException("Reserva no encontrada con ID: " + id);
        }
        developmentReservationRepository.delete(reservation);
    }

    public List<DevelopmentReservationDTO> getReservationsByStatus(ReservationStatus status) {
        return developmentReservationRepository.findByStatus(status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentReservationDTO> getReservationsByUnitId(Long unitId) {
        return developmentReservationRepository.findByUnitId(unitId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentReservationDTO> getReservationsByClientEmail(String email) {
        return developmentReservationRepository.findByClientEmail(email).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentReservationDTO> getReservationsByClientDocument(String document) {
        return developmentReservationRepository.findByClientDocument(document).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentReservationDTO> getExpiredReservations() {
        return developmentReservationRepository.findExpiredReservations().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentReservationDTO> getExpiringSoonReservations(int daysAhead) {
        return developmentReservationRepository.findExpiringSoonReservations(daysAhead).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentReservationDTO> getPendingReservations() {
        return developmentReservationRepository.findPendingReservations().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DevelopmentReservationDTO> getReservationsByAgentId(String agentId) {
        return developmentReservationRepository.findByAgentId(agentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DevelopmentReservationDTO confirmReservation(Long id) {
        DevelopmentReservation reservation = developmentReservationRepository.findById(id);
        if (reservation == null) {
            throw new RuntimeException("Reserva no encontrada con ID: " + id);
        }

        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setConfirmationDate(LocalDate.now());
        reservation.setUpdatedAt(LocalDateTime.now());

        return toDTO(reservation);
    }

    @Transactional
    public DevelopmentReservationDTO cancelReservation(Long id, String reason) {
        DevelopmentReservation reservation = developmentReservationRepository.findById(id);
        if (reservation == null) {
            throw new RuntimeException("Reserva no encontrada con ID: " + id);
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancellationDate(LocalDate.now());
        reservation.setCancellationReason(reason);
        reservation.setUpdatedAt(LocalDateTime.now());

        return toDTO(reservation);
    }

    @Transactional
    public DevelopmentReservationDTO convertToSale(Long id) {
        DevelopmentReservation reservation = developmentReservationRepository.findById(id);
        if (reservation == null) {
            throw new RuntimeException("Reserva no encontrada con ID: " + id);
        }

        reservation.setStatus(ReservationStatus.CONVERTED);
        reservation.setUpdatedAt(LocalDateTime.now());

        return toDTO(reservation);
    }

    public Map<String, Object> getStats() {
        long total = developmentReservationRepository.count();
        long pending = developmentReservationRepository.countPendingByDevelopmentId(null);
        long confirmed = developmentReservationRepository.countByDevelopmentIdAndStatus(null, ReservationStatus.CONFIRMED);
        long expired = developmentReservationRepository.countExpiredByDevelopmentId(null);
        long cancelled = developmentReservationRepository.countByDevelopmentIdAndStatus(null, ReservationStatus.CANCELLED);
        long converted = developmentReservationRepository.countByDevelopmentIdAndStatus(null, ReservationStatus.CONVERTED);

        return Map.of(
            "total", total,
            "pending", pending,
            "confirmed", confirmed,
            "expired", expired,
            "cancelled", cancelled,
            "converted", converted,
            "totalAmount", 0.0, 
            "pendingAmount", 0.0 
        );
    }

    private DevelopmentReservationDTO toDTO(DevelopmentReservation reservation) {
        DevelopmentReservationDTO dto = new DevelopmentReservationDTO();
        dto.setId(reservation.getId());
        
        // Set developmentId from the relationship
        if (reservation.getDevelopment() != null) {
            dto.setDevelopmentId(reservation.getDevelopment().getId());
        }
        
        dto.setUnitId(reservation.getUnit() != null ? reservation.getUnit().getId() : null);
        dto.setReservationNumber(reservation.getReservationNumber());
        dto.setClientName(reservation.getClientName());
        dto.setClientEmail(reservation.getClientEmail());
        dto.setClientPhone(reservation.getClientPhone());
        dto.setClientDocument(reservation.getClientDocument());
        dto.setStatus(reservation.getStatus());
        dto.setReservationAmount(reservation.getReservationAmount());
        dto.setTotalPrice(reservation.getTotalPrice());
        
        // Set currency info from the relationship
        if (reservation.getCurrency() != null) {
            dto.setCurrencyId(reservation.getCurrency().getId());
            dto.setCurrency(new com.proptech.commons.dto.CurrencyDTO());
            dto.getCurrency().setId(reservation.getCurrency().getId());
            dto.getCurrency().setCode(reservation.getCurrency().getCode());
            dto.getCurrency().setName(reservation.getCurrency().getName());
            dto.getCurrency().setSymbol(reservation.getCurrency().getSymbol());
        }
        
        dto.setReservationDate(reservation.getReservationDate());
        dto.setExpirationDate(reservation.getExpirationDate());
        dto.setConfirmationDate(reservation.getConfirmationDate());
        dto.setCancellationDate(reservation.getCancellationDate());
        dto.setCancellationReason(reservation.getCancellationReason());
        dto.setNotes(reservation.getNotes());
        dto.setAgentName(reservation.getAgentName());
        dto.setAgentId(reservation.getAgentId());
        dto.setPaymentMethod(reservation.getPaymentMethod());
        dto.setPaymentReference(reservation.getPaymentReference());
        dto.setActive(reservation.getActive());
        dto.setCreatedAt(reservation.getCreatedAt());
        dto.setCreatedBy(reservation.getCreatedBy());
        dto.setUpdatedAt(reservation.getUpdatedAt());
        dto.setUpdatedBy(reservation.getUpdatedBy());
        return dto;
    }

    private DevelopmentReservation toEntity(DevelopmentReservationDTO dto) {
        DevelopmentReservation reservation = new DevelopmentReservation();
        reservation.setId(dto.getId());
        
        // Set development relationship if developmentId is provided
        if (dto.getDevelopmentId() != null) {
            Development development = new Development();
            development.setId(dto.getDevelopmentId());
            reservation.setDevelopment(development);
        }
        
        // Set unit relationship if unitId is provided
        if (dto.getUnitId() != null) {
            DevelopmentUnit unit = new DevelopmentUnit();
            unit.setId(dto.getUnitId());
            reservation.setUnit(unit);
        }
        
        reservation.setReservationNumber(dto.getReservationNumber());
        reservation.setClientName(dto.getClientName());
        reservation.setClientEmail(dto.getClientEmail());
        reservation.setClientPhone(dto.getClientPhone());
        reservation.setClientDocument(dto.getClientDocument());
        reservation.setStatus(dto.getStatus());
        reservation.setReservationAmount(dto.getReservationAmount());
        reservation.setTotalPrice(dto.getTotalPrice());
        
        // Set currency relationship if currencyId is provided
        if (dto.getCurrencyId() != null) {
            Currency currency = new Currency();
            currency.setId(dto.getCurrencyId());
            reservation.setCurrency(currency);
        }
        
        reservation.setReservationDate(dto.getReservationDate());
        reservation.setExpirationDate(dto.getExpirationDate());
        reservation.setConfirmationDate(dto.getConfirmationDate());
        reservation.setCancellationDate(dto.getCancellationDate());
        reservation.setCancellationReason(dto.getCancellationReason());
        reservation.setNotes(dto.getNotes());
        reservation.setAgentName(dto.getAgentName());
        reservation.setAgentId(dto.getAgentId());
        reservation.setPaymentMethod(dto.getPaymentMethod());
        reservation.setPaymentReference(dto.getPaymentReference());
        reservation.setActive(dto.getActive());
        reservation.setCreatedAt(dto.getCreatedAt());
        reservation.setCreatedBy(dto.getCreatedBy());
        reservation.setUpdatedAt(dto.getUpdatedAt());
        reservation.setUpdatedBy(dto.getUpdatedBy());
        return reservation;
    }
} 