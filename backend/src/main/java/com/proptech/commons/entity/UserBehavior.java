package com.proptech.commons.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "user_behavior", schema = "proptech")
public class UserBehavior extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private String userId;
    
    @ElementCollection
    @CollectionTable(name = "user_viewed_properties", schema = "proptech", joinColumns = @JoinColumn(name = "user_behavior_id"))
    @Column(name = "property_id")
    private List<String> viewedProperties;
    
    @ElementCollection
    @CollectionTable(name = "user_favorited_properties", schema = "proptech", joinColumns = @JoinColumn(name = "user_behavior_id"))
    @Column(name = "property_id")
    private List<String> favoritedProperties;
    
    @ElementCollection
    @CollectionTable(name = "user_contacted_properties", schema = "proptech", joinColumns = @JoinColumn(name = "user_behavior_id"))
    @Column(name = "property_id")
    private List<String> contactedProperties;
    
    @ElementCollection
    @CollectionTable(name = "user_search_history", schema = "proptech", joinColumns = @JoinColumn(name = "user_behavior_id"))
    @Column(name = "search_term")
    private List<String> searchHistory;
    
    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public List<String> getViewedProperties() { return viewedProperties; }
    public void setViewedProperties(List<String> viewedProperties) { this.viewedProperties = viewedProperties; }
    
    public List<String> getFavoritedProperties() { return favoritedProperties; }
    public void setFavoritedProperties(List<String> favoritedProperties) { this.favoritedProperties = favoritedProperties; }
    
    public List<String> getContactedProperties() { return contactedProperties; }
    public void setContactedProperties(List<String> contactedProperties) { this.contactedProperties = contactedProperties; }
    
    public List<String> getSearchHistory() { return searchHistory; }
    public void setSearchHistory(List<String> searchHistory) { this.searchHistory = searchHistory; }
} 