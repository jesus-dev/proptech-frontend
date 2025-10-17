package com.proptech.commons.service;

import java.util.List;
import java.util.stream.Collectors;

import com.proptech.commons.dto.CityDTO;
import com.proptech.commons.entity.City;
import com.proptech.commons.entity.Department;
import com.proptech.commons.mapper.CityMapper;
import com.proptech.commons.repository.CityRepository;
import com.proptech.commons.repository.DepartmentRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
public class CityService {
    
    @Inject
    CityRepository cityRepository;
    
    @Inject
    DepartmentRepository departmentRepository;
    
    public List<CityDTO> listAll() {
        return cityRepository.listAll().stream()
                .map(CityMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public CityDTO findById(Long id) {
        City city = cityRepository.findById(id);
        if (city == null) {
            throw new NotFoundException("City not found");
        }
        return CityMapper.toDTO(city);
    }
    
    @Transactional
    public CityDTO create(CityDTO dto) {
        City city = CityMapper.toEntity(dto);
        
        // Set department
        if (dto.departmentId != null) {
            Department department = departmentRepository.findById(dto.departmentId);
            if (department == null) {
                throw new NotFoundException("Department not found");
            }
            city.setDepartment(department);
        }
        
        cityRepository.persist(city);
        return CityMapper.toDTO(city);
    }
    
    @Transactional
    public CityDTO update(Long id, CityDTO dto) {
        City city = cityRepository.findById(id);
        if (city == null) {
            throw new NotFoundException("City not found");
        }
        
        CityMapper.updateEntityFromDTO(dto, city);
        
        // Update department if provided
        if (dto.departmentId != null) {
            Department department = departmentRepository.findById(dto.departmentId);
            if (department == null) {
                throw new NotFoundException("Department not found");
            }
            city.setDepartment(department);
        }
        
        return CityMapper.toDTO(city);
    }
    
    @Transactional
    public void delete(Long id) {
        City city = cityRepository.findById(id);
        if (city == null) {
            throw new NotFoundException("City not found");
        }
        cityRepository.delete(city);
    }
} 