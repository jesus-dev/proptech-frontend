package com.proptech.properties.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

import com.proptech.commons.repository.UserBehaviorRepository;
import com.proptech.properties.dto.PropertyDTO;
import com.proptech.properties.entity.Property;
import com.proptech.properties.repository.PropertyRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class PropertyRecommendationService {

    @Inject
    PropertyRepository propertyRepository;

    @Inject
    UserBehaviorRepository userBehaviorRepository;

    @Inject
    PropertyService propertyService;

    /**
     * Genera recomendaciones inteligentes basadas en múltiples factores
     */
    public List<PropertyRecommendation> generateRecommendations(
            Long userId, 
            RecommendationCriteria criteria, 
            int limit) {
        
        List<Property> allProperties = propertyRepository.listAll();
        List<PropertyRecommendation> recommendations = new ArrayList<>();

        // Obtener comportamiento del usuario
        UserBehavior userBehavior = getUserBehavior(userId);

        for (Property property : allProperties) {
            PropertyDTO propertyDTO = propertyService.mapToDTO(property);
            RecommendationScore score = calculateRecommendationScore(propertyDTO, criteria, userBehavior);
            
            if (score.getTotalScore() > 0.3) { // Umbral mínimo
                recommendations.add(new PropertyRecommendation(propertyDTO, score));
            }
        }

        // Ordenar por score descendente y limitar resultados
        return recommendations.stream()
                .sorted((a, b) -> Double.compare(b.getScore().getTotalScore(), a.getScore().getTotalScore()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Calcula el score de recomendación para una propiedad
     */
    private RecommendationScore calculateRecommendationScore(
            PropertyDTO property, 
            RecommendationCriteria criteria, 
            UserBehavior userBehavior) {
        
        RecommendationScore score = new RecommendationScore();

        // Factor de precio (25% del peso total)
        score.setPriceMatch(calculatePriceMatch(property, criteria));
        
        // Factor de ubicación (20% del peso total)
        score.setLocationMatch(calculateLocationMatch(property, criteria));
        
        // Factor de tipo de propiedad (15% del peso total)
        score.setTypeMatch(calculateTypeMatch(property, criteria));
        
        // Factor de amenidades (10% del peso total)
        score.setAmenityMatch(calculateAmenityMatch(property, criteria));
        
        // Factor de popularidad (10% del peso total)
        score.setPopularity(calculatePopularity(property, userBehavior));
        
        // Factor de urgencia (8% del peso total)
        score.setUrgency(calculateUrgency(property));
        
        // Factor de potencial de inversión (7% del peso total)
        score.setInvestmentPotential(calculateInvestmentPotential(property));
        
        // Factor de tendencia del mercado (5% del peso total)
        score.setMarketTrend(calculateMarketTrend(property));

        // Calcular score total ponderado
        double totalScore = 
            score.getPriceMatch() * 0.25 +
            score.getLocationMatch() * 0.20 +
            score.getTypeMatch() * 0.15 +
            score.getAmenityMatch() * 0.10 +
            score.getPopularity() * 0.10 +
            score.getUrgency() * 0.08 +
            score.getInvestmentPotential() * 0.07 +
            score.getMarketTrend() * 0.05;

        score.setTotalScore(totalScore);
        
        // Generar explicaciones
        score.setExplanations(generateExplanations(score, property));

        return score;
    }

    /**
     * Calcula el match de precio (0-1)
     */
    private double calculatePriceMatch(PropertyDTO property, RecommendationCriteria criteria) {
        BigDecimal price = property.getPrice();
        if (price == null) return 0.5;

        BigDecimal minPrice = criteria.getMinPrice();
        BigDecimal maxPrice = criteria.getMaxPrice();

        if (minPrice == null || maxPrice == null) return 0.5;

        if (price.compareTo(minPrice) >= 0 && price.compareTo(maxPrice) <= 0) {
            return 1.0; // Precio perfecto
        } else if (price.compareTo(minPrice) < 0) {
            return 0.8; // Bonus por estar bajo el presupuesto
        } else {
            // Penalización por estar sobre el presupuesto
            double penalty = price.subtract(maxPrice).doubleValue() / maxPrice.doubleValue();
            return Math.max(0, 1 - penalty);
        }
    }

    /**
     * Calcula el match de ubicación (0-1)
     */
    private double calculateLocationMatch(PropertyDTO property, RecommendationCriteria criteria) {
        List<String> preferredLocations = criteria.getPreferredLocations();
        if (preferredLocations == null || preferredLocations.isEmpty()) {
            return 0.5; // Neutral si no hay preferencias
        }

        String propertyLocation = property.getCity();
        if (propertyLocation == null) return 0.3;

        String normalizedLocation = propertyLocation.toLowerCase().trim();
        
        // Buscar coincidencias exactas o parciales
        for (String preferred : preferredLocations) {
            String normalizedPreferred = preferred.toLowerCase().trim();
            if (normalizedLocation.contains(normalizedPreferred) || 
                normalizedPreferred.contains(normalizedLocation)) {
                return 1.0;
            }
        }

        return 0.3; // Bajo match si no hay coincidencias
    }

    /**
     * Calcula el match de tipo de propiedad (0-1)
     */
    private double calculateTypeMatch(PropertyDTO property, RecommendationCriteria criteria) {
        List<String> preferredTypes = criteria.getPreferredTypes();
        if (preferredTypes == null || preferredTypes.isEmpty()) {
            return 0.7; // Neutral si no hay preferencias
        }

        String propertyType = property.getType();
        if (propertyType == null) return 0.3;

        String normalizedType = propertyType.toLowerCase().trim();
        
        for (String preferred : preferredTypes) {
            String normalizedPreferred = preferred.toLowerCase().trim();
            if (normalizedType.contains(normalizedPreferred) || 
                normalizedPreferred.contains(normalizedType)) {
                return 1.0;
            }
        }

        return 0.2; // Bajo match si no hay coincidencias
    }

    /**
     * Calcula el match de amenidades (0-1)
     */
    private double calculateAmenityMatch(PropertyDTO property, RecommendationCriteria criteria) {
        List<String> preferredAmenities = criteria.getPreferredAmenities();
        if (preferredAmenities == null || preferredAmenities.isEmpty()) {
            return 0.5; // Neutral si no hay preferencias
        }

        List<String> propertyAmenities = property.getAmenities() != null ? 
            property.getAmenities().stream().map(String::valueOf).collect(Collectors.toList()) : 
            new ArrayList<>();
        if (propertyAmenities == null || propertyAmenities.isEmpty()) {
            return 0.2;
        }

        int matches = 0;
        for (String preferred : preferredAmenities) {
            String normalizedPreferred = preferred.toLowerCase().trim();
            for (String propertyAmenity : propertyAmenities) {
                String normalizedPropertyAmenity = propertyAmenity.toLowerCase().trim();
                if (normalizedPropertyAmenity.contains(normalizedPreferred) || 
                    normalizedPreferred.contains(normalizedPropertyAmenity)) {
                    matches++;
                    break;
                }
            }
        }

        return (double) matches / preferredAmenities.size();
    }

    /**
     * Calcula la popularidad basada en comportamiento del usuario (0-1)
     */
    private double calculatePopularity(PropertyDTO property, UserBehavior userBehavior) {
        double popularity = 0.0;

        // Propiedades vistas
        if (userBehavior.getViewedProperties().contains(property.getId().toString())) {
            popularity += 0.3;
        }

        // Propiedades favoritas
        if (userBehavior.getFavoritedProperties().contains(property.getId().toString())) {
            popularity += 0.4;
        }

        // Propiedades contactadas
        if (userBehavior.getContactedProperties().contains(property.getId().toString())) {
            popularity += 0.3;
        }

        return popularity;
    }

    /**
     * Calcula la urgencia de la propiedad (0-1)
     */
    private double calculateUrgency(PropertyDTO property) {
        double urgency = 0.3; // Base

        // Propiedades destacadas
        if (Boolean.TRUE.equals(property.getFeatured())) {
            urgency += 0.3;
        }

        // Propiedades premium
        if (Boolean.TRUE.equals(property.getPremium())) {
            urgency += 0.4;
        }

        return Math.min(1.0, urgency);
    }

    /**
     * Calcula el potencial de inversión (0-1)
     */
    private double calculateInvestmentPotential(PropertyDTO property) {
        BigDecimal price = property.getPrice();
        Double area = property.getArea();
        
        if (price == null || area == null || area == 0) {
            return 0.5;
        }

        // Convert Double to BigDecimal for calculation
        BigDecimal areaBD = BigDecimal.valueOf(area);
        
        // Calcular precio por m²
        BigDecimal pricePerM2 = price.divide(areaBD, 2, BigDecimal.ROUND_HALF_UP);
        
        // Precio promedio por m² en Paraguay (ajustar según datos reales)
        BigDecimal avgPricePerM2 = new BigDecimal("1500");
        
        if (pricePerM2.compareTo(avgPricePerM2) < 0) {
            return 0.8; // Buen potencial de inversión
        } else if (pricePerM2.compareTo(avgPricePerM2.multiply(new BigDecimal("1.5"))) < 0) {
            return 0.6; // Potencial moderado
        } else {
            return 0.4; // Potencial bajo
        }
    }

    /**
     * Calcula la tendencia del mercado (0-1)
     */
    private double calculateMarketTrend(PropertyDTO property) {
        // Simulación de tendencia del mercado
        // En producción, esto vendría de análisis de datos históricos
        
        Random random = new Random(property.getId().hashCode()); // Determinístico
        return 0.6 + random.nextDouble() * 0.4; // Entre 0.6 y 1.0
    }

    /**
     * Genera explicaciones para la recomendación
     */
    private List<String> generateExplanations(RecommendationScore score, PropertyDTO property) {
        List<String> explanations = new ArrayList<>();

        if (score.getPriceMatch() > 0.8) {
            explanations.add("Perfecto para tu presupuesto");
        }
        
        if (score.getLocationMatch() > 0.8) {
            explanations.add("En tu zona preferida");
        }
        
        if (score.getTypeMatch() > 0.8) {
            explanations.add("Tipo de propiedad que buscas");
        }
        
        if (score.getAmenityMatch() > 0.7) {
            explanations.add("Tiene las amenidades que necesitas");
        }
        
        if (score.getPopularity() > 0.5) {
            explanations.add("Muy popular entre usuarios similares");
        }
        
        if (score.getUrgency() > 0.7) {
            explanations.add("Propiedad destacada");
        }
        
        if (score.getInvestmentPotential() > 0.7) {
            explanations.add("Excelente potencial de inversión");
        }

        return explanations;
    }

    /**
     * Obtiene el comportamiento del usuario
     */
    private UserBehavior getUserBehavior(Long userId) {
        // En producción, esto vendría de la base de datos
        // Por ahora, simulamos datos
        UserBehavior behavior = new UserBehavior();
        behavior.setUserId(userId);
        behavior.setViewedProperties(Arrays.asList("1", "3", "5", "7"));
        behavior.setFavoritedProperties(Arrays.asList("3", "7"));
        behavior.setContactedProperties(Arrays.asList("3"));
        behavior.setSearchHistory(Arrays.asList("casa villa morra", "apartamento centro"));
        return behavior;
    }

    /**
     * Registra comportamiento del usuario
     */
    @Transactional
    public void recordUserBehavior(Long userId, String propertyId, String action) {
        // Registrar comportamiento en la base de datos
        // Esto se usaría para mejorar las recomendaciones
    }

    /**
     * Obtiene recomendaciones basadas en similitud de propiedades
     */
    public List<PropertyDTO> getSimilarProperties(Long propertyId, int limit) {
        PropertyDTO targetProperty = propertyService.getPropertyById(propertyId);
        if (targetProperty == null) return new ArrayList<>();

        List<Property> allProperties = propertyRepository.listAll();
        Map<PropertyDTO, Double> similarities = new HashMap<>();

        for (Property property : allProperties) {
            if (property.getId().equals(propertyId)) continue;
            
            PropertyDTO propertyDTO = propertyService.mapToDTO(property);
            double similarity = calculateSimilarity(targetProperty, propertyDTO);
            similarities.put(propertyDTO, similarity);
        }

        return similarities.entrySet().stream()
                .sorted(Map.Entry.<PropertyDTO, Double>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Calcula la similitud entre dos propiedades
     */
    private double calculateSimilarity(PropertyDTO prop1, PropertyDTO prop2) {
        double similarity = 0.0;
        int factors = 0;

        // Similitud de precio
        if (prop1.getPrice() != null && prop2.getPrice() != null) {
            double priceDiff = Math.abs(prop1.getPrice().doubleValue() - prop2.getPrice().doubleValue());
            double maxPrice = Math.max(prop1.getPrice().doubleValue(), prop2.getPrice().doubleValue());
            similarity += (1 - priceDiff / maxPrice);
            factors++;
        }

        // Similitud de ubicación
        if (prop1.getCity() != null && prop2.getCity() != null) {
            if (prop1.getCity().equals(prop2.getCity())) {
                similarity += 1.0;
            }
            factors++;
        }

        // Similitud de tipo
        if (prop1.getType() != null && prop2.getType() != null) {
            if (prop1.getType().equals(prop2.getType())) {
                similarity += 1.0;
            }
            factors++;
        }

        // Similitud de habitaciones
        if (prop1.getBedrooms() != null && prop2.getBedrooms() != null) {
            double bedroomDiff = Math.abs(prop1.getBedrooms() - prop2.getBedrooms());
            similarity += (1 - bedroomDiff / 5.0); // Normalizar por máximo 5 habitaciones
            factors++;
        }

        return factors > 0 ? similarity / factors : 0.0;
    }

    // Clases de datos para las recomendaciones
    public static class PropertyRecommendation {
        private PropertyDTO property;
        private RecommendationScore score;

        public PropertyRecommendation(PropertyDTO property, RecommendationScore score) {
            this.property = property;
            this.score = score;
        }

        public PropertyDTO getProperty() { return property; }
        public void setProperty(PropertyDTO property) { this.property = property; }
        public RecommendationScore getScore() { return score; }
        public void setScore(RecommendationScore score) { this.score = score; }
    }

    public static class RecommendationScore {
        private double priceMatch;
        private double locationMatch;
        private double typeMatch;
        private double amenityMatch;
        private double popularity;
        private double urgency;
        private double investmentPotential;
        private double marketTrend;
        private double totalScore;
        private List<String> explanations;

        public RecommendationScore() {
            this.explanations = new ArrayList<>();
        }

        // Getters y Setters
        public double getPriceMatch() { return priceMatch; }
        public void setPriceMatch(double priceMatch) { this.priceMatch = priceMatch; }
        
        public double getLocationMatch() { return locationMatch; }
        public void setLocationMatch(double locationMatch) { this.locationMatch = locationMatch; }
        
        public double getTypeMatch() { return typeMatch; }
        public void setTypeMatch(double typeMatch) { this.typeMatch = typeMatch; }
        
        public double getAmenityMatch() { return amenityMatch; }
        public void setAmenityMatch(double amenityMatch) { this.amenityMatch = amenityMatch; }
        
        public double getPopularity() { return popularity; }
        public void setPopularity(double popularity) { this.popularity = popularity; }
        
        public double getUrgency() { return urgency; }
        public void setUrgency(double urgency) { this.urgency = urgency; }
        
        public double getInvestmentPotential() { return investmentPotential; }
        public void setInvestmentPotential(double investmentPotential) { this.investmentPotential = investmentPotential; }
        
        public double getMarketTrend() { return marketTrend; }
        public void setMarketTrend(double marketTrend) { this.marketTrend = marketTrend; }
        
        public double getTotalScore() { return totalScore; }
        public void setTotalScore(double totalScore) { this.totalScore = totalScore; }
        
        public List<String> getExplanations() { return explanations; }
        public void setExplanations(List<String> explanations) { this.explanations = explanations; }
    }

    public static class RecommendationCriteria {
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private List<String> preferredLocations;
        private List<String> preferredTypes;
        private List<String> preferredAmenities;
        private Integer minBedrooms;
        private Integer maxBedrooms;
        private Integer minBathrooms;
        private Integer maxBathrooms;
        private BigDecimal minArea;
        private BigDecimal maxArea;

        // Getters y Setters
        public BigDecimal getMinPrice() { return minPrice; }
        public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }
        
        public BigDecimal getMaxPrice() { return maxPrice; }
        public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }
        
        public List<String> getPreferredLocations() { return preferredLocations; }
        public void setPreferredLocations(List<String> preferredLocations) { this.preferredLocations = preferredLocations; }
        
        public List<String> getPreferredTypes() { return preferredTypes; }
        public void setPreferredTypes(List<String> preferredTypes) { this.preferredTypes = preferredTypes; }
        
        public List<String> getPreferredAmenities() { return preferredAmenities; }
        public void setPreferredAmenities(List<String> preferredAmenities) { this.preferredAmenities = preferredAmenities; }
        
        public Integer getMinBedrooms() { return minBedrooms; }
        public void setMinBedrooms(Integer minBedrooms) { this.minBedrooms = minBedrooms; }
        
        public Integer getMaxBedrooms() { return maxBedrooms; }
        public void setMaxBedrooms(Integer maxBedrooms) { this.maxBedrooms = maxBedrooms; }
        
        public Integer getMinBathrooms() { return minBathrooms; }
        public void setMinBathrooms(Integer minBathrooms) { this.minBathrooms = minBathrooms; }
        
        public Integer getMaxBathrooms() { return maxBathrooms; }
        public void setMaxBathrooms(Integer maxBathrooms) { this.maxBathrooms = maxBathrooms; }
        
        public BigDecimal getMinArea() { return minArea; }
        public void setMinArea(BigDecimal minArea) { this.minArea = minArea; }
        
        public BigDecimal getMaxArea() { return maxArea; }
        public void setMaxArea(BigDecimal maxArea) { this.maxArea = maxArea; }
    }

    public static class UserBehavior {
        private Long userId;
        private List<String> viewedProperties;
        private List<String> favoritedProperties;
        private List<String> contactedProperties;
        private List<String> searchHistory;
        private LocalDateTime lastActivity;

        public UserBehavior() {
            this.viewedProperties = new ArrayList<>();
            this.favoritedProperties = new ArrayList<>();
            this.contactedProperties = new ArrayList<>();
            this.searchHistory = new ArrayList<>();
        }

        // Getters y Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public List<String> getViewedProperties() { return viewedProperties; }
        public void setViewedProperties(List<String> viewedProperties) { this.viewedProperties = viewedProperties; }
        
        public List<String> getFavoritedProperties() { return favoritedProperties; }
        public void setFavoritedProperties(List<String> favoritedProperties) { this.favoritedProperties = favoritedProperties; }
        
        public List<String> getContactedProperties() { return contactedProperties; }
        public void setContactedProperties(List<String> contactedProperties) { this.contactedProperties = contactedProperties; }
        
        public List<String> getSearchHistory() { return searchHistory; }
        public void setSearchHistory(List<String> searchHistory) { this.searchHistory = searchHistory; }
        
        public LocalDateTime getLastActivity() { return lastActivity; }
        public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
    }
} 