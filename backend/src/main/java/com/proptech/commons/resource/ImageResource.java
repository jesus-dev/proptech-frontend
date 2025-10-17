package com.proptech.commons.resource;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.StreamingOutput;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.file.Paths;

@Path("/api/images")
@Produces(MediaType.APPLICATION_OCTET_STREAM)
public class ImageResource {

    @ConfigProperty(name = "quarkus.http.port", defaultValue = "8080")
    String httpPort;

    @GET
    @Path("/{type}/{filename}")
    public Response getImage(@PathParam("type") String type, @PathParam("filename") String filename) {
        try {
            // Construir la ruta del archivo
            String uploadsDir = System.getProperty("user.dir") + "/uploads";
            java.nio.file.Path filePath = Paths.get(uploadsDir, type, filename);
            File file = filePath.toFile();

            // Verificar que el archivo existe
            if (!file.exists() || !file.isFile()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Image not found: " + filename)
                        .type(MediaType.TEXT_PLAIN)
                        .build();
            }

            // Determinar el tipo MIME basado en la extensión del archivo
            String contentType = determineContentType(filename);
            
            // Leer y devolver el archivo
            StreamingOutput stream = output -> {
                try (InputStream inputStream = new FileInputStream(file)) {
                    byte[] buffer = new byte[4096];
                    int bytesRead;
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        output.write(buffer, 0, bytesRead);
                    }
                }
            };

            return Response.ok(stream)
                    .type(contentType)
                    .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                    .build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error serving image: " + e.getMessage())
                    .type(MediaType.TEXT_PLAIN)
                    .build();
        }
    }

    private String determineContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "avif" -> "image/avif";
            default -> "application/octet-stream";
        };
    }
}
