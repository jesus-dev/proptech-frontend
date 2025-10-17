package com.proptech.contracts.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

import com.proptech.commons.service.SignatureAuditLogService;
import com.proptech.contracts.dto.SignatureAuditLogDTO;

@Path("/api/contracts/signature-audit")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SignatureAuditLogResource {
    
    @Inject
    SignatureAuditLogService signatureAuditLogService;
    
    /**
     * POST - Guardar un nuevo log de auditoría
     */
    @POST
    public Response saveAuditLog(SignatureAuditLogDTO auditLogDTO) {
        try {
            SignatureAuditLogDTO savedLog = signatureAuditLogService.saveAuditLog(auditLogDTO);
            return Response.status(Response.Status.CREATED).entity(savedLog).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Error saving audit log: " + e.getMessage()).build();
        }
    }
    
    /**
     * GET - Obtener todos los logs de auditoría
     */
    @GET
    public Response getAllAuditLogs(@QueryParam("contractId") String contractId) {
        try {
            List<SignatureAuditLogDTO> logs;
            if (contractId != null && !contractId.isEmpty()) {
                logs = signatureAuditLogService.getAuditLogsByContractId(contractId);
            } else {
                logs = signatureAuditLogService.getAllAuditLogs();
            }
            return Response.ok(logs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Error retrieving audit logs: " + e.getMessage()).build();
        }
    }
    
    /**
     * GET - Obtener logs por contractId y tipo de firma
     */
    @GET
    @Path("/contract/{contractId}/type/{signatureType}")
    public Response getAuditLogsByContractAndType(
            @PathParam("contractId") String contractId,
            @PathParam("signatureType") String signatureType) {
        try {
            List<SignatureAuditLogDTO> logs = signatureAuditLogService.getAuditLogsByContractIdAndSignatureType(contractId, signatureType);
            return Response.ok(logs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Error retrieving audit logs: " + e.getMessage()).build();
        }
    }
    
    /**
     * GET - Obtener logs por IP address
     */
    @GET
    @Path("/ip/{ipAddress}")
    public Response getAuditLogsByIpAddress(@PathParam("ipAddress") String ipAddress) {
        try {
            List<SignatureAuditLogDTO> logs = signatureAuditLogService.getAuditLogsByIpAddress(ipAddress);
            return Response.ok(logs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Error retrieving audit logs: " + e.getMessage()).build();
        }
    }
    
    /**
     * GET - Obtener logs por sessionId
     */
    @GET
    @Path("/session/{sessionId}")
    public Response getAuditLogsBySessionId(@PathParam("sessionId") String sessionId) {
        try {
            List<SignatureAuditLogDTO> logs = signatureAuditLogService.getAuditLogsBySessionId(sessionId);
            return Response.ok(logs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Error retrieving audit logs: " + e.getMessage()).build();
        }
    }
    
    /**
     * GET - Obtener logs por rango de fechas
     */
    @GET
    @Path("/date-range")
    public Response getAuditLogsByDateRange(
            @QueryParam("startDate") String startDate,
            @QueryParam("endDate") String endDate) {
        try {
            if (startDate == null || endDate == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("startDate and endDate parameters are required").build();
            }
            
            List<SignatureAuditLogDTO> logs = signatureAuditLogService.getAuditLogsByDateRange(startDate, endDate);
            return Response.ok(logs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Error retrieving audit logs: " + e.getMessage()).build();
        }
    }
    
    /**
     * GET - Obtener estadísticas de auditoría para un contrato
     */
    @GET
    @Path("/stats/{contractId}")
    public Response getAuditStats(@PathParam("contractId") String contractId) {
        try {
            SignatureAuditLogService.SignatureAuditStats stats = signatureAuditLogService.getAuditStats(contractId);
            return Response.ok(stats).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Error retrieving audit stats: " + e.getMessage()).build();
        }
    }
} 