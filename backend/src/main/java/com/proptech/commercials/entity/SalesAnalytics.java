package com.proptech.commercials.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "sales_analytics", schema = "proptech")
public class SalesAnalytics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date")
    private LocalDateTime date;

    @Column(name = "agent_id")
    private Long agentId;

    @Column(name = "stage")
    private String stage;

    @Column(name = "leads_count")
    private Integer leadsCount;

    @Column(name = "conversion_rate")
    private BigDecimal conversionRate;

    @Column(name = "avg_deal_size")
    private BigDecimal avgDealSize;

    @Column(name = "total_pipeline_value")
    private BigDecimal totalPipelineValue;

    @Column(name = "closed_won_count")
    private Integer closedWonCount;

    @Column(name = "closed_lost_count")
    private Integer closedLostCount;

    @Column(name = "avg_days_to_close")
    private Integer avgDaysToClose;

    @Column(name = "win_rate")
    private BigDecimal winRate;

    @Column(name = "revenue_generated")
    private BigDecimal revenueGenerated;

    @Column(name = "commission_generated")
    private BigDecimal commissionGenerated;

    @Column(name = "source_breakdown")
    private String sourceBreakdown; // JSON with source statistics

    @Column(name = "priority_breakdown")
    private String priorityBreakdown; // JSON with priority statistics

    @Column(name = "stage_velocity")
    private String stageVelocity; // JSON with average days per stage

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public Integer getLeadsCount() { return leadsCount; }
    public void setLeadsCount(Integer leadsCount) { this.leadsCount = leadsCount; }

    public BigDecimal getConversionRate() { return conversionRate; }
    public void setConversionRate(BigDecimal conversionRate) { this.conversionRate = conversionRate; }

    public BigDecimal getAvgDealSize() { return avgDealSize; }
    public void setAvgDealSize(BigDecimal avgDealSize) { this.avgDealSize = avgDealSize; }

    public BigDecimal getTotalPipelineValue() { return totalPipelineValue; }
    public void setTotalPipelineValue(BigDecimal totalPipelineValue) { this.totalPipelineValue = totalPipelineValue; }

    public Integer getClosedWonCount() { return closedWonCount; }
    public void setClosedWonCount(Integer closedWonCount) { this.closedWonCount = closedWonCount; }

    public Integer getClosedLostCount() { return closedLostCount; }
    public void setClosedLostCount(Integer closedLostCount) { this.closedLostCount = closedLostCount; }

    public Integer getAvgDaysToClose() { return avgDaysToClose; }
    public void setAvgDaysToClose(Integer avgDaysToClose) { this.avgDaysToClose = avgDaysToClose; }

    public BigDecimal getWinRate() { return winRate; }
    public void setWinRate(BigDecimal winRate) { this.winRate = winRate; }

    public BigDecimal getRevenueGenerated() { return revenueGenerated; }
    public void setRevenueGenerated(BigDecimal revenueGenerated) { this.revenueGenerated = revenueGenerated; }

    public BigDecimal getCommissionGenerated() { return commissionGenerated; }
    public void setCommissionGenerated(BigDecimal commissionGenerated) { this.commissionGenerated = commissionGenerated; }

    public String getSourceBreakdown() { return sourceBreakdown; }
    public void setSourceBreakdown(String sourceBreakdown) { this.sourceBreakdown = sourceBreakdown; }

    public String getPriorityBreakdown() { return priorityBreakdown; }
    public void setPriorityBreakdown(String priorityBreakdown) { this.priorityBreakdown = priorityBreakdown; }

    public String getStageVelocity() { return stageVelocity; }
    public void setStageVelocity(String stageVelocity) { this.stageVelocity = stageVelocity; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
} 