package com.proptech.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.HashMap;
import java.util.Map;

@ApplicationScoped
public class InstagramApiClient {

    private final Client client = ClientBuilder.newClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @ConfigProperty(name = "instagram.api.enabled", defaultValue = "false")
    boolean enabled;
    
    @ConfigProperty(name = "instagram.api.app.id")
    String appId;
    
    @ConfigProperty(name = "instagram.api.app.secret")
    String appSecret;
    
    @ConfigProperty(name = "instagram.api.access.token")
    String accessToken;
    
    @ConfigProperty(name = "instagram.api.business.account.id")
    String businessAccountId;

    public static class InstagramPostResponse {
        public String id;
        public String postId;
        public String error;
    }

    public InstagramPostResponse publishPropertyPost(String caption, String imageUrl) {
        if (!enabled) {
            InstagramPostResponse response = new InstagramPostResponse();
            response.error = "Instagram API not enabled";
            return response;
        }

        try {
            // Paso 1: Crear contenedor de medios
            String containerId = createMediaContainer(imageUrl, caption);
            if (containerId == null) {
                InstagramPostResponse result = new InstagramPostResponse();
                result.error = "Failed to create media container";
                return result;
            }

            // Paso 2: Publicar el contenido
            String url = String.format("https://graph.facebook.com/v18.0/%s/media_publish", businessAccountId);
            
            Map<String, Object> publishData = new HashMap<>();
            publishData.put("creation_id", containerId);

            Response response = client.target(url)
                    .queryParam("access_token", accessToken)
                    .request(MediaType.APPLICATION_JSON)
                    .post(Entity.json(publishData));

            if (response.getStatus() == 200) {
                JsonNode jsonResponse = objectMapper.readTree(response.readEntity(String.class));
                InstagramPostResponse result = new InstagramPostResponse();
                result.id = jsonResponse.get("id").asText();
                result.postId = jsonResponse.get("id").asText();
                return result;
            } else {
                InstagramPostResponse result = new InstagramPostResponse();
                result.error = "HTTP Error: " + response.getStatus() + " - " + response.readEntity(String.class);
                return result;
            }
        } catch (Exception e) {
            InstagramPostResponse result = new InstagramPostResponse();
            result.error = "Error publishing to Instagram: " + e.getMessage();
            return result;
        }
    }

    private String createMediaContainer(String imageUrl, String caption) {
        try {
            String url = String.format("https://graph.facebook.com/v18.0/%s/media", businessAccountId);
            
            Map<String, Object> mediaData = new HashMap<>();
            mediaData.put("image_url", imageUrl);
            mediaData.put("caption", caption);
            mediaData.put("access_token", accessToken);

            Response response = client.target(url)
                    .request(MediaType.APPLICATION_JSON)
                    .post(Entity.json(mediaData));

            if (response.getStatus() == 200) {
                JsonNode jsonResponse = objectMapper.readTree(response.readEntity(String.class));
                return jsonResponse.get("id").asText();
            }
        } catch (Exception e) {
            System.err.println("Error creating Instagram media container: " + e.getMessage());
        }
        return null;
    }

    public boolean deletePost(String postId) {
        if (!enabled) {
            return false;
        }

        try {
            String url = String.format("https://graph.facebook.com/v18.0/%s", postId);
            
            Response response = client.target(url)
                    .queryParam("access_token", accessToken)
                    .request()
                    .delete();

            return response.getStatus() == 200;
        } catch (Exception e) {
            System.err.println("Error deleting Instagram post: " + e.getMessage());
            return false;
        }
    }

    public String getBusinessAccountInfo() {
        if (!enabled) {
            return "Instagram API not enabled";
        }

        try {
            String url = String.format("https://graph.facebook.com/v18.0/%s", businessAccountId);
            
            Response response = client.target(url)
                    .queryParam("access_token", accessToken)
                    .queryParam("fields", "id,name,username,media_count")
                    .request(MediaType.APPLICATION_JSON)
                    .get();

            if (response.getStatus() == 200) {
                return response.readEntity(String.class);
            } else {
                return "Error: " + response.getStatus();
            }
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
} 