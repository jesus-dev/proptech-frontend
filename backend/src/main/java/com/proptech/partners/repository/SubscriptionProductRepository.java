package com.proptech.partners.repository;

import com.proptech.partners.entity.SubscriptionProduct;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class SubscriptionProductRepository implements PanacheRepository<SubscriptionProduct> {
    
    public List<SubscriptionProduct> findActiveProducts() {
        return find("isActive", true).list();
    }
    
    public List<SubscriptionProduct> findByCategory(SubscriptionProduct.ProductCategory category) {
        return find("category", category).list();
    }
    
    public List<SubscriptionProduct> findPopularProducts() {
        return find("isPopular", true).list();
    }
    
    public List<SubscriptionProduct> findRecommendedProducts() {
        return find("isRecommended", true).list();
    }
    
    public List<SubscriptionProduct> findActiveByCategory(SubscriptionProduct.ProductCategory category) {
        return find("category = ?1 and isActive = ?2", category, true).list();
    }
    
    public long countActiveProducts() {
        return count("isActive", true);
    }
    
    public long countByCategory(SubscriptionProduct.ProductCategory category) {
        return count("category", category);
    }
}
