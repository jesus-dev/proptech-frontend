package com.proptech.auth.service;

import com.proptech.auth.dto.RoleDTO;
import com.proptech.auth.entity.Role;
import com.proptech.auth.entity.Permission;
import com.proptech.auth.repository.RoleRepository;
import com.proptech.auth.repository.PermissionRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@ApplicationScoped
public class RoleService {
    
    @Inject
    RoleRepository roleRepository;
    
    @Inject
    PermissionRepository permissionRepository;
    
    public List<RoleDTO> getAllRoles() {
        return roleRepository.listAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<RoleDTO> getActiveRoles() {
        return roleRepository.findByActive(true).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public RoleDTO getRoleById(Long id) {
        Role role = roleRepository.findById(id);
        if (role == null) {
            throw new RuntimeException("Rol no encontrado con ID: " + id);
        }
        return toDTO(role);
    }
    
    public RoleDTO getRoleByName(String name) {
        Role role = roleRepository.findByName(name);
        if (role == null) {
            throw new RuntimeException("Rol no encontrado con nombre: " + name);
        }
        return toDTO(role);
    }
    
    @Transactional
    public RoleDTO createRole(RoleDTO dto) {
        // Verificar si el nombre ya existe
        if (roleRepository.findByName(dto.getName()) != null) {
            throw new RuntimeException("El nombre del rol ya existe: " + dto.getName());
        }
        
        Role role = new Role();
        role.setName(dto.getName());
        role.setDescription(dto.getDescription());
        role.setActive(dto.getActive() != null ? dto.getActive() : true);
        role.setCreatedAt(LocalDateTime.now());
        role.setCreatedBy(dto.getCreatedBy());
        
        // Asignar permisos si se proporcionan
        if (dto.getPermissionIds() != null && !dto.getPermissionIds().isEmpty()) {
            Set<Permission> permissions = dto.getPermissionIds().stream()
                    .map(permissionId -> permissionRepository.findById(permissionId))
                    .filter(permission -> permission != null)
                    .collect(Collectors.toSet());
            role.setPermissions(permissions);
        }
        
        roleRepository.persist(role);
        return toDTO(role);
    }
    
    @Transactional
    public RoleDTO updateRole(Long id, RoleDTO dto) {
        Role role = roleRepository.findById(id);
        if (role == null) {
            throw new RuntimeException("Rol no encontrado con ID: " + id);
        }
        
        // Verificar si el nombre ya existe en otro rol
        Role existingRole = roleRepository.findByName(dto.getName());
        if (existingRole != null && !existingRole.getId().equals(id)) {
            throw new RuntimeException("El nombre del rol ya existe: " + dto.getName());
        }
        
        role.setName(dto.getName());
        role.setDescription(dto.getDescription());
        role.setActive(dto.getActive());
        role.setUpdatedAt(LocalDateTime.now());
        role.setUpdatedBy(dto.getUpdatedBy());
        
        // Actualizar permisos si se proporcionan
        if (dto.getPermissionIds() != null) {
            Set<Permission> permissions = dto.getPermissionIds().stream()
                    .map(permissionId -> permissionRepository.findById(permissionId))
                    .filter(permission -> permission != null)
                    .collect(Collectors.toSet());
            role.setPermissions(permissions);
        }
        
        return toDTO(role);
    }
    
    @Transactional
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id);
        if (role == null) {
            throw new RuntimeException("Rol no encontrado con ID: " + id);
        }
        
        // Verificar si el rol está siendo usado por usuarios
        if (roleRepository.isRoleUsedByUsers(id)) {
            throw new RuntimeException("No se puede eliminar el rol porque está siendo usado por usuarios");
        }
        
        roleRepository.delete(role);
    }
    
    @Transactional
    public RoleDTO activateRole(Long id) {
        Role role = roleRepository.findById(id);
        if (role == null) {
            throw new RuntimeException("Rol no encontrado con ID: " + id);
        }
        role.setActive(true);
        role.setUpdatedAt(LocalDateTime.now());
        return toDTO(role);
    }
    
    @Transactional
    public RoleDTO deactivateRole(Long id) {
        Role role = roleRepository.findById(id);
        if (role == null) {
            throw new RuntimeException("Rol no encontrado con ID: " + id);
        }
        role.setActive(false);
        role.setUpdatedAt(LocalDateTime.now());
        return toDTO(role);
    }
    
    @Transactional
    public RoleDTO assignPermissions(Long roleId, List<Long> permissionIds) {
        Role role = roleRepository.findById(roleId);
        if (role == null) {
            throw new RuntimeException("Rol no encontrado con ID: " + roleId);
        }
        
        Set<Permission> permissions = permissionIds.stream()
                .map(permissionId -> permissionRepository.findById(permissionId))
                .filter(permission -> permission != null)
                .collect(Collectors.toSet());
        
        role.setPermissions(permissions);
        role.setUpdatedAt(LocalDateTime.now());
        return toDTO(role);
    }
    
    @Transactional
    public RoleDTO removePermissions(Long roleId, List<Long> permissionIds) {
        Role role = roleRepository.findById(roleId);
        if (role == null) {
            throw new RuntimeException("Rol no encontrado con ID: " + roleId);
        }
        
        Set<Permission> permissionsToRemove = permissionIds.stream()
                .map(permissionId -> permissionRepository.findById(permissionId))
                .filter(permission -> permission != null)
                .collect(Collectors.toSet());
        
        role.getPermissions().removeAll(permissionsToRemove);
        role.setUpdatedAt(LocalDateTime.now());
        return toDTO(role);
    }
    
    public List<RoleDTO> getRolesByPermission(String permissionName) {
        return roleRepository.findByPermissionName(permissionName).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<RoleDTO> getRolesByActive(Boolean active) {
        return roleRepository.findByActive(active).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    private RoleDTO toDTO(Role role) {
        RoleDTO dto = new RoleDTO();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setDescription(role.getDescription());
        dto.setActive(role.getActive());
        dto.setCreatedAt(role.getCreatedAt());
        dto.setUpdatedAt(role.getUpdatedAt());
        dto.setCreatedBy(role.getCreatedBy());
        dto.setUpdatedBy(role.getUpdatedBy());
        
        // Convertir permisos a nombres
        if (role.getPermissions() != null) {
            dto.setPermissions(role.getPermissions().stream()
                    .map(Permission::getName)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
} 