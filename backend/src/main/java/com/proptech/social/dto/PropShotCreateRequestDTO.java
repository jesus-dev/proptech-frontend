package com.proptech.social.dto;

public class PropShotCreateRequestDTO {
    public String title;
    public String description;
    public String duration;
    public String link;
    public String videoUrl;
    public String thumbnailUrl;
    public Long userId;
    
    // Constructor por defecto
    public PropShotCreateRequestDTO() {}
    
    // Constructor con parámetros
    public PropShotCreateRequestDTO(String title, String description, String duration, 
                                   String link, String videoUrl, String thumbnailUrl, Long userId) {
        this.title = title;
        this.description = description;
        this.duration = duration;
        this.link = link;
        this.videoUrl = videoUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.userId = userId;
    }
}
