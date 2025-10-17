package com.proptech.contacts.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contacts", schema = "proptech")
public class Contact extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    private ContactType type;

    @Enumerated(EnumType.STRING)
    private ContactStatus status;

    private String company;
    private String position;
    private String address;
    private String city;
    private String state;
    private String zip;
    private String country;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    private String source;
    
    @Column(name = "assigned_to")
    private String assignedTo;
    
    @Column(name = "last_contact")
    private LocalDateTime lastContact;
    
    @Column(name = "next_follow_up")
    private LocalDateTime nextFollowUp;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Budget information (stored as JSON)
    @Column(columnDefinition = "TEXT")
    private String budget;

    // Preferences information (stored as JSON)
    @Column(columnDefinition = "TEXT")
    private String preferences;

    // Tags (stored as JSON array)
    @Column(columnDefinition = "TEXT")
    private String tags;

    public enum ContactType {
        CLIENT, PROSPECT, BUYER, SELLER
    }

    public enum ContactStatus {
        ACTIVE, INACTIVE, LEAD, QUALIFIED, CONVERTED
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public ContactType getType() { return type; }
    public void setType(ContactType type) { this.type = type; }

    public ContactStatus getStatus() { return status; }
    public void setStatus(ContactStatus status) { this.status = status; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getZip() { return zip; }
    public void setZip(String zip) { this.zip = zip; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public LocalDateTime getLastContact() { return lastContact; }
    public void setLastContact(LocalDateTime lastContact) { this.lastContact = lastContact; }

    public LocalDateTime getNextFollowUp() { return nextFollowUp; }
    public void setNextFollowUp(LocalDateTime nextFollowUp) { this.nextFollowUp = nextFollowUp; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getBudget() { return budget; }
    public void setBudget(String budget) { this.budget = budget; }

    public String getPreferences() { return preferences; }
    public void setPreferences(String preferences) { this.preferences = preferences; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 