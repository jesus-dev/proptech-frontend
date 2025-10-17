package com.proptech.auth.service;

import com.proptech.auth.dto.PermissionDTO;
import com.proptech.auth.entity.Permission;
import com.proptech.auth.repository.PermissionRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class PermissionService {
    
    @Inject
    PermissionRepository permissionRepository;
    
    public List<PermissionDTO> getAllPermissions() {
        return permissionRepository.listAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<PermissionDTO> getActivePermissions() {
        return permissionRepository.findByActive(true).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public PermissionDTO getPermissionById(Long id) {
        Permission permission = permissionRepository.findById(id);
        if (permission == null) {
            throw new RuntimeException("Permiso no encontrado con ID: " + id);
        }
        return toDTO(permission);
    }
    
    public PermissionDTO getPermissionByName(String name) {
        Permission permission = permissionRepository.findByName(name);
        if (permission == null) {
            throw new RuntimeException("Permiso no encontrado con nombre: " + name);
        }
        return toDTO(permission);
    }
    
    @Transactional
    public PermissionDTO createPermission(PermissionDTO dto) {
        // Verificar si el nombre ya existe
        if (permissionRepository.findByName(dto.getName()) != null) {
            throw new RuntimeException("El nombre del permiso ya existe: " + dto.getName());
        }
        
        Permission permission = new Permission();
        permission.setName(dto.getName());
        permission.setDescription(dto.getDescription());
        permission.setResource(dto.getResource());
        permission.setAction(dto.getAction());
        permission.setCategory(dto.getCategory());
        permission.setActive(dto.getActive() != null ? dto.getActive() : true);
        permission.setCreatedAt(LocalDateTime.now());
        permission.setCreatedBy(dto.getCreatedBy());
        
        permissionRepository.persist(permission);
        return toDTO(permission);
    }
    
    @Transactional
    public PermissionDTO updatePermission(Long id, PermissionDTO dto) {
        Permission permission = permissionRepository.findById(id);
        if (permission == null) {
            throw new RuntimeException("Permiso no encontrado con ID: " + id);
        }
        
        // Verificar si el nombre ya existe en otro permiso
        Permission existingPermission = permissionRepository.findByName(dto.getName());
        if (existingPermission != null && !existingPermission.getId().equals(id)) {
            throw new RuntimeException("El nombre del permiso ya existe: " + dto.getName());
        }
        
        permission.setName(dto.getName());
        permission.setDescription(dto.getDescription());
        permission.setResource(dto.getResource());
        permission.setAction(dto.getAction());
        permission.setCategory(dto.getCategory());
        permission.setActive(dto.getActive());
        permission.setUpdatedAt(LocalDateTime.now());
        permission.setUpdatedBy(dto.getUpdatedBy());
        
        return toDTO(permission);
    }
    
    @Transactional
    public void deletePermission(Long id) {
        Permission permission = permissionRepository.findById(id);
        if (permission == null) {
            throw new RuntimeException("Permiso no encontrado con ID: " + id);
        }
        
        // Verificar si el permiso está siendo usado por roles
        if (permissionRepository.isPermissionUsedByRoles(id)) {
            throw new RuntimeException("No se puede eliminar el permiso porque está siendo usado por roles");
        }
        
        permissionRepository.delete(permission);
    }
    
    @Transactional
    public PermissionDTO activatePermission(Long id) {
        Permission permission = permissionRepository.findById(id);
        if (permission == null) {
            throw new RuntimeException("Permiso no encontrado con ID: " + id);
        }
        permission.setActive(true);
        permission.setUpdatedAt(LocalDateTime.now());
        return toDTO(permission);
    }
    
    @Transactional
    public PermissionDTO deactivatePermission(Long id) {
        Permission permission = permissionRepository.findById(id);
        if (permission == null) {
            throw new RuntimeException("Permiso no encontrado con ID: " + id);
        }
        permission.setActive(false);
        permission.setUpdatedAt(LocalDateTime.now());
        return toDTO(permission);
    }
    
    public List<PermissionDTO> getPermissionsByResource(String resource) {
        return permissionRepository.findByResource(resource).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<PermissionDTO> getPermissionsByAction(String action) {
        return permissionRepository.findByAction(action).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<PermissionDTO> getPermissionsByResourceAndAction(String resource, String action) {
        return permissionRepository.findByResourceAndAction(resource, action).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<PermissionDTO> getPermissionsByActive(Boolean active) {
        return permissionRepository.findByActive(active).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<PermissionDTO> getPermissionsByCategory(String category) {
        return permissionRepository.findByCategory(category).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<String> getPermissionCategories() {
        return permissionRepository.findDistinctCategories();
    }
    
    private PermissionDTO toDTO(Permission permission) {
        PermissionDTO dto = new PermissionDTO();
        dto.setId(permission.getId());
        dto.setName(permission.getName());
        dto.setDescription(permission.getDescription());
        dto.setResource(permission.getResource());
        dto.setAction(permission.getAction());
        dto.setCategory(permission.getCategory());
        dto.setActive(permission.getActive());
        dto.setCreatedAt(permission.getCreatedAt());
        dto.setUpdatedAt(permission.getUpdatedAt());
        dto.setCreatedBy(permission.getCreatedBy());
        dto.setUpdatedBy(permission.getUpdatedBy());
        return dto;
    }
} 