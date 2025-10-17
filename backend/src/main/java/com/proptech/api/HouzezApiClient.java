package com.proptech.api;

import java.io.InputStream;

import com.proptech.properties.dto.PropertyDTO;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@ApplicationScoped
public class HouzezApiClient {

    private final Client client = ClientBuilder.newClient();
    private final String baseUrl = "https://api.houzez.com/v1"; // Replace with actual API URL
    private final String apiKey = "your-api-key"; // Replace with actual API key

    public static class MediaResponse {
        public int id;
        public String url;

        public int getId() { return id; }
    }

    public Response createProperty(PropertyDTO dto) {
        // Implementation for creating property in Houzez
        return client.target(baseUrl + "/properties")
                .request(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + apiKey)
                .post(Entity.json(dto));
    }

    public Response updateProperty(Long wordpressId, PropertyDTO dto) {
        // Implementation for updating property in Houzez
        return client.target(baseUrl + "/properties/" + wordpressId)
                .request(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + apiKey)
                .put(Entity.json(dto));
    }

    public Response deleteProperty(Long wordpressId) {
        // Implementation for deleting property in Houzez
        return client.target(baseUrl + "/properties/" + wordpressId)
                .request()
                .header("Authorization", "Bearer " + apiKey)
                .delete();
    }

    public MediaResponse uploadImage(InputStream file, String fileName) {
        // Implementation for uploading image to Houzez
        MediaResponse response = new MediaResponse();
        response.id = 1; // Mock ID
        response.url = "https://example.com/image.jpg"; // Mock URL
        return response;
    }
}
