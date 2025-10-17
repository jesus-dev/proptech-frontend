package com.proptech.properties.repository;

import com.proptech.properties.entity.PropertyType;
import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PropertyTypeRepository implements PanacheRepository<PropertyType> {
    
    public PropertyType findById(Long id) {
        return find("id", id).firstResult();
    }
    
    public PropertyType findByName(String name) {
        return find("name", name).firstResult();
    }
    
    // Obtener tipos padre (sin parent)
    public List<PropertyType> findParentTypes() {
        return find("parent is null").list();
    }
    
    // Obtener tipos hijo de un padre específico
    public List<PropertyType> findChildTypes(Long parentId) {
        return find("parent.id", parentId).list();
    }
    
    // Obtener todos los tipos con sus relaciones cargadas
    public List<PropertyType> findAllWithParent() {
        return find("from PropertyType pt left join fetch pt.parent").list();
    }
} 