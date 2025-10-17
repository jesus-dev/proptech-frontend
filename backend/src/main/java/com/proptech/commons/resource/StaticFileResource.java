package com.proptech.commons.resource;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.StreamingOutput;

import org.eclipse.microprofile.config.inject.ConfigProperty;

@jakarta.ws.rs.Path("/uploads")
@ApplicationScoped
public class StaticFileResource {
    
    // Endpoint para servir archivos de PropShots desde múltiples ubicaciones
    @GET
    @jakarta.ws.rs.Path("/prop-shots/media/{filename}")
    public Response servePropShotMedia(@PathParam("filename") String filename) {
        // Buscar el archivo en múltiples ubicaciones posibles - respetando la estructura existente
        String[] possiblePaths = {
            "uploads/social/propshots/" + filename,  // Estructura principal
            "uploads/prop-shots/media/" + filename,  // Para compatibilidad con URLs existentes
            "uploads/social/propshots/videos/" + filename,  // Para compatibilidad
            "uploads/" + filename
        };
        
        for (String path : possiblePaths) {
            Path filePath = Paths.get(path);
            File file = filePath.toFile();
            
            if (file.exists() && file.canRead()) {
                // Determinar el tipo de contenido
                String contentType = determineContentType(filename);
                
                // Crear un StreamingOutput para servir el archivo
                StreamingOutput stream = output -> {
                    try (InputStream inputStream = new FileInputStream(file)) {
                        byte[] buffer = new byte[8192];
                        int bytesRead;
                        while ((bytesRead = inputStream.read(buffer)) != -1) {
                            output.write(buffer, 0, bytesRead);
                        }
                    }
                };
                
                return Response.ok(stream)
                    .type(contentType)
                    .header("Cache-Control", "public, max-age=31536000")
                    .header("Content-Length", file.length())
                    .build();
            }
        }
        
        // Si no se encuentra el archivo, devolver 404
        return Response.status(Response.Status.NOT_FOUND)
            .entity("File not found: " + filename + " (searched in: " + String.join(", ", possiblePaths) + ")")
            .build();
    }
    


    @ConfigProperty(name = "file.upload.path", defaultValue = "uploads")
    String uploadPath;

    @GET
    @jakarta.ws.rs.Path("/{path:.*}")
    public Response serveFile(@PathParam("path") String filePath) {
        try {
            // Construir la ruta completa del archivo
            Path fullPath = Paths.get(uploadPath, filePath);
            File file = fullPath.toFile();

            // Verificar que el archivo existe y es legible
            if (!file.exists() || !file.canRead()) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity("File not found: " + filePath)
                    .build();
            }

            // Verificar que no es un directorio
            if (file.isDirectory()) {
                return Response.status(Response.Status.FORBIDDEN)
                    .entity("Cannot serve directory: " + filePath)
                    .build();
            }

            // Determinar el tipo de contenido basado en la extensión
            String contentType = determineContentType(filePath);

            // Crear un StreamingOutput para servir el archivo
            StreamingOutput stream = output -> {
                try (InputStream inputStream = new FileInputStream(file)) {
                    byte[] buffer = new byte[8192];
                    int bytesRead;
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        output.write(buffer, 0, bytesRead);
                    }
                }
            };

            return Response.ok(stream)
                .type(contentType)
                .header("Cache-Control", "public, max-age=31536000") // Cache por 1 año
                .header("Content-Length", file.length())
                .build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error serving file: " + e.getMessage())
                .build();
        }
    }

    private String determineContentType(String filePath) {
        String extension = filePath.substring(filePath.lastIndexOf('.') + 1).toLowerCase();
        
        switch (extension) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "webp":
                return "image/webp";
            case "avif":
                return "image/avif";
            case "pdf":
                return "application/pdf";
            case "txt":
                return "text/plain";
            case "html":
            case "htm":
                return "text/html";
            case "css":
                return "text/css";
            case "js":
                return "application/javascript";
            case "xml":
                return "application/xml";
            case "json":
                return "application/json";
            // Formatos de video
            case "mp4":
                return "video/mp4";
            case "mov":
                return "video/quicktime";
            case "avi":
                return "video/x-msvideo";
            case "wmv":
                return "video/x-ms-wmv";
            case "flv":
                return "video/x-flv";
            case "webm":
                return "video/webm";
            case "mkv":
                return "video/x-matroska";
            case "3gp":
                return "video/3gpp";
            case "m4v":
                return "video/x-m4v";
            default:
                return "application/octet-stream";
        }
    }
} 