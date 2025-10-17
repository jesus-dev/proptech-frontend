package com.proptech.social.dto;

public class PropShotCreateDTO {
    public String title;
    public String description;
    public String mediaUrl;
    public String linkUrl;
    public Long propertyId;
    public Long socialId;
    
    // Constructor por defecto
    public PropShotCreateDTO() {}
    
    // Constructor con parámetros
    public PropShotCreateDTO(String title, String description, String mediaUrl, 
                        String linkUrl, Long propertyId, Long socialId) {
        this.title = title;
        this.description = description;
        this.mediaUrl = mediaUrl;
        this.linkUrl = linkUrl;
        this.propertyId = propertyId;
        this.socialId = socialId;
    }
}
