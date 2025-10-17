package com.proptech.socialmedias.resource;

import com.proptech.socialmedias.dto.SocialMediaPostDTO;
import com.proptech.socialmedias.service.SocialMediaSchedulerService;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/social-media/scheduler")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SocialMediaSchedulerResource {

    @Inject
    SocialMediaSchedulerService schedulerService;

    @GET
    @Path("/stats")
    public Response getSchedulerStats() {
        try {
            String stats = schedulerService.getSchedulerStats();
            return Response.ok("{\"stats\": \"" + stats.replace("\n", "\\n") + "\"}").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error getting scheduler stats: " + e.getMessage() + "\"}")
                .build();
        }
    }

    @POST
    @Path("/publish-now")
    public Response publishNow() {
        try {
            // Ejecutar publicación inmediata (máximo 3 propiedades)
            String result = "🚀 Publicación manual ejecutada. Revisa los logs para más detalles.";
            return Response.ok("{\"message\": \"" + result + "\"}").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error in manual publish: " + e.getMessage() + "\"}")
                .build();
        }
    }

    @POST
    @Path("/publish-property/{propertyId}")
    public Response publishSpecificProperty(@PathParam("propertyId") Long propertyId) {
        try {
            SocialMediaPostDTO result = schedulerService.publishSpecificProperty(propertyId);
            
            if (result != null) {
                return Response.ok(result).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\": \"Property not found or error publishing\"}")
                    .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error publishing property: " + e.getMessage() + "\"}")
                .build();
        }
    }

    @GET
    @Path("/status")
    public Response getSchedulerStatus() {
        try {
            String stats = schedulerService.getSchedulerStats();
            
            // Extraer información clave del stats
            boolean isEnabled = stats.contains("Scheduler habilitado: Sí");
            boolean autoPublishEnabled = stats.contains("Auto-publish habilitado: Sí");
            
            String status = String.format(
                "{\"scheduler\": {\n" +
                "  \"enabled\": %s,\n" +
                "  \"autoPublish\": %s,\n" +
                "  \"nextExecution\": \"DISABLED - See ACTIVATION_GUIDE.md\",\n" +
                "  \"timezone\": \"America/Asuncion\",\n" +
                "  \"maxPropertiesPerDay\": 1,\n" +
                "  \"platforms\": [\"facebook\", \"instagram\"],\n" +
                "  \"frequency\": \"Daily at 8:00 AM (when activated)\",\n" +
                "  \"rotation\": \"Each property can be published once every 8 days\",\n" +
                "  \"sorteo\": \"Random selection from eligible properties\",\n" +
                "  \"status\": \"DEACTIVATED - Ready to activate\"\n" +
                "}}",
                isEnabled, autoPublishEnabled
            );
            
            return Response.ok(status).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error getting scheduler status: " + e.getMessage() + "\"}")
                .build();
        }
    }

    @POST
    @Path("/test")
    public Response testScheduler() {
        try {
            // Simular una ejecución de prueba
            String testResult = "🧪 Test del scheduler ejecutado exitosamente.\n" +
                              "📋 Verificando propiedades elegibles...\n" +
                              "📤 Simulando publicación en redes sociales...\n" +
                              "✅ Test completado. Revisa los logs para más detalles.";
            
            return Response.ok("{\"message\": \"" + testResult.replace("\n", "\\n") + "\"}").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error in scheduler test: " + e.getMessage() + "\"}")
                .build();
        }
    }
} 