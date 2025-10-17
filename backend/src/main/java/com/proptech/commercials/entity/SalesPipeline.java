package com.proptech.commercials.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "sales_pipeline", schema = "proptech")
public class SalesPipeline extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lead_id")
    private Long leadId;

    @Column(name = "property_id")
    private Long propertyId;

    @Column(name = "agent_id")
    private Long agentId;

    @Column(name = "stage")
    private String stage; // LEAD, CONTACTED, MEETING, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST

    @Column(name = "probability")
    private Integer probability; // 0-100%

    @Column(name = "expected_value")
    private BigDecimal expectedValue;

    @Column(name = "currency")
    private String currency;

    @Column(name = "source")
    private String source; // WEBSITE, REFERRAL, SOCIAL_MEDIA, COLD_CALL, etc.

    @Column(name = "priority")
    private String priority; // LOW, MEDIUM, HIGH, URGENT

    @Column(name = "next_action")
    private String nextAction;

    @Column(name = "next_action_date")
    private LocalDateTime nextActionDate;

    @Column(name = "last_contact_date")
    private LocalDateTime lastContactDate;

    @Column(name = "notes")
    private String notes;

    @Column(name = "tags")
    private String tags; // JSON array of tags

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "close_reason")
    private String closeReason;

    @Column(name = "actual_value")
    private BigDecimal actualValue;

    @Column(name = "commission_earned")
    private BigDecimal commissionEarned;

    // Campos para analytics
    @Column(name = "days_in_pipeline")
    private Integer daysInPipeline;

    @Column(name = "stage_changes_count")
    private Integer stageChangesCount;

    @Column(name = "last_stage_change_date")
    private LocalDateTime lastStageChangeDate;

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLeadId() { return leadId; }
    public void setLeadId(Long leadId) { this.leadId = leadId; }

    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }

    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public Integer getProbability() { return probability; }
    public void setProbability(Integer probability) { this.probability = probability; }

    public BigDecimal getExpectedValue() { return expectedValue; }
    public void setExpectedValue(BigDecimal expectedValue) { this.expectedValue = expectedValue; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getNextAction() { return nextAction; }
    public void setNextAction(String nextAction) { this.nextAction = nextAction; }

    public LocalDateTime getNextActionDate() { return nextActionDate; }
    public void setNextActionDate(LocalDateTime nextActionDate) { this.nextActionDate = nextActionDate; }

    public LocalDateTime getLastContactDate() { return lastContactDate; }
    public void setLastContactDate(LocalDateTime lastContactDate) { this.lastContactDate = lastContactDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }

    public String getCloseReason() { return closeReason; }
    public void setCloseReason(String closeReason) { this.closeReason = closeReason; }

    public BigDecimal getActualValue() { return actualValue; }
    public void setActualValue(BigDecimal actualValue) { this.actualValue = actualValue; }

    public BigDecimal getCommissionEarned() { return commissionEarned; }
    public void setCommissionEarned(BigDecimal commissionEarned) { this.commissionEarned = commissionEarned; }

    public Integer getDaysInPipeline() { return daysInPipeline; }
    public void setDaysInPipeline(Integer daysInPipeline) { this.daysInPipeline = daysInPipeline; }

    public Integer getStageChangesCount() { return stageChangesCount; }
    public void setStageChangesCount(Integer stageChangesCount) { this.stageChangesCount = stageChangesCount; }

    public LocalDateTime getLastStageChangeDate() { return lastStageChangeDate; }
    public void setLastStageChangeDate(LocalDateTime lastStageChangeDate) { this.lastStageChangeDate = lastStageChangeDate; }
} 