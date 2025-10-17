package com.proptech.properties.dto;

import org.jboss.resteasy.reactive.PartType;
import jakarta.ws.rs.FormParam;
import java.io.InputStream;

public class ImageUploadForm {
    @FormParam("file")
    @PartType("application/octet-stream")
    public InputStream file;

    @FormParam("fileName")
    @PartType("text/plain")
    public String fileName;
} 