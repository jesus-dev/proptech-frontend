package com.proptech.contracts.respository;

import com.proptech.contracts.entity.ContractDocument;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ContractDocumentRepository implements PanacheRepository<ContractDocument> {
} 