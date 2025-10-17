package com.proptech.socialmedias.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import com.proptech.api.FacebookApiClient;
import com.proptech.api.InstagramApiClient;
import com.proptech.socialmedias.dto.SocialMediaPostDTO;
import com.proptech.properties.dto.PropertyDTO;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class SocialMediaService {

    @Inject
    FacebookApiClient facebookApiClient;

    @Inject
    InstagramApiClient instagramApiClient;

    @ConfigProperty(name = "social.media.auto.publish", defaultValue = "false")
    boolean autoPublish;

    @ConfigProperty(name = "social.media.publish.on.property.create", defaultValue = "false")
    boolean publishOnCreate;

    @ConfigProperty(name = "social.media.publish.on.property.featured", defaultValue = "true")
    boolean publishOnFeatured;

    public SocialMediaPostDTO publishPropertyToSocialMedia(PropertyDTO property, List<String> platforms) {
        SocialMediaPostDTO post = new SocialMediaPostDTO();
        post.propertyId = property.id;
        post.platforms = platforms;
        post.status = "pending";
        post.scheduledAt = LocalDateTime.now();

        try {
            // Generar contenido del post
            String title = generatePostTitle(property);
            String description = generatePostDescription(property);
            String imageUrl = property.featuredImage;
            String propertyUrl = generatePropertyUrl(property);

            // Publicar en cada plataforma
            for (String platform : platforms) {
                switch (platform.toLowerCase()) {
                    case "facebook":
                        publishToFacebook(post, title, description, imageUrl, propertyUrl);
                        break;
                    case "instagram":
                        publishToInstagram(post, title, description, imageUrl);
                        break;
                }
            }

            post.status = "published";
            post.publishedAt = LocalDateTime.now();

        } catch (Exception e) {
            post.status = "failed";
            post.errorMessage = e.getMessage();
        }

        return post;
    }

    private void publishToFacebook(SocialMediaPostDTO post, String title, String description, 
                                  String imageUrl, String propertyUrl) {
        String message = title + "\n\n" + description + "\n\n" + propertyUrl;
        
        FacebookApiClient.FacebookPostResponse response = 
            facebookApiClient.publishPropertyPost(message, imageUrl, propertyUrl);
        
        if (response.error == null) {
            post.facebookPostId = response.postId;
        } else {
            post.errorMessage = "Facebook: " + response.error;
        }
    }

    private void publishToInstagram(SocialMediaPostDTO post, String title, String description, 
                                   String imageUrl) {
        String caption = title + "\n\n" + description;
        
        InstagramApiClient.InstagramPostResponse response = 
            instagramApiClient.publishPropertyPost(caption, imageUrl);
        
        if (response.error == null) {
            post.instagramPostId = response.postId;
        } else {
            post.errorMessage = (post.errorMessage != null ? post.errorMessage + "; " : "") + 
                               "Instagram: " + response.error;
        }
    }

    private String generatePostTitle(PropertyDTO property) {
        StringBuilder title = new StringBuilder();
        title.append("🏠 ").append(property.title);
        
        if (property.price != null) {
            title.append(" - ").append(property.currency).append(" ").append(property.price);
        }
        
        if (property.bedrooms != null && property.bedrooms > 0) {
            title.append(" | ").append(property.bedrooms).append(" dormitorios");
        }
        
        if (property.bathrooms != null && property.bathrooms > 0) {
            title.append(" | ").append(property.bathrooms).append(" baños");
        }
        
        return title.toString();
    }

    private String generatePostDescription(PropertyDTO property) {
        StringBuilder description = new StringBuilder();
        
        if (property.description != null && !property.description.isEmpty()) {
            description.append(property.description.substring(0, Math.min(200, property.description.length())));
            if (property.description.length() > 200) {
                description.append("...");
            }
        }
        
        description.append("\n\n📍 ").append(property.address);
        
        if (property.area != null && property.area > 0) {
            description.append("\n📐 ").append(property.area).append(" m²");
        }
        
        if (property.propertyTypeName != null) {
            description.append("\n🏘️ ").append(property.propertyTypeName);
        }
        
        description.append("\n\n#inmobiliaria #propiedades #paraguay #venta #alquiler");
        
        return description.toString();
    }

    private String generatePropertyUrl(PropertyDTO property) {
        // URL de la propiedad en el frontend
        return "https://tu-dominio.com/propiedades/" + property.id;
    }

    public boolean shouldPublishProperty(PropertyDTO property) {
        if (!autoPublish) {
            return false;
        }

        // Publicar si es destacada
        if (publishOnFeatured && property.featured != null && property.featured) {
            return true;
        }

        // Publicar si es nueva propiedad
        if (publishOnCreate) {
            return true;
        }

        return false;
    }

    public List<String> getAvailablePlatforms() {
        List<String> platforms = new ArrayList<>();
        
        if (facebookApiClient != null) {
            platforms.add("facebook");
        }
        
        if (instagramApiClient != null) {
            platforms.add("instagram");
        }
        
        return platforms;
    }

    public String getFacebookAccountInfo() {
        return "Facebook API Status: " + (facebookApiClient != null ? "Available" : "Not configured");
    }

    public String getInstagramAccountInfo() {
        if (instagramApiClient != null) {
            return instagramApiClient.getBusinessAccountInfo();
        }
        return "Instagram API Status: Not configured";
    }
} 