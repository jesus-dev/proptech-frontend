package com.proptech.properties.resource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.proptech.properties.dto.PropertyAuditLogDTO;
import com.proptech.properties.entity.PropertyAuditLog;
import com.proptech.properties.service.PropertyAuditService;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/properties/audit")
@Produces(MediaType.APPLICATION_JSON)
public class PropertyAuditResource {

    @Inject
    PropertyAuditService auditService;

    /**
     * Obtiene el historial completo de auditoría de una propiedad
     */
    @GET
    @Path("/property/{propertyId}")
    public Response getPropertyAuditHistory(@PathParam("propertyId") Long propertyId) {
        try {
            List<PropertyAuditLog> auditLogs = auditService.getPropertyAuditHistory(propertyId);
            List<PropertyAuditLogDTO> auditLogDTOs = auditLogs.stream()
                    .map(PropertyAuditLogDTO::new)
                    .collect(Collectors.toList());
            
            return Response.ok(auditLogDTOs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener historial de auditoría: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Obtiene el historial de auditoría por usuario
     */
    @GET
    @Path("/user/{userId}")
    public Response getAuditHistoryByUser(@PathParam("userId") Long userId) {
        try {
            List<PropertyAuditLog> auditLogs = auditService.getAuditHistoryByUser(userId);
            List<PropertyAuditLogDTO> auditLogDTOs = auditLogs.stream()
                    .map(PropertyAuditLogDTO::new)
                    .collect(Collectors.toList());
            
            return Response.ok(auditLogDTOs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener historial de auditoría: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Obtiene el historial de auditoría por rango de fechas
     */
    @GET
    @Path("/date-range")
    public Response getAuditHistoryByDateRange(
            @QueryParam("startDate") String startDate,
            @QueryParam("endDate") String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            
            List<PropertyAuditLog> auditLogs = auditService.getAuditHistoryByDateRange(start, end);
            List<PropertyAuditLogDTO> auditLogDTOs = auditLogs.stream()
                    .map(PropertyAuditLogDTO::new)
                    .collect(Collectors.toList());
            
            return Response.ok(auditLogDTOs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener historial de auditoría: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Obtiene el historial de auditoría por tipo de acción
     */
    @GET
    @Path("/action/{action}")
    public Response getAuditHistoryByAction(@PathParam("action") String action) {
        try {
            PropertyAuditLog.AuditAction auditAction = PropertyAuditLog.AuditAction.valueOf(action.toUpperCase());
            List<PropertyAuditLog> auditLogs = auditService.getAuditHistoryByAction(auditAction);
            List<PropertyAuditLogDTO> auditLogDTOs = auditLogs.stream()
                    .map(PropertyAuditLogDTO::new)
                    .collect(Collectors.toList());
            
            return Response.ok(auditLogDTOs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener historial de auditoría: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Obtiene el último cambio realizado en una propiedad
     */
    @GET
    @Path("/property/{propertyId}/last-change")
    public Response getLastPropertyChange(@PathParam("propertyId") Long propertyId) {
        try {
            PropertyAuditLog lastChange = auditService.getLastPropertyChange(propertyId);
            if (lastChange == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("No se encontraron cambios para la propiedad")
                        .build();
            }
            
            PropertyAuditLogDTO auditLogDTO = new PropertyAuditLogDTO(lastChange);
            return Response.ok(auditLogDTO).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener último cambio: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Obtiene quién creó la propiedad
     */
    @GET
    @Path("/property/{propertyId}/creator")
    public Response getPropertyCreator(@PathParam("propertyId") Long propertyId) {
        try {
            PropertyAuditLog creator = auditService.getPropertyCreator(propertyId);
            if (creator == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("No se encontró información del creador")
                        .build();
            }
            
            PropertyAuditLogDTO auditLogDTO = new PropertyAuditLogDTO(creator);
            return Response.ok(auditLogDTO).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener creador: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Obtiene quién modificó la propiedad por última vez
     */
    @GET
    @Path("/property/{propertyId}/last-modifier")
    public Response getLastPropertyModifier(@PathParam("propertyId") Long propertyId) {
        try {
            PropertyAuditLog lastModifier = auditService.getLastPropertyModifier(propertyId);
            if (lastModifier == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("No se encontró información del último modificador")
                        .build();
            }
            
            PropertyAuditLogDTO auditLogDTO = new PropertyAuditLogDTO(lastModifier);
            return Response.ok(auditLogDTO).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener último modificador: " + e.getMessage())
                    .build();
        }
    }
} 