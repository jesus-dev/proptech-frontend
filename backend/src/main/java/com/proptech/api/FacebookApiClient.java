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
public class FacebookApiClient {

    private final Client client = ClientBuilder.newClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @ConfigProperty(name = "facebook.api.enabled", defaultValue = "false")
    boolean enabled;
    
    @ConfigProperty(name = "facebook.api.app.id")
    String appId;
    
    @ConfigProperty(name = "facebook.api.app.secret")
    String appSecret;
    
    @ConfigProperty(name = "facebook.api.access.token")
    String accessToken;
    
    @ConfigProperty(name = "facebook.api.page.id")
    String pageId;

    public static class FacebookPostResponse {
        public String id;
        public String postId;
        public String error;
    }

    public FacebookPostResponse publishPropertyPost(String message, String imageUrl, String link) {
        if (!enabled) {
            FacebookPostResponse response = new FacebookPostResponse();
            response.error = "Facebook API not enabled";
            return response;
        }

        try {
            // Primero subir la imagen si existe
            String imageId = null;
            if (imageUrl != null && !imageUrl.isEmpty()) {
                imageId = uploadImage(imageUrl);
            }

            // Crear el post
            Map<String, Object> postData = new HashMap<>();
            postData.put("message", message);
            if (link != null && !link.isEmpty()) {
                postData.put("link", link);
            }
            if (imageId != null) {
                postData.put("attached_media", "[{\"media_fbid\":\"" + imageId + "\"}]");
            }

            String url = String.format("https://graph.facebook.com/v18.0/%s/feed", pageId);
            
            Response response = client.target(url)
                    .queryParam("access_token", accessToken)
                    .request(MediaType.APPLICATION_JSON)
                    .post(Entity.json(postData));

            if (response.getStatus() == 200) {
                JsonNode jsonResponse = objectMapper.readTree(response.readEntity(String.class));
                FacebookPostResponse result = new FacebookPostResponse();
                result.id = jsonResponse.get("id").asText();
                result.postId = jsonResponse.get("id").asText();
                return result;
            } else {
                FacebookPostResponse result = new FacebookPostResponse();
                result.error = "HTTP Error: " + response.getStatus() + " - " + response.readEntity(String.class);
                return result;
            }
        } catch (Exception e) {
            FacebookPostResponse result = new FacebookPostResponse();
            result.error = "Error publishing to Facebook: " + e.getMessage();
            return result;
        }
    }

    private String uploadImage(String imageUrl) {
        try {
            Map<String, Object> imageData = new HashMap<>();
            imageData.put("url", imageUrl);
            imageData.put("published", false);

            String url = String.format("https://graph.facebook.com/v18.0/%s/photos", pageId);
            
            Response response = client.target(url)
                    .queryParam("access_token", accessToken)
                    .request(MediaType.APPLICATION_JSON)
                    .post(Entity.json(imageData));

            if (response.getStatus() == 200) {
                JsonNode jsonResponse = objectMapper.readTree(response.readEntity(String.class));
                return jsonResponse.get("id").asText();
            }
        } catch (Exception e) {
            System.err.println("Error uploading image to Facebook: " + e.getMessage());
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
            System.err.println("Error deleting Facebook post: " + e.getMessage());
            return false;
        }
    }
} 