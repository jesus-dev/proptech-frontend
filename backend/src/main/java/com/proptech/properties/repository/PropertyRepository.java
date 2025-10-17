package com.proptech.properties.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import com.proptech.properties.entity.Property;
import com.proptech.properties.entity.PropertyFavorite;
import com.proptech.properties.entity.PropertyView;

@ApplicationScoped
public class PropertyRepository implements PanacheRepository<Property> {
    
    @Inject
    EntityManager entityManager;
    
    public Property findById(Long id) {
        // Use fetch join to eagerly load propertyType relationship
        Property property = entityManager.createQuery(
            "SELECT p FROM Property p " +
            "LEFT JOIN FETCH p.propertyType " +
            "WHERE p.id = :id", Property.class)
            .setParameter("id", id)
            .getSingleResult();
        
        if (property != null) {
            // Initialize collections to avoid lazy loading issues
            property.getAmenities().size();
            property.getServices().size();
        }
        return property;
    }
    
    public List<Property> findAllPaginated(int page, int size) {
        return findAll().page(page - 1, size).list();
    }
    
    public List<Property> listAllWithCollections() {
        List<Property> properties = listAll();
        // Initialize lazy collections for each property
        for (Property property : properties) {
            if (property.getAmenities() != null) {
                property.getAmenities().size();
            }
            if (property.getServices() != null) {
                property.getServices().size();
            }
            if (property.getPrivateFiles() != null) {
                property.getPrivateFiles().size();
            }
            if (property.getGalleryImages() != null) {
                property.getGalleryImages().size();
            }
        }
        return properties;
    }
    
    public void recalculateAllFavoritesCount() {
        List<Property> properties = listAll();
        for (Property property : properties) {
            Long favoritesCount = PropertyFavorite.count("propertyId = ?1 and isActive = true", property.getId());
            property.setFavoritesCount(favoritesCount.intValue());
            property.persist();
        }
    }
    
    public Integer getFavoritesCount(Long propertyId) {
        Long count = PropertyFavorite.count("propertyId = ?1 and isActive = true", propertyId);
        return count.intValue();
    }

    public List<Map<String, Object>> getPropertyTypesSummary() {

        // Traer todos los tipos activos desde la tabla property_types
        List<Object[]> types = entityManager.createQuery(
            "SELECT t.name FROM PropertyType t WHERE t.active = true", Object[].class)
            .getResultList();

        // Crear lista auxiliar para ordenar por count
        List<Map<String, Object>> allTypes = new ArrayList<>();

        for (Object[] typeRow : types) {
            String typeName = (String) typeRow[0];
            Map<String, Object> typeSummary = new HashMap<>();
            typeSummary.put("type", typeName);

            // Contar propiedades activas de este tipo
            Long count = entityManager.createQuery(
                "SELECT COUNT(p) FROM Property p WHERE p.propertyType.name = :typeName", Long.class)
                .setParameter("typeName", typeName)
                .getSingleResult();
            typeSummary.put("count", count.intValue());

            // Buscar la propiedad más reciente de este tipo
            List<Property> exampleList = entityManager.createQuery(
                "SELECT p FROM Property p WHERE p.propertyType.name = :typeName ORDER BY p.createdAt DESC", Property.class)
                .setParameter("typeName", typeName)
                .setMaxResults(1)
                .getResultList();
            if (!exampleList.isEmpty()) {
                Property example = exampleList.get(0);
                Map<String, Object> exampleMap = new HashMap<>();
                exampleMap.put("id", example.getId());
                exampleMap.put("title", example.getTitle());
                exampleMap.put("price", example.getPrice());
                exampleMap.put("currency", example.getCurrency());
                exampleMap.put("city", example.getCity() != null ? example.getCity().getName() : null);
                exampleMap.put("slug", example.getId() + "-" + (example.getTitle() != null ? example.getTitle().toLowerCase().replaceAll("[^a-z0-9]+", "-") : ""));
                String imageUrl = null;
                if (example.getGalleryImages() != null && !example.getGalleryImages().isEmpty()) {
                    imageUrl = example.getGalleryImages().get(0).getUrl();
                } else if (example.getFeaturedImage() != null) {
                    imageUrl = example.getFeaturedImage();
                }
                exampleMap.put("image", imageUrl);
                typeSummary.put("example", exampleMap);
            } else {
                typeSummary.put("example", null);
            }
            allTypes.add(typeSummary);
        }
        // Ordenar por count descendente y devolver solo los 4 primeros
        allTypes.sort((a, b) -> Integer.compare((int) b.get("count"), (int) a.get("count")));
        return allTypes.stream().limit(4).toList();
    }

    public List<Map<String, Object>> getCategorySummary() {
        List<Map<String, Object>> summary = new ArrayList<>();

        // En Venta - usar código interno ACTIVE en lugar de ID hardcodeado
        Long ventaCount = entityManager.createQuery(
            "SELECT COUNT(p) FROM Property p WHERE (p.operacion = 'SALE' OR p.operacion = 'BOTH') AND p.propertyStatus.code = 'ACTIVE'", Long.class)
            .getSingleResult();
        List<Property> ventaExampleList = entityManager.createQuery(
            "SELECT p FROM Property p WHERE (p.operacion = 'SALE' OR p.operacion = 'BOTH') AND p.propertyStatus.code = 'ACTIVE' ORDER BY p.createdAt DESC", Property.class)
            .setMaxResults(1)
            .getResultList();
        Map<String, Object> venta = new HashMap<>();
        venta.put("category", "En Venta");
        venta.put("count", ventaCount.intValue());
        if (!ventaExampleList.isEmpty()) {
            Property example = ventaExampleList.get(0);
            Map<String, Object> exampleMap = new HashMap<>();
            exampleMap.put("id", example.getId());
            exampleMap.put("title", example.getTitle());
            exampleMap.put("price", example.getPrice());
            exampleMap.put("currency", example.getCurrency());
            exampleMap.put("city", example.getCity() != null ? example.getCity().getName() : null);
            exampleMap.put("slug", example.getId() + "-" + (example.getTitle() != null ? example.getTitle().toLowerCase().replaceAll("[^a-z0-9]+", "-") : ""));
            String imageUrl = null;
            if (example.getGalleryImages() != null && !example.getGalleryImages().isEmpty()) {
                imageUrl = example.getGalleryImages().get(0).getUrl();
            } else if (example.getFeaturedImage() != null) {
                imageUrl = example.getFeaturedImage();
            }
            exampleMap.put("image", imageUrl);
            venta.put("example", exampleMap);
        } else {
            venta.put("example", null);
        }
        summary.add(venta);

        // En Alquiler - usar código interno ACTIVE en lugar de ID hardcodeado
        Long alquilerCount = entityManager.createQuery(
            "SELECT COUNT(p) FROM Property p WHERE (p.operacion = 'RENT' OR p.operacion = 'BOTH') AND p.propertyStatus.code = 'ACTIVE'", Long.class)
            .getSingleResult();
        List<Property> alquilerExampleList = entityManager.createQuery(
            "SELECT p FROM Property p WHERE (p.operacion = 'RENT' OR p.operacion = 'BOTH') AND p.propertyStatus.code = 'ACTIVE' ORDER BY p.createdAt DESC", Property.class)
            .setMaxResults(1)
            .getResultList();
        Map<String, Object> alquiler = new HashMap<>();
        alquiler.put("category", "En Alquiler");
        alquiler.put("count", alquilerCount.intValue());
        if (!alquilerExampleList.isEmpty()) {
            Property example = alquilerExampleList.get(0);
            Map<String, Object> exampleMap = new HashMap<>();
            exampleMap.put("id", example.getId());
            exampleMap.put("title", example.getTitle());
            exampleMap.put("price", example.getPrice());
            exampleMap.put("currency", example.getCurrency());
            exampleMap.put("city", example.getCity() != null ? example.getCity().getName() : null);
            exampleMap.put("slug", example.getId() + "-" + (example.getTitle() != null ? example.getTitle().toLowerCase().replaceAll("[^a-z0-9]+", "-") : ""));
            String imageUrl = null;
            if (example.getGalleryImages() != null && !example.getGalleryImages().isEmpty()) {
                imageUrl = example.getGalleryImages().get(0).getUrl();
            } else if (example.getFeaturedImage() != null) {
                imageUrl = example.getFeaturedImage();
            }
            exampleMap.put("image", imageUrl);
            alquiler.put("example", exampleMap);
        } else {
            alquiler.put("example", null);
        }
        summary.add(alquiler);

        return summary;
    }

    public List<Property> findByPropertyType(Long propertyTypeId) {
        return find("propertyType.id", propertyTypeId).list();
    }
    
    public List<Property> findByPropertyStatus(Long propertyStatusId) {
        return find("propertyStatus.id", propertyStatusId).list();
    }
    
    public List<Property> findByCity(Long cityId) {
        return find("city.id", cityId).list();
    }
    
    public List<Property> findByAgency(Long agencyId) {
        return find("agency.id", agencyId).list();
    }
    
    public List<Property> findByAgent(Long agentId) {
        return find("agent.id", agentId).list();
    }
    
    public List<Property> findByPriceRange(Double minPrice, Double maxPrice) {
        return find("price between ?1 and ?2", minPrice, maxPrice).list();
    }
    
    public List<Property> findBySyncStatus(String syncStatus) {
        return find("syncStatus", syncStatus).list();
    }
    
    public List<Property> findFavoritesByUserId(Long userId) {
        return entityManager.createQuery(
            "SELECT p FROM Property p JOIN PropertyFavorite pf ON p.id = pf.propertyId WHERE pf.userId = :userId AND pf.isActive = true", 
            Property.class)
            .setParameter("userId", userId)
            .getResultList();
    }
    
    public void addToFavorites(Long propertyId, Long userId) {
        PropertyFavorite favorite = new PropertyFavorite();
        favorite.setPropertyId(propertyId);
        favorite.setUserId(userId);
        entityManager.persist(favorite);
    }
    
    public void removeFromFavorites(Long propertyId, Long userId) {
        entityManager.createQuery("UPDATE PropertyFavorite pf SET pf.isActive = false, pf.removedAt = CURRENT_TIMESTAMP WHERE pf.propertyId = :propertyId AND pf.userId = :userId")
            .setParameter("propertyId", propertyId)
            .setParameter("userId", userId)
            .executeUpdate();
    }

    public Optional<Property> findBySlug(String slug) {
        return find("slug", slug).firstResultOptional();
    }

    public long getTotalViews() {
        Long result = entityManager.createQuery(
            "SELECT COALESCE(SUM(p.views), 0) FROM Property p", Long.class)
            .getSingleResult();
        return result != null ? result : 0;
    }

    public long getTotalFavorites() {
        Long result = entityManager.createQuery(
            "SELECT COALESCE(SUM(p.favoritesCount), 0) FROM Property p", Long.class)
            .getSingleResult();
        return result != null ? result : 0;
    }

    public long getTotalShares() {
        Long result = entityManager.createQuery(
            "SELECT COALESCE(SUM(p.shares), 0) FROM Property p", Long.class)
            .getSingleResult();
        return result != null ? result : 0;
    }

    public List<Property> findMostViewed(int limit) {
        return entityManager.createQuery(
            "SELECT p FROM Property p ORDER BY p.views DESC", Property.class)
            .setMaxResults(limit)
            .getResultList();
    }

    public List<Property> findMostFavorited(int limit) {
        return entityManager.createQuery(
            "SELECT p FROM Property p ORDER BY p.favoritesCount DESC", Property.class)
            .setMaxResults(limit)
            .getResultList();
    }

    // Métodos para estadísticas individuales de propiedades
    public long getPropertyViews(Long propertyId) {
        Property property = findById(propertyId);
        return property != null && property.getViews() != null ? property.getViews() : 0;
    }

    public long getPropertyFavorites(Long propertyId) {
        Property property = findById(propertyId);
        return property != null && property.getFavoritesCount() != null ? property.getFavoritesCount() : 0;
    }

    public long getPropertyShares(Long propertyId) {
        Property property = findById(propertyId);
        return property != null && property.getShares() != null ? property.getShares() : 0;
    }

    public long getPropertyContacts(Long propertyId) {
        // Contar contactos relacionados con esta propiedad
        Long result = entityManager.createQuery(
            "SELECT COUNT(c) FROM Contact c WHERE c.source LIKE :propertyId", Long.class)
            .setParameter("propertyId", "%" + propertyId + "%")
            .getSingleResult();
        return result != null ? result : 0;
    }

    public List<Map<String, Object>> getPropertyViewsTrend(Long propertyId, int days) {
        List<Map<String, Object>> trend = new ArrayList<>();
        
        // Intentar obtener datos reales de la tabla property_views
        try {
            List<Object[]> viewStats = entityManager.createQuery(
                "SELECT DATE(pv.viewedAt), COUNT(pv) FROM PropertyView pv " +
                "WHERE pv.propertyId = :propertyId " +
                "AND pv.viewedAt >= :startDate " +
                "GROUP BY DATE(pv.viewedAt) " +
                "ORDER BY DATE(pv.viewedAt)", Object[].class)
                .setParameter("propertyId", propertyId)
                .setParameter("startDate", java.time.LocalDate.now().minusDays(days))
                .getResultList();
            
            // Crear mapa de fechas con vistas
            Map<String, Long> viewsByDate = new HashMap<>();
            for (Object[] row : viewStats) {
                String date = row[0].toString();
                Long count = (Long) row[1];
                viewsByDate.put(date, count);
            }
            
            // Llenar todas las fechas del rango
            for (int i = days - 1; i >= 0; i--) {
                Map<String, Object> day = new HashMap<>();
                String date = java.time.LocalDate.now().minusDays(i).toString();
                day.put("date", date);
                day.put("views", viewsByDate.getOrDefault(date, 0L));
                trend.add(day);
            }
        } catch (Exception e) {
            // Si no existe la tabla o hay error, usar datos simulados
            Property property = findById(propertyId);
            int totalViews = property != null && property.getViews() != null ? property.getViews() : 0;
            
            for (int i = days - 1; i >= 0; i--) {
                Map<String, Object> day = new HashMap<>();
                day.put("date", java.time.LocalDate.now().minusDays(i).toString());
                int dailyViews = Math.max(0, totalViews / days + (int)(Math.random() * (totalViews / days / 2)));
                day.put("views", dailyViews);
                trend.add(day);
            }
        }
        
        return trend;
    }

    public List<Map<String, Object>> getPropertyContactsTrend(Long propertyId, int days) {
        // Contar contactos por día para esta propiedad
        List<Map<String, Object>> trend = new ArrayList<>();
        long totalContacts = getPropertyContacts(propertyId);
        
        for (int i = days - 1; i >= 0; i--) {
            Map<String, Object> day = new HashMap<>();
            day.put("date", java.time.LocalDate.now().minusDays(i).toString());
            // Distribuir contactos de manera realista
            int dailyContacts = Math.max(0, (int)(totalContacts / days) + (int)(Math.random() * 2));
            day.put("contacts", dailyContacts);
            trend.add(day);
        }
        return trend;
    }

    public List<Map<String, Object>> getPropertyPriceHistory(Long propertyId) {
        // Por ahora solo el precio actual, en el futuro se puede implementar historial
        List<Map<String, Object>> history = new ArrayList<>();
        Property property = findById(propertyId);
        
        if (property != null && property.getPrice() != null) {
            Map<String, Object> currentPrice = new HashMap<>();
            currentPrice.put("date", java.time.LocalDate.now().toString());
            currentPrice.put("price", property.getPrice());
            currentPrice.put("reason", "Precio actual");
            currentPrice.put("change", 0);
            history.add(currentPrice);
        }
        
        return history;
    }

    public Map<String, Object> getPropertyMarketComparison(Long propertyId) {
        Property property = findById(propertyId);
        if (property == null) {
            return new HashMap<>();
        }
        
        // Obtener estadísticas del mercado para comparar
        long totalViews = getTotalViews();
        long totalFavorites = getTotalFavorites();
        
        // Calcular rankings basados en vistas y favoritos
        int viewsRank = 0;
        int favoritesRank = 0;
        int engagementRank = 0;
        
        if (property.getViews() != null && totalViews > 0) {
            double viewsPercentage = (double) property.getViews() / totalViews * 100;
            if (viewsPercentage >= 80) viewsRank = 1; // Top 20%
            else if (viewsPercentage >= 60) viewsRank = 2; // Top 40%
            else if (viewsPercentage >= 40) viewsRank = 3; // Top 60%
            else if (viewsPercentage >= 20) viewsRank = 4; // Top 80%
            else viewsRank = 5; // Bottom 20%
        }
        
        if (property.getFavoritesCount() != null && totalFavorites > 0) {
            double favoritesPercentage = (double) property.getFavoritesCount() / totalFavorites * 100;
            if (favoritesPercentage >= 80) favoritesRank = 1;
            else if (favoritesPercentage >= 60) favoritesRank = 2;
            else if (favoritesPercentage >= 40) favoritesRank = 3;
            else if (favoritesPercentage >= 20) favoritesRank = 4;
            else favoritesRank = 5;
        }
        
        // Calcular engagement rate (favoritos / vistas)
        double engagementRate = 0;
        if (property.getViews() != null && property.getViews() > 0 && property.getFavoritesCount() != null) {
            engagementRate = (double) property.getFavoritesCount() / property.getViews() * 100;
        }
        
        Map<String, Object> comparison = new HashMap<>();
        comparison.put("viewsRank", getRankText(viewsRank));
        comparison.put("favoritesRank", getRankText(favoritesRank));
        comparison.put("engagementRank", getRankText(engagementRank));
        comparison.put("engagementRate", Math.round(engagementRate * 100) / 100.0);
        
        return comparison;
    }

    private String getRankText(int rank) {
        switch (rank) {
            case 1: return "Top 20%";
            case 2: return "Top 40%";
            case 3: return "Top 60%";
            case 4: return "Top 80%";
            case 5: return "Bottom 20%";
            default: return "N/A";
        }
    }

    @Transactional
    public void recordPropertyView(Long propertyId, String visitorId, Long userId, String ipAddress, String userAgent, String referrer, String sessionId) {
        try {
            PropertyView view = new PropertyView();
            view.setPropertyId(propertyId);
            view.setVisitorId(visitorId);
            view.setUserId(userId);
            view.setIpAddress(ipAddress);
            view.setUserAgent(userAgent);
            view.setReferrer(referrer);
            view.setSessionId(sessionId);
            entityManager.persist(view);
            
            // También incrementar el contador en la propiedad
            Property property = findById(propertyId);
            if (property != null) {
                property.setViews((property.getViews() == null ? 0 : property.getViews()) + 1);
                property.persist();
            }
        } catch (Exception e) {
            // Si hay error, solo incrementar el contador básico
            Property property = findById(propertyId);
            if (property != null) {
                property.setViews((property.getViews() == null ? 0 : property.getViews()) + 1);
                property.persist();
            }
        }
    }

    public List<Property> findByFilters(String operacion, String type, String city, Double minPrice, Double maxPrice, Integer bedrooms, Integer bathrooms, String status) {
        StringBuilder query = new StringBuilder("SELECT p FROM Property p WHERE 1=1");
        if (operacion != null) query.append(" AND p.operacion = :operacion");
        if (type != null) query.append(" AND p.propertyType.name = :type");
        if (city != null) query.append(" AND p.city.name = :city");
        if (minPrice != null) query.append(" AND p.price >= :minPrice");
        if (maxPrice != null) query.append(" AND p.price <= :maxPrice");
        if (bedrooms != null) query.append(" AND p.bedrooms = :bedrooms");
        if (bathrooms != null) query.append(" AND p.bathrooms = :bathrooms");
        if (status != null) query.append(" AND p.status = :status");
        var q = getEntityManager().createQuery(query.toString(), Property.class);
        if (operacion != null) {
            try {
                Property.OperacionType operacionType = Property.OperacionType.valueOf(operacion.toUpperCase());
                q.setParameter("operacion", operacionType);
            } catch (IllegalArgumentException e) {
                // Si el valor no es válido, no aplicar el filtro
                System.err.println("Invalid operacion value: " + operacion);
            }
        }
        if (type != null) q.setParameter("type", type);
        if (city != null) q.setParameter("city", city);
        if (minPrice != null) q.setParameter("minPrice", minPrice);
        if (maxPrice != null) q.setParameter("maxPrice", maxPrice);
        if (bedrooms != null) q.setParameter("bedrooms", bedrooms);
        if (bathrooms != null) q.setParameter("bathrooms", bathrooms);
        if (status != null) q.setParameter("status", status);
        return q.getResultList();
    }
} 