package com.proptech.contacts.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.proptech.contacts.dto.ContactDTO;
import com.proptech.contacts.entity.Contact;
import com.proptech.contacts.repository.ContactRepository;
import com.proptech.commons.dto.PaginatedResponse;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class ContactService {

    @Inject
    ContactRepository contactRepository;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public List<ContactDTO> listAll() {
        return contactRepository.listAll().stream()
            .map(ContactDTO::new)
            .collect(Collectors.toList());
    }

    public PaginatedResponse<ContactDTO> listAllPaginated(int page, int size) {
        long totalElements = contactRepository.count();
        List<Contact> contacts = contactRepository.findAllPaginated(page, size);
        
        List<ContactDTO> contactDTOs = contacts.stream()
            .map(ContactDTO::new)
            .collect(Collectors.toList());
        
        return new PaginatedResponse<>(contactDTOs, page, size, totalElements);
    }

    public PaginatedResponse<ContactDTO> searchPaginated(String searchTerm, int page, int size) {
        // Count total matching results
        long totalElements = contactRepository.count("firstName like ?1 or lastName like ?1 or email like ?1 or phone like ?1 or company like ?1", 
                                                    "%" + searchTerm + "%");
        
        List<Contact> contacts = contactRepository.searchContactsPaginated(searchTerm, page, size);
        
        List<ContactDTO> contactDTOs = contacts.stream()
            .map(ContactDTO::new)
            .collect(Collectors.toList());
        
        return new PaginatedResponse<>(contactDTOs, page, size, totalElements);
    }

    public PaginatedResponse<ContactDTO> findByTypePaginated(String type, int page, int size) {
        try {
            Contact.ContactType contactType = Contact.ContactType.valueOf(type.toUpperCase());
            
            long totalElements = contactRepository.count("type", contactType);
            List<Contact> contacts = contactRepository.findByTypePaginated(contactType, page, size);
            
            List<ContactDTO> contactDTOs = contacts.stream()
                .map(ContactDTO::new)
                .collect(Collectors.toList());
            
            return new PaginatedResponse<>(contactDTOs, page, size, totalElements);
        } catch (IllegalArgumentException e) {
            return new PaginatedResponse<>(List.of(), page, size, 0);
        }
    }

    public PaginatedResponse<ContactDTO> findByStatusPaginated(String status, int page, int size) {
        try {
            Contact.ContactStatus contactStatus = Contact.ContactStatus.valueOf(status.toUpperCase());
            
            long totalElements = contactRepository.count("status", contactStatus);
            List<Contact> contacts = contactRepository.findByStatusPaginated(contactStatus, page, size);
            
            List<ContactDTO> contactDTOs = contacts.stream()
                .map(ContactDTO::new)
                .collect(Collectors.toList());
            
            return new PaginatedResponse<>(contactDTOs, page, size, totalElements);
        } catch (IllegalArgumentException e) {
            return new PaginatedResponse<>(List.of(), page, size, 0);
        }
    }

    public PaginatedResponse<ContactDTO> findByAssignedToPaginated(String assignedTo, int page, int size) {
        long totalElements = contactRepository.count("assignedTo", assignedTo);
        List<Contact> contacts = contactRepository.findByAssignedToPaginated(assignedTo, page, size);
        
        List<ContactDTO> contactDTOs = contacts.stream()
            .map(ContactDTO::new)
            .collect(Collectors.toList());
        
        return new PaginatedResponse<>(contactDTOs, page, size, totalElements);
    }

    public Optional<ContactDTO> findById(Long id) {
        Contact contact = contactRepository.findById(id);
        return Optional.ofNullable(contact).map(ContactDTO::new);
    }

    @Transactional
    public ContactDTO create(ContactDTO dto) {
        Contact contact = dto.toEntity();
        contactRepository.persist(contact);
        return new ContactDTO(contact);
    }

    @Transactional
    public ContactDTO update(Long id, ContactDTO dto) {
        Contact contact = contactRepository.findById(id);
        if (contact == null) {
            throw new RuntimeException("Contact not found");
        }

        // Update fields
        contact.setFirstName(dto.firstName);
        contact.setLastName(dto.lastName);
        contact.setEmail(dto.email);
        contact.setPhone(dto.phone);
        contact.setType(dto.type != null ? Contact.ContactType.valueOf(dto.type.toUpperCase()) : null);
        contact.setStatus(dto.status != null ? Contact.ContactStatus.valueOf(dto.status.toUpperCase()) : null);
        contact.setCompany(dto.company);
        contact.setPosition(dto.position);
        contact.setAddress(dto.address);
        contact.setCity(dto.city);
        contact.setState(dto.state);
        contact.setZip(dto.zip);
        contact.setCountry(dto.country);
        contact.setNotes(dto.notes);
        contact.setSource(dto.source);
        contact.setAssignedTo(dto.assignedTo);
        
        // Serialize JSON fields
        contact.setBudget(serializeJson(dto.budget));
        contact.setPreferences(serializeJson(dto.preferences));
        contact.setTags(serializeJson(dto.tags));

        contactRepository.persist(contact);
        return new ContactDTO(contact);
    }

    @Transactional
    public boolean delete(Long id) {
        Contact contact = contactRepository.findById(id);
        if (contact == null) {
            return false;
        }
        contactRepository.delete(contact);
        return true;
    }

    public List<ContactDTO> findByType(String type) {
        try {
            Contact.ContactType contactType = Contact.ContactType.valueOf(type.toUpperCase());
            return contactRepository.findByType(contactType).stream()
                .map(ContactDTO::new)
                .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    public List<ContactDTO> findByStatus(String status) {
        try {
            Contact.ContactStatus contactStatus = Contact.ContactStatus.valueOf(status.toUpperCase());
            return contactRepository.findByStatus(contactStatus).stream()
                .map(ContactDTO::new)
                .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    public List<ContactDTO> search(String searchTerm) {
        return contactRepository.searchContacts(searchTerm).stream()
            .map(ContactDTO::new)
            .collect(Collectors.toList());
    }

    public List<ContactDTO> findByAssignedTo(String assignedTo) {
        return contactRepository.findByAssignedTo(assignedTo).stream()
            .map(ContactDTO::new)
            .collect(Collectors.toList());
    }

    public boolean existsByEmail(String email) {
        return contactRepository.existsByEmail(email);
    }

    private String serializeJson(Object obj) {
        if (obj == null) {
            return null;
        }
        
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
} 