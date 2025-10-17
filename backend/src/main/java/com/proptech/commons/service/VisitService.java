package com.proptech.commons.service;

import com.proptech.commons.dto.VisitDTO;
import com.proptech.commons.entity.Visit;
import com.proptech.commons.mapper.VisitMapper;
import com.proptech.commons.repository.VisitRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;

@ApplicationScoped
public class VisitService {
    @Inject
    VisitRepository visitRepository;

    public List<VisitDTO> listAll() {
        return VisitMapper.toDTOList(visitRepository.listAll());
    }

    public VisitDTO findById(Long id) {
        return VisitMapper.toDTO(visitRepository.findById(id));
    }

    @Transactional
    public VisitDTO create(VisitDTO dto) {
        Visit entity = VisitMapper.toEntity(dto);
        visitRepository.persist(entity);
        return VisitMapper.toDTO(entity);
    }

    @Transactional
    public VisitDTO update(Long id, VisitDTO dto) {
        Visit entity = visitRepository.findById(id);
        if (entity == null) return null;
        Visit updated = VisitMapper.toEntity(dto);
        updated.setId(id);
        visitRepository.getEntityManager().merge(updated);
        return VisitMapper.toDTO(updated);
    }

    @Transactional
    public boolean delete(Long id) {
        Visit entity = visitRepository.findById(id);
        if (entity == null) return false;
        visitRepository.delete(entity);
        return true;
    }
} 