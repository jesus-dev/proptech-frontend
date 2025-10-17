package com.proptech.social.repository;

import com.proptech.social.entity.PropShot;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class PropShotRepository implements PanacheRepository<PropShot> {
    
    // Método personalizado para buscar por agente (usuario)
    public List<PropShot> findByUserId(Long userId) {
        return find("agent.id = ?1", userId).list();
    }
}
