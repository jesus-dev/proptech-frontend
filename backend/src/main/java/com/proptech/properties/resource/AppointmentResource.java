package com.proptech.properties.resource;

import com.proptech.properties.dto.AppointmentDTO;
import com.proptech.properties.dto.CreateAppointmentRequest;
import com.proptech.properties.dto.ErrorResponse;
import com.proptech.properties.dto.PublicAppointmentRequest;
import com.proptech.properties.dto.TimeSlotDTO;
import com.proptech.properties.service.AppointmentService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/api/appointments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AppointmentResource {
    
    @Inject
    AppointmentService appointmentService;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    
    // Crear nueva cita
    @POST
    public Response createAppointment(CreateAppointmentRequest request) {
        try {
            AppointmentDTO appointment = appointmentService.createAppointment(request);
            return Response.status(Response.Status.CREATED).entity(appointment).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }
    }
    
    // Obtener todas las citas
    @GET
    public Response getAllAppointments() {
        try {
            List<AppointmentDTO> appointments = appointmentService.getAllAppointments();
            return Response.ok(appointments).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener las citas: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    // Obtener cita por ID
    @GET
    @Path("/{id}")
    public Response getAppointmentById(@PathParam("id") Long id) {
        try {
            AppointmentDTO appointment = appointmentService.getAppointmentById(id);
            return Response.ok(appointment).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.NOT_FOUND).entity(error).build();
        }
    }
    
    // Obtener citas por agente
    @GET
    @Path("/agent/{agentId}")
    public Response getAppointmentsByAgent(@PathParam("agentId") Long agentId) {
        try {
            List<AppointmentDTO> appointments = appointmentService.getAppointmentsByAgent(agentId);
            return Response.ok(appointments).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener las citas del agente: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    // Obtener citas por cliente
    @GET
    @Path("/client/{clientId}")
    public Response getAppointmentsByClient(@PathParam("clientId") Long clientId) {
        try {
            List<AppointmentDTO> appointments = appointmentService.getAppointmentsByClient(clientId);
            return Response.ok(appointments).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener las citas del cliente: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    // Obtener citas por propiedad
    @GET
    @Path("/property/{propertyId}")
    public Response getAppointmentsByProperty(@PathParam("propertyId") Long propertyId) {
        try {
            List<AppointmentDTO> appointments = appointmentService.getAppointmentsByProperty(propertyId);
            return Response.ok(appointments).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener las citas de la propiedad: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    // Obtener citas del día
    @GET
    @Path("/today")
    public Response getTodayAppointments() {
        try {
            List<AppointmentDTO> appointments = appointmentService.getTodayAppointments();
            return Response.ok(appointments).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener las citas del día: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    // Obtener citas de la semana
    @GET
    @Path("/week")
    public Response getWeekAppointments() {
        try {
            List<AppointmentDTO> appointments = appointmentService.getWeekAppointments();
            return Response.ok(appointments).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener las citas de la semana: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    // Obtener citas del mes
    @GET
    @Path("/month")
    public Response getMonthAppointments() {
        try {
            List<AppointmentDTO> appointments = appointmentService.getMonthAppointments();
            return Response.ok(appointments).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener las citas del mes: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    // Obtener citas próximas
    @GET
    @Path("/upcoming")
    public Response getUpcomingAppointments() {
        try {
            List<AppointmentDTO> appointments = appointmentService.getUpcomingAppointments();
            return Response.ok(appointments).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener las citas próximas: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    // Obtener citas por rango de fechas
    @GET
    @Path("/date-range")
    public Response getAppointmentsByDateRange(
            @QueryParam("startDate") String startDateStr,
            @QueryParam("endDate") String endDateStr) {
        try {
            LocalDateTime startDate = LocalDateTime.parse(startDateStr, DATE_FORMATTER);
            LocalDateTime endDate = LocalDateTime.parse(endDateStr, DATE_FORMATTER);
            
            List<AppointmentDTO> appointments = appointmentService.getAppointmentsByDateRange(startDate, endDate);
            return Response.ok(appointments).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener las citas por rango de fechas: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }
    }
    
    // Obtener citas por agente y rango de fechas
    @GET
    @Path("/agent/{agentId}/date-range")
    public Response getAppointmentsByAgentAndDateRange(
            @PathParam("agentId") Long agentId,
            @QueryParam("startDate") String startDateStr,
            @QueryParam("endDate") String endDateStr) {
        try {
            LocalDateTime startDate = LocalDateTime.parse(startDateStr, DATE_FORMATTER);
            LocalDateTime endDate = LocalDateTime.parse(endDateStr, DATE_FORMATTER);
            
            List<AppointmentDTO> appointments = appointmentService.getAppointmentsByAgentAndDateRange(agentId, startDate, endDate);
            return Response.ok(appointments).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener las citas del agente por rango de fechas: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }
    }
    
    // Actualizar estado de cita
    @PUT
    @Path("/{id}/status")
    public Response updateAppointmentStatus(
            @PathParam("id") Long id,
            @QueryParam("status") String status) {
        try {
            AppointmentDTO appointment = appointmentService.updateAppointmentStatus(id, status);
            return Response.ok(appointment).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }
    }
    
    // Cancelar cita
    @PUT
    @Path("/{id}/cancel")
    public Response cancelAppointment(
            @PathParam("id") Long id,
            @QueryParam("reason") String reason) {
        try {
            AppointmentDTO appointment = appointmentService.cancelAppointment(id, reason);
            return Response.ok(appointment).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }
    }
    
    // Reprogramar cita
    @PUT
    @Path("/{id}/reschedule")
    public Response rescheduleAppointment(
            @PathParam("id") Long id,
            @QueryParam("newDate") String newDateStr,
            @QueryParam("newDuration") Integer newDuration) {
        try {
            LocalDateTime newDate = LocalDateTime.parse(newDateStr, DATE_FORMATTER);
            AppointmentDTO appointment = appointmentService.rescheduleAppointment(id, newDate, newDuration);
            return Response.ok(appointment).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }
    }
    
    // Eliminar cita
    @DELETE
    @Path("/{id}")
    public Response deleteAppointment(@PathParam("id") Long id) {
        try {
            AppointmentDTO deletedAppointment = appointmentService.deleteAppointment(id);
            return Response.ok(deletedAppointment).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    // Endpoints públicos para usuarios web
    @POST
    @Path("/public")
    public Response createPublicAppointment(PublicAppointmentRequest request) {
        try {
            AppointmentDTO appointment = appointmentService.createPublicAppointment(request);
            return Response.status(Response.Status.CREATED).entity(appointment).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/public")
    public Response getPublicAppointments() {
        try {
            List<AppointmentDTO> appointments = appointmentService.getPublicAppointments();
            return Response.ok(appointments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/public/property/{propertyId}")
    public Response getPublicAppointmentsByProperty(@PathParam("propertyId") Long propertyId) {
        try {
            List<AppointmentDTO> appointments = appointmentService.getPublicAppointmentsByProperty(propertyId);
            return Response.ok(appointments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/public/available-slots/{propertyId}")
    public Response getAvailableSlots(@PathParam("propertyId") Long propertyId, 
                                    @QueryParam("date") String dateStr) {
        try {
            LocalDate date = LocalDate.parse(dateStr);
            List<TimeSlotDTO> slots = appointmentService.getAvailableSlots(propertyId, date);
            return Response.ok(slots).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    // Estadísticas
    @GET
    @Path("/stats")
    public Response getAppointmentStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalAppointments", appointmentService.getTotalAppointments());
            stats.put("todayAppointments", appointmentService.getTodayAppointmentsCount());
            
            return Response.ok(stats).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener estadísticas: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    // Obtener tipos de cita disponibles
    @GET
    @Path("/types")
    public Response getAppointmentTypes() {
        try {
            // Aquí podrías devolver los tipos desde el enum
            Map<String, String> types = new HashMap<>();
            types.put("PROPERTY_VISIT", "Visita a Propiedad");
            types.put("CLIENT_MEETING", "Reunión con Cliente");
            types.put("PROPERTY_INSPECTION", "Inspección Técnica");
            types.put("CONTRACT_SIGNING", "Firma de Contrato");
            types.put("PROPERTY_VALUATION", "Valuación");
            types.put("DEVELOPMENT_TOUR", "Tour de Desarrollo");
            types.put("OTHER", "Otro");
            
            return Response.ok(types).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener tipos de cita: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    // Obtener estados de cita disponibles
    @GET
    @Path("/statuses")
    public Response getAppointmentStatuses() {
        try {
            Map<String, String> statuses = new HashMap<>();
            statuses.put("SCHEDULED", "Programada");
            statuses.put("CONFIRMED", "Confirmada");
            statuses.put("IN_PROGRESS", "En Progreso");
            statuses.put("COMPLETED", "Completada");
            statuses.put("CANCELLED", "Cancelada");
            statuses.put("NO_SHOW", "No Se Presentó");
            statuses.put("RESCHEDULED", "Reprogramada");
            
            return Response.ok(statuses).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener estados de cita: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
}
