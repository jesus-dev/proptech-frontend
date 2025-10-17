package com.proptech.developments.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.proptech.developments.entity.Development;
import com.proptech.developments.enums.DevelopmentStatus;
import com.proptech.developments.enums.DevelopmentType;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DevelopmentRepository implements PanacheRepository<Development> {

    // Buscar por tipo
    public List<Development> findByType(DevelopmentType type) {
        return find("type", type).list();
    }

    // Buscar por estado
    public List<Development> findByStatus(DevelopmentStatus status) {
        return find("status", status).list();
    }

    // Buscar por ciudad
    public List<Development> findByCity(String city) {
        return find("city ILIKE :city", Parameters.with("city", "%" + city + "%")).list();
    }

    // Buscar por rango de precio
    public List<Development> findByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return find("price BETWEEN :minPrice AND :maxPrice", 
                   Parameters.with("minPrice", minPrice).and("maxPrice", maxPrice)).list();
    }

    // Buscar desarrollos destacados
    public List<Development> findFeatured() {
        return find("featured = true AND active = true").list();
    }

    // Buscar desarrollos premium
    public List<Development> findPremium() {
        return find("premium = true AND active = true").list();
    }

    // Buscar desarrollos disponibles
    public List<Development> findAvailable() {
        return find("status = :status AND active = true", 
                   Parameters.with("status", DevelopmentStatus.AVAILABLE)).list();
    }

    // Buscar desarrollos vendidos
    public List<Development> findSold() {
        return find("status = :status", 
                   Parameters.with("status", DevelopmentStatus.SOLD)).list();
    }

    // Buscar desarrollos reservados
    public List<Development> findReserved() {
        return find("status = :status", 
                   Parameters.with("status", DevelopmentStatus.RESERVED)).list();
    }

    // Buscar por desarrollador
    public List<Development> findByDeveloper(String developer) {
        return find("developer ILIKE :developer", 
                   Parameters.with("developer", "%" + developer + "%")).list();
    }

    // Buscar por búsqueda de texto
    public List<Development> searchByText(String searchTerm) {
        return find("title ILIKE :search OR description ILIKE :search OR address ILIKE :search OR city ILIKE :search", 
                   Parameters.with("search", "%" + searchTerm + "%")).list();
    }

    // Buscar por múltiples criterios
    public List<Development> findByCriteria(DevelopmentType type, DevelopmentStatus status, String city, 
                                          BigDecimal minPrice, BigDecimal maxPrice, Boolean featured, Boolean premium) {
        StringBuilder query = new StringBuilder();
        Parameters params = new Parameters();
        
        if (type != null) {
            query.append("type = :type");
            params.and("type", type);
        }
        
        if (status != null) {
            if (query.length() > 0) query.append(" AND ");
            query.append("status = :status");
            params.and("status", status);
        }
        
        if (city != null && !city.trim().isEmpty()) {
            if (query.length() > 0) query.append(" AND ");
            query.append("city ILIKE :city");
            params.and("city", "%" + city + "%");
        }
        
        if (minPrice != null && maxPrice != null) {
            if (query.length() > 0) query.append(" AND ");
            query.append("price BETWEEN :minPrice AND :maxPrice");
            params.and("minPrice", minPrice).and("maxPrice", maxPrice);
        }
        
        if (featured != null) {
            if (query.length() > 0) query.append(" AND ");
            query.append("featured = :featured");
            params.and("featured", featured);
        }
        
        if (premium != null) {
            if (query.length() > 0) query.append(" AND ");
            query.append("premium = :premium");
            params.and("premium", premium);
        }
        
        if (query.length() == 0) {
            return findAll().list();
        }
        
        return find(query.toString(), params).list();
    }

    // Contar por tipo
    public long countByType(DevelopmentType type) {
        return count("type", type);
    }

    // Contar por estado
    public long countByStatus(DevelopmentStatus status) {
        return count("status", status);
    }

    // Contar desarrollos activos
    public long countActive() {
        return count("active = true");
    }

    // Contar desarrollos publicados
    public long countPublished() {
        return count("published = true");
    }

    // Obtener desarrollos más vistos
    public List<Development> findMostViewed(int limit) {
        return find("active = true ORDER BY views DESC").range(0, limit - 1).list();
    }

    // Obtener desarrollos más favoritos
    public List<Development> findMostFavorited(int limit) {
        return find("active = true ORDER BY favoritesCount DESC").range(0, limit - 1).list();
    }

    // Obtener desarrollos recientes
    public List<Development> findRecent(int limit) {
        return find("active = true ORDER BY createdAt DESC").range(0, limit - 1).list();
    }

    // Buscar por ID con validación
    public Optional<Development> findByIdOptional(Long id) {
        return findByIdOptional(id);
    }

    // Verificar si existe por título
    public boolean existsByTitle(String title) {
        return count("title = :title", Parameters.with("title", title)) > 0;
    }

    // Obtener estadísticas básicas
    public long getTotalCount() {
        return count();
    }

    public long getActiveCount() {
        return count("active = true");
    }

    public long getPublishedCount() {
        return count("published = true");
    }

    public long getAvailableCount() {
        return count("status = :status", Parameters.with("status", DevelopmentStatus.AVAILABLE));
    }

    public long getSoldCount() {
        return count("status = :status", Parameters.with("status", DevelopmentStatus.SOLD));
    }

    public long getReservedCount() {
        return count("status = :status", Parameters.with("status", DevelopmentStatus.RESERVED));
    }

    // Incrementar vistas
    public void incrementViews(Long id) {
        update("views = views + 1 WHERE id = :id", Parameters.with("id", id));
    }

    // Incrementar favoritos
    public void incrementFavorites(Long id) {
        update("favoritesCount = favoritesCount + 1 WHERE id = :id", Parameters.with("id", id));
    }

    // Decrementar favoritos
    public void decrementFavorites(Long id) {
        update("favoritesCount = GREATEST(favoritesCount - 1, 0) WHERE id = :id", Parameters.with("id", id));
    }

    // Incrementar compartidos
    public void incrementShares(Long id) {
        update("sharesCount = sharesCount + 1 WHERE id = :id", Parameters.with("id", id));
    }

    // Incrementar consultas
    public void incrementInquiries(Long id) {
        update("inquiriesCount = inquiriesCount + 1 WHERE id = :id", Parameters.with("id", id));
    }

    // Marcar como destacado
    public void setFeatured(Long id, boolean featured) {
        update("featured = :featured WHERE id = :id", 
               Parameters.with("featured", featured).and("id", id));
    }

    // Marcar como premium
    public void setPremium(Long id, boolean premium) {
        update("premium = :premium WHERE id = :id", 
               Parameters.with("premium", premium).and("id", id));
    }

    // Publicar/despublicar
    public void setPublished(Long id, boolean published) {
        update("published = :published, publishedAt = :publishedAt WHERE id = :id", 
               Parameters.with("published", published)
                        .and("publishedAt", published ? java.time.LocalDateTime.now() : null)
                        .and("id", id));
    }

    // Activar/desactivar
    public void setActive(Long id, boolean active) {
        update("active = :active WHERE id = :id", 
               Parameters.with("active", active).and("id", id));
    }
} 