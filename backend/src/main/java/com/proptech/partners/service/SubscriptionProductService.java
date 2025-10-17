package com.proptech.partners.service;

import com.proptech.partners.dto.SubscriptionProductDTO;
import com.proptech.partners.entity.SubscriptionProduct;
import com.proptech.partners.repository.SubscriptionProductRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class SubscriptionProductService {
    
    @Inject
    SubscriptionProductRepository subscriptionProductRepository;
    
    @Inject
    com.proptech.commons.repository.CurrencyRepository currencyRepository;
    
    public List<SubscriptionProductDTO> getAllProducts() {
        return subscriptionProductRepository.listAll().stream()
                .map(SubscriptionProductDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<SubscriptionProductDTO> getActiveProducts() {
        return subscriptionProductRepository.findActiveProducts().stream()
                .map(SubscriptionProductDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<SubscriptionProductDTO> getProductsByCategory(SubscriptionProduct.ProductCategory category) {
        return subscriptionProductRepository.findByCategory(category).stream()
                .map(SubscriptionProductDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<SubscriptionProductDTO> getPopularProducts() {
        return subscriptionProductRepository.findPopularProducts().stream()
                .map(SubscriptionProductDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<SubscriptionProductDTO> getRecommendedProducts() {
        return subscriptionProductRepository.findRecommendedProducts().stream()
                .map(SubscriptionProductDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public SubscriptionProductDTO getProductById(Long id) {
        SubscriptionProduct product = subscriptionProductRepository.findById(id);
        if (product == null) {
            throw new RuntimeException("Producto de suscripción no encontrado con ID: " + id);
        }
        return SubscriptionProductDTO.fromEntity(product);
    }
    
    @Transactional
    public SubscriptionProductDTO createProduct(SubscriptionProductDTO dto) {
        SubscriptionProduct product = new SubscriptionProduct();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        if (dto.getCurrencyId() != null) {
            com.proptech.commons.entity.Currency currency = currencyRepository.findById(dto.getCurrencyId());
            if (currency != null) {
                product.setCurrency(currency);
            }
        }
        product.setBillingCycle(SubscriptionProduct.BillingCycle.valueOf(dto.getBillingCycle()));
        product.setCategory(SubscriptionProduct.ProductCategory.valueOf(dto.getCategory()));
        product.setFeatures(dto.getFeatures());
        product.setIsActive(dto.getIsActive());
        product.setIsPopular(dto.getIsPopular());
        product.setIsRecommended(dto.getIsRecommended());
        product.setMaxUsers(dto.getMaxUsers());
        product.setMaxProperties(dto.getMaxProperties());
        product.setMaxContacts(dto.getMaxContacts());
        product.setCreatedAt(LocalDateTime.now());
        
        subscriptionProductRepository.persist(product);
        return SubscriptionProductDTO.fromEntity(product);
    }
    
    @Transactional
    public SubscriptionProductDTO updateProduct(Long id, SubscriptionProductDTO dto) {
        SubscriptionProduct product = subscriptionProductRepository.findById(id);
        if (product == null) {
            throw new RuntimeException("Producto de suscripción no encontrado con ID: " + id);
        }
        
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        if (dto.getCurrencyId() != null) {
            com.proptech.commons.entity.Currency currency = currencyRepository.findById(dto.getCurrencyId());
            if (currency != null) {
                product.setCurrency(currency);
            }
        }
        product.setBillingCycle(SubscriptionProduct.BillingCycle.valueOf(dto.getBillingCycle()));
        product.setCategory(SubscriptionProduct.ProductCategory.valueOf(dto.getCategory()));
        product.setFeatures(dto.getFeatures());
        product.setIsActive(dto.getIsActive());
        product.setIsPopular(dto.getIsPopular());
        product.setIsRecommended(dto.getIsRecommended());
        product.setMaxUsers(dto.getMaxUsers());
        product.setMaxProperties(dto.getMaxProperties());
        product.setMaxContacts(dto.getMaxContacts());
        product.setUpdatedAt(LocalDateTime.now());
        
        subscriptionProductRepository.persist(product);
        return SubscriptionProductDTO.fromEntity(product);
    }
    
    @Transactional
    public void deleteProduct(Long id) {
        SubscriptionProduct product = subscriptionProductRepository.findById(id);
        if (product == null) {
            throw new RuntimeException("Producto de suscripción no encontrado con ID: " + id);
        }
        subscriptionProductRepository.delete(product);
    }
    
    @Transactional
    public SubscriptionProductDTO activateProduct(Long id) {
        SubscriptionProduct product = subscriptionProductRepository.findById(id);
        if (product == null) {
            throw new RuntimeException("Producto de suscripción no encontrado con ID: " + id);
        }
        product.setIsActive(true);
        product.setUpdatedAt(LocalDateTime.now());
        subscriptionProductRepository.persist(product);
        return SubscriptionProductDTO.fromEntity(product);
    }
    
    @Transactional
    public SubscriptionProductDTO deactivateProduct(Long id) {
        SubscriptionProduct product = subscriptionProductRepository.findById(id);
        if (product == null) {
            throw new RuntimeException("Producto de suscripción no encontrado con ID: " + id);
        }
        product.setIsActive(false);
        product.setUpdatedAt(LocalDateTime.now());
        subscriptionProductRepository.persist(product);
        return SubscriptionProductDTO.fromEntity(product);
    }
    
    // Método para crear el plan genérico de cuotas sociales
    @Transactional
    public SubscriptionProductDTO createSocialDuesPlan() {
        // Verificar si ya existe un plan de cuotas sociales
        List<SubscriptionProduct> existingSocialDues = subscriptionProductRepository.findByCategory(SubscriptionProduct.ProductCategory.SOCIAL_DUES);
        if (!existingSocialDues.isEmpty()) {
            return SubscriptionProductDTO.fromEntity(existingSocialDues.get(0));
        }
        
        // Crear el plan genérico de cuotas sociales
        SubscriptionProduct socialDuesPlan = new SubscriptionProduct();
        socialDuesPlan.setName("Cuota Social");
        socialDuesPlan.setDescription("Plan genérico para cuotas sociales. No incluye suscripción al Proptech.");
        socialDuesPlan.setPrice(BigDecimal.ZERO); // Precio 0 ya que es genérico
        // Buscar la moneda USD
        com.proptech.commons.entity.Currency usdCurrency = currencyRepository.find("code", "USD").firstResult();
        if (usdCurrency != null) {
            socialDuesPlan.setCurrency(usdCurrency);
        }
        socialDuesPlan.setBillingCycle(SubscriptionProduct.BillingCycle.MONTHLY);
        socialDuesPlan.setCategory(SubscriptionProduct.ProductCategory.SOCIAL_DUES);
        socialDuesPlan.setFeatures(List.of("Cuota social", "Sin suscripción Proptech"));
        socialDuesPlan.setIsActive(true);
        socialDuesPlan.setIsPopular(false);
        socialDuesPlan.setIsRecommended(false);
        socialDuesPlan.setMaxUsers(0);
        socialDuesPlan.setMaxProperties(0);
        socialDuesPlan.setMaxContacts(0);
        socialDuesPlan.setCreatedAt(LocalDateTime.now());
        
        subscriptionProductRepository.persist(socialDuesPlan);
        return SubscriptionProductDTO.fromEntity(socialDuesPlan);
    }
    
    public long getTotalProducts() {
        return subscriptionProductRepository.count();
    }
    
    public long getActiveProductsCount() {
        return subscriptionProductRepository.countActiveProducts();
    }
}
