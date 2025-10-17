package com.proptech.contracts.respository;

import com.proptech.contracts.entity.Contract;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ContractRepository implements PanacheRepository<Contract> {
} 