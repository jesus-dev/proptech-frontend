package com.proptech.social.resource;

import com.proptech.social.entity.PropShot;
import com.proptech.social.service.PropShotService;
import com.proptech.social.dto.PropShotCreateRequestDTO;
import com.proptech.social.dto.PropShotResponseDTO;
import com.proptech.social.mapper.PropShotMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Path("/api/social/propshots")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "PropShots", description = "API para gestión de PropShots")
public class PropShotResource {

    @Inject
    PropShotService propShotService;
    
    @Inject
    PropShotMapper propShotMapper;

    // Obtener todos los PropShots
    @GET
    @Operation(summary = "Obtener todos los PropShots")
    public Response getAllPropShots() {
        try {
            List<PropShot> propShots = propShotService.getAllPropShots();
            List<PropShotResponseDTO> responseDTOs = propShots.stream()
                    .map(propShotMapper::toResponseDTO)
                    .toList();
            return Response.ok(responseDTOs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener PropShots: " + e.getMessage())
                    .build();
        }
    }

    // Obtener PropShots por usuario
    @GET
    @Path("/user/{userId}")
    @Operation(summary = "Obtener PropShots por usuario")
    public Response getPropShotsByUser(@PathParam("userId") Long userId) {
        try {
            List<PropShotResponseDTO> propShots = propShotService.getPropShotsByUser(userId);
            return Response.ok(propShots).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al obtener PropShots del usuario: " + e.getMessage())
                    .build();
        }
    }

    // Obtener un PropShot por ID
    @GET
    @Path("/{id}")
    @Operation(summary = "Obtener PropShot por ID")
    public Response getPropShotById(@PathParam("id") Long id) {
        try {
            PropShot propShot = propShotService.getPropShotById(id);
            PropShotResponseDTO responseDTO = propShotMapper.toResponseDTO(propShot);
            return Response.ok(responseDTO).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("PropShot no encontrado: " + e.getMessage())
                    .build();
        }
    }

    // Crear nuevo PropShot
    @POST
    @Operation(summary = "Crear nuevo PropShot")
    public Response createPropShot(PropShotCreateRequestDTO createRequest) {
        try {
            System.out.println("🔍 DEBUG: Iniciando creación de PropShot desde DTO");
            System.out.println("🔍 DEBUG: Title: " + createRequest.title);
            System.out.println("🔍 DEBUG: Description: " + createRequest.description);
            System.out.println("🔍 DEBUG: VideoUrl: " + createRequest.videoUrl);
            System.out.println("🔍 DEBUG: UserId: " + createRequest.userId);
            
            PropShotResponseDTO responseDTO = propShotService.createPropShotFromDTO(createRequest);
            
            System.out.println("✅ DEBUG: PropShot creado exitosamente: " + responseDTO.id);
            return Response.status(Response.Status.CREATED).entity(responseDTO).build();
        } catch (Exception e) {
            System.err.println("❌ ERROR en createPropShot: " + e.getMessage());
            System.err.println("❌ ERROR Stack trace:");
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al crear PropShot: " + e.getMessage())
                    .build();
        }
    }

    // Actualizar PropShot
    @PUT
    @Path("/{id}")
    @Operation(summary = "Actualizar PropShot")
    public Response updatePropShot(@PathParam("id") Long id, PropShot propShot) {
        try {
            propShot.setId(id);
            PropShot updated = propShotService.updatePropShot(propShot);
            return Response.ok(updated).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al actualizar PropShot: " + e.getMessage())
                    .build();
        }
    }

    // Eliminar PropShot
    @DELETE
    @Path("/{id}")
    @Operation(summary = "Eliminar PropShot")
    public Response deletePropShot(@PathParam("id") Long id) {
        try {
            propShotService.deletePropShot(id);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al eliminar PropShot: " + e.getMessage())
                    .build();
        }
    }

    // Upload de video
    @POST
    @Path("/upload/video")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Operation(summary = "Subir video para PropShot")
    public Response uploadVideo(@FormParam("video") InputStream video, @FormParam("fileName") String fileName) {
        try {
            System.out.println("🔍 Upload iniciado - fileName: " + fileName);
            System.out.println("🔍 Video stream: " + (video != null ? "NO NULL" : "NULL"));
            System.out.println("🔍 Content-Type: " + MediaType.MULTIPART_FORM_DATA);
            
            if (video == null) {
                System.err.println("❌ ERROR: Video stream es NULL");
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Video stream no puede ser null")
                    .build();
            }
            
            if (fileName == null || fileName.trim().isEmpty()) {
                System.err.println("❌ ERROR: fileName es null o vacío");
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("fileName no puede ser null o vacío")
                    .build();
            }
            
            // Verificar que el stream tenga contenido
            try {
                int available = video.available();
                System.out.println("🔍 Bytes disponibles en stream: " + available);
                if (available == 0) {
                    System.err.println("❌ ERROR: Stream vacío (0 bytes disponibles)");
                    return Response.status(Response.Status.BAD_REQUEST)
                        .entity("El archivo de video está vacío")
                        .build();
                }
            } catch (IOException e) {
                System.err.println("❌ ERROR verificando stream: " + e.getMessage());
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Error verificando el archivo de video: " + e.getMessage())
                    .build();
            }
            
            String videoUrl = propShotService.uploadVideo(video, fileName);
            System.out.println("✅ Video subido exitosamente: " + videoUrl);
            return Response.ok(videoUrl).build();
        } catch (Exception e) {
            System.err.println("❌ ERROR en uploadVideo: " + e.getMessage());
            e.printStackTrace();
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Error al subir video: " + e.getMessage())
                .build();
        }
    }

    // Upload de thumbnail
    @POST
    @Path("/upload/thumbnail")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Operation(summary = "Subir thumbnail para PropShot")
    public Response uploadThumbnail(@FormParam("thumbnail") InputStream thumbnail, @FormParam("fileName") String fileName) {
        try {
            String thumbnailUrl = propShotService.uploadThumbnail(thumbnail, fileName);
            return Response.ok(thumbnailUrl).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Error al subir thumbnail: " + e.getMessage())
                    .build();
        }
    }

    // Dar like a un PropShot
    @POST
    @Path("/{id}/like")
    @Operation(summary = "Dar like a un PropShot")
    public Response likePropShot(@PathParam("id") Long id) {
        try {
            propShotService.likePropShot(id);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al dar like: " + e.getMessage())
                    .build();
        }
    }

    // Incrementar vistas
    @POST
    @Path("/{id}/view")
    @Operation(summary = "Incrementar vistas de un PropShot")
    public Response incrementViews(@PathParam("id") Long id) {
        try {
            propShotService.incrementViews(id);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al incrementar vistas: " + e.getMessage())
                    .build();
        }
    }


}
