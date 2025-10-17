package com.proptech.social.resource;

import com.proptech.social.entity.SocialPost;
import com.proptech.social.entity.SocialPostComment;
import com.proptech.social.entity.SocialPostLike;
import com.proptech.auth.entity.User;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.time.LocalDateTime;
import java.time.Duration;
import java.time.format.DateTimeFormatter;


@Path("/api/social")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SocialResource {

    @GET
    @Path("/posts")
    public List<SocialPost> list(@QueryParam("page") @DefaultValue("0") int page,
                                  @QueryParam("size") @DefaultValue("20") int size) {
        List<SocialPost> posts = SocialPost.find("order by createdAt desc").page(page, size).list();
        
        // Enriquecer posts con información del agente y tiempo formateado
        for (SocialPost post : posts) {
            enrichPostData(post);
        }
        
        return posts;
    }
    
    private void enrichPostData(SocialPost post) {
        try {
            // Formatear tiempo
            post.setTime(formatTimeAgo(post.getCreatedAt()));
            
        } catch (Exception e) {
            System.err.println("Error enriqueciendo datos del post " + post.getId() + ": " + e.getMessage());
        }
    }
    
    private String formatTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "Recién";
        
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(dateTime, now);
        
        if (duration.toMinutes() < 1) return "Recién";
        if (duration.toHours() < 1) return "hace " + duration.toMinutes() + " min";
        if (duration.toDays() < 1) return "hace " + duration.toHours() + "h";
        if (duration.toDays() < 7) return "hace " + duration.toDays() + " días";
        
        return dateTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }



    @PUT
    @Path("/posts/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, Map<String, Object> body) {
        SocialPost p = SocialPost.findById(id);
        if (p == null) return Response.status(Response.Status.NOT_FOUND).build();
        if (body.containsKey("content")) p.setContent((String) body.get("content"));
        if (body.containsKey("linkUrl")) p.setLinkUrl((String) body.get("linkUrl"));
        if (body.containsKey("linkTitle")) p.setLinkTitle((String) body.get("linkTitle"));
        if (body.containsKey("linkDescription")) p.setLinkDescription((String) body.get("linkDescription"));
        if (body.containsKey("linkImage")) p.setLinkImage((String) body.get("linkImage"));
        if (body.containsKey("images")) p.setImages((String) body.get("images"));
        return Response.ok(p).build();
    }

    @POST
    @Path("/posts/{id}/like")
    @Transactional
    public Response like(@PathParam("id") Long id, Map<String, Object> body) {
        Long userId = ((Number) body.getOrDefault("userId", 0)).longValue();
        SocialPost post = SocialPost.findById(id);
        if (post == null) return Response.status(Response.Status.NOT_FOUND).build();
        boolean exists = SocialPostLike.find("postId = ?1 and user.id = ?2", id, userId).firstResultOptional().isPresent();
        if (!exists) {
            SocialPostLike l = new SocialPostLike();
            l.setPostId(id);
            User user = User.findById(userId);
            if (user != null) {
                l.setUser(user);
                l.persist();
                post.setLikesCount(post.getLikesCount() + 1);
            }
        }
        return Response.ok(Map.of("likes", post.getLikesCount())).build();
    }

    @POST
    @Path("/posts/{id}/unlike")
    @Transactional
    public Response unlike(@PathParam("id") Long id, Map<String, Object> body) {
        Long userId = ((Number) body.getOrDefault("userId", 0)).longValue();
        SocialPost post = SocialPost.findById(id);
        if (post == null) return Response.status(Response.Status.NOT_FOUND).build();
        SocialPostLike l = SocialPostLike.find("postId = ?1 and user.id = ?2", id, userId).firstResult();
        if (l != null) {
            l.delete();
            post.setLikesCount(Math.max(0, post.getLikesCount() - 1));
        }
        return Response.ok(Map.of("likes", post.getLikesCount())).build();
    }

    @GET
    @Path("/posts/{id}/comments")
    public List<SocialPostComment> listComments(@PathParam("id") Long id) {
        return SocialPostComment.find("postId = ?1 order by createdAt asc", id).list();
    }

    @POST
    @Path("/posts/{id}/comments")
    @Transactional
    public Response createComment(@PathParam("id") Long id, Map<String, Object> body) {
        SocialPost post = SocialPost.findById(id);
        if (post == null) return Response.status(Response.Status.NOT_FOUND).build();
        SocialPostComment c = new SocialPostComment();
        c.setPostId(id);
        Long userId = ((Number) body.getOrDefault("userId", 0)).longValue();
        User user = User.findById(userId);
        if (user != null) {
            c.setUser(user);
            c.setContent((String) body.getOrDefault("content", ""));
            c.persist();
            post.setCommentsCount(post.getCommentsCount() + 1);
        }
        return Response.status(Response.Status.CREATED).entity(c).build();
    }

    @POST
    @Path("/posts")
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    public Response createPost(Map<String, Object> body) {
        try {
            SocialPost post = new SocialPost();
            Long userId = ((Number) body.getOrDefault("userId", 0)).longValue();
            User user = User.findById(userId);
            if (user == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Usuario no encontrado")
                    .build();
            }
            
            post.setUser(user);
            post.setContent((String) body.getOrDefault("content", ""));
            post.setLinkUrl((String) body.getOrDefault("linkUrl", null));
            post.setLinkTitle((String) body.getOrDefault("linkTitle", null));
            post.setLinkDescription((String) body.getOrDefault("linkDescription", null));
            post.setLinkImage((String) body.getOrDefault("linkImage", null));
            
            // Manejar array de imágenes convirtiéndolo a string separado por comas
            Object imagesObj = body.getOrDefault("images", null);
            if (imagesObj instanceof List) {
                List<?> imagesList = (List<?>) imagesObj;
                String imagesString = imagesList.stream()
                    .map(Object::toString)
                    .collect(Collectors.joining(","));
                post.setImages(imagesString);
            } else {
                post.setImages((String) imagesObj);
            }
            
            post.setLikesCount(0);
            post.setCommentsCount(0);
            
            // Establecer ubicación (se puede enviar desde el frontend)
            post.setLocation((String) body.getOrDefault("location", null));
            
            post.persist();
            
            return Response.status(Response.Status.CREATED).entity(post).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error al crear post: " + e.getMessage())
                .build();
        }
    }

    @POST
    @Path("/upload-image")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response uploadImage(@FormParam("file") InputStream file,
                              @FormParam("fileName") String fileName) {
        try {
            if (file == null || fileName == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Archivo requerido")
                    .build();
            }

            // Crear directorio de uploads si no existe
            String uploadDir = "uploads/social/posts";
            java.nio.file.Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generar nombre único para el archivo
            String fileExtension = getFileExtension(fileName);
            String uniqueFileName = "social_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + fileExtension;
            java.nio.file.Path filePath = uploadPath.resolve(uniqueFileName);

            // Guardar archivo
            try (InputStream inputStream = file) {
                Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            }

            // Devolver URL del archivo
            String fileUrl = "/uploads/social/posts/" + uniqueFileName;
            
            return Response.ok(Map.of(
                "fileUrl", fileUrl,
                "fileName", uniqueFileName,
                "success", true
            )).build();

        } catch (IOException e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error al subir archivo: " + e.getMessage())
                .build();
        }
    }

    private String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex > 0) {
            return fileName.substring(lastDotIndex);
        }
        return "";
    }

    @POST
    @Path("/fix-image-urls")
    @Transactional
    public Response fixImageUrls() {
        try {
            // Ejecutar la corrección de URLs
            int updatedRows = SocialPost.update("SET images = REPLACE(images, '/uploads/network/', '/uploads/social/posts/'), linkImage = REPLACE(linkImage, '/uploads/network/', '/uploads/social/posts/') WHERE images LIKE '%/uploads/network/%' OR linkImage LIKE '%/uploads/network/%'");
            
            return Response.ok(Map.of(
                "message", "URLs de imágenes corregidas",
                "updatedRows", updatedRows,
                "success", true
            )).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error al corregir URLs: " + e.getMessage())
                .build();
        }
    }
}


