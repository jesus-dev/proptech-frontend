package com.proptech.properties.service;

import com.proptech.properties.dto.AppointmentDTO;
import com.proptech.properties.dto.CreateAppointmentRequest;
import com.proptech.properties.dto.PublicAppointmentRequest;
import com.proptech.properties.dto.TimeSlotDTO;
import com.proptech.properties.entity.Appointment;
import com.proptech.properties.entity.Appointment.AppointmentStatus;
import com.proptech.properties.entity.Appointment.AppointmentType;
import com.proptech.properties.entity.Appointment.LocationType;
import com.proptech.properties.repository.AppointmentRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class AppointmentService {
    
    @Inject
    AppointmentRepository appointmentRepository;
    
    // Crear nueva cita
    @Transactional
    public AppointmentDTO createAppointment(CreateAppointmentRequest request) {
        // Validar request
        String validationError = request.getValidationError();
        if (validationError != null) {
            throw new RuntimeException(validationError);
        }
        
        // Verificar conflictos de horario para el agente
        if (hasTimeConflict(request.getAgentId(), request.getAppointmentDate(), 
                           request.getDurationMinutes(), null)) {
            throw new RuntimeException("El agente tiene un conflicto de horario en esa fecha y hora");
        }
        
        // Crear la cita
        Appointment appointment = new Appointment();
        appointment.setTitle(request.getTitle());
        appointment.setDescription(request.getDescription());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setDurationMinutes(request.getDurationMinutes());
        appointment.setAppointmentType(parseAppointmentType(request.getAppointmentType()));
        appointment.setLocation(request.getLocation());
        appointment.setLocationType(parseLocationType(request.getLocationType()));
        appointment.setAgentId(request.getAgentId());
        appointment.setClientId(request.getClientId());
        appointment.setPropertyId(request.getPropertyId());
        appointment.setNotes(request.getNotes());
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        
        // Persistir
        appointmentRepository.persist(appointment);
        
        return new AppointmentDTO(appointment);
    }
    
    // Obtener cita por ID
    public AppointmentDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id);
        if (appointment == null) {
            throw new RuntimeException("Cita no encontrada");
        }
        return new AppointmentDTO(appointment);
    }
    
    // Obtener todas las citas
    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.listAll().stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }
    
    // Obtener citas por agente
    public List<AppointmentDTO> getAppointmentsByAgent(Long agentId) {
        return appointmentRepository.findByAgentId(agentId).stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }
    
    // Obtener citas por cliente
    public List<AppointmentDTO> getAppointmentsByClient(Long clientId) {
        return appointmentRepository.findByClientId(clientId).stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }
    
    // Obtener citas por propiedad
    public List<AppointmentDTO> getAppointmentsByProperty(Long propertyId) {
        return appointmentRepository.findByPropertyId(propertyId).stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }
    
    // Obtener citas del día
    public List<AppointmentDTO> getTodayAppointments() {
        return appointmentRepository.findTodayAppointments().stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }
    
    // Obtener citas de la semana
    public List<AppointmentDTO> getWeekAppointments() {
        return appointmentRepository.findWeekAppointments().stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }
    
    // Obtener citas del mes
    public List<AppointmentDTO> getMonthAppointments() {
        return appointmentRepository.findMonthAppointments().stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }
    
    // Obtener citas próximas
    public List<AppointmentDTO> getUpcomingAppointments() {
        return appointmentRepository.findUpcomingAppointments().stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }
    
    // Obtener citas por rango de fechas
    public List<AppointmentDTO> getAppointmentsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return appointmentRepository.findByDateRange(startDate, endDate).stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }
    
    // Obtener citas por agente y rango de fechas
    public List<AppointmentDTO> getAppointmentsByAgentAndDateRange(Long agentId, LocalDateTime startDate, LocalDateTime endDate) {
        return appointmentRepository.findByAgentAndDateRange(agentId, startDate, endDate).stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }
    
    // Actualizar estado de cita
    @Transactional
    public AppointmentDTO updateAppointmentStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id);
        if (appointment == null) {
            throw new RuntimeException("Cita no encontrada");
        }
        
        AppointmentStatus newStatus = parseAppointmentStatus(status);
        if (newStatus == null) {
            throw new RuntimeException("Estado de cita inválido");
        }
        
        appointment.setStatus(newStatus);
        appointmentRepository.persist(appointment);
        
        return new AppointmentDTO(appointment);
    }
    
    // Cancelar cita
    @Transactional
    public AppointmentDTO cancelAppointment(Long id, String reason) {
        Appointment appointment = appointmentRepository.findById(id);
        if (appointment == null) {
            throw new RuntimeException("Cita no encontrada");
        }
        
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("La cita ya está cancelada");
        }
        
        appointment.setStatus(AppointmentStatus.CANCELLED);
        if (reason != null && !reason.trim().isEmpty()) {
            String notes = appointment.getNotes() != null ? appointment.getNotes() : "";
            appointment.setNotes(notes + "\n\nCancelada: " + reason);
        }
        
        appointmentRepository.persist(appointment);
        
        return new AppointmentDTO(appointment);
    }
    
    // Reprogramar cita
    @Transactional
    public AppointmentDTO rescheduleAppointment(Long id, LocalDateTime newDate, Integer newDuration) {
        Appointment appointment = appointmentRepository.findById(id);
        if (appointment == null) {
            throw new RuntimeException("Cita no encontrada");
        }
        
        if (newDate.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("La nueva fecha debe ser futura");
        }
        
        // Verificar conflictos de horario
        if (hasTimeConflict(appointment.getAgentId(), newDate, 
                           newDuration != null ? newDuration : appointment.getDurationMinutes(), id)) {
            throw new RuntimeException("El agente tiene un conflicto de horario en la nueva fecha y hora");
        }
        
        appointment.setAppointmentDate(newDate);
        if (newDuration != null) {
            appointment.setDurationMinutes(newDuration);
        }
        appointment.setStatus(AppointmentStatus.RESCHEDULED);
        
        appointmentRepository.persist(appointment);
        
        return new AppointmentDTO(appointment);
    }
    
    // Eliminar cita
    @Transactional
    public AppointmentDTO deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id);
        if (appointment == null) {
            throw new RuntimeException("Cita no encontrada");
        }
        
        appointmentRepository.delete(appointment);
        return new AppointmentDTO(appointment);
    }

    // Métodos para citas públicas
    public AppointmentDTO createPublicAppointment(PublicAppointmentRequest request) {
        // Validar request
        if (!request.isValid()) {
            throw new RuntimeException(request.getValidationError());
        }

        // Verificar disponibilidad del horario
        if (hasTimeConflict(1L, request.getAppointmentDate(), request.getDurationMinutes(), null)) {
            throw new RuntimeException("El horario seleccionado no está disponible");
        }

        // Asignar agente disponible (lógica simple por ahora)
        Long agentId = assignAvailableAgent(request.getAppointmentDate());
        if (agentId == null) {
            throw new RuntimeException("No hay agentes disponibles en este horario");
        }

        // Crear la cita
        Appointment appointment = new Appointment();
        appointment.setTitle(request.getTitle());
        appointment.setDescription(request.getDescription());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setDurationMinutes(request.getDurationMinutes());
        appointment.setAppointmentType(Appointment.AppointmentType.PROPERTY_VISIT);
        appointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);
        appointment.setLocation("Propiedad");
        appointment.setLocationType(Appointment.LocationType.PROPERTY_ADDRESS);
        appointment.setAgentId(agentId);
        appointment.setPropertyId(request.getPropertyId());
        appointment.setNotes(request.getNotes());
        appointment.setIsPublic(true);
        appointment.setClientEmail(request.getClientEmail());
        appointment.setClientPhone(request.getClientPhone());

        appointmentRepository.persist(appointment);
        return new AppointmentDTO(appointment);
    }

    public List<AppointmentDTO> getPublicAppointments() {
        return appointmentRepository.findPublicAppointments()
                .stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getPublicAppointmentsByProperty(Long propertyId) {
        return appointmentRepository.findByPropertyId(propertyId).stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }

    public List<TimeSlotDTO> getAvailableSlots(Long propertyId, LocalDate date) {
        // Obtener horarios disponibles para una propiedad en una fecha específica
        List<TimeSlotDTO> availableSlots = new ArrayList<>();
        
        // Horarios de trabajo: 9:00 AM a 6:00 PM
        LocalTime startTime = LocalTime.of(9, 0);
        LocalTime endTime = LocalTime.of(18, 0);
        
        // Slots de 1 hora
        LocalTime currentTime = startTime;
        while (currentTime.isBefore(endTime)) {
            LocalDateTime slotDateTime = LocalDateTime.of(date, currentTime);
            
            // Verificar si el slot está disponible para cualquier agente
            boolean isAvailable = false;
            Long availableAgentId = null;
            String availableAgentName = null;
            
            // Verificar disponibilidad para agentes 1, 2 y 3
            for (long agentId = 1; agentId <= 3; agentId++) {
                if (!hasTimeConflict(agentId, slotDateTime, 60, null)) {
                    isAvailable = true;
                    availableAgentId = agentId;
                    availableAgentName = getAgentName(agentId);
                    break;
                }
            }
            
            String timeStr = currentTime.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"));
            TimeSlotDTO slot = new TimeSlotDTO(timeStr, isAvailable, availableAgentId, availableAgentName);
            availableSlots.add(slot);
            
            currentTime = currentTime.plusHours(1);
        }
        
        return availableSlots;
    }
    
    private String getAgentName(Long agentId) {
        // Mapeo simple de IDs de agente a nombres
        switch (agentId.intValue()) {
            case 1: return "María González";
            case 2: return "Carlos Rodríguez";
            case 3: return "Ana Martínez";
            default: return "Agente " + agentId;
        }
    }

    private Long assignAvailableAgent(LocalDateTime appointmentDate) {
        // Lógica simple: asignar el primer agente disponible
        // En producción, esto debería ser más sofisticado
        List<Appointment> agentAppointments = appointmentRepository.findByAgentAndDate(1L, appointmentDate);
        
        // Verificar si el agente 1 está disponible
        boolean isAvailable = agentAppointments.stream()
                .noneMatch(apt -> apt.getAppointmentDate().equals(appointmentDate));
        
        if (isAvailable) {
            return 1L;
        }
        
        // Intentar con otros agentes
        return 2L; // Simplificado por ahora
    }
    
    // Verificar conflictos de horario
    private boolean hasTimeConflict(Long agentId, LocalDateTime startTime, Integer durationMinutes, Long excludeId) {
        LocalDateTime endTime = startTime.plusMinutes(durationMinutes);
        
        List<Appointment> agentAppointments = appointmentRepository.findByAgentId(agentId);
        
        for (Appointment existing : agentAppointments) {
            if (excludeId != null && existing.getId().equals(excludeId)) {
                continue; // Excluir la cita actual en caso de actualización
            }
            
            if (existing.getStatus() == AppointmentStatus.CANCELLED || 
                existing.getStatus() == AppointmentStatus.NO_SHOW) {
                continue; // No considerar citas canceladas
            }
            
            LocalDateTime existingEnd = existing.getEndTime();
            
            // Verificar superposición
            if (!(endTime.isBefore(existing.getAppointmentDate()) || 
                  startTime.isAfter(existingEnd))) {
                return true; // Hay conflicto
            }
        }
        
        return false;
    }
    
    // Métodos auxiliares para parsear enums
    private AppointmentType parseAppointmentType(String type) {
        if (type == null) return AppointmentType.OTHER;
        
        for (AppointmentType appointmentType : AppointmentType.values()) {
            if (appointmentType.getDisplayName().equals(type) || 
                appointmentType.name().equals(type.toUpperCase())) {
                return appointmentType;
            }
        }
        return AppointmentType.OTHER;
    }
    
    private LocationType parseLocationType(String type) {
        if (type == null) return LocationType.OTHER;
        
        for (LocationType locationType : LocationType.values()) {
            if (locationType.getDisplayName().equals(type) || 
                locationType.name().equals(type.toUpperCase())) {
                return locationType;
            }
        }
        return LocationType.OTHER;
    }
    
    private AppointmentStatus parseAppointmentStatus(String status) {
        if (status == null) return null;
        
        for (AppointmentStatus appointmentStatus : AppointmentStatus.values()) {
            if (appointmentStatus.getDisplayName().equals(status) || 
                appointmentStatus.name().equals(status.toUpperCase())) {
                return appointmentStatus;
            }
        }
        return null;
    }
    
    // Estadísticas
    public long getTotalAppointments() {
        return appointmentRepository.count();
    }
    
    public long getAppointmentsByStatus(AppointmentStatus status) {
        return appointmentRepository.countByStatus(status);
    }
    
    public long getTodayAppointmentsCount() {
        return appointmentRepository.countTodayAppointments();
    }
    
    public long countAppointmentsByAgent(Long agentId) {
        return appointmentRepository.countByAgent(agentId);
    }
    
    public long countAppointmentsByClient(Long clientId) {
        return appointmentRepository.countByClient(clientId);
    }
}
