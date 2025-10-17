package com.proptech.commons.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import java.util.stream.Collectors;

import com.proptech.commons.dto.DepartmentDTO;
import com.proptech.commons.entity.Department;
import com.proptech.commons.mapper.DepartmentMapper;
import com.proptech.commons.repository.DepartmentRepository;

@ApplicationScoped
public class DepartmentService {
    
    @Inject
    DepartmentRepository departmentRepository;
    
    public List<DepartmentDTO> listAll() {
        return departmentRepository.listAll().stream()
                .map(DepartmentMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public DepartmentDTO findById(Long id) {
        Department department = departmentRepository.findById(id);
        if (department == null) {
            throw new NotFoundException("Department not found");
        }
        return DepartmentMapper.toDTO(department);
    }
    
    @Transactional
    public DepartmentDTO create(DepartmentDTO dto) {
        Department department = DepartmentMapper.toEntity(dto);
        departmentRepository.persist(department);
        return DepartmentMapper.toDTO(department);
    }
    
    @Transactional
    public DepartmentDTO update(Long id, DepartmentDTO dto) {
        Department department = departmentRepository.findById(id);
        if (department == null) {
            throw new NotFoundException("Department not found");
        }
        
        DepartmentMapper.updateEntityFromDTO(dto, department);
        return DepartmentMapper.toDTO(department);
    }
    
    @Transactional
    public void delete(Long id) {
        Department department = departmentRepository.findById(id);
        if (department == null) {
            throw new NotFoundException("Department not found");
        }
        departmentRepository.delete(department);
    }
} 