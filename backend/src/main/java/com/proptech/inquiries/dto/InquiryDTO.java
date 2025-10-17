package com.proptech.inquiries.dto;

import java.time.LocalDateTime;

public class InquiryDTO {
    public Long id;
    public String name;
    public String email;
    public String phone;
    public String message;
    public Long propertyId;
    public String propertyImage;
    public Boolean read;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
} 