package com.proptech.contracts.resource;

import java.util.List;
import java.util.Map;

import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import com.proptech.contracts.entity.ContractTemplate;
import com.proptech.contracts.service.ContractTemplateService;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/contract-templates")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Contract Templates", description = "Contract template management operations")
public class ContractTemplateResource {
    
    @Inject
    ContractTemplateService templateService;
    
    @GET
    public Response listAll(@QueryParam("type") String type,
                           @QueryParam("isDefault") Boolean isDefault,
                           @QueryParam("isActive") Boolean isActive) {
        try {
            List<ContractTemplate> templates;
            
            if (type != null && !type.trim().isEmpty()) {
                try {
                    ContractTemplate.TemplateType templateType = ContractTemplate.TemplateType.valueOf(type.toUpperCase());
                    templates = templateService.findByType(templateType);
                } catch (IllegalArgumentException e) {
                    return Response.status(Response.Status.BAD_REQUEST)
                            .entity(Map.of("error", "Invalid template type: " + type))
                            .build();
                }
            } else if (Boolean.TRUE.equals(isDefault)) {
                templates = templateService.findDefaultTemplates();
            } else if (Boolean.TRUE.equals(isActive)) {
                templates = templateService.listActive();
            } else {
                templates = templateService.listAll();
            }
            
            return Response.ok(templates).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error retrieving templates: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        try {
            ContractTemplate template = templateService.findById(id);
            return Response.ok(template).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Template not found: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/default/{type}")
    public Response getDefaultByType(@PathParam("type") String type) {
        try {
            ContractTemplate.TemplateType templateType = ContractTemplate.TemplateType.valueOf(type.toUpperCase());
            return templateService.findDefaultByType(templateType)
                    .map(template -> Response.ok(template).build())
                    .orElse(Response.status(Response.Status.NOT_FOUND)
                            .entity(Map.of("error", "No default template found for type: " + type))
                            .build());
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error retrieving default template: " + e.getMessage()))
                    .build();
        }
    }
    
    @POST
    @Transactional
    public Response create(ContractTemplate template) {
        try {
            ContractTemplate created = templateService.create(template);
            return Response.status(Response.Status.CREATED).entity(created).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error creating template: " + e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, ContractTemplate template) {
        try {
            ContractTemplate updated = templateService.update(id, template);
            return Response.ok(updated).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error updating template: " + e.getMessage()))
                    .build();
        }
    }
    
    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        try {
            boolean deleted = templateService.delete(id);
            if (deleted) {
                return Response.noContent().build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Template not found"))
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error deleting template: " + e.getMessage()))
                    .build();
        }
    }
    
    @POST
    @Path("/{id}/duplicate")
    @Transactional
    public Response duplicate(@PathParam("id") Long id, Map<String, String> request) {
        try {
            String newName = request.get("name");
            if (newName == null || newName.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "New name is required"))
                        .build();
            }
            
            ContractTemplate duplicated = templateService.duplicate(id, newName);
            return Response.status(Response.Status.CREATED).entity(duplicated).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error duplicating template: " + e.getMessage()))
                    .build();
        }
    }
    
    @POST
    @Path("/{id}/generate")
    public Response generateContract(@PathParam("id") Long id, Map<String, Object> data) {
        try {
            String generatedContent = templateService.generateContract(id, data);
            return Response.ok(Map.of("content", generatedContent)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error generating contract: " + e.getMessage()))
                    .build();
        }
    }
    
    @POST
    @Path("/seed")
    @Transactional
    public Response seedData() {
        try {
            // Crear plantillas de prueba
            ContractTemplate saleTemplate = new ContractTemplate();
            saleTemplate.setName("Contrato de Compraventa Estándar");
            saleTemplate.setDescription("Plantilla estándar para contratos de compraventa de propiedades");
            saleTemplate.setType(ContractTemplate.TemplateType.SALE);
            saleTemplate.setContent("CONTRATO DE COMPRAVENTA\n\nEntre los suscritos:\nVENDEDOR: {{vendedor_nombre}}\nCOMPRADOR: {{comprador_nombre}}\n\nSe acuerda la venta de la propiedad ubicada en {{propiedad_direccion}} por un valor de {{precio}}.\n\nFirma del Vendedor: _________________\nFirma del Comprador: _________________\n\nFecha: {{fecha_contrato}}");
            saleTemplate.setIsDefault(true);
            saleTemplate.setIsActive(true);
            saleTemplate.setCreatedBy("Sistema");
            templateService.create(saleTemplate);
            
            ContractTemplate rentTemplate = new ContractTemplate();
            rentTemplate.setName("Contrato de Alquiler Residencial");
            rentTemplate.setDescription("Plantilla para contratos de alquiler de viviendas");
            rentTemplate.setType(ContractTemplate.TemplateType.RENT);
            rentTemplate.setContent("CONTRATO DE ALQUILER\n\nPROPIETARIO: {{propietario_nombre}}\nINQUILINO: {{inquilino_nombre}}\nPROPIEDAD: {{propiedad_direccion}}\nRENTA MENSUAL: {{renta_mensual}}\n\nDuración del contrato: {{duracion_meses}} meses.\n\nFirma del Propietario: _________________\nFirma del Inquilino: _________________\n\nFecha: {{fecha_inicio}}");
            rentTemplate.setIsDefault(true);
            rentTemplate.setIsActive(true);
            rentTemplate.setCreatedBy("Sistema");
            templateService.create(rentTemplate);
            
            ContractTemplate brokerageTemplate = new ContractTemplate();
            brokerageTemplate.setName("Contrato de Corretaje");
            brokerageTemplate.setDescription("Plantilla para contratos de corretaje inmobiliario");
            brokerageTemplate.setType(ContractTemplate.TemplateType.BROKERAGE);
            brokerageTemplate.setContent("CONTRATO DE CORRETAJE\n\nCLIENTE: {{cliente_nombre}}\nCORREDOR: {{corredor_nombre}}\nPROPIEDAD: {{propiedad_direccion}}\nCOMISIÓN: {{comision_porcentaje}}%\n\nEl corredor se compromete a gestionar la venta/alquiler de la propiedad.\n\nFirma del Cliente: _________________\nFirma del Corredor: _________________\n\nFecha: {{fecha_contrato}}");
            brokerageTemplate.setIsDefault(true);
            brokerageTemplate.setIsActive(true);
            brokerageTemplate.setCreatedBy("Sistema");
            templateService.create(brokerageTemplate);
            
            return Response.ok(Map.of("message", "Datos de prueba creados exitosamente", "count", 3)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Error creando datos de prueba: " + e.getMessage()))
                    .build();
        }
    }
} 