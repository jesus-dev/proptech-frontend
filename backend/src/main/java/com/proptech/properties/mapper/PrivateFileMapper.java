package com.proptech.properties.mapper;

import com.proptech.properties.dto.PrivateFileDTO;
import com.proptech.properties.entity.PrivateFile;

public class PrivateFileMapper {
    
    public static PrivateFileDTO toDTO(PrivateFile privateFile) {
        if (privateFile == null) return null;
        
        PrivateFileDTO dto = new PrivateFileDTO();
        dto.id = privateFile.getId();
        dto.fileName = privateFile.getFileName();
        dto.url = privateFile.getUrl();
        return dto;
    }
    
    public static PrivateFile toEntity(PrivateFileDTO dto) {
        if (dto == null) return null;
        
        PrivateFile privateFile = new PrivateFile();
        privateFile.setId(dto.id);
        privateFile.setFileName(dto.fileName);
        privateFile.setUrl(dto.url);
        return privateFile;
    }
} 