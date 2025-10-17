package com.proptech.contacts.dto;

import java.time.LocalDateTime;
import com.proptech.contacts.entity.Contact;

public class ContactDTO {
    public Long id;
    public String name; // Compatibilidad: firstName + " " + lastName
    public String firstName;
    public String lastName;
    public String email;
    public String phone;
    public String type;
    public String status;
    public String company;
    public String position;
    public String address;
    public String city;
    public String state;
    public String zip;
    public String country;
    public String notes;
    public String source;
    public String assignedTo;
    public LocalDateTime lastContact;
    public LocalDateTime nextFollowUp;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public String budget;
    public String preferences;
    public String tags;

    public ContactDTO() {
    }

    public ContactDTO(Contact contact) {
        if (contact == null) return;
        this.id = contact.getId();
        this.firstName = contact.getFirstName();
        this.lastName = contact.getLastName();
        this.email = contact.getEmail();
        this.phone = contact.getPhone();
        this.type = contact.getType() != null ? contact.getType().name() : null;
        this.status = contact.getStatus() != null ? contact.getStatus().name() : null;
        this.company = contact.getCompany();
        this.position = contact.getPosition();
        this.address = contact.getAddress();
        this.city = contact.getCity();
        this.state = contact.getState();
        this.zip = contact.getZip();
        this.country = contact.getCountry();
        this.notes = contact.getNotes();
        this.source = contact.getSource();
        this.assignedTo = contact.getAssignedTo();
        // Mapear otros campos según sea necesario
    }

    public Contact toEntity() {
        Contact contact = new Contact();
        contact.setId(this.id);
        contact.setFirstName(this.firstName);
        contact.setLastName(this.lastName);
        contact.setEmail(this.email);
        contact.setPhone(this.phone);
        contact.setType(this.type != null ? Contact.ContactType.valueOf(this.type.toUpperCase()) : null);
        contact.setStatus(this.status != null ? Contact.ContactStatus.valueOf(this.status.toUpperCase()) : null);
        contact.setCompany(this.company);
        contact.setPosition(this.position);
        contact.setAddress(this.address);
        contact.setCity(this.city);
        contact.setState(this.state);
        contact.setZip(this.zip);
        contact.setCountry(this.country);
        contact.setNotes(this.notes);
        contact.setSource(this.source);
        contact.setAssignedTo(this.assignedTo);
        // Mapear otros campos según sea necesario
        return contact;
    }
} 