package com.proptech.contacts.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

import com.proptech.contacts.entity.Contact;

@ApplicationScoped
public class ContactRepository implements PanacheRepository<Contact> {
    
    public Contact findByEmail(String email) {
        return find("email", email).firstResult();
    }
    
    public List<Contact> findByType(Contact.ContactType type) {
        return find("type", type).list();
    }
    
    public List<Contact> findByStatus(Contact.ContactStatus status) {
        return find("status", status).list();
    }
    
    public List<Contact> findByAssignedTo(String assignedTo) {
        return find("assignedTo", assignedTo).list();
    }
    
    public List<Contact> searchContacts(String searchTerm) {
        return find("firstName like ?1 or lastName like ?1 or email like ?1 or phone like ?1 or company like ?1", 
                   "%" + searchTerm + "%").list();
    }
    
    public List<Contact> findAllPaginated(int page, int size) {
        return findAll().page(page - 1, size).list();
    }
    
    public List<Contact> searchContactsPaginated(String searchTerm, int page, int size) {
        return find("firstName like ?1 or lastName like ?1 or email like ?1 or phone like ?1 or company like ?1", 
                   "%" + searchTerm + "%").page(page - 1, size).list();
    }
    
    public List<Contact> findByTypePaginated(Contact.ContactType type, int page, int size) {
        return find("type", type).page(page - 1, size).list();
    }
    
    public List<Contact> findByStatusPaginated(Contact.ContactStatus status, int page, int size) {
        return find("status", status).page(page - 1, size).list();
    }
    
    public List<Contact> findByAssignedToPaginated(String assignedTo, int page, int size) {
        return find("assignedTo", assignedTo).page(page - 1, size).list();
    }
    
    public boolean existsByEmail(String email) {
        return count("email", email) > 0;
    }
} 