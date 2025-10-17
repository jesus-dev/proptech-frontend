package com.proptech.commons.service;

import com.proptech.commons.dto.CityZoneDTO;
import com.proptech.commons.entity.City;
import com.proptech.commons.entity.CityZone;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class CityZoneService {

    public List<CityZoneDTO> listAll() {
        return CityZone.<CityZone>listAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CityZoneDTO findById(Long id) {
        CityZone cityZone = CityZone.findById(id);
        if (cityZone == null) {
            throw new NotFoundException("City zone not found with id: " + id);
        }
        return convertToDTO(cityZone);
    }

    @Transactional
    public CityZoneDTO create(CityZoneDTO dto) {
        CityZone cityZone = new CityZone();
        cityZone.setName(dto.getName());
        cityZone.setDescription(dto.getDescription());
        cityZone.setActive(dto.getActive() != null ? dto.getActive() : true);
        
        // Buscar la ciudad
        City city = City.findById(dto.getCityId());
        if (city == null) {
            throw new NotFoundException("City not found with id: " + dto.getCityId());
        }
        cityZone.setCity(city);
        
        cityZone.persist();
        return convertToDTO(cityZone);
    }

    @Transactional
    public CityZoneDTO update(Long id, CityZoneDTO dto) {
        CityZone cityZone = CityZone.findById(id);
        if (cityZone == null) {
            throw new NotFoundException("City zone not found with id: " + id);
        }

        cityZone.setName(dto.getName());
        cityZone.setDescription(dto.getDescription());
        cityZone.setActive(dto.getActive() != null ? dto.getActive() : true);
        
        // Buscar la ciudad si cambió
        if (dto.getCityId() != null && !dto.getCityId().equals(cityZone.getCity().getId())) {
            City city = City.findById(dto.getCityId());
            if (city == null) {
                throw new NotFoundException("City not found with id: " + dto.getCityId());
            }
            cityZone.setCity(city);
        }
        
        return convertToDTO(cityZone);
    }

    @Transactional
    public boolean delete(Long id) {
        CityZone cityZone = CityZone.findById(id);
        if (cityZone == null) {
            return false;
        }
        cityZone.delete();
        return true;
    }

    public List<CityZoneDTO> findByCityId(Long cityId) {
        return CityZone.<CityZone>find("city.id", cityId).list().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private CityZoneDTO convertToDTO(CityZone cityZone) {
        CityZoneDTO dto = new CityZoneDTO();
        dto.setId(cityZone.getId());
        dto.setName(cityZone.getName());
        dto.setDescription(cityZone.getDescription());
        dto.setActive(cityZone.getActive());
        dto.setCityId(cityZone.getCity().getId());
        dto.setCityName(cityZone.getCity().getName());
        dto.setCreatedAt(cityZone.getCreatedAt());
        dto.setUpdatedAt(cityZone.getUpdatedAt());
        return dto;
    }
}
