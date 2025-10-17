package com.proptech.contacts.mapper;

import com.proptech.contacts.dto.ContactDTO;
import com.proptech.contacts.entity.Contact;

public class ContactMapper {
    public static ContactDTO toDTO(Contact contact) {
        if (contact == null) return null;
        ContactDTO dto = new ContactDTO();
        dto.id = contact.getId();
        dto.firstName = contact.getFirstName();
        dto.lastName = contact.getLastName();
        dto.name = contact.getFirstName() + " " + contact.getLastName();
        dto.email = contact.getEmail();
        dto.phone = contact.getPhone();
        dto.type = contact.getType() != null ? contact.getType().name() : null;
        dto.status = contact.getStatus() != null ? contact.getStatus().name() : null;
        dto.company = contact.getCompany();
        dto.position = contact.getPosition();
        dto.address = contact.getAddress();
        dto.city = contact.getCity();
        dto.state = contact.getState();
        dto.zip = contact.getZip();
        dto.country = contact.getCountry();
        dto.notes = contact.getNotes();
        dto.source = contact.getSource();
        dto.assignedTo = contact.getAssignedTo();
        dto.lastContact = contact.getLastContact();
        dto.nextFollowUp = contact.getNextFollowUp();
        dto.createdAt = contact.getCreatedAt();
        dto.updatedAt = contact.getUpdatedAt();
        dto.budget = contact.getBudget();
        dto.preferences = contact.getPreferences();
        dto.tags = contact.getTags();
        return dto;
    }

    public static Contact toEntity(ContactDTO dto) {
        if (dto == null) return null;
        Contact contact = new Contact();
        contact.setId(dto.id);
        contact.setFirstName(dto.firstName != null ? dto.firstName : (dto.name != null ? dto.name.split(" ", 2)[0] : null));
        contact.setLastName(dto.lastName != null ? dto.lastName : (dto.name != null && dto.name.split(" ", 2).length > 1 ? dto.name.split(" ", 2)[1] : ""));
        contact.setEmail(dto.email);
        contact.setPhone(dto.phone);
        if (dto.type != null) {
            try { contact.setType(Contact.ContactType.valueOf(dto.type)); } catch (Exception ignored) {}
        }
        if (dto.status != null) {
            try { contact.setStatus(Contact.ContactStatus.valueOf(dto.status)); } catch (Exception ignored) {}
        }
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
        contact.setLastContact(dto.lastContact);
        contact.setNextFollowUp(dto.nextFollowUp);
        contact.setCreatedAt(dto.createdAt);
        contact.setUpdatedAt(dto.updatedAt);
        contact.setBudget(dto.budget);
        contact.setPreferences(dto.preferences);
        contact.setTags(dto.tags);
        return contact;
    }
} 