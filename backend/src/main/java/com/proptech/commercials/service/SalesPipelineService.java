package com.proptech.commercials.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proptech.commercials.entity.SalesAnalytics;
import com.proptech.commercials.entity.SalesPipeline;
import com.proptech.commercials.repository.SalesAnalyticsRepository;
import com.proptech.commercials.repository.SalesPipelineRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class SalesPipelineService {

    @Inject
    SalesPipelineRepository pipelineRepository;

    @Inject
    SalesAnalyticsRepository analyticsRepository;

    @Inject
    ObjectMapper objectMapper;

    // CRUD Operations
    @Transactional
    public SalesPipeline createPipeline(SalesPipeline pipeline) {
        pipeline.setCreatedAt(LocalDateTime.now());
        pipeline.setUpdatedAt(LocalDateTime.now());
        pipeline.setStageChangesCount(0);
        pipeline.setLastStageChangeDate(LocalDateTime.now());
        pipelineRepository.persist(pipeline);
        return pipeline;
    }

    @Transactional
    public SalesPipeline updatePipeline(Long id, SalesPipeline updatedPipeline) {
        SalesPipeline pipeline = pipelineRepository.findById(id);
        if (pipeline == null) {
            throw new RuntimeException("Pipeline not found");
        }

        // Track stage changes
        if (!pipeline.getStage().equals(updatedPipeline.getStage())) {
            pipeline.setStageChangesCount(pipeline.getStageChangesCount() + 1);
            pipeline.setLastStageChangeDate(LocalDateTime.now());
        }

        // Update fields
        pipeline.setLeadId(updatedPipeline.getLeadId());
        pipeline.setPropertyId(updatedPipeline.getPropertyId());
        pipeline.setAgentId(updatedPipeline.getAgentId());
        pipeline.setStage(updatedPipeline.getStage());
        pipeline.setProbability(updatedPipeline.getProbability());
        pipeline.setExpectedValue(updatedPipeline.getExpectedValue());
        pipeline.setCurrency(updatedPipeline.getCurrency());
        pipeline.setSource(updatedPipeline.getSource());
        pipeline.setPriority(updatedPipeline.getPriority());
        pipeline.setNextAction(updatedPipeline.getNextAction());
        pipeline.setNextActionDate(updatedPipeline.getNextActionDate());
        pipeline.setLastContactDate(updatedPipeline.getLastContactDate());
        pipeline.setNotes(updatedPipeline.getNotes());
        pipeline.setTags(updatedPipeline.getTags());
        pipeline.setUpdatedAt(LocalDateTime.now());

        // Handle closed deals
        if (updatedPipeline.getStage().equals("CLOSED_WON") || updatedPipeline.getStage().equals("CLOSED_LOST")) {
            pipeline.setClosedAt(LocalDateTime.now());
            pipeline.setCloseReason(updatedPipeline.getCloseReason());
            pipeline.setActualValue(updatedPipeline.getActualValue());
            pipeline.setCommissionEarned(updatedPipeline.getCommissionEarned());
        }

        // Calculate days in pipeline
        pipeline.setDaysInPipeline((int) ChronoUnit.DAYS.between(pipeline.getCreatedAt(), LocalDateTime.now()));

        pipelineRepository.persist(pipeline);
        return pipeline;
    }

    @Transactional
    public void deletePipeline(Long id) {
        SalesPipeline pipeline = pipelineRepository.findById(id);
        if (pipeline != null) {
            pipelineRepository.delete(pipeline);
        }
    }

    public SalesPipeline getPipelineById(Long id) {
        return pipelineRepository.findById(id);
    }

    public List<SalesPipeline> getAllPipelines() {
        return pipelineRepository.listAll();
    }

    public List<SalesPipeline> getPipelinesByAgent(Long agentId) {
        return pipelineRepository.findByAgentId(agentId);
    }

    public List<SalesPipeline> getPipelinesByStage(String stage) {
        return pipelineRepository.findByStage(stage);
    }

    public List<SalesPipeline> getActivePipelines() {
        return pipelineRepository.findActivePipeline();
    }

    // Pipeline Management
    @Transactional
    public SalesPipeline moveToStage(Long pipelineId, String newStage, String notes) {
        SalesPipeline pipeline = pipelineRepository.findById(pipelineId);
        if (pipeline == null) {
            throw new RuntimeException("Pipeline not found");
        }

        pipeline.setStage(newStage);
        pipeline.setStageChangesCount(pipeline.getStageChangesCount() + 1);
        pipeline.setLastStageChangeDate(LocalDateTime.now());
        pipeline.setUpdatedAt(LocalDateTime.now());
        
        if (notes != null && !notes.isEmpty()) {
            String currentNotes = pipeline.getNotes() != null ? pipeline.getNotes() : "";
            pipeline.setNotes(currentNotes + "\n" + LocalDateTime.now() + ": " + notes);
        }

        // Set probability based on stage
        pipeline.setProbability(getProbabilityForStage(newStage));

        pipelineRepository.persist(pipeline);
        return pipeline;
    }

    @Transactional
    public SalesPipeline updateContact(Long pipelineId, String contactNotes) {
        SalesPipeline pipeline = pipelineRepository.findById(pipelineId);
        if (pipeline == null) {
            throw new RuntimeException("Pipeline not found");
        }

        pipeline.setLastContactDate(LocalDateTime.now());
        pipeline.setUpdatedAt(LocalDateTime.now());
        
        if (contactNotes != null && !contactNotes.isEmpty()) {
            String currentNotes = pipeline.getNotes() != null ? pipeline.getNotes() : "";
            pipeline.setNotes(currentNotes + "\n" + LocalDateTime.now() + " - Contacto: " + contactNotes);
        }

        pipelineRepository.persist(pipeline);
        return pipeline;
    }

    @Transactional
    public SalesPipeline closeDeal(Long pipelineId, String closeReason, BigDecimal actualValue, BigDecimal commissionEarned) {
        SalesPipeline pipeline = pipelineRepository.findById(pipelineId);
        if (pipeline == null) {
            throw new RuntimeException("Pipeline not found");
        }

        pipeline.setStage("CLOSED_WON");
        pipeline.setClosedAt(LocalDateTime.now());
        pipeline.setCloseReason(closeReason);
        pipeline.setActualValue(actualValue);
        pipeline.setCommissionEarned(commissionEarned);
        pipeline.setProbability(100);
        pipeline.setUpdatedAt(LocalDateTime.now());

        pipelineRepository.persist(pipeline);
        return pipeline;
    }

    @Transactional
    public SalesPipeline loseDeal(Long pipelineId, String closeReason) {
        SalesPipeline pipeline = pipelineRepository.findById(pipelineId);
        if (pipeline == null) {
            throw new RuntimeException("Pipeline not found");
        }

        pipeline.setStage("CLOSED_LOST");
        pipeline.setClosedAt(LocalDateTime.now());
        pipeline.setCloseReason(closeReason);
        pipeline.setProbability(0);
        pipeline.setUpdatedAt(LocalDateTime.now());

        pipelineRepository.persist(pipeline);
        return pipeline;
    }

    // Analytics Methods
    public Map<String, Object> getPipelineOverview() {
        Map<String, Object> overview = new HashMap<>();
        
        List<SalesPipeline> allPipelines = pipelineRepository.listAll();
        List<SalesPipeline> activePipelines = pipelineRepository.findActivePipeline();
        
        overview.put("totalPipelines", allPipelines.size());
        overview.put("activePipelines", activePipelines.size());
        overview.put("closedPipelines", allPipelines.size() - activePipelines.size());
        
        // Calculate total expected value
        BigDecimal totalExpectedValue = activePipelines.stream()
                .map(p -> p.getExpectedValue() != null ? p.getExpectedValue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        overview.put("totalExpectedValue", totalExpectedValue);
        
        // Calculate average probability (manejar nulls)
        double avgProbability = activePipelines.stream()
                .mapToInt(p -> p.getProbability() != null ? p.getProbability() : 0)
                .average()
                .orElse(0.0);
        overview.put("averageProbability", avgProbability);
        
        return overview;
    }

    public Map<String, Object> getStageBreakdown() {
        Map<String, Object> breakdown = new HashMap<>();
        List<SalesPipeline> activePipelines = pipelineRepository.findActivePipeline();
        
        Map<String, Long> stageCounts = activePipelines.stream()
                .collect(Collectors.groupingBy(SalesPipeline::getStage, Collectors.counting()));
        
        breakdown.put("stages", stageCounts);
        
        // Calculate value by stage
        Map<String, BigDecimal> stageValues = new HashMap<>();
        for (SalesPipeline pipeline : activePipelines) {
            String stage = pipeline.getStage();
            BigDecimal value = pipeline.getExpectedValue() != null ? pipeline.getExpectedValue() : BigDecimal.ZERO;
            stageValues.merge(stage, value, BigDecimal::add);
        }
        breakdown.put("stageValues", stageValues);
        
        return breakdown;
    }

    public Map<String, Object> getAgentPerformance() {
        Map<String, Object> performance = new HashMap<>();
        List<SalesPipeline> allPipelines = pipelineRepository.listAll();
        // Filtrar los que tienen agentId nulo
        Map<Long, List<SalesPipeline>> pipelinesByAgent = allPipelines.stream()
            .filter(p -> p.getAgentId() != null)
            .collect(Collectors.groupingBy(SalesPipeline::getAgentId));
        
        Map<String, Object> agentStats = new HashMap<>();
        for (Map.Entry<Long, List<SalesPipeline>> entry : pipelinesByAgent.entrySet()) {
            Long agentId = entry.getKey();
            List<SalesPipeline> agentPipelines = entry.getValue();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalPipelines", agentPipelines.size());
            stats.put("activePipelines", agentPipelines.stream().filter(p -> !p.getStage().startsWith("CLOSED")).count());
            stats.put("closedWon", agentPipelines.stream().filter(p -> "CLOSED_WON".equals(p.getStage())).count());
            stats.put("closedLost", agentPipelines.stream().filter(p -> "CLOSED_LOST".equals(p.getStage())).count());
            
            BigDecimal totalValue = agentPipelines.stream()
                    .map(p -> p.getExpectedValue() != null ? p.getExpectedValue() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            stats.put("totalValue", totalValue);
            
            agentStats.put(agentId.toString(), stats);
        }
        
        performance.put("agentPerformance", agentStats);
        return performance;
    }

    public Map<String, Object> getSourceAnalysis() {
        Map<String, Object> analysis = new HashMap<>();
        List<SalesPipeline> allPipelines = pipelineRepository.listAll();
        
        Map<String, Long> sourceCounts = allPipelines.stream()
                .filter(p -> p.getSource() != null)
                .collect(Collectors.groupingBy(SalesPipeline::getSource, Collectors.counting()));
        
        analysis.put("sourceCounts", sourceCounts);
        
        // Calculate conversion rates by source
        Map<String, Object> sourceConversion = new HashMap<>();
        for (String source : sourceCounts.keySet()) {
            List<SalesPipeline> sourcePipelines = allPipelines.stream()
                    .filter(p -> source.equals(p.getSource()))
                    .collect(Collectors.toList());
            
            long total = sourcePipelines.size();
            long won = sourcePipelines.stream().filter(p -> "CLOSED_WON".equals(p.getStage())).count();
            double conversionRate = total > 0 ? (double) won / total * 100 : 0;
            
            Map<String, Object> sourceStats = new HashMap<>();
            sourceStats.put("total", total);
            sourceStats.put("won", won);
            sourceStats.put("conversionRate", conversionRate);
            sourceConversion.put(source, sourceStats);
        }
        
        analysis.put("sourceConversion", sourceConversion);
        return analysis;
    }

    public List<SalesPipeline> getLeadsNeedingFollowUp(int daysThreshold) {
        LocalDateTime thresholdDate = LocalDateTime.now().minusDays(daysThreshold);
        return pipelineRepository.findByLastContactDateBefore(thresholdDate);
    }

    public List<SalesPipeline> getUpcomingActions() {
        LocalDateTime tomorrow = LocalDateTime.now().plusDays(1);
        return pipelineRepository.findByNextActionDateBefore(tomorrow);
    }

    public List<SalesPipeline> getHighProbabilityLeads(int minProbability) {
        return pipelineRepository.findByProbabilityGreaterThan(minProbability);
    }

    public List<SalesPipeline> getUrgentLeads() {
        return pipelineRepository.findByPriority("HIGH");
    }

    private int getProbabilityForStage(String stage) {
        switch (stage.toUpperCase()) {
            case "LEAD": return 10;
            case "CONTACTED": return 25;
            case "QUALIFIED": return 50;
            case "PROPOSAL": return 75;
            case "NEGOTIATION": return 90;
            case "CLOSED_WON": return 100;
            case "CLOSED_LOST": return 0;
            default: return 25;
        }
    }

    @Transactional
    public void generateDailyAnalytics() {
        // Generate daily analytics and store in SalesAnalytics table
        Map<String, Object> overview = getPipelineOverview();
        Map<String, Object> stageBreakdown = getStageBreakdown();
        
        SalesAnalytics analytics = new SalesAnalytics();
        analytics.setDate(LocalDateTime.now());
        analytics.setSourceBreakdown(serializeToJson(overview));
        analytics.setPriorityBreakdown(serializeToJson(stageBreakdown));
        analytics.setCreatedAt(LocalDateTime.now());
        
        analyticsRepository.persist(analytics);
    }

    private String serializeToJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }
} 