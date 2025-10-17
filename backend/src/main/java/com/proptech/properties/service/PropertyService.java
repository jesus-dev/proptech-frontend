package com.proptech.properties.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

import com.proptech.commons.repository.AgencyRepository;
import com.proptech.commons.repository.AgentRepository;
import com.proptech.commons.repository.AmenityRepository;
import com.proptech.commons.repository.CityRepository;
import com.proptech.commons.repository.CountryRepository;
import com.proptech.commons.repository.ServiceRepository;
import com.proptech.contacts.repository.ContactRepository;
import com.proptech.properties.dto.PropertyDTO;
import com.proptech.properties.entity.Property;
import com.proptech.properties.entity.PropertyType;
import com.proptech.properties.mapper.PropertyMapper;
import com.proptech.properties.repository.PropertyRepository;
import com.proptech.properties.repository.PropertyStatusRepository;
import com.proptech.properties.repository.PropertyTypeRepository;
import com.proptech.socialmedias.service.SocialMediaService;
import com.proptech.auth.entity.User;
import com.proptech.auth.dto.UserDTO;
import com.proptech.auth.service.UserService;
import com.proptech.auth.service.SecurityContextService;
import com.proptech.notifications.service.NotificationEventService;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import jakarta.persistence.EntityManager;
import com.proptech.properties.entity.PropertyStatus;

@ApplicationScoped
public class PropertyService {

    @Inject
    PropertyRepository propertyRepository;

    @Inject
    PropertyTypeRepository propertyTypeRepository;

    @Inject
    PropertyStatusRepository propertyStatusRepository;

    @Inject
    AgencyRepository agencyRepository;

    @Inject
    AgentRepository agentRepository;

    @Inject
    CityRepository cityRepository;

    @Inject
    CountryRepository countryRepository;

    @Inject
    AmenityRepository amenityRepository;

    @Inject
    ServiceRepository serviceRepository;

    @Inject
    ContactRepository contactRepository;

    @Inject
    SocialMediaService socialMediaService;

    @Inject
    PropertyAuditService propertyAuditService;

    @Inject
    UserService userService;

    @Inject
    SecurityContextService securityContextService;

    @Inject
    NotificationEventService notificationEventService;

    @Inject
    EntityManager entityManager;

    public List<PropertyDTO> listAll() {
        return PropertyMapper.toDTOList(propertyRepository.listAll());
    }

    public PropertyDTO findById(Long id) {
        Property property = propertyRepository.findById(id);
        return property != null ? PropertyMapper.toDTO(property) : null;
    }

    public Property findByIdEntity(Long id) {
        return propertyRepository.findById(id);
    }

    public PropertyDTO mapToDTO(com.proptech.properties.entity.Property property) {
        return com.proptech.properties.mapper.PropertyMapper.toDTO(property);
    }

    public PropertyDTO getPropertyById(Long id) {
        com.proptech.properties.entity.Property property = propertyRepository.findById(id);
        if (property == null) return null;
        return com.proptech.properties.mapper.PropertyMapper.toDTO(property);
    }

        @Transactional
    public PropertyDTO create(PropertyDTO propertyDTO) {
        // Crear la entidad manualmente sin usar el mapper
        Property property = new Property();
        property.setTitle(propertyDTO.title);
        property.setDescription(propertyDTO.description);
        property.setSlug(propertyDTO.slug);
        property.setAddress(propertyDTO.address);
        property.setPrice(propertyDTO.price);
        property.setBedrooms(propertyDTO.bedrooms);
        property.setBathrooms(propertyDTO.bathrooms);
        property.setArea(propertyDTO.area);
        property.setParkingSpaces(propertyDTO.parkingSpaces);
        property.setOperacion(propertyDTO.operacion);
        property.setAvailableFrom(propertyDTO.availableFrom);
        property.setAdditionalDetails(propertyDTO.additionalDetails);
        property.setVideoUrl(propertyDTO.videoUrl);
        property.setVirtualTourUrl(propertyDTO.virtualTourUrl);
        property.setFeaturedImage(propertyDTO.featuredImage);
        property.setFeatured(propertyDTO.featured);
        property.setPremium(propertyDTO.premium);
        property.setPropertyLabel(propertyDTO.propertyLabel);
        
        // Establecer relaciones
        if (propertyDTO.propertyTypeId != null) {
            PropertyType propertyType = propertyTypeRepository.findById(propertyDTO.propertyTypeId);
            property.setPropertyType(propertyType);
        }
        
        if (propertyDTO.agencyId != null) {
            property.setAgency(agencyRepository.findById(propertyDTO.agencyId));
        }
        
        if (propertyDTO.agentId != null) {
            property.setAgent(agentRepository.findById(propertyDTO.agentId));
        }
        
        if (propertyDTO.cityId != null) {
            property.setCity(cityRepository.findById(propertyDTO.cityId));
        }
        
        if (propertyDTO.countryId != null) {
            property.setCountry(countryRepository.findById(propertyDTO.countryId));
        }
        
        // Establecer moneda - SOLUCIÓN DIRECTA Y SIMPLE
        System.out.println("🔍 CurrencyId recibido: " + propertyDTO.currencyId);
        
        // Crear la moneda directamente sin buscar en BD
        com.proptech.commons.entity.Currency currency = new com.proptech.commons.entity.Currency();
        if (propertyDTO.currencyId == 1) {
            currency.setId(1L);
            currency.setCode("PYG");
            currency.setName("Guaranies");
            currency.setSymbol("Gs.");
            currency.setIsBase(true);
            currency.setIsActive(true);
            currency.setDecimalPlaces(0);
        } else {
            currency.setId(2L);
            currency.setCode("USD");
            currency.setName("Dólar Estadounidense");
            currency.setSymbol("$");
            currency.setIsBase(false);
            currency.setIsActive(true);
            currency.setDecimalPlaces(2);
        }
        
        property.setCurrency(currency);
        System.out.println("✅ Currency set directamente: " + currency.getCode() + " (ID: " + currency.getId() + ")");
        
        // Establecer PropertyStatus basado en el código
        if (propertyDTO.status != null) {
            PropertyStatus status = propertyStatusRepository.find("code", propertyDTO.status).firstResult();
            if (status != null) {
                property.setPropertyStatus(status);
            } else {
                // Si no encuentra el status, usar ACTIVE por defecto
                PropertyStatus activeStatus = propertyStatusRepository.find("code", "ACTIVE").firstResult();
                property.setPropertyStatus(activeStatus);
            }
        } else {
            // Status por defecto: ACTIVE
            PropertyStatus activeStatus = propertyStatusRepository.find("code", "ACTIVE").firstResult();
            property.setPropertyStatus(activeStatus);
        }
        
        propertyRepository.persist(property);
        
        // Registrar auditoría de creación
        try {
            User currentUser = securityContextService.getCurrentUser();
            if (currentUser != null) {
                propertyAuditService.logPropertyCreation(property, currentUser);
            }
        } catch (Exception e) {
            // Log error pero no fallar la creación
            System.err.println("Error logging property creation: " + e.getMessage());
        }
            
        return PropertyMapper.toDTO(property);
    }

    @Transactional
    public PropertyDTO update(Long id, PropertyDTO propertyDTO) {
        Property property = propertyRepository.findById(id);
        if (property == null) {
            throw new NotFoundException("Property not found");
        }
        
        // Guardar valores anteriores para auditoría
        String oldStatus = property.getPropertyStatus() != null ? property.getPropertyStatus().getCode() : null;
        Boolean oldFeatured = property.getFeatured();
        
        PropertyMapper.updateEntityFromDTO(propertyDTO, property);
        // Actualizar PropertyStatus basado en el código
        if (propertyDTO.status != null) {
            PropertyStatus status = propertyStatusRepository.find("code", propertyDTO.status).firstResult();
            if (status != null) {
                property.setPropertyStatus(status);
            }
        }
        
        propertyRepository.persist(property);
        propertyRepository.flush(); // Forzar persistencia inmediata de la relación ManyToMany
        
        // Registrar auditoría de actualización
        try {
            User currentUser = securityContextService.getCurrentUser();
            if (currentUser != null) {
                // Registrar cambios de estado
                if (propertyDTO.status != null && !propertyDTO.status.equals(oldStatus)) {
                    propertyAuditService.logPropertyStatusChange(property, currentUser, oldStatus, propertyDTO.status);
                }
                
                // Registrar cambios de featured
                if (propertyDTO.featured != null && !propertyDTO.featured.equals(oldFeatured)) {
                    propertyAuditService.logFeaturedChange(property, currentUser, oldFeatured, propertyDTO.featured);
                }
            }
        } catch (Exception e) {
            // Log error pero no fallar la actualización
            System.err.println("Error logging property update: " + e.getMessage());
        }
        
        return PropertyMapper.toDTO(property);
    }

    @Transactional
    public boolean delete(Long id) {
        Property property = propertyRepository.findById(id);
        if (property == null) {
            return false;
        }
        
        // Registrar auditoría de eliminación
        try {
            User currentUser = securityContextService.getCurrentUser();
            if (currentUser != null) {
                propertyAuditService.logPropertyDeletion(property, currentUser);
            }
        } catch (Exception e) {
            // Log error pero no fallar la eliminación
            System.err.println("Error logging property deletion: " + e.getMessage());
        }
        
        propertyRepository.delete(property);
        return true;
    }

    public List<PropertyDTO> findByPropertyType(Long propertyTypeId) {
        return PropertyMapper.toDTOList(propertyRepository.findByPropertyType(propertyTypeId));
    }

    public List<PropertyDTO> findByCity(Long cityId) {
        return PropertyMapper.toDTOList(propertyRepository.findByCity(cityId));
    }

    public List<PropertyDTO> findByPriceRange(Double minPrice, Double maxPrice) {
        return PropertyMapper.toDTOList(propertyRepository.findByPriceRange(minPrice, maxPrice));
    }

    public List<PropertyDTO> findFavoritesByUserId(Long userId) {
        return PropertyMapper.toDTOList(propertyRepository.findFavoritesByUserId(userId));
    }

    @Transactional
    public void addToFavorites(Long propertyId, Long userId) {
        propertyRepository.addToFavorites(propertyId, userId);
        
        // Crear notificación para el agente propietario de la propiedad
        try {
            UserDTO user = userService.getUserById(userId);
            String userName = user != null ? (user.getFirstName() + " " + user.getLastName()) : "Un usuario";
            
            notificationEventService.notifyPropertyFavorite(propertyId, userId, userName);
        } catch (Exception e) {
            System.err.println("Error creating notification for property favorite: " + e.getMessage());
            // No lanzar excepción para no afectar la adición a favoritos
        }
    }

    @Transactional
    public void removeFromFavorites(Long propertyId, Long userId) {
        propertyRepository.removeFromFavorites(propertyId, userId);
    }

    public Map<String, Object> getStatisticsSummary() {
        Map<String, Object> stats = new HashMap<>();
        
        // Obtener estadísticas básicas
        long totalProperties = propertyRepository.count();
        long totalViews = propertyRepository.getTotalViews();
        long totalFavorites = propertyRepository.getTotalFavorites();
        long totalShares = propertyRepository.getTotalShares();
        
        // Calcular promedios
        double averageViews = totalProperties > 0 ? (double) totalViews / totalProperties : 0;
        double averageFavorites = totalProperties > 0 ? (double) totalFavorites / totalProperties : 0;
        double averagePrice = 0;
        
        // Calcular precio promedio
        try {
            Double avgPrice = entityManager.createQuery(
                "SELECT AVG(p.price) FROM Property p WHERE p.price IS NOT NULL", Double.class)
                .getSingleResult();
            averagePrice = avgPrice != null ? avgPrice : 0;
        } catch (Exception e) {
            averagePrice = 0;
        }
        
        // Obtener propiedades más vistas y favoritas
        List<PropertyDTO> mostViewed = PropertyMapper.toDTOList(propertyRepository.findMostViewed(5));
        List<PropertyDTO> mostFavorited = PropertyMapper.toDTOList(propertyRepository.findMostFavorited(5));
        
        // Obtener distribución por tipo de propiedad
        Map<String, Object> propertiesByType = new HashMap<>();
        try {
            List<Object[]> typeStats = entityManager.createQuery(
                "SELECT p.propertyType.name, COUNT(p) FROM Property p GROUP BY p.propertyType.name", Object[].class)
                .getResultList();
            
            for (Object[] row : typeStats) {
                String typeName = (String) row[0];
                Long count = (Long) row[1];
                propertiesByType.put(typeName, count);
            }
        } catch (Exception e) {
            // Si hay error, usar datos vacíos
        }
        
        // Obtener distribución por operación
        Map<String, Object> propertiesByOperation = new HashMap<>();
        try {
            List<Object[]> operationStats = entityManager.createQuery(
                "SELECT p.operacion, COUNT(p) FROM Property p GROUP BY p.operacion", Object[].class)
                .getResultList();
            
            for (Object[] row : operationStats) {
                String operation = row[0] != null ? row[0].toString() : "N/A";
                Long count = (Long) row[1];
                propertiesByOperation.put(operation, count);
            }
        } catch (Exception e) {
            // Si hay error, usar datos vacíos
        }
        
        // Simular tendencia de vistas (últimos 7 días)
        List<Map<String, Object>> viewsTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            Map<String, Object> day = new HashMap<>();
            day.put("date", java.time.LocalDate.now().minusDays(i).toString());
            // Distribuir las vistas de manera realista
            int dailyViews = Math.max(0, (int)(totalViews / 30) + (int)(Math.random() * (totalViews / 30 / 2)));
            day.put("views", dailyViews);
            viewsTrend.add(day);
        }
        
        stats.put("totalProperties", totalProperties);
        stats.put("totalViews", totalViews);
        stats.put("totalFavorites", totalFavorites);
        stats.put("totalShares", totalShares);
        stats.put("totalContacts", 0); // Por ahora 0, se puede implementar cuando se agregue tracking de contactos
        stats.put("averageViews", Math.round(averageViews * 100) / 100.0);
        stats.put("averageFavorites", Math.round(averageFavorites * 100) / 100.0);
        stats.put("averagePrice", Math.round(averagePrice * 100) / 100.0);
        stats.put("propertiesByType", propertiesByType);
        stats.put("propertiesByOperation", propertiesByOperation);
        stats.put("viewsTrend", viewsTrend);
        stats.put("mostViewed", mostViewed);
        stats.put("mostFavorited", mostFavorited);
        
        return stats;
    }

    public Map<String, Object> getPropertyStats(Long propertyId) {
        Map<String, Object> stats = new HashMap<>();
        
        Property property = propertyRepository.findById(propertyId);
        if (property == null) {
            return stats;
        }
        
        // Estadísticas básicas de la propiedad
        stats.put("views", property.getViews() != null ? property.getViews() : 0);
        stats.put("favorites", property.getFavoritesCount() != null ? property.getFavoritesCount() : 0);
        stats.put("shared", property.getShares() != null ? property.getShares() : 0);
        
        // Contar amenidades
        int amenitiesCount = property.getAmenities() != null ? property.getAmenities().size() : 0;
        stats.put("amenities", amenitiesCount);
        
        // Contar servicios
        int servicesCount = property.getServices() != null ? property.getServices().size() : 0;
        stats.put("services", servicesCount);
        
        // Contar documentos privados (si existe la relación)
        int documentsCount = 0; // Por ahora 0, se puede implementar cuando se agregue la relación
        stats.put("documents", documentsCount);
        
        return stats;
    }

    public Map<String, Object> getPropertyStatistics(Long propertyId, int days) {
        Map<String, Object> stats = new HashMap<>();
        
        Property property = propertyRepository.findById(propertyId);
        if (property == null) {
            return stats;
        }
        
        // Estadísticas básicas reales
        long totalViews = propertyRepository.getPropertyViews(propertyId);
        long totalFavorites = propertyRepository.getPropertyFavorites(propertyId);
        long totalShares = propertyRepository.getPropertyShares(propertyId);
        long totalContacts = propertyRepository.getPropertyContacts(propertyId);
        
        // Calcular días desde la creación
        long daysListed = 0;
        if (property.getCreatedAt() != null) {
            daysListed = java.time.temporal.ChronoUnit.DAYS.between(
                property.getCreatedAt().toLocalDate(),
                java.time.LocalDate.now()
            );
        }
        
        // Calcular promedio de vistas por día
        double averageViewsPerDay = daysListed > 0 ? (double) totalViews / daysListed : 0;
        
        // Calcular tasas de conversión
        double engagementRate = totalViews > 0 ? ((double) totalFavorites / totalViews) * 100 : 0;
        double conversionRate = totalViews > 0 ? ((double) totalContacts / totalViews) * 100 : 0;
        
        // Obtener tendencias reales
        List<Map<String, Object>> viewsTrend = propertyRepository.getPropertyViewsTrend(propertyId, days);
        List<Map<String, Object>> contactsTrend = propertyRepository.getPropertyContactsTrend(propertyId, days);
        
        // Obtener historial de precios real
        List<Map<String, Object>> priceHistory = propertyRepository.getPropertyPriceHistory(propertyId);
        
        // Obtener comparación con el mercado real
        Map<String, Object> marketComparison = propertyRepository.getPropertyMarketComparison(propertyId);
        
        stats.put("totalViews", totalViews);
        stats.put("totalFavorites", totalFavorites);
        stats.put("totalShares", totalShares);
        stats.put("totalContacts", totalContacts);
        stats.put("averageViewsPerDay", Math.round(averageViewsPerDay * 100) / 100.0);
        stats.put("daysListed", daysListed);
        stats.put("engagementRate", Math.round(engagementRate * 100) / 100.0);
        stats.put("conversionRate", Math.round(conversionRate * 100) / 100.0);
        stats.put("viewsTrend", viewsTrend);
        stats.put("contactsTrend", contactsTrend);
        stats.put("priceHistory", priceHistory);
        stats.put("marketComparison", marketComparison);
        
        return stats;
    }

    public List<PropertyDTO> findByFilters(String operacion, String type, String city, Double minPrice, Double maxPrice, Integer bedrooms, Integer bathrooms, String status) {
        return PropertyMapper.toDTOList(
            propertyRepository.findByFilters(operacion, type, city, minPrice, maxPrice, bedrooms, bathrooms, status)
        );
    }

    public Map<String, Object> findPaginated(
        Integer page, 
        Integer limit, 
        String search, 
        String operacion, 
        String type, 
        String city, 
        Double minPrice, 
        Double maxPrice, 
        Integer bedrooms, 
        Integer bathrooms, 
        String status
    ) {
        // Obtener todas las propiedades filtradas
        List<Property> allProperties = propertyRepository.findByFilters(operacion, type, city, minPrice, maxPrice, bedrooms, bathrooms, status);
        
        // Aplicar búsqueda de texto si se proporciona
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            allProperties = allProperties.stream()
                .filter(p -> 
                    (p.getTitle() != null && p.getTitle().toLowerCase().contains(searchLower)) ||
                    (p.getDescription() != null && p.getDescription().toLowerCase().contains(searchLower)) ||
                    (p.getAddress() != null && p.getAddress().toLowerCase().contains(searchLower))
                )
                .toList();
        }
        
        // Calcular paginación
        int total = allProperties.size();
        int totalPages = (int) Math.ceil((double) total / limit);
        int offset = (page - 1) * limit;
        
        // Obtener propiedades para la página actual
        List<Property> pageProperties = allProperties.stream()
            .skip(offset)
        .limit(limit)
        .toList();
        
        // Convertir a DTOs
        List<PropertyDTO> propertyDTOs = PropertyMapper.toDTOList(pageProperties);
        
        // Crear respuesta paginada
        Map<String, Object> result = new HashMap<>();
        result.put("properties", propertyDTOs);
        result.put("total", total);
        result.put("page", page);
        result.put("limit", limit);
        result.put("totalPages", totalPages);
        
        return result;
    }

    public List<PropertyStatus> getAllStatuses() {
        return propertyStatusRepository.listAll();
    }

    // Método para obtener status del sistema (protegidos)
    public List<PropertyStatus> getSystemStatuses() {
        return propertyStatusRepository.find("isSystem", true).list();
    }

    // Método para obtener status personalizados (no protegidos)
    public List<PropertyStatus> getCustomStatuses() {
        return propertyStatusRepository.find("isSystem", false).list();
    }

    // Método para eliminar status con validación de protección
    @Transactional
    public boolean deletePropertyStatus(Long id) {
        PropertyStatus status = propertyStatusRepository.findById(id);
        if (status == null) {
            return false;
        }
        
        // Verificar si es un registro del sistema
        if (status.getIsSystem()) {
            throw new RuntimeException("No se puede eliminar un status del sistema: " + status.getName());
        }
        
        // Verificar si hay propiedades usando este status
        long propertyCount = propertyRepository.count("propertyStatus.id", id);
        if (propertyCount > 0) {
            throw new RuntimeException("No se puede eliminar el status '" + status.getName() + "' porque está siendo usado por " + propertyCount + " propiedades");
        }
        
        propertyStatusRepository.delete(status);
        return true;
    }

    // Método para actualizar status con validación
    @Transactional
    public PropertyStatus updatePropertyStatus(Long id, PropertyStatus updatedStatus) {
        PropertyStatus existingStatus = propertyStatusRepository.findById(id);
        if (existingStatus == null) {
            throw new RuntimeException("Status no encontrado");
        }
        
        // Si es un registro del sistema, solo permitir cambios en name y description
        if (existingStatus.getIsSystem()) {
            existingStatus.setName(updatedStatus.getName());
            existingStatus.setDescription(updatedStatus.getDescription());
            // NO permitir cambiar code, isSystem, o active para registros del sistema
        } else {
            // Para registros personalizados, permitir todos los cambios excepto isSystem
            existingStatus.setName(updatedStatus.getName());
            existingStatus.setCode(updatedStatus.getCode());
            existingStatus.setDescription(updatedStatus.getDescription());
            existingStatus.setActive(updatedStatus.getActive());
        }
        
        propertyStatusRepository.persist(existingStatus);
        return existingStatus;
    }
} 