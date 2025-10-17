package com.proptech.properties.repository;

import com.proptech.properties.entity.Appointment;
import com.proptech.properties.entity.Appointment.AppointmentStatus;
import com.proptech.properties.entity.Appointment.AppointmentType;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@ApplicationScoped
public class AppointmentRepository implements PanacheRepository<Appointment> {
    
    // Buscar citas por agente
    public List<Appointment> findByAgentId(Long agentId) {
        return find("agentId", agentId).list();
    }
    
    // Buscar citas por cliente
    public List<Appointment> findByClientId(Long clientId) {
        return find("clientId", clientId).list();
    }
    
    // Buscar citas por propiedad
    public List<Appointment> findByPropertyId(Long propertyId) {
        return find("propertyId", propertyId).list();
    }
    
    // Buscar citas por estado
    public List<Appointment> findByStatus(AppointmentStatus status) {
        return find("status", status).list();
    }
    
    // Buscar citas por tipo
    public List<Appointment> findByType(AppointmentType type) {
        return find("appointmentType", type).list();
    }
    
    // Buscar citas por fecha
    public List<Appointment> findByDate(LocalDateTime date) {
        return find("appointmentDate", date).list();
    }
    
    // Buscar citas por rango de fechas
    public List<Appointment> findByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return find("appointmentDate between ?1 and ?2", startDate, endDate).list();
    }
    
    // Buscar citas del día
    public List<Appointment> findTodayAppointments() {
        LocalDateTime today = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime tomorrow = today.plusDays(1);
        return findByDateRange(today, tomorrow);
    }
    
    // Buscar citas de la semana
    public List<Appointment> findWeekAppointments() {
        LocalDateTime weekStart = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime weekEnd = weekStart.plusWeeks(1);
        return findByDateRange(weekStart, weekEnd);
    }
    
    // Buscar citas del mes
    public List<Appointment> findMonthAppointments() {
        LocalDateTime monthStart = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime monthEnd = monthStart.plusMonths(1);
        return findByDateRange(monthStart, monthEnd);
    }
    
    // Buscar citas próximas (hoy y mañana)
    public List<Appointment> findUpcomingAppointments() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1).toLocalDate().atTime(23, 59, 59);
        return find("appointmentDate between ?1 and ?2 order by appointmentDate", now, tomorrow).list();
    }
    
    // Buscar citas por agente y fecha
    public List<Appointment> findByAgentAndDate(Long agentId, LocalDateTime date) {
        return find("agentId = ?1 and appointmentDate = ?2", agentId, date).list();
    }
    
    // Buscar citas por agente y rango de fechas
    public List<Appointment> findByAgentAndDateRange(Long agentId, LocalDateTime startDate, LocalDateTime endDate) {
        return find("agentId = ?1 and appointmentDate between ?2 and ?3 order by appointmentDate", 
                   agentId, startDate, endDate).list();
    }
    
    // Buscar citas pendientes de confirmación
    public List<Appointment> findPendingConfirmation() {
        return find("status", AppointmentStatus.SCHEDULED).list();
    }
    
    // Buscar citas que necesitan recordatorio
    public List<Appointment> findAppointmentsNeedingReminder() {
        LocalDateTime reminderTime = LocalDateTime.now().plusHours(24);
        return find("reminderDate <= ?1 AND reminderSent = false", reminderTime).list();
    }

    // Métodos para citas públicas
    public List<Appointment> findPublicAppointments() {
        return find("isPublic = true ORDER BY appointmentDate DESC").list();
    }

    public List<Appointment> findPublicAppointmentsByProperty(Long propertyId) {
        return find("isPublic = true AND propertyId = ?1 ORDER BY appointmentDate DESC", propertyId).list();
    }

    public List<Appointment> findAvailableSlotsForProperty(Long propertyId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        
        return find("propertyId = ?1 AND appointmentDate BETWEEN ?2 AND ?3", 
                   propertyId, startOfDay, endOfDay).list();
    }
    
    // Contar citas por estado
    public long countByStatus(AppointmentStatus status) {
        return count("status", status);
    }
    
    // Contar citas por agente
    public long countByAgent(Long agentId) {
        return count("agentId", agentId);
    }
    
    // Contar citas por cliente
    public long countByClient(Long clientId) {
        return count("clientId", clientId);
    }
    
    // Contar citas del día
    public long countTodayAppointments() {
        LocalDateTime today = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime tomorrow = today.plusDays(1);
        return count("appointmentDate between ?1 and ?2", today, tomorrow);
    }
}
