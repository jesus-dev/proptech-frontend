package com.proptech.inquiries.repository;

import com.proptech.inquiries.entity.Inquiry;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class InquiryRepository implements PanacheRepository<Inquiry> {
} 