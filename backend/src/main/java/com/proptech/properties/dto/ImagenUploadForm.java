package com.proptech.properties.dto;



import java.io.InputStream;

import jakarta.ws.rs.FormParam;

public class ImagenUploadForm {

    @FormParam("archivo")
    public InputStream archivo;

    @FormParam("nombre")
    public String nombre;
}
