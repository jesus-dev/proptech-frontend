package com.proptech.commons.mapper;

import com.proptech.commons.dto.CityDTO;
import com.proptech.commons.entity.City;

public class CityMapper {
    
    public static CityDTO toDTO(City entity) {
        if (entity == null) {
            return null;
        }
        
        CityDTO dto = new CityDTO();
        dto.id = entity.getId();
        dto.name = entity.getName();
        dto.departmentId = entity.getDepartment() != null ? entity.getDepartment().getId() : null;
        dto.departmentName = entity.getDepartment() != null ? entity.getDepartment().getName() : null;
        dto.countryId = entity.getDepartment() != null && entity.getDepartment().getCountry() != null ? 
                       entity.getDepartment().getCountry().getId() : null;
        dto.countryName = entity.getDepartment() != null && entity.getDepartment().getCountry() != null ? 
                         entity.getDepartment().getCountry().getName() : null;
        dto.active = entity.getActive();
        
        return dto;
    }
    
    public static City toEntity(CityDTO dto) {
        if (dto == null) {
            return null;
        }
        
        City entity = new City();
        entity.setId(dto.id);
        entity.setName(dto.name);
        entity.setActive(dto.active != null ? dto.active : true);
        
        return entity;
    }
    
    public static void updateEntityFromDTO(CityDTO dto, City entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        entity.setName(dto.name);
        entity.setActive(dto.active != null ? dto.active : true);
    }
}
