package com.proptech.ownersproperty.controller;

// import com.proptech.ownersproperty.dto.PropertyReportMetricsDTO;
import com.proptech.ownersproperty.entity.Owner;
import com.proptech.ownersproperty.entity.OwnerProperty;
import com.proptech.ownersproperty.entity.OwnerReport;
import com.proptech.ownersproperty.service.OwnersPropertyService;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

import java.util.List;

@Path("/api/owners-property")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Gestión de Propiedades de Propietarios", description = "API para gestionar propiedades de propietarios y generar reportes")
public class OwnersPropertyController {
    
    private static final Logger LOG = Logger.getLogger(OwnersPropertyController.class);
    
    @Inject
    OwnersPropertyService ownersPropertyService;
    
    // ===== GESTIÓN DE PROPIEDADES DEL PROPIETARIO =====
    
    @GET
    @Path("/owners/{ownerId}/properties")
    @Operation(summary = "Obtener propiedades de un propietario", 
               description = "Retorna todas las propiedades asociadas a un propietario específico")
    public Response getOwnerProperties(@PathParam("ownerId") Long ownerId) {
        try {
            LOG.info("Obteniendo propiedades del propietario: " + ownerId);
            
            List<OwnerProperty> properties = ownersPropertyService.getOwnerProperties(ownerId);
            
            return Response.ok(properties).build();
        } catch (Exception e) {
            LOG.error("Error obteniendo propiedades del propietario: " + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error interno del servidor: " + e.getMessage())
                    .build();
        }
    }
    
    @GET
    @Path("/owners/{ownerId}/properties/active")
    @Operation(summary = "Obtener propiedades activas de un propietario", 
               description = "Retorna solo las propiedades activas de un propietario")
    public Response getActiveOwnerProperties(@PathParam("ownerId") Long ownerId) {
        try {
            LOG.info("Obteniendo propiedades activas del propietario: " + ownerId);
            
            List<OwnerProperty> properties = ownersPropertyService.getActiveOwnerProperties(ownerId);
            
            return Response.ok(properties).build();
        } catch (Exception e) {
            LOG.error("Error obteniendo propiedades activas del propietario: " + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error interno del servidor: " + e.getMessage())
                    .build();
        }
    }
    
    @POST
    @Path("/owners/{ownerId}/properties")
    @Operation(summary = "Agregar propiedad a un propietario", 
               description = "Asocia una nueva propiedad a un propietario existente")
    public Response addPropertyToOwner(@PathParam("ownerId") Long ownerId, 
                                     @QueryParam("propertyId") Long propertyId,
                                     @QueryParam("ownershipType") String ownershipType,
                                     @QueryParam("ownershipPercentage") Double ownershipPercentage) {
        try {
            LOG.info("Agregando propiedad " + propertyId + " al propietario " + ownerId);
            
            OwnerProperty.OwnershipType type = OwnerProperty.OwnershipType.valueOf(ownershipType.toUpperCase());
            
            OwnerProperty ownerProperty = ownersPropertyService.addPropertyToOwner(
                ownerId, propertyId, type, ownershipPercentage
            );
            
            return Response.status(Response.Status.CREATED)
                    .entity(ownerProperty)
                    .build();
        } catch (IllegalArgumentException e) {
            LOG.warn("Error de validación: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Error de validación: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            LOG.error("Error agregando propiedad al propietario: " + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error interno del servidor: " + e.getMessage())
                    .build();
        }
    }
    
    @DELETE
    @Path("/owners/{ownerId}/properties/{propertyId}")
    @Operation(summary = "Remover propiedad de un propietario", 
               description = "Elimina la asociación entre una propiedad y un propietario")
    public Response removePropertyFromOwner(@PathParam("ownerId") Long ownerId, 
                                         @PathParam("propertyId") Long propertyId) {
        try {
            LOG.info("Removiendo propiedad " + propertyId + " del propietario " + ownerId);
            
            boolean removed = ownersPropertyService.removePropertyFromOwner(ownerId, propertyId);
            
            if (removed) {
                return Response.ok("Propiedad removida del propietario exitosamente").build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("No se pudo remover la propiedad")
                        .build();
            }
        } catch (IllegalArgumentException e) {
            LOG.warn("Error de validación: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Error de validación: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            LOG.error("Error removiendo propiedad del propietario: " + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error interno del servidor: " + e.getMessage())
                    .build();
        }
    }
    
    // ===== GENERACIÓN DE REPORTES POR PROPIEDADES =====
    
    @POST
    @Path("/owners/{ownerId}/reports/generate")
    @Operation(summary = "Generar reporte detallado por propiedades", 
               description = "Genera un reporte completo enfocado en las propiedades del propietario")
    public Response generateDetailedPropertyReport(@PathParam("ownerId") Long ownerId,
                                                @QueryParam("period") String period) {
        try {
            LOG.info("Generando reporte detallado por propiedades para propietario: " + ownerId);
            
            if (period == null || period.trim().isEmpty()) {
                period = "Período Actual"; // Período por defecto
            }
            
            OwnerReport report = ownersPropertyService.generateDetailedPropertyReport(ownerId, period);
            
            return Response.status(Response.Status.CREATED)
                    .entity(report)
                    .build();
        } catch (IllegalArgumentException e) {
            LOG.warn("Error de validación: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Error de validación: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            LOG.error("Error generando reporte detallado: " + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error interno del servidor: " + e.getMessage())
                    .build();
        }
    }
    
    @GET
    @Path("/owners/{ownerId}/reports")
    @Operation(summary = "Obtener reportes de un propietario", 
               description = "Retorna todos los reportes generados para un propietario")
    public Response getOwnerReports(@PathParam("ownerId") Long ownerId) {
        try {
            LOG.info("Obteniendo reportes del propietario: " + ownerId);
            
            List<OwnerReport> reports = ownersPropertyService.getOwnerReports(ownerId);
            
            return Response.ok(reports).build();
        } catch (Exception e) {
            LOG.error("Error obteniendo reportes del propietario: " + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error interno del servidor: " + e.getMessage())
                    .build();
        }
    }
    
    @GET
    @Path("/reports/{reportId}")
    @Operation(summary = "Obtener reporte específico", 
               description = "Retorna un reporte específico por su ID")
    public Response getOwnerReport(@PathParam("reportId") Long reportId) {
        try {
            LOG.info("Obteniendo reporte: " + reportId);
            
            OwnerReport report = ownersPropertyService.getOwnerReport(reportId);
            
            if (report == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Reporte no encontrado")
                        .build();
            }
            
            return Response.ok(report).build();
        } catch (Exception e) {
            LOG.error("Error obteniendo reporte: " + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error interno del servidor: " + e.getMessage())
                    .build();
        }
    }
    
    @GET
    @Path("/owners/{ownerId}/reports/latest")
    @Operation(summary = "Obtener último reporte de un propietario", 
               description = "Retorna el reporte más reciente de un propietario")
    public Response getLatestOwnerReport(@PathParam("ownerId") Long ownerId) {
        try {
            LOG.info("Obteniendo último reporte del propietario: " + ownerId);
            
            OwnerReport report = ownersPropertyService.getLatestOwnerReport(ownerId);
            
            if (report == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("No se encontraron reportes para este propietario")
                        .build();
            }
            
            return Response.ok(report).build();
        } catch (Exception e) {
            LOG.error("Error obteniendo último reporte: " + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error interno del servidor: " + e.getMessage())
                    .build();
        }
    }
    
    // ===== ENDPOINTS ADICIONALES =====
    
    @GET
    @Path("/owners")
    @Operation(summary = "Listar todos los propietarios", 
               description = "Retorna una lista paginada de todos los propietarios")
    public Response getAllOwners(@QueryParam("page") @DefaultValue("0") int page,
                                @QueryParam("size") @DefaultValue("20") int size) {
        try {
            LOG.info("Listando propietarios - página: " + page + ", tamaño: " + size);
            
            PanacheQuery<Owner> query = Owner.findAll();
            List<Owner> owners = query.page(page, size).list();
            
            return Response.ok(owners).build();
        } catch (Exception e) {
            LOG.error("Error listando propietarios: " + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error interno del servidor: " + e.getMessage())
                    .build();
        }
    }
    
    @GET
    @Path("/owners/{ownerId}")
    @Operation(summary = "Obtener propietario por ID", 
               description = "Retorna la información completa de un propietario")
    public Response getOwnerById(@PathParam("ownerId") Long ownerId) {
        try {
            LOG.info("Obteniendo propietario: " + ownerId);
            
            Owner owner = Owner.findById(ownerId);
            
            if (owner == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Propietario no encontrado")
                        .build();
            }
            
            return Response.ok(owner).build();
        } catch (Exception e) {
            LOG.error("Error obteniendo propietario: " + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error interno del servidor: " + e.getMessage())
                    .build();
        }
    }
}
