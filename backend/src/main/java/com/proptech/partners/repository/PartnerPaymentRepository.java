package com.proptech.partners.repository;

import com.proptech.partners.entity.PartnerPayment;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class PartnerPaymentRepository implements PanacheRepository<PartnerPayment> {
    
    public List<PartnerPayment> findByPartnerId(Long partnerId) {
        return list("partnerId", partnerId);
    }
} 