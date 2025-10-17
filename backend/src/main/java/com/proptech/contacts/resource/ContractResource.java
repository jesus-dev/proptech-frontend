package com.proptech.contacts.resource;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.proptech.commons.service.SignatureAuditLogService;
import com.proptech.contracts.dto.SignatureAuditLogDTO;
import com.proptech.contracts.entity.Contract;
import com.proptech.contracts.service.ContractService;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/contracts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Contracts", description = "Contract management operations")
public class ContractResource {
    @Inject
    ContractService contractService;
    
    @Inject
    SignatureAuditLogService signatureAuditLogService;

    @GET
    public Response listAll() {
        List<Contract> contracts = contractService.listAll();
        return Response.ok(contracts).build();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {

        Contract contract = contractService.findById(id);
        if (contract == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        
        // Retornar el contrato tal como está en la base de datos
        // Los datos de auditoría se procesan solo cuando se guardan las firmas
        
        
        return Response.ok(contract).build();
    }

    @POST
    @Transactional
    public Response create(Contract contract) {
        Contract created = contractService.create(contract);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, Contract contract) {
        try {
            Contract updated = contractService.update(id, contract);
            if (updated == null) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
            return Response.ok(updated).build();
        } catch (IllegalStateException e) {
            // Contrato firmado, no se puede modificar
            return Response.status(Response.Status.CONFLICT)
                .entity(Map.of(
                    "error", "CONTRACT_ALREADY_SIGNED",
                    "message", e.getMessage(),
                    "contractId", id
                ))
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(
                    "error", "UPDATE_ERROR",
                    "message", "Error al actualizar el contrato: " + e.getMessage()
                ))
                .build();
        }
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = contractService.delete(id);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.noContent().build();
    }

    @POST
    @Path("/signatures")
    @Transactional
    public Response saveSignature(Map<String, Object> signatureData) {
        try {
    
            
            String contractId = signatureData.get("contractId").toString();
            String signerType = signatureData.get("signerType").toString();
            String signature = signatureData.get("signature").toString();
            String timestamp = signatureData.get("timestamp").toString();
            String ipAddress = (String) signatureData.getOrDefault("ipAddress", "N/A");
            
            @SuppressWarnings("unchecked")
            Map<String, Object> deviceInfo = (Map<String, Object>) signatureData.getOrDefault("deviceInfo", Map.of());
            @SuppressWarnings("unchecked")
            Map<String, Object> signatureDataMap = (Map<String, Object>) signatureData.getOrDefault("signatureData", Map.of());
            @SuppressWarnings("unchecked")
            Map<String, Object> sessionInfo = (Map<String, Object>) signatureData.getOrDefault("sessionInfo", Map.of());



            // Helper para obtener campo con variantes de case
            java.util.function.BiFunction<Map<String, Object>, String, Object> getField = (map, key) -> {
                if (map.containsKey(key)) return map.get(key);
                String alt = key.substring(0,1).toUpperCase() + key.substring(1);
                if (map.containsKey(alt)) return map.get(alt);
                return null;
            };

            // Crear el DTO de auditoría
            SignatureAuditLogDTO auditLogDTO = new SignatureAuditLogDTO();
            auditLogDTO.setContractId(contractId);
            auditLogDTO.setSignatureType(signerType.toUpperCase());
            auditLogDTO.setEventType("CREATED");
            
            // Parsear timestamp
            if (timestamp.endsWith("Z")) {
                auditLogDTO.setTimestamp(java.time.OffsetDateTime.parse(timestamp).toLocalDateTime());
            } else {
                auditLogDTO.setTimestamp(java.time.LocalDateTime.parse(timestamp));
            }
            
            auditLogDTO.setIpAddress(ipAddress);
            auditLogDTO.setUserAgent((String) getField.apply(deviceInfo, "userAgent"));
            auditLogDTO.setPlatform((String) getField.apply(deviceInfo, "platform"));
            auditLogDTO.setLanguage((String) getField.apply(deviceInfo, "language"));
            auditLogDTO.setScreenResolution((String) getField.apply(deviceInfo, "screenResolution"));
            auditLogDTO.setTimezone((String) getField.apply(deviceInfo, "timezone"));
            auditLogDTO.setBrowser((String) getField.apply(deviceInfo, "browser"));
            auditLogDTO.setBrowserVersion((String) getField.apply(deviceInfo, "browserVersion"));
            auditLogDTO.setSessionId((String) getField.apply(sessionInfo, "sessionId"));
            auditLogDTO.setPageUrl((String) getField.apply(sessionInfo, "pageUrl"));
            auditLogDTO.setReferrer((String) getField.apply(sessionInfo, "referrer"));
            
            // Canvas size
            Object canvasSize = getField.apply(signatureDataMap, "canvasSize");
            if (canvasSize instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> canvasMap = (Map<String, Object>) canvasSize;
                Object width = canvasMap.get("width");
                Object height = canvasMap.get("height");
                if (width instanceof Number) auditLogDTO.setCanvasWidth(((Number) width).intValue());
                if (height instanceof Number) auditLogDTO.setCanvasHeight(((Number) height).intValue());
            }
            
            // Signature data
            String sigHash = (String) getField.apply(signatureDataMap, "signatureHash");
            Object sigLength = getField.apply(signatureDataMap, "signatureLength");
            
            if (sigHash != null) {
                auditLogDTO.setSignatureHash(sigHash);
            } else {
                auditLogDTO.setSignatureHash(String.valueOf(signature.hashCode()));
            }
            
            if (sigLength instanceof Number) {
                auditLogDTO.setSignatureLength(((Number) sigLength).intValue());
            } else {
                auditLogDTO.setSignatureLength(signature.length());
            }
            

            
            // Guardar la auditoría
            SignatureAuditLogDTO savedLog = signatureAuditLogService.saveAuditLog(auditLogDTO);

            
            // Serializar el DTO a JSON (con soporte para fechas)
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            
            // Crear la estructura anidada que espera el frontend

            Map<String, Object> nestedAuditData = new HashMap<>();
            nestedAuditData.put("timestamp", auditLogDTO.getTimestamp().toString());
            nestedAuditData.put("ipAddress", auditLogDTO.getIpAddress());
            nestedAuditData.put("userAgent", auditLogDTO.getUserAgent());
            
            // deviceInfo

            Map<String, Object> nestedDeviceInfo = new HashMap<>();
            nestedDeviceInfo.put("platform", auditLogDTO.getPlatform());
            nestedDeviceInfo.put("browser", auditLogDTO.getBrowser());
            nestedDeviceInfo.put("browserVersion", auditLogDTO.getBrowserVersion());
            nestedDeviceInfo.put("screenResolution", auditLogDTO.getScreenResolution());
            nestedDeviceInfo.put("timezone", auditLogDTO.getTimezone());
            nestedDeviceInfo.put("language", auditLogDTO.getLanguage());
            nestedAuditData.put("deviceInfo", nestedDeviceInfo);
            
            // sessionInfo

            Map<String, Object> nestedSessionInfo = new HashMap<>();
            nestedSessionInfo.put("sessionId", auditLogDTO.getSessionId());
            nestedSessionInfo.put("pageUrl", auditLogDTO.getPageUrl());
            nestedSessionInfo.put("referrer", auditLogDTO.getReferrer());
            nestedAuditData.put("sessionInfo", nestedSessionInfo);
            
            // signatureData

            Map<String, Object> nestedSignatureData = new HashMap<>();
            Map<String, Object> nestedCanvasSize = new HashMap<>();
            nestedCanvasSize.put("width", auditLogDTO.getCanvasWidth());
            nestedCanvasSize.put("height", auditLogDTO.getCanvasHeight());
            nestedSignatureData.put("canvasSize", nestedCanvasSize);
            nestedSignatureData.put("signatureHash", auditLogDTO.getSignatureHash());
            nestedSignatureData.put("signatureLength", auditLogDTO.getSignatureLength());
            nestedAuditData.put("signatureData", nestedSignatureData);
            
            // Convertir la estructura anidada a JSON

            String nestedAuditJson = mapper.writeValueAsString(nestedAuditData);

            
            // Actualizar el contrato con la firma usando el método específico para firmas
            Contract updatedContract = contractService.saveSignature(Long.valueOf(contractId), signature, nestedAuditJson, signerType);
            if (updatedContract != null) {
    
            } else {
                throw new RuntimeException("No se pudo guardar la firma: contrato no encontrado");
            }
            
            return Response.ok(Map.of(
                "success", true,
                "message", "Firma guardada exitosamente",
                "signatureId", savedLog.getId()
            )).build();
            
        } catch (Exception e) {

            e.printStackTrace();
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", "Error al guardar la firma: " + e.getMessage()))
                .build();
        }
    }

    @PATCH
    @Path("/{id}/status")
    @Transactional
    public Response updateStatus(@PathParam("id") Long id, Map<String, String> statusData) {
        try {
            String newStatus = statusData.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of(
                        "error", "MISSING_STATUS",
                        "message", "El estado del contrato es requerido"
                    ))
                    .build();
            }

            Contract updatedContract = contractService.updateStatus(id, newStatus);
            if (updatedContract == null) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of(
                        "error", "CONTRACT_NOT_FOUND",
                        "message", "Contrato no encontrado"
                    ))
                    .build();
            }

            return Response.ok(updatedContract).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of(
                    "error", "UPDATE_STATUS_ERROR",
                    "message", "Error al actualizar el estado del contrato: " + e.getMessage()
                ))
                .build();
        }
    }

    @GET
    @Path("/{id}/can-modify")
    public Response canModify(@PathParam("id") Long id) {
        try {
            boolean canModify = contractService.canContractBeModified(id);
            String reason = contractService.getContractModificationReason(id);
            
            return Response.ok(Map.of(
                "canModify", canModify,
                "reason", reason,
                "contractId", id
            )).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of(
                    "error", "CHECK_ERROR",
                    "message", "Error al verificar si el contrato puede ser modificado: " + e.getMessage()
                ))
                .build();
        }
    }
} 