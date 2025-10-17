package com.proptech.commons.mapper;

import java.time.format.DateTimeFormatter;

import com.proptech.commons.dto.DepartmentDTO;
import com.proptech.commons.entity.Department;

public class DepartmentMapper {
    
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    public static DepartmentDTO toDTO(Department entity) {
        if (entity == null) {
            return null;
        }
        
        DepartmentDTO dto = new DepartmentDTO();
        dto.id = entity.getId();
        dto.name = entity.getName();
        dto.active = entity.getActive();
        dto.createdAt = entity.getCreatedAt() != null ? entity.getCreatedAt().format(formatter) : null;
        dto.updatedAt = entity.getUpdatedAt() != null ? entity.getUpdatedAt().format(formatter) : null;
        
        return dto;
    }
    
    public static Department toEntity(DepartmentDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Department entity = new Department();
        entity.setId(dto.id);
        entity.setName(dto.name);
        entity.setActive(dto.active != null ? dto.active : true);
        
        return entity;
    }
    
    public static void updateEntityFromDTO(DepartmentDTO dto, Department entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        entity.setName(dto.name);
        entity.setActive(dto.active != null ? dto.active : true);
    }
}
