package com.proptech.auth.service;

import com.proptech.auth.dto.UserDTO;
import com.proptech.auth.entity.User;
import com.proptech.auth.entity.Role;
import com.proptech.auth.enums.UserStatus;
import com.proptech.auth.enums.UserType;
import com.proptech.auth.repository.UserRepository;
import com.proptech.auth.repository.RoleRepository;
import com.proptech.auth.security.PasswordEncoder;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@ApplicationScoped
public class UserService {
    
    @Inject
    UserRepository userRepository;
    
    @Inject
    RoleRepository roleRepository;
    
    @Inject
    PasswordEncoder passwordEncoder;
    
    public List<UserDTO> getAllUsers() {
        return userRepository.listAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<UserDTO> getActiveUsers() {
        return userRepository.findByStatus(UserStatus.ACTIVE).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id);
        if (user == null) {
            throw new RuntimeException("Usuario no encontrado con ID: " + id);
        }
        return toDTO(user);
    }
    
    public UserDTO getUserByEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado con email: " + email);
        }
        return toDTO(userOpt.get());
    }
    
    @Transactional
    public UserDTO createUser(UserDTO dto) {
        // Verificar si el email ya existe
        Optional<User> existingUserOpt = userRepository.findByEmail(dto.getEmail());
        if (existingUserOpt.isPresent()) {
            throw new RuntimeException("El email ya está registrado: " + dto.getEmail());
        }
        
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhone(dto.getPhone());
        user.setDocument(dto.getDocument());
        user.setStatus(dto.getStatus() != null ? dto.getStatus() : UserStatus.ACTIVE);
        user.setUserType(dto.getUserType() != null ? dto.getUserType() : UserType.VIEWER);
        user.setEmailVerified(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setCreatedBy(dto.getCreatedBy());
        
        // Asignar roles si se proporcionan
        if (dto.getRoleIds() != null && !dto.getRoleIds().isEmpty()) {
            Set<Role> roles = dto.getRoleIds().stream()
                    .map(roleId -> roleRepository.findById(roleId))
                    .filter(role -> role != null)
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }
        
        userRepository.persist(user);
        return toDTO(user);
    }
    
    @Transactional
    public UserDTO updateUser(Long id, UserDTO dto) {
        User user = userRepository.findById(id);
        if (user == null) {
            throw new RuntimeException("Usuario no encontrado con ID: " + id);
        }
        
        // Verificar si el email ya existe en otro usuario
        Optional<User> existingUserOpt = userRepository.findByEmail(dto.getEmail());
        if (existingUserOpt.isPresent() && !existingUserOpt.get().getId().equals(id)) {
            throw new RuntimeException("El email ya está registrado: " + dto.getEmail());
        }
        
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhone(dto.getPhone());
        user.setDocument(dto.getDocument());
        // Cambiar aquí: si status es null, mantener el actual
        user.setStatus(dto.getStatus() != null ? dto.getStatus() : user.getStatus());
        user.setUserType(dto.getUserType());
        user.setUpdatedAt(LocalDateTime.now());
        user.setUpdatedBy(dto.getUpdatedBy());
        
        // Actualizar contraseña si se proporciona
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            user.setPasswordChangedAt(LocalDateTime.now());
        }
        
        // Actualizar roles si se proporcionan
        if (dto.getRoleIds() != null) {
            Set<Role> roles = dto.getRoleIds().stream()
                    .map(roleId -> roleRepository.findById(roleId))
                    .filter(role -> role != null)
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }
        
        return toDTO(user);
    }
    
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id);
        if (user == null) {
            throw new RuntimeException("Usuario no encontrado con ID: " + id);
        }
        userRepository.delete(user);
    }
    
    @Transactional
    public UserDTO activateUser(Long id) {
        User user = userRepository.findById(id);
        if (user == null) {
            throw new RuntimeException("Usuario no encontrado con ID: " + id);
        }
        user.setStatus(UserStatus.ACTIVE);
        user.setUpdatedAt(LocalDateTime.now());
        return toDTO(user);
    }
    
    @Transactional
    public UserDTO deactivateUser(Long id) {
        User user = userRepository.findById(id);
        if (user == null) {
            throw new RuntimeException("Usuario no encontrado con ID: " + id);
        }
        user.setStatus(UserStatus.INACTIVE);
        user.setUpdatedAt(LocalDateTime.now());
        return toDTO(user);
    }
    
    @Transactional
    public UserDTO assignRoles(Long userId, List<Long> roleIds) {
        User user = userRepository.findById(userId);
        if (user == null) {
            throw new RuntimeException("Usuario no encontrado con ID: " + userId);
        }
        
        Set<Role> roles = roleIds.stream()
                .map(roleId -> roleRepository.findById(roleId))
                .filter(role -> role != null)
                .collect(Collectors.toSet());
        
        user.setRoles(roles);
        user.setUpdatedAt(LocalDateTime.now());
        return toDTO(user);
    }
    
    @Transactional
    public UserDTO removeRoles(Long userId, List<Long> roleIds) {
        User user = userRepository.findById(userId);
        if (user == null) {
            throw new RuntimeException("Usuario no encontrado con ID: " + userId);
        }
        
        Set<Role> rolesToRemove = roleIds.stream()
                .map(roleId -> roleRepository.findById(roleId))
                .filter(role -> role != null)
                .collect(Collectors.toSet());
        
        user.getRoles().removeAll(rolesToRemove);
        user.setUpdatedAt(LocalDateTime.now());
        return toDTO(user);
    }
    
    public List<UserDTO> getUsersByRole(String roleName) {
        return userRepository.findByRoleName(roleName).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<UserDTO> getUsersByStatus(UserStatus status) {
        return userRepository.findByStatus(status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<UserDTO> getUsersByType(UserType userType) {
        return userRepository.findByUserType(userType.name()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setDocument(user.getDocument());
        dto.setStatus(user.getStatus());
        dto.setUserType(user.getUserType());
        dto.setLastLogin(user.getLastLogin());
        dto.setPasswordChangedAt(user.getPasswordChangedAt());
        dto.setEmailVerified(user.getEmailVerified());
        dto.setEmailVerifiedAt(user.getEmailVerifiedAt());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setCreatedBy(user.getCreatedBy());
        dto.setUpdatedBy(user.getUpdatedBy());
        
        // Convertir roles a nombres
        if (user.getRoles() != null) {
            dto.setRoles(user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList()));
            
            // Obtener permisos de todos los roles
            dto.setPermissions(user.getRoles().stream()
                    .flatMap(role -> role.getPermissions().stream())
                    .map(permission -> permission.getName())
                    .distinct()
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
    

} 