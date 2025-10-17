package com.proptech.partners.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "partners", schema = "proptech")
public class Partner extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    private String email;
    private String phone;
    
    @Column(name = "document_number")
    private String documentNumber;
    
    @Column(name = "document_type")
    private String documentType;
    
    private String type;
    private String status;
    
    @Column(name = "company_name")
    private String companyName;
    
    @Column(name = "company_registration")
    private String companyRegistration;
    
    private String position;
    private String address;
    private String city;
    private String state;
    
    @Column(name = "zip_code")
    private String zipCode;
    
    private String country;
    private String website;
    
    @Column(name = "social_media")
    private String socialMedia;
    
    @Column(name = "bank_account")
    private String bankAccount;
    
    @Column(name = "bank_name")
    private String bankName;
    
    @Column(name = "commission_rate")
    private BigDecimal commissionRate;
    
    @Column(name = "partnership_date")
    private LocalDateTime partnershipDate;
    
    @Column(name = "contract_start_date")
    private LocalDateTime contractStartDate;
    
    @Column(name = "contract_end_date")
    private LocalDateTime contractEndDate;
    
    @Column(name = "contract_value")
    private BigDecimal contractValue;
    
    private String currency;
    
    @Column(name = "payment_frequency")
    private String paymentFrequency;
    
    @Column(name = "next_payment_date")
    private LocalDateTime nextPaymentDate;
    
    @Column(name = "total_earnings")
    private BigDecimal totalEarnings;
    
    @Column(name = "pending_earnings")
    private BigDecimal pendingEarnings;
    
    @Column(name = "last_payment_date")
    private LocalDateTime lastPaymentDate;
    
    @Column(name = "last_payment_amount")
    private BigDecimal lastPaymentAmount;
    
    @Column(name = "assigned_agent_id")
    private Long assignedAgentId;
    
    @Column(name = "assigned_agency_id")
    private Long assignedAgencyId;
    
    private String notes;
    private String specializations;
    private String territories;
    private String languages;
    private String certifications;
    
    @Column(name = "experience_years")
    private Integer experienceYears;
    
    @Column(name = "properties_managed")
    private Integer propertiesManaged;
    
    @Column(name = "successful_deals")
    private Integer successfulDeals;
    
    @Column(name = "average_rating")
    private BigDecimal averageRating;
    
    @Column(name = "total_reviews")
    private Integer totalReviews;
    
    @Column(name = "is_verified")
    private Boolean isVerified;
    
    @Column(name = "verification_date")
    private LocalDateTime verificationDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    private String photo;
    
    // Getters y setters
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
    
    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }
    
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    
    public String getCompanyRegistration() { return companyRegistration; }
    public void setCompanyRegistration(String companyRegistration) { this.companyRegistration = companyRegistration; }
    
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    
    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }
    
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    
    public String getSocialMedia() { return socialMedia; }
    public void setSocialMedia(String socialMedia) { this.socialMedia = socialMedia; }
    
    public String getBankAccount() { return bankAccount; }
    public void setBankAccount(String bankAccount) { this.bankAccount = bankAccount; }
    
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    
    public BigDecimal getCommissionRate() { return commissionRate; }
    public void setCommissionRate(BigDecimal commissionRate) { this.commissionRate = commissionRate; }
    
    public LocalDateTime getPartnershipDate() { return partnershipDate; }
    public void setPartnershipDate(LocalDateTime partnershipDate) { this.partnershipDate = partnershipDate; }
    
    public LocalDateTime getContractStartDate() { return contractStartDate; }
    public void setContractStartDate(LocalDateTime contractStartDate) { this.contractStartDate = contractStartDate; }
    
    public LocalDateTime getContractEndDate() { return contractEndDate; }
    public void setContractEndDate(LocalDateTime contractEndDate) { this.contractEndDate = contractEndDate; }
    
    public BigDecimal getContractValue() { return contractValue; }
    public void setContractValue(BigDecimal contractValue) { this.contractValue = contractValue; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public String getPaymentFrequency() { return paymentFrequency; }
    public void setPaymentFrequency(String paymentFrequency) { this.paymentFrequency = paymentFrequency; }
    
    public LocalDateTime getNextPaymentDate() { return nextPaymentDate; }
    public void setNextPaymentDate(LocalDateTime nextPaymentDate) { this.nextPaymentDate = nextPaymentDate; }
    
    public BigDecimal getTotalEarnings() { return totalEarnings; }
    public void setTotalEarnings(BigDecimal totalEarnings) { this.totalEarnings = totalEarnings; }
    
    public BigDecimal getPendingEarnings() { return pendingEarnings; }
    public void setPendingEarnings(BigDecimal pendingEarnings) { this.pendingEarnings = pendingEarnings; }
    
    public LocalDateTime getLastPaymentDate() { return lastPaymentDate; }
    public void setLastPaymentDate(LocalDateTime lastPaymentDate) { this.lastPaymentDate = lastPaymentDate; }
    
    public BigDecimal getLastPaymentAmount() { return lastPaymentAmount; }
    public void setLastPaymentAmount(BigDecimal lastPaymentAmount) { this.lastPaymentAmount = lastPaymentAmount; }
    
    public Long getAssignedAgentId() { return assignedAgentId; }
    public void setAssignedAgentId(Long assignedAgentId) { this.assignedAgentId = assignedAgentId; }
    
    public Long getAssignedAgencyId() { return assignedAgencyId; }
    public void setAssignedAgencyId(Long assignedAgencyId) { this.assignedAgencyId = assignedAgencyId; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getSpecializations() { return specializations; }
    public void setSpecializations(String specializations) { this.specializations = specializations; }
    
    public String getTerritories() { return territories; }
    public void setTerritories(String territories) { this.territories = territories; }
    
    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }
    
    public String getCertifications() { return certifications; }
    public void setCertifications(String certifications) { this.certifications = certifications; }
    
    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    
    public Integer getPropertiesManaged() { return propertiesManaged; }
    public void setPropertiesManaged(Integer propertiesManaged) { this.propertiesManaged = propertiesManaged; }
    
    public Integer getSuccessfulDeals() { return successfulDeals; }
    public void setSuccessfulDeals(Integer successfulDeals) { this.successfulDeals = successfulDeals; }
    
    public BigDecimal getAverageRating() { return averageRating; }
    public void setAverageRating(BigDecimal averageRating) { this.averageRating = averageRating; }
    
    public Integer getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Integer totalReviews) { this.totalReviews = totalReviews; }
    
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    
    public LocalDateTime getVerificationDate() { return verificationDate; }
    public void setVerificationDate(LocalDateTime verificationDate) { this.verificationDate = verificationDate; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getPhoto() { return photo; }
    public void setPhoto(String photo) { this.photo = photo; }
} 